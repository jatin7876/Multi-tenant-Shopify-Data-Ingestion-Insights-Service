// routes/order.js
import express from "express";
import { pool } from "../config/db.js";
import { verifyJwt } from "../middleware/auth.js";

const router = express.Router();

// GET /api/orders - Get all orders for the tenant
router.get("/", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const result = await pool.query(
      `SELECT o.id, o.order_number, o.total_cents, o.status, o.placed_at, o.currency,
              c.name as customer_name, c.email as customer_email
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.tenant_id = $1 
       ORDER BY o.placed_at DESC`,
      [tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders - Create a new order
router.post("/", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const { customerId, items, currency = 'USD' } = req.body;
    
    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ error: "Customer ID and items are required" });
    }

    // Calculate total
    const totalCents = items.reduce((sum, item) => sum + (item.price * item.quantity * 100), 0);
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");

      // Create the order
      const orderResult = await client.query(
        `INSERT INTO orders (tenant_id, customer_id, order_number, total_cents, currency, status, placed_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
         RETURNING id, order_number, total_cents, status, placed_at`,
        [tenantId, customerId, orderNumber, totalCents, currency]
      );

      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_cents)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.productId, item.quantity, item.price * 100]
        );
      }

      await client.query("COMMIT");
      
      res.status(201).json({
        id: order.id,
        orderNumber: order.order_number,
        total: order.total_cents / 100,
        status: order.status,
        placedAt: order.placed_at,
        message: "Order created successfully"
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id - Get a specific order with items
router.get("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const orderId = req.params.id;
    
    const orderResult = await pool.query(
      `SELECT o.*, c.name as customer_name, c.email as customer_email
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1 AND o.tenant_id = $2`,
      [orderId, tenantId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.*, p.title as product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    res.json({
      ...order,
      items: itemsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id - Update order status
router.put("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const orderId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [status, orderId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orders/:id - Delete an order
router.delete("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const orderId = req.params.id;
    
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");

      // Delete order items first
      await client.query(
        `DELETE FROM order_items WHERE order_id = $1`,
        [orderId]
      );

      // Delete the order
      const result = await client.query(
        `DELETE FROM orders 
         WHERE id = $1 AND tenant_id = $2
         RETURNING id`,
        [orderId, tenantId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Order not found" });
      }

      await client.query("COMMIT");
      res.json({ message: "Order deleted successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

export default router;
