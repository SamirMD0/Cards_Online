# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:18-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ===================================
# Stage 2: Build
# ===================================
FROM node:18-alpine AS builder

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
FROM node:18-alpine AS runner

# Security: Non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 unoapp

WORKDIR /app

# Copy production deps
COPY --from=deps --chown=unoapp:nodejs /app/node_modules ./node_modules

# Copy built app
COPY --from=builder --chown=unoapp:nodejs /app/dist ./dist

# Copy Prisma (needed for runtime)
COPY --from=builder --chown=unoapp:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=unoapp:nodejs prisma ./prisma

# Create logs directory
RUN mkdir -p /app/logs && chown unoapp:nodejs /app/logs

USER unoapp

# ✅ Lightweight health check (no curl needed)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

EXPOSE 8080

# ✅ CRITICAL: Set Node.js memory limit for 256MB VM
ENV NODE_OPTIONS="--max-old-space-size=200"

CMD ["node", "dist/server.js"]