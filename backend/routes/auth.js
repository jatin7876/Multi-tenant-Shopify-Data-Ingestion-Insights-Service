// routes/auth.js
import express from "express";
import { pool } from "../config/db.js";
import { registerTenantAndUser, verifyEmailToken, verifyEmailCode } from "../services/authService.js";
import { comparePassword } from "../utils/crypto.js";
import { signToken } from "../utils/jwt.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/**
 * POST /api/auth/signup
 * body: { email, password, storeName, shopifyDomain }
 */
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, storeName, shopifyDomain } = req.body;
    if (!email || !password || !storeName || !shopifyDomain) return res.status(400).json({ error: "Missing fields" });

    const result = await registerTenantAndUser({
      email,
      password,
      storeName,
      shopifyDomain,
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
    });

    res.json({ message: "Signup complete. Check your email to verify." });
  } catch (err) {
    // Unique violation -> email or domain exists
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email or domain already in use" });
    }
    next(err);
  }
});

/**
 * GET /api/auth/verify?token=... (legacy token verification)
 */
router.get("/verify", async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: "Missing token" });

    const u = await verifyEmailToken(token);
    if (!u) return res.status(400).json({ error: "Invalid or expired token" });

    res.json({ message: "Email verified. You can now log in." });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/verify-code
 * body: { code, email }
 */
router.post("/verify-code", async (req, res, next) => {
  try {
    const { code, email } = req.body;
    if (!code || !email) return res.status(400).json({ error: "Missing code or email" });

    const u = await verifyEmailCode(code, email);
    if (!u) return res.status(400).json({ error: "Invalid or expired verification code" });

    res.json({ message: "Email verified. You can now log in." });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const r = await pool.query(`SELECT id, email, password_hash, tenant_id, is_verified FROM users WHERE email=$1`, [email]);
    if (r.rowCount === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = r.rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.is_verified) return res.status(403).json({ error: "Please verify your email first" });

    const token = signToken({ userId: user.id, tenantId: user.tenant_id });
    res.json({ token, user: { id: user.id, email: user.email, tenantId: user.tenant_id } });
  } catch (err) {
    next(err);
  }
});

export default router;
