# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

# Prisma engines require OpenSSL
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and prisma schema
COPY package.json ./
COPY prisma ./prisma

# Install all deps (including devDeps needed for build)
RUN npm install

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Generate Prisma client and compile TypeScript
RUN npm run build

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:22-slim AS runner

# Prisma engines require OpenSSL
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production deps only
COPY package.json ./
COPY prisma ./prisma
RUN npm install --omit=dev

# Copy compiled output and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 4000

CMD ["npm", "run", "start:migrate"]
