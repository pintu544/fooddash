To deploy when ready:

# Install CLIs once

npm i -g vercel@latest @railway/cli@latest

# Backend → Railway

cd backend && railway login && railway init
railway add --plugin postgresql
railway variables set PORT=4000 FRONTEND_URL=https://your-app.vercel.app NODE_ENV=production
railway up

# Frontend → Vercel

cd ../frontend && vercel login && vercel link
vercel env add NEXT_PUBLIC_API_URL production # paste Railway URL
vercel env add NEXT_PUBLIC_SOCKET_URL production # paste Railway URL
vercel --prod

# Implementation Plan - Food Delivery Order Management

## Problem Statement

Build a full-stack Order Management feature for a food delivery app where users can browse a menu, add items to a cart, place orders with delivery details, and track real-time order
status updates — backed by a REST API with PostgreSQL and Socket.io for live updates.

---

## Requirements

- **Menu Display:** List of food items with name, description, price, and image
- **Cart & Checkout:** Add items, adjust quantities, submit delivery details (name, address, phone)
- **Order Status:** Auto-advances through stages (Received → Preparing → Out for Delivery → Delivered) with a manual admin override endpoint
- **Backend:** Node.js + Express REST API, PostgreSQL database
- **Real-time:** Socket.io WebSockets for live status updates to the client
- **Frontend:** Next.js (App Router)
- **Testing:** Jest + Supertest (API), React Testing Library (UI components), Playwright (E2E)
- **Deployment:** Vercel (frontend) + Railway/Render (backend + DB)

---

## Background

- **Next.js App Router** uses file-system routing under `app/`. Pages are Server Components by default; interactive components use `"use client"`.
- **Socket.io 4.8.x** runs as a standalone HTTP server (or attached to Express). The frontend uses `socket.io-client` to subscribe to order-specific rooms.
- **PostgreSQL** will hold two tables: `menu_items` and `orders`. Prisma ORM will simplify schema management and queries.
- **Status auto-advance** will use `setTimeout` chains on the server after order creation, emitting Socket.io events at each transition.
- **Playwright** supports Next.js out of the box and can test the full browser flow.

---

## Proposed Solution

A monorepo with two workspaces: `backend/` (Express + Socket.io + Prisma + PostgreSQL) and `frontend/` (Next.js). The backend exposes REST endpoints for menu and orders, and a
Socket.io server for real-time status pushes. The frontend consumes the API and connects to Socket.io for live updates on the order tracking page.

