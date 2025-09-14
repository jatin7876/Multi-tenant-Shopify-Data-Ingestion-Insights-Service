Documentation

Detailed project documentation (assumptions, architecture, APIs, and next steps) is available here:
👉 Shopify Documentation (PDF)

🚀 Features

Multi-tenant support (tenant_id per store)

Secure JWT authentication with email verification

Shopify webhook ingestion:

Customers (create/update)

Products (create/update)

Orders (create/update)

Raw event storage for audit trail

React-based dashboard for metrics

PostgreSQL (Neon) as scalable RDBMS

⚙️ Setup Instructions
1. Clone the repo
git clone https://github.com/your-username/your-repo.git
cd your-repo

2. Backend setup
cd backend
npm install


Create .env file:

DATABASE_URL=postgresql://user:password@xxxx.neon.tech/dbname?sslmode=require
JWT_SECRET=super-secret-jwt-key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

FRONTEND_URL=http://localhost:5173

SHOPIFY_CLIENT_ID=your-client-id
SHOPIFY_CLIENT_SECRET=your-client-secret
SHOPIFY_SECRET=your-webhook-secret

PORT=4000


Run database migrations:

psql $DATABASE_URL -f schema.sql


Start backend:

npm run dev

3. Frontend setup
cd frontend
npm install
npm run dev


Frontend runs on: http://localhost:5173

📡 API Routes
Authentication

POST /api/auth/register – register new user

POST /api/auth/login – login and get JWT

Tenants

POST /api/tenants – add a Shopify store

GET /api/tenants – list connected tenants

Shopify Webhooks

POST /api/webhook – endpoint for Shopify events (raw body verified via HMAC)

Metrics

GET /api/metrics/customers

GET /api/metrics/orders

GET /api/metrics/products

Data Access

GET /api/customers

GET /api/products

GET /api/orders

🛠️ Next Steps (Production Readiness)

Add retry queues (e.g., BullMQ with Redis) for failed webhook ingestion

Implement row-level security for tenants

Add monitoring/logging (Winston, Datadog)

Deploy backend (Render, Railway, AWS) + frontend (Vercel, Netlify)