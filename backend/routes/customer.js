// routes/customer.js
import express from "express";
import { pool } from "../config/db.js";
import { verifyJwt } from "../middleware/auth.js";

const router = express.Router();

// GET /api/customers - Get all customers for the tenant
router.get("/", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const result = await pool.query(
      `SELECT id, name, email, phone, shopify_id, created_at 
       FROM customers 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC`,
      [tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers - Create a new customer
router.post("/", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const { name, email, phone, shopifyId } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const result = await pool.query(
      `INSERT INTO customers (tenant_id, name, email, phone, shopify_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, phone, shopify_id, created_at`,
      [tenantId, name, email, phone, shopifyId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Unique violation -> email already exists
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    next(err);
  }
});

// GET /api/customers/:id - Get a specific customer
router.get("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const customerId = req.params.id;
    
    const result = await pool.query(
      `SELECT * FROM customers 
       WHERE id = $1 AND tenant_id = $2`,
      [customerId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/customers/:id - Update a customer
router.put("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const customerId = req.params.id;
    const { name, email, phone, shopifyId } = req.body;
    
    const result = await pool.query(
      `UPDATE customers 
       SET name = $1, email = $2, phone = $3, shopify_id = $4, updated_at = NOW()
       WHERE id = $5 AND tenant_id = $6
       RETURNING *`,
      [name, email, phone, shopifyId, customerId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/customers/:id - Delete a customer
router.delete("/:id", verifyJwt, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const customerId = req.params.id;
    
    const result = await pool.query(
      `DELETE FROM customers 
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [customerId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
