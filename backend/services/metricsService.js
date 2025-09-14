// services/metricsService.js
import { pool } from "../config/db.js";

export async function getOverview(tenantId) {
  const totalCustomersRes = await pool.query(`SELECT COUNT(*) AS cnt FROM customers WHERE tenant_id=$1`, [tenantId]);
  const totalOrdersRes = await pool.query(`SELECT COUNT(*) AS cnt FROM orders WHERE tenant_id=$1`, [tenantId]);
  const totalRevenueRes = await pool.query(`SELECT COALESCE(SUM(total_cents),0) AS cents FROM orders WHERE tenant_id=$1`, [tenantId]);

  return {
    customers: parseInt(totalCustomersRes.rows[0].cnt, 10),
    orders: parseInt(totalOrdersRes.rows[0].cnt, 10),
    revenue: (parseInt(totalRevenueRes.rows[0].cents, 10) || 0) / 100.0
  };
}

export async function getOrdersByDate(tenantId, from, to) {
  // from/to expected as ISO strings; validate before calling
  const res = await pool.query(
    `SELECT date_trunc('day', placed_at) AS day, COUNT(*) AS orders, COALESCE(SUM(total_cents),0)/100.0 AS revenue
     FROM orders
     WHERE tenant_id=$1 AND placed_at BETWEEN $2::timestamptz AND $3::timestamptz
     GROUP BY day
     ORDER BY day`,
    [tenantId, from, to]
  );
  return res.rows;
}

export async function getTopCustomersBySpend(tenantId, limit = 5) {
  const res = await pool.query(
    `SELECT c.id, c.name, c.email, 
            COALESCE(SUM(o.total_cents), 0)/100.0 AS total_spent,
            COUNT(o.id) AS order_count
     FROM customers c
     LEFT JOIN orders o ON c.id = o.customer_id AND o.tenant_id = $1
     WHERE c.tenant_id = $1
     GROUP BY c.id, c.name, c.email
     ORDER BY total_spent DESC
     LIMIT $2`,
    [tenantId, limit]
  );
  return res.rows;
}

export async function getRevenueTrends(tenantId) {
  // Get last 30 days revenue trend
  const res = await pool.query(
    `SELECT date_trunc('day', placed_at) AS day, 
            COALESCE(SUM(total_cents),0)/100.0 AS revenue,
            COUNT(*) AS orders
     FROM orders
     WHERE tenant_id=$1 AND placed_at >= NOW() - INTERVAL '30 days'
     GROUP BY day
     ORDER BY day`,
    [tenantId]
  );
  return res.rows;
}

export async function getCustomerGrowth(tenantId) {
  // Get customer growth over last 12 months
  const res = await pool.query(
    `SELECT date_trunc('month', created_at) AS month, COUNT(*) AS new_customers
     FROM customers
     WHERE tenant_id=$1 AND created_at >= NOW() - INTERVAL '12 months'
     GROUP BY month
     ORDER BY month`,
    [tenantId]
  );
  return res.rows;
}

export async function getAverageOrderValue(tenantId) {
  const res = await pool.query(
    `SELECT AVG(total_cents)/100.0 AS avg_order_value,
            COUNT(*) AS total_orders,
            MIN(total_cents)/100.0 AS min_order,
            MAX(total_cents)/100.0 AS max_order
     FROM orders
     WHERE tenant_id=$1`,
    [tenantId]
  );
  return res.rows[0];
}

export async function getSalesByHour(tenantId) {
  const res = await pool.query(
    `SELECT EXTRACT(hour FROM placed_at) AS hour, 
            COUNT(*) AS orders,
            COALESCE(SUM(total_cents),0)/100.0 AS revenue
     FROM orders
     WHERE tenant_id=$1 AND placed_at >= NOW() - INTERVAL '30 days'
     GROUP BY hour
     ORDER BY hour`,
    [tenantId]
  );
  return res.rows;
}