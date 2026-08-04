# Deployment Guide

## Overview

| Service | Platform | Directory |
|---------|----------|-----------|
| Frontend | Vercel | `frontend/` |
| Backend API | Railway | `backend/` |
| PostgreSQL DB | Railway | (addon) |

---

## Prerequisites

Install the CLIs:

```bash
# Vercel CLI
npm install -g vercel@latest

# Railway CLI
npm install -g @railway/cli@latest
```

---

## Railway — Backend + Database

### 1. Login

```bash
railway login
```

### 2. Create a new project

```bash
cd backend
railway init
# Choose "Empty project", name it "fooddash-backend"
```

### 3. Add a PostgreSQL database

```bash
railway add -d postgres
```

Railway auto-sets `DATABASE_URL` in your service environment.

### 4. Set environment variables

```bash
railway variables set PORT=4000
railway variables set FRONTEND_URL=https://your-app.vercel.app
railway variables set NODE_ENV=production
```

> Set `FRONTEND_URL` to your Vercel URL. You can update it after deploying the frontend.

### 5. Deploy

```bash
railway up
```

Railway will:
1. Run `npm install` (triggers `postinstall` → `prisma generate`)
2. Run `npm run build` (`prisma generate && tsc`)
3. Start with `npm run start:migrate` (`prisma migrate deploy && node dist/index.js`)

### 6. Get your backend URL

```bash
railway domain
```

Note this URL — you'll need it for the Vercel env vars.

### 7. Seed the database (optional, first deploy only)

```bash
railway run npm run prisma:seed
```

---

## Vercel — Frontend

### 1. Login

```bash
cd frontend
vercel login
```

### 2. Link the project

```bash
vercel link
# Choose "Create new project" → name it "fooddash-frontend"
```

### 3. Set environment variables

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.up.railway.app

vercel env add NEXT_PUBLIC_SOCKET_URL production
# Enter: https://your-backend.up.railway.app
```

> Use your Railway backend URL from step 6 above.

### 4. Deploy

```bash
vercel --prod
```

Vercel will:
1. Run `npm install`
2. Run `npm run build` (`next build`)
3. Serve from the `.next` output directory

### 5. Update Railway FRONTEND_URL

Once you have your Vercel URL (e.g. `https://fooddash.vercel.app`):

```bash
cd ../backend
railway variables set FRONTEND_URL=https://fooddash.vercel.app
railway up
```

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Set automatically by Railway addon |
| `PORT` | Server port | `4000` |
| `FRONTEND_URL` | Vercel app URL (for CORS) | `https://fooddash.vercel.app` |
| `NODE_ENV` | Environment | `production` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL | `https://fooddash-backend.up.railway.app` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `https://fooddash-backend.up.railway.app` |

---

## Redeployment

```bash
# Redeploy backend
cd backend && railway up

# Redeploy frontend
cd frontend && vercel --prod
```

## Useful Commands

```bash
# View Railway logs
railway logs

# Open Railway dashboard
railway open

# View Vercel deployments
vercel ls

# Open deployed Vercel app
vercel open
```
