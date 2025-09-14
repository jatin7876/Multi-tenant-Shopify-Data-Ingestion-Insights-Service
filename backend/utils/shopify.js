// utils/shopify.js
import crypto from "crypto";

export function verifyShopifyHmac(rawBody, shopifySecret, hmacHeader) {
  if (!rawBody || !shopifySecret || !hmacHeader) return false;
  // rawBody should be a Buffer
  const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), "utf8");
  const digest = crypto.createHmac("sha256", shopifySecret).update(bodyBuffer).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch (e) {
    return false;
  }
}
