# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:20-bullseye-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ===================================
# Stage 2: Build
# ===================================
FROM node:20-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
RUN npm ci

COPY src ./src
COPY prisma ./prisma

# ✅ Generate Prisma with driver adapters
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ===================================
# Stage 3: Production (256MB Optimized)
# ===================================
FROM node:20-bullseye-slim AS runner

# Install OpenSSL 1.1
RUN apt-get update && \
    apt-get install -y libssl1.1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Security: Non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 unoapp

WORKDIR /app

# Copy package.json
COPY --from=builder --chown=unoapp:nodejs /app/package.json ./package.json

# Copy production deps
COPY --from=deps --chown=unoapp:nodejs /app/node_modules ./node_modules

# Copy built app
COPY --from=builder --chown=unoapp:nodejs /app/dist ./dist

# Copy Prisma runtime
COPY --from=builder --chown=unoapp:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=unoapp:nodejs prisma ./prisma

# Logs directory
RUN mkdir -p /app/logs && chown unoapp:nodejs /app/logs

USER unoapp

EXPOSE 8080

ENV NODE_OPTIONS="--max-old-space-size=200"

CMD ["node", "dist/server.js"]
