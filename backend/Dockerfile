# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# ===================================
# Stage 2: Build
# ===================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ===================================
# Stage 3: Production Runner (256 MB)
# ===================================
FROM node:18-alpine AS runner

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 unoapp

WORKDIR /app

# Copy production dependencies
COPY --from=deps --chown=unoapp:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=unoapp:nodejs /app/dist ./dist

# Copy Prisma schema (needed for runtime)
COPY --from=builder --chown=unoapp:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=unoapp:nodejs prisma ./prisma

# Create logs directory
RUN mkdir -p /app/logs && chown unoapp:nodejs /app/logs

# Switch to non-root user
USER unoapp

# ✅ FREE TIER: Lightweight health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Expose port (Fly.io uses 8080 internally)
EXPOSE 8080

# ✅ FREE TIER: Set memory limit for Node.js
ENV NODE_OPTIONS="--max-old-space-size=220"

# Start application
CMD ["node", "dist/server.js"]