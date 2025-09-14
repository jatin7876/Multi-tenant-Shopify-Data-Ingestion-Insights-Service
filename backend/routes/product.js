// routes/product.js
import express from "express";
import { pool } from "../config/db.js";
import { verifyJwt } from "../middleware/auth.js";

const router = express.Router();

// GET /api/products - Get all products for the tenant
router.get("/", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const result = await pool.query(
      `SELECT id, title, sku, price_cents, inventory, shopify_id, created_at, updated_at
       FROM products 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC`,
      [tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/products - Create a new product
router.post("/", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const { title, price, inventory, sku, shopifyId } = req.body;
    
    if (!title || !price || inventory === undefined) {
      return res.status(400).json({ error: "Title, price, and inventory are required" });
    }

    const result = await pool.query(
      `INSERT INTO products (tenant_id, title, price_cents, inventory, sku, shopify_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, title, price_cents, inventory, sku, shopify_id, created_at`,
      [tenantId, title, price * 100, inventory, sku, shopifyId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Unique violation -> SKU already exists
    if (err.code === "23505") {
      return res.status(400).json({ error: "SKU already exists" });
    }
    next(err);
  }
});

// GET /api/products/:id - Get a specific product
router.get("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const productId = req.params.id;
    
    const result = await pool.query(
      `SELECT * FROM products 
       WHERE id = $1 AND tenant_id = $2`,
      [productId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Update a product
router.put("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const productId = req.params.id;
    const { title, price, inventory, sku, shopifyId } = req.body;
    
    const result = await pool.query(
      `UPDATE products 
       SET title = $1, price_cents = $2, inventory = $3, sku = $4, shopify_id = $5, updated_at = NOW()
       WHERE id = $6 AND tenant_id = $7
       RETURNING *`,
      [title, price * 100, inventory, sku, shopifyId, productId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - Delete a product
router.delete("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const productId = req.params.id;
    
    const result = await pool.query(
      `DELETE FROM products 
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [productId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
