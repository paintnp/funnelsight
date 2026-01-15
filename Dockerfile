# Multi-stage Dockerfile for FunnelSight
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# CRITICAL: Accept VITE_API_URL as build argument for production builds
# This MUST be set at build time for Vite to embed it in the client bundle
ARG VITE_API_URL=https://funnelsight.fly.dev
ENV VITE_API_URL=$VITE_API_URL

# Copy root package files
COPY package*.json ./

# Install root dependencies (needed for shared types)
RUN npm ci

# Copy shared types
COPY shared ./shared

# Copy vite config (needed for path aliases)
COPY vite.config.ts ./

# Copy Tailwind and PostCSS configs (CRITICAL for CSS processing)
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Copy frontend source
COPY client ./client

# Build frontend with production environment (run from root so vite.config.ts paths work)
ENV NODE_ENV=production
RUN npx vite build --config vite.config.ts

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install all dependencies (need dev deps for TypeScript build)
RUN npm ci

# Copy backend source and shared types
COPY server ./server
COPY shared ./shared
COPY tsconfig.server.json ./

# Build TypeScript backend
RUN npm run build:server

# Stage 3: Production runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and install production dependencies only
COPY package*.json ./

RUN npm ci --only=production --omit=dev

# Copy built backend from builder
COPY --from=backend-builder --chown=nodejs:nodejs /app/dist ./dist

# Copy built frontend from builder
COPY --from=frontend-builder --chown=nodejs:nodejs /app/client/dist ./client/dist

# Copy shared types (runtime reference)
COPY --chown=nodejs:nodejs shared ./shared

# Switch to non-root user
USER nodejs

# Expose port (Fly.io uses 8080 by default)
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server using compiled JavaScript
CMD ["node", "dist/server/index.js"]
