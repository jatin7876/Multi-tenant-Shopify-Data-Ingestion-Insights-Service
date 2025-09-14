// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

import authRoutes from "./routes/auth.js";
import webhookRoutes from "./routes/webhook.js"; // note plural
import metricsRoutes from "./routes/metrics.js";
import tenantsRoutes from "./routes/tenant.js";
import customerRoutes from "./routes/customer.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import { verifyJwt } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Mount webhook raw body parser BEFORE any JSON parser
// Shopify sends raw JSON and HMAC must be computed over raw payload
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

// Now parse JSON for all other routes
app.use(bodyParser.json());

// Public/unprotected routes
app.use("/api/auth", authRoutes);

// Protected routes (require JWT)
app.use("/api/metrics", verifyJwt, metricsRoutes);
app.use("/api/tenants", verifyJwt, tenantsRoutes);
app.use("/api/customers", verifyJwt, customerRoutes);
app.use("/api/products", verifyJwt, productRoutes);
app.use("/api/orders", verifyJwt, orderRoutes);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
