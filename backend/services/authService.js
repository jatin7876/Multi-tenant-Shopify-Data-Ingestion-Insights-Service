// services/authService.js
import { pool } from "../config/db.js";
import { hashPassword, generateVerificationCode } from "../utils/crypto.js";
import { transporter } from "../config/mailer.js";

export async function registerTenantAndUser({ email, password, storeName, shopifyDomain, frontendUrl }) {
  const client = await pool.connect();
  const verificationCode = generateVerificationCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    await client.query("BEGIN");

    const tenantRes = await client.query(
      `INSERT INTO tenants (store_name, domain) VALUES ($1, $2) RETURNING id, store_name, domain`,
      [storeName, shopifyDomain]
    );
    const tenant = tenantRes.rows[0];

    const passwordHash = await hashPassword(password);

    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, tenant_id, role, verification_token, verification_expires) 
       VALUES ($1, $2, $3, 'admin', $4, $5) RETURNING id, email, tenant_id`,
      [email, passwordHash, tenant.id, verificationCode, expires]
    );

    await client.query("COMMIT");

    // send verification email
    const verifyUrl = `${frontendUrl.replace(/\/$/, "")}/verify-email`;
    await transporter.sendMail({
      from: `"Xeno Insights" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Xeno Insights email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to Xeno Insights!</h2>
          <p>Please use the following verification code to verify your email address:</p>
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 8px;">${verificationCode}</h1>
          </div>
          <p>Enter this code on the verification page: <a href="${verifyUrl}">${verifyUrl}</a></p>
          <p style="color: #6B7280; font-size: 14px;">This code will expire in 15 minutes.</p>
        </div>
      `
    });

    return { user: userRes.rows[0], tenant };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function verifyEmailToken(token) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, email, verification_expires FROM users WHERE verification_token=$1`,
      [token]
    );
    if (res.rowCount === 0) return null;
    const user = res.rows[0];
    if (new Date(user.verification_expires) < new Date()) return null;

    await client.query(
      `UPDATE users SET is_verified=true, verification_token=NULL, verification_expires=NULL WHERE id=$1`,
      [user.id]
    );

    return { id: user.id, email: user.email };
  } finally {
    client.release();
  }
}

export async function verifyEmailCode(code, email) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, email, verification_expires FROM users WHERE verification_token=$1 AND email=$2`,
      [code, email]
    );
    if (res.rowCount === 0) return null;
    const user = res.rows[0];
    if (new Date(user.verification_expires) < new Date()) return null;

    await client.query(
      `UPDATE users SET is_verified=true, verification_token=NULL, verification_expires=NULL WHERE id=$1`,
      [user.id]
    );

    return { id: user.id, email: user.email };
  } finally {
    client.release();
  }
}
