# 🛍️ Shopify Data Ingestion & Dashboard

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)  
![React](https://img.shields.io/badge/React-18-blue?logo=react)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20DB-blue?logo=postgresql)  
![Shopify](https://img.shields.io/badge/Shopify-Integration-brightgreen?logo=shopify)  
![License](https://img.shields.io/badge/License-MIT-purple)  

---

## ✨ Overview
This project implements a **Shopify Data Ingestion and Analytics Dashboard**.  
It connects Shopify stores via **webhooks**, ingests data (customers, products, orders), stores it in a **PostgreSQL (Neon)** database, and provides a **React-based dashboard** to visualize metrics.  

✅ Multi-Tenant Architecture  
✅ JWT Authentication & Email Verification  
✅ Secure Shopify Webhook Integration  
✅ Real-time Metrics Dashboard  

---

## 📄 Documentation
👉 Full documentation: [Shopify_Documentation.pdf](docs/Shopify_Documentation.pdf)


---

## ⚡ Tech Stack
- 🎨 **Frontend**: React (Vite), Tailwind  
- 🖥️ **Backend**: Node.js, Express, JWT  
- 🗄️ **Database**: PostgreSQL (Neon)  
- 📩 **Email Service**: Nodemailer (SMTP)  
- 🛒 **Shopify Integration**: Webhooks + APIs  

---

## 🚀 Setup Instructions

### 🔧 Backend
```bash
cd backend
npm install
npm run dev
| Category     | Endpoint                 | Method | Auth    |
| ------------ | ------------------------ | ------ | ------- |
| 🔐 Auth      | `/api/auth/register`     | POST   | ✅       |
|              | `/api/auth/login`        | POST   | ✅       |
| 🛍️ Webhooks | `/api/webhook`           | POST   | Shopify |
| 📊 Metrics   | `/api/metrics/customers` | GET    | ✅       |
|              | `/api/metrics/orders`    | GET    | ✅       |
|              | `/api/metrics/products`  | GET    | ✅       |
| 👥 Customers | `/api/customers`         | GET    | ✅       |
| 📦 Products  | `/api/products`          | GET    | ✅       |
| 🧾 Orders    | `/api/orders`            | GET    | ✅       |


---

## 🏗️ Architecture

