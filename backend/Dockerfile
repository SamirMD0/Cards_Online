# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production && \
    npm cache clean --force

# ===================================
# Stage 2: Build
# ===================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY backend/src ./src
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ===================================
# Stage 3: Production Runner
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
COPY --chown=unoapp:nodejs backend/prisma ./prisma

# Create logs directory
RUN mkdir -p /app/logs && chown unoapp:nodejs /app/logs

# Switch to non-root user
USER unoapp

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-3001}/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/server.js"]