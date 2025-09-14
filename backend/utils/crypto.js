// utils/crypto.js
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function generateVerificationCode() {
  // Generate a 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
}