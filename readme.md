# FoodDash — Order Management App

A full-stack food delivery order management app built as a Sr Full Stack Developer assessment.

## 🚀 Live Demo

- **Frontend**: https://fooddash-frontend.vercel.app
- **Backend API**: https://backend-production-0ad7.up.railway.app
- **GitHub Repository**: https://github.com/pintu544/fooddash

## 📋 Quick Start

Clone and run locally:

```bash
git clone https://github.com/pintu544/fooddash.git
cd fooddash
npm install

# Backend setup
cd backend && cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations & seed
npx prisma migrate dev
npx prisma db seed

# Start in two terminals
npm run dev:backend   # Terminal 1: Backend (port 4000)
npm run dev:frontend  # Terminal 2: Frontend (port 3000)
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Real-time | Socket.io (WebSockets) |
| Testing | Jest + Supertest, React Testing Library, Playwright |
| Deployment | Vercel (frontend) + Railway (backend + DB) |

## Features

- **Menu Display** — Browse food items with name, description, price, and image
- **Cart** — Add/remove items, adjust quantities, persisted to localStorage
- **Checkout** — Delivery details form with client and server-side validation
- **Order Tracking** — Real-time status updates via Socket.io WebSockets
- **Auto Status Advance** — Orders auto-progress: Received → Preparing → Out for Delivery → Delivered
- **Admin Override** — `PATCH /api/orders/:id/status` to manually set status

## Project Structure

```
food-delivery/
├── backend/               # Express API + Socket.io
│   ├── prisma/
│   │   ├── schema.prisma  # DB schema (MenuItem, Order)
│   │   └── seed.ts        # Seed 8 menu items
│   ├── src/
│   │   ├── app.ts         # Express app factory
│   │   ├── index.ts       # HTTP server + Socket.io init
│   │   ├── lib/
│   │   │   ├── prisma.ts  # Prisma client singleton
│   │   │   ├── socket.ts  # Socket.io initialisation
│   │   │   └── orderTimer.ts # Auto-advance status logic
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   └── routes/
│   │       ├── menu.ts    # GET /api/menu
│   │       └── orders.ts  # POST/GET/PATCH /api/orders
│   └── tests/             # Jest + Supertest tests
└── frontend/              # Next.js app
    ├── app/
    │   ├── layout.tsx      # Root layout with CartProvider + Navbar
    │   ├── page.tsx        # Menu page (server component)
    │   ├── checkout/       # Checkout form
    │   └── orders/[id]/    # Order tracking page
    ├── components/ui/      # MenuItemCard, CartDrawer, Navbar, etc.
    ├── context/            # CartContext (useReducer + localStorage)
    ├── hooks/              # useOrderStatus (Socket.io)
    ├── lib/                # API client
    ├── types/              # Shared TypeScript types
    ├── __tests__/          # React Testing Library tests
    └── e2e/                # Playwright E2E tests
```

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone https://github.com/pintu544/fooddash.git
cd fooddash
npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Database setup

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# Seed menu items
npx prisma db seed
```

### 4. Run the app

```bash
# In two terminals:

# Terminal 1 — Backend (port 4000)
npm run dev:backend

# Terminal 2 — Frontend (port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000)

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | List all available menu items |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/:id` | Get order by ID |
| PATCH | `/api/orders/:id/status` | Update order status (admin) |
| GET | `/health` | Health check |

### POST /api/orders — Request body

```json
{
  "customerName": "Jane Doe",
  "address": "123 Main Street, Springfield",
  "phone": "+1 555-0100",
  "items": [
    { "menuItemId": "...", "name": "Margherita Pizza", "price": 12.99, "quantity": 2 }
  ]
}
```

### PATCH /api/orders/:id/status — Request body

```json
{ "status": "PREPARING" }
```

Valid statuses: `RECEIVED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`

## Testing

```bash
# Backend unit + API tests
npm run test:backend

# Frontend component tests
npm run test:frontend

# E2E tests (requires running dev stack)
npm run test:e2e
```

## Deployment

### Live Deployment

This project is deployed on:
- **Frontend**: [Vercel](https://vercel.com) → https://fooddash-frontend.vercel.app
- **Backend API**: [Railway](https://railway.app) → https://backend-production-0ad7.up.railway.app
- **Database**: PostgreSQL on Railway

### Deploy Your Own

#### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` — your Railway backend URL
- `NEXT_PUBLIC_SOCKET_URL` — your Railway backend URL

#### Railway (Backend + PostgreSQL)
```bash
cd backend
railway login
railway up
```

Set environment variables on Railway:
- `DATABASE_URL` — auto-provided by Postgres addon
- `PORT` — `4000`
- `FRONTEND_URL` — your Vercel app URL (for CORS)
- `NODE_ENV` — `production`

## Architecture Notes

- **Monorepo** with npm workspaces (`backend/`, `frontend/`)
- **Prisma** manages schema migrations and type-safe DB access
- **Socket.io rooms** — each order gets its own room `order:{id}`; clients join on page load
- **Auto-advance timers** run server-side via `setTimeout` chains (10s → 30s → 60s)
- **Zod** validates all API inputs on the backend; `react-hook-form + zod` on the frontend
- **Next.js App Router** — menu page is a Server Component for SEO/performance; interactive pages use `"use client"`
