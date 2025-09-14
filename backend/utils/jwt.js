// utils/jwt.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function signToken(payload) {
  // payload should include userId and tenantId
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}
