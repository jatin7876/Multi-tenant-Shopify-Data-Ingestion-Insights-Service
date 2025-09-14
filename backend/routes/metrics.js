// routes/metrics.js
import express from "express";
import { getOverview, getOrdersByDate, getTopCustomersBySpend, getRevenueTrends, getCustomerGrowth, getAverageOrderValue, getSalesByHour } from "../services/metricsService.js";

const router = express.Router();

// GET /api/metrics/overview
router.get("/overview", async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const overview = await getOverview(tenantId);
    res.json(overview);
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/orders-by-date?from=2025-01-01&to=2025-01-31
router.get("/orders-by-date", async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: "Missing from/to" });
    const data = await getOrdersByDate(tenantId, from, to);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/top-customers
router.get("/top-customers", async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const { limit = 5 } = req.query;
    const data = await getTopCustomersBySpend(tenantId, parseInt(limit));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/revenue-trends
router.get("/revenue-trends", async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const data = await getRevenueTrends(tenantId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/customer-growth
router.get("/customer-growth", async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const data = await getCustomerGrowth(tenantId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/average-order-value
router.get("/average-order-value", async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const data = await getAverageOrderValue(tenantId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/sales-by-hour
router.get("/sales-by-hour", async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const data = await getSalesByHour(tenantId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