```mermaid
graph TD
    subgraph Frontend [Next.js Frontend]
        A[Menu Page] -->|Add to cart| B[Cart / Checkout Page]
        B -->|POST /orders| C[Order Tracking Page]
        C -->|Socket.io room: orderId| D[Live Status Display]
    end

    subgraph Backend [Express Backend]
        E[REST API] -->|Prisma| F[(PostgreSQL)]
        E -->|emit status| G[Socket.io Server]
        G -->|room: orderId| D
        H[Admin Endpoint PATCH /orders/:id/status] --> E
        I[Auto-advance Timer] --> G
    end

    B --> E
    A -->|GET /menu| E

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Task Breakdown

Task 1: Project Scaffolding & Database Schema

- Objective: Set up the monorepo structure, initialize both workspaces, and define the database schema.
- Implementation:
  - Create root package.json with workspaces: ["backend", "frontend"]
  - Initialize backend/ with Express, Prisma, socket.io, cors, dotenv
  - Initialize frontend/ with create-next-app (App Router, TypeScript)
  - Define Prisma schema with two models: MenuItem (id, name, description, price, imageUrl) and Order (id, status, customerName, address, phone, createdAt, items JSON)
  - Run prisma migrate dev to create the DB and seed it with 6–8 sample menu items
  - Write a seed script (prisma/seed.ts) with realistic food items

- Tests: Verify migration runs cleanly; seed script populates DB without errors
- Demo: Running prisma studio shows populated menu_items table

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Task 2: Backend REST API — Menu & Orders

- Objective: Build and test all REST endpoints for menu retrieval and order CRUD.
- Implementation:
  - GET /api/menu — returns all menu items
  - POST /api/orders — validates payload, creates order with status RECEIVED, returns created order
  - GET /api/orders/:id — returns order with current status
  - PATCH /api/orders/:id/status — admin endpoint to manually set status
  - Add input validation middleware using zod
  - Add global error handler middleware

- Tests (Jest + Supertest):
  - GET /api/menu returns 200 with array of items
  - POST /api/orders with valid payload returns 201 with order id and status RECEIVED
  - POST /api/orders with missing fields returns 400 with validation errors
  - GET /api/orders/:id returns 200 for existing, 404 for unknown id
  - PATCH /api/orders/:id/status with invalid status returns 400

- Demo: All API tests pass; endpoints verified via Postman/curl

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Task 3: Real-Time Order Status with Socket.io

- Objective: Attach Socket.io to the Express server and implement auto-advance + manual status transitions with live events.
- Implementation:
  - Attach Socket.io to the Express HTTP server with CORS configured for the frontend origin
  - On POST /api/orders success, start a timer chain: after 10s → PREPARING, after 30s → OUT_FOR_DELIVERY, after 60s → DELIVERED
  - Each transition persists to DB and emits status:update to room order:{id}
  - Client joins room on connect by passing orderId as a query param
  - PATCH /api/orders/:id/status also emits status:update and cancels pending timers
  - Export a statusTimers map for testability

- Tests (Jest):
  - Unit test the timer chain: mock setTimeout, verify correct status sequence and DB writes
  - Unit test that manual status update cancels the pending timer

- Demo: Place an order via curl; a socket.io-client Node script prints live status updates in real time

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Task 4: Next.js Frontend — Menu Page & Cart

- Objective: Build the menu browsing and cart experience.
- Implementation:
  - app/page.tsx — Menu page: fetch GET /api/menu (server component), render <MenuItemCard> grid
  - MenuItemCard client component: name, description, price, image, "Add to Cart" button
  - Cart state managed via React Context (CartProvider) in app/layout.tsx
  - CartDrawer client component: slide-in panel with items, quantity +/- controls, subtotals, total, "Checkout" button
  - Cart persisted to localStorage
  - Responsive layout with Tailwind CSS

- Tests (React Testing Library):
  - MenuItemCard renders name, price, and fires onAddToCart callback
  - CartDrawer shows correct item count and total after adding items
  - Quantity increment/decrement updates totals correctly

- Demo: Browse menu, add items, adjust quantities in the cart drawer — all without a page reload

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Task 5: Next.js Frontend — Checkout & Order Placement

- Objective: Build the checkout form and wire it to the backend order API.
- Implementation:
  - app/checkout/page.tsx — cart summary + delivery details form (name, address, phone)
  - Client-side validation with react-hook-form + zod
  - On submit: POST /api/orders, clear cart, redirect to /orders/[id]
  - Show loading state on submit button; show error message on API failure

- Tests (React Testing Library):
  - Form shows validation errors for empty required fields
  - Form shows validation error for invalid phone format
  - Successful submission calls the API with correct payload and redirects
  - API error shows user-friendly error message

- Demo: Fill out checkout form, submit — redirected to order tracking page with the new order ID

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Task 6: Next.js Frontend — Order Tracking Page with Live Updates

- Objective: Build the order status tracking page with Socket.io real-time updates.
- Implementation:
  - app/orders/[id]/page.tsx — fetches initial order via GET /api/orders/:id
  - OrderStatusTracker client component: connects to Socket.io, joins room order:{id}, listens for status:update events
  - Visual stepper component showing all 4 statuses with active/completed states
  - Gracefully handle socket disconnection (show "reconnecting..." indicator)
  - useOrderStatus custom hook encapsulates socket logic

- Tests (React Testing Library):
  - OrderStatusTracker renders correct active step for each status value
  - useOrderStatus hook updates status when socket emits status:update
  - Disconnected state shows reconnecting indicator

- Demo: Open the order tracking page — watch the status stepper advance automatically without any page refresh

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Task 7: End-to-End Tests with Playwright

- Objective: Write E2E tests covering the full user journey.
- Implementation:
  - Set up Playwright targeting the running Next.js dev server
  - Test 1 — Happy path: menu → add items → cart → checkout → submit → verify tracking page shows "Order Received"
  - Test 2 — Checkout validation: submit empty form → verify all validation errors appear
  - Test 3 — Real-time update: place order → wait for socket event → verify status stepper advances to "Preparing"
  - Add npm run test:e2e script

- Tests: All 3 Playwright tests pass against the local dev stack
- Demo: npm run test:e2e runs and all tests pass with a visible browser trace

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Task 8: Deployment & Final Polish

- Objective: Deploy the app, add final UX polish, and ensure the repo is presentable.
- Implementation:
  - Deploy PostgreSQL + Express backend to Railway or Render; set environment variables
  - Deploy Next.js frontend to Vercel; set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SOCKET_URL
  - Add README.md with setup instructions, architecture overview, and hosted app link
  - Add loading skeletons for menu items and order page
  - Add a 404 page for unknown order IDs
  - Ensure all images have alt text; form fields have labels (accessibility)
  - Run Lighthouse and fix any critical a11y issues

- Tests: Playwright E2E suite passes against the deployed URL
- Demo: Fully working hosted app accessible via public URL; all tests green


---




```
