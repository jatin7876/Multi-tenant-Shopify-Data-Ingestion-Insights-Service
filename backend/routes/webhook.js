// routes/webhooks.js
import express from "express";
import { pool } from "../config/db.js";
import { verifyShopifyHmac } from "../utils/shopify.js";
import { processShopifyEvent, saveRawEvent } from "../services/webhookService.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    // IMPORTANT: req.body should be a Buffer when express.raw() is used
    const rawBody = req.body;
    if (!rawBody) return res.status(400).send("Missing body");

    const headers = req.headers;
    const shop = headers["x-shopify-shop-domain"];
    const topic = headers["x-shopify-topic"];
    const hmac = headers["x-shopify-hmac-sha256"];

    if (!shop || !topic) return res.status(400).send("Missing headers");
console.log("Incoming webhook:", {
  shop,
  topic,
  hmac,
  raw: rawBody.toString("utf8")
});

    // Dev bypass: useful while testing locally with curl/Postman
    const skipHmac = process.env.SKIP_SHOPIFY_HMAC === "true" || process.env.NODE_ENV === "development";

    if (!skipHmac) {
      if (!hmac || !verifyShopifyHmac(rawBody, process.env.SHOPIFY_SECRET || "", hmac)) {
        return res.status(401).send("Invalid HMAC");
      }
    } else {
      console.warn("⚠️ SKIPPING Shopify HMAC verification (dev mode)");
    }

    // Find tenant by shop domain
    const t = await pool.query("SELECT id FROM tenants WHERE domain=$1", [shop]);
    if (t.rowCount === 0) {
      // Option: auto-create tenant minimally instead of returning 404.
      // For now return 404 so you explicitly register tenants or connect tokens.
      return res.status(404).send("Unknown tenant");
    }
    const tenantId = t.rows[0].id;

    // Parse the raw body into JSON safely
    let payload;
    try {
      const text = rawBody.toString("utf8");
      payload = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse webhook JSON:", err);
      return res.status(400).send("Invalid JSON payload");
    }

    // Save raw event for audit
    await saveRawEvent(tenantId, topic, payload);

    // Process asynchronously (do not block Shopify)
    processShopifyEvent(tenantId, topic, payload).catch(err => {
      console.error("Error processing Shopify event:", err);
    });

    return res.status(200).send("ok");
  } catch (err) {
    next(err);
  }
});

export default router;
