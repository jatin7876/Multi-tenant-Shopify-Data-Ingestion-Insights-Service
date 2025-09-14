// services/webhookService.js
import { pool } from "../config/db.js";

export async function saveRawEvent(tenantId, topic, payload) {
  await pool.query(
    `INSERT INTO events (tenant_id, type, payload, processed)
     VALUES ($1, $2, $3, false)`,
    [tenantId, topic, payload]
  );
}

export async function processShopifyEvent(tenantId, topic, payload) {
  if (topic.startsWith("customers")) {
    return upsertCustomer(tenantId, payload);
  } else if (topic.startsWith("products")) {
    return upsertProduct(tenantId, payload);
  } else if (topic.startsWith("orders")) {
    return upsertOrder(tenantId, payload);
  } else {
    // For other topics store raw event only
    return;
  }
}

/* ========== Upsert helpers ========== */

export async function upsertCustomer(tenantId, payload) {
  // normalize
  const shopifyId = payload.id ? String(payload.id) : null;
  const email = payload.email || null;
  const name = payload.first_name || payload.last_name ? `${payload.first_name || ""} ${payload.last_name || ""}`.trim() : payload.display_name || null;
  const phone = payload.phone || null;

  // Use ON CONFLICT on (tenant_id, shopify_id)
  await pool.query(
    `INSERT INTO customers (tenant_id, shopify_id, email, name, phone, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,now(),now())
     ON CONFLICT (tenant_id, shopify_id)
     DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, phone = EXCLUDED.phone, updated_at = now()`,
    [tenantId, shopifyId, email, name, phone]
  );
}

export async function upsertProduct(tenantId, payload) {
  const shopifyId = payload.id ? String(payload.id) : null;
  const title = payload.title || payload.name || "Untitled";
  const sku = (payload.variants && payload.variants[0] && payload.variants[0].sku) || null;
  const priceCents = (payload.variants && payload.variants[0] && payload.variants[0].price) ? Math.round(parseFloat(payload.variants[0].price) * 100) : null;
  const inventory = (payload.variants && payload.variants[0] && payload.variants[0].inventory_quantity) || null;

  if (!shopifyId) return;

  await pool.query(
    `INSERT INTO products (tenant_id, shopify_id, title, sku, price_cents, inventory, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,now(),now())
     ON CONFLICT ON CONSTRAINT uq_products_tenant_shopifyid
     DO UPDATE SET title=EXCLUDED.title, sku=EXCLUDED.sku, price_cents=EXCLUDED.price_cents, inventory=EXCLUDED.inventory, updated_at=now()`,
    [tenantId, shopifyId, title, sku, priceCents, inventory]
  );
}
export async function upsertOrder(tenantId, payload) {
  const shopifyId = payload.id ? String(payload.id) : null;
  if (!shopifyId) return;

  const orderNumber = payload.name || payload.order_number || null;
  const totalCents = payload.total_price ? Math.round(parseFloat(payload.total_price) * 100) : null;
  const currency = payload.currency || payload.presentment_currency || null;
  const placedAt = payload.created_at ? new Date(payload.created_at) : null;
  const status = payload.financial_status || payload.fulfillment_status || null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ✅ Ensure customer exists (upsert first!)
    let customerId = null;
    if (payload.customer) {
      const custShopId = String(payload.customer.id);
      const name = (payload.customer.first_name || payload.customer.last_name)
        ? `${payload.customer.first_name || ""} ${payload.customer.last_name || ""}`.trim()
        : payload.customer.email || null;

      const result = await client.query(
        `INSERT INTO customers (tenant_id, shopify_id, email, name, phone, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,now(),now())
         ON CONFLICT (tenant_id, shopify_id)
         DO UPDATE SET email=EXCLUDED.email, name=EXCLUDED.name, phone=EXCLUDED.phone, updated_at=now()
         RETURNING id`,
        [tenantId, custShopId, payload.customer.email || null, name, payload.customer.phone || null]
      );
      customerId = result.rows[0].id;
    }

   await client.query(
  `INSERT INTO orders (tenant_id, shopify_id, order_number, customer_id, total_cents, currency, status, placed_at, created_at, updated_at)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(),now())
   ON CONFLICT (tenant_id, shopify_id)
   DO UPDATE SET order_number = EXCLUDED.order_number,
                 customer_id = COALESCE(EXCLUDED.customer_id, orders.customer_id),
                 total_cents = EXCLUDED.total_cents,
                 currency   = EXCLUDED.currency,
                 status     = EXCLUDED.status,
                 placed_at  = EXCLUDED.placed_at,
                 updated_at = now()`,
  [tenantId, shopifyId, orderNumber, customerId, totalCents, currency, status, placedAt]
);


    // Get order id
    const ordRow = await client.query(
      `SELECT id FROM orders WHERE tenant_id=$1 AND shopify_id=$2`,
      [tenantId, shopifyId]
    );
    const orderId = ordRow.rows[0].id;

    // ✅ Re-insert line items
    await client.query(`DELETE FROM order_items WHERE order_id=$1`, [orderId]);
    if (Array.isArray(payload.line_items)) {
      for (const li of payload.line_items) {
        let productId = null;
        if (li.product_id) {
          const rprod = await client.query(
            `SELECT id FROM products WHERE tenant_id=$1 AND shopify_id=$2`,
            [tenantId, String(li.product_id)]
          );
          if (rprod.rowCount > 0) productId = rprod.rows[0].id;
        }
        const priceCents = li.price ? Math.round(parseFloat(li.price) * 100) : null;
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_cents)
           VALUES ($1,$2,$3,$4)`,
          [orderId, productId, li.quantity || 1, priceCents]
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
