// routes/tenants.js (simplified)
import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();

// Save admin token (manual)
router.post("/connect", async (req, res, next) => {
  try {
    const { domain, access_token } = req.body; // domain like myshop.myshopify.com
    if (!domain || !access_token) return res.status(400).json({ error: "Missing" });
    await pool.query(
      `INSERT INTO tenants (store_name, domain, access_token) VALUES ($1,$2,$3)
       ON CONFLICT (domain) DO UPDATE SET access_token=EXCLUDED.access_token, updated_at=now()`,
      [domain.split(".")[0], domain, access_token]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
