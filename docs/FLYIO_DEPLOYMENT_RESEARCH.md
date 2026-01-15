# Research Report: Fly.io Deployment for FunnelSight

## Executive Summary

Based on analysis of the production checklist and Fly.io best practices, FunnelSight should be deployed as a single Docker container with Express serving both the API and the built Vite frontend static files. This approach simplifies deployment, reduces complexity, and follows proven patterns from the app-factory production checklist.

## Core Technologies Required

- **Docker**: Multi-stage build with node:20-alpine - Minimizes image size
- **Fly.io CLI**: v0.2.x - Latest deployment tooling
- **Express Static Middleware**: serve-static - For production file serving
- **TypeScript Build Tools**: tsx for runtime - Handles path aliases
- **Vite Production Build**: v5.x - Optimized frontend bundles

## Architecture Recommendations

### Backend
- Single Express server on port 5013 (internally mapped to 8080 for Fly.io)
- Serve API routes at `/api/*`
- Serve static frontend files from `/client/dist`
- Use compression middleware for static files
- Implement proper middleware ordering (static files BEFORE auth)

### Frontend
- Build with Vite to `/client/dist`
- Configure proper base URL for production
- Use environment variables with VITE_ prefix
- Implement SPA fallback for client-side routing

### Data Storage
- Remote Supabase PostgreSQL (no local database needed)
- Connection via DATABASE_URL environment variable
- Use Drizzle ORM with proper SSL configuration

## Implementation Challenges

1. **Challenge**: TypeScript path aliases breaking in production
   **Solution**: Use relative imports with .js extensions in server code, or configure tsx runtime properly

2. **Challenge**: Environment variables not accessible in frontend
   **Solution**: Prefix all client-side variables with VITE_ (e.g., VITE_SUPABASE_URL)

3. **Challenge**: CORS configuration for production
   **Solution**: Explicitly whitelist production domain, avoid wildcard origins

4. **Challenge**: Health checks failing on Fly.io
   **Solution**: Implement HTTP health check endpoint at `/api/health` returning 200 status

## Code Patterns

### Express Production Configuration
```typescript
// server/index.ts - Production static file serving
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  const staticPath = path.join(__dirname, '../client/dist');
  app.use(express.static(staticPath));

  // API routes
  app.use('/api', apiRouter);

  // SPA fallback - MUST be last
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // Development: Vite dev server handles frontend
  app.use('/api', apiRouter);
}

const PORT = process.env.PORT || 5013;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Complete Production Dockerfile
```dockerfile
# Multi-stage Dockerfile for FunnelSight
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd client && npm ci --only=production

# Copy frontend source
COPY client ./client
COPY shared ./shared

# Build frontend with production environment
ENV NODE_ENV=production
RUN cd client && npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install all dependencies (need dev deps for TypeScript build)
RUN npm ci
RUN cd server && npm ci

# Copy backend source and shared types
COPY server ./server
COPY shared ./shared
COPY tsconfig.json ./

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
COPY server/package*.json ./server/

RUN npm ci --only=production --omit=dev
RUN cd server && npm ci --only=production --omit=dev

# Copy built backend from builder
COPY --from=backend-builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/server/dist ./server/dist

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
CMD ["node", "server/dist/index.js"]
```

### Complete fly.toml Configuration
```toml
# fly.toml for FunnelSight
app = "funnelsight"
primary_region = "iad"  # US East (Virginia)
kill_signal = "SIGINT"
kill_timeout = "5s"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"
  AUTH_MODE = "supabase"
  STORAGE_MODE = "supabase"

# Main HTTP service configuration
[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

  # HTTP health check configuration
  [[http_service.checks]]
    grace_period = "10s"
    interval = "15s"
    method = "GET"
    path = "/api/health"
    protocol = "http"
    timeout = "5s"

  # Concurrency limits
  [http_service.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

# Machine resources
[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

### .dockerignore File
```
# Dependencies
node_modules
*/node_modules

# Environment files
.env
.env.local
.env.production
.env.*

# Build outputs (will be rebuilt in Docker)
dist
*/dist
build
*/build

# Version control
.git
.gitignore

# Development files
.vscode
.idea
*.log
*.swp
.DS_Store

# Test files
coverage
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx

# Documentation
*.md
docs

# Fly.io
fly.toml
```

## External APIs/Services

- **Supabase**: https://supabase.com/docs/reference/javascript/introduction
- **Anthropic Claude API**: https://docs.anthropic.com/claude/reference/getting-started
- **Fly.io CLI**: https://fly.io/docs/hands-on/install-flyctl/
- **Fly.io Secrets**: https://fly.io/docs/reference/secrets/

## Deployment Commands

### First-Time Deployment
```bash
# 1. Install Fly CLI (if not installed)
curl -L https://fly.io/install.sh | sh

# 2. Authenticate with Fly.io
fly auth login

# 3. Create the app (first time only)
fly apps create funnelsight

# 4. Set all secrets BEFORE first deploy
fly secrets set SUPABASE_URL="https://xxx.supabase.co" \
  SUPABASE_ANON_KEY="eyJhbGc..." \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..." \
  DATABASE_URL="postgresql://postgres:xxx@xxx.supabase.co:5432/postgres" \
  ANTHROPIC_API_KEY="sk-ant-api03-xxx" \
  VITE_API_URL="https://funnelsight.fly.dev" \
  VITE_SUPABASE_URL="https://xxx.supabase.co" \
  VITE_SUPABASE_ANON_KEY="eyJhbGc..." \
  --app funnelsight

# 5. Deploy the application
fly deploy --app funnelsight

# 6. Open the deployed app
fly open --app funnelsight
```

### Subsequent Deployments
```bash
# Deploy with fresh build (recommended)
fly deploy --no-cache --app funnelsight

# Check deployment status
fly status --app funnelsight

# View logs
fly logs --app funnelsight

# SSH into machine for debugging
fly ssh console --app funnelsight
```

## Environment Variables Guide

### Backend Secrets (via fly secrets set)
```bash
# Supabase credentials
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...  # Safe for frontend, has RLS
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Backend only, bypasses RLS
DATABASE_URL=postgresql://postgres:xxx@xxx.supabase.co:5432/postgres

# AI Service
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# Frontend configuration (MUST have VITE_ prefix)
VITE_API_URL=https://funnelsight.fly.dev  # No trailing slash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Public Environment Variables (in fly.toml)
```toml
[env]
  NODE_ENV = "production"
  PORT = "8080"
  AUTH_MODE = "supabase"
  STORAGE_MODE = "supabase"
```

## Testing Strategy

### 1. Local Production Build Test
```bash
# Build the app locally
npm run build

# Test with production environment
NODE_ENV=production PORT=8080 npm run start:prod

# Verify health endpoint
curl http://localhost:8080/api/health

# Check frontend is served
curl -I http://localhost:8080/
```

### 2. Docker Build Test
```bash
# Build Docker image locally
docker build -t funnelsight:test .

# Run with environment variables
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e SUPABASE_URL=xxx \
  -e SUPABASE_ANON_KEY=xxx \
  funnelsight:test

# Test the containerized app
curl http://localhost:8080/api/health
```

### 3. Pre-Deployment Checklist Verification
```bash
# TypeScript compilation check
npm run typecheck

# Build verification
npm run build

# Check for exposed secrets
grep -r "SERVICE_ROLE" client/  # Should be empty

# Verify environment variables
grep "VITE_" .env  # All client vars should have VITE_ prefix

# Check console.log statements
grep -r "console.log" client/src/ | wc -l  # Should be minimal
```

### 4. Post-Deployment Verification
```bash
# Health check
curl https://funnelsight.fly.dev/api/health

# Check application status
fly status --app funnelsight

# Monitor logs for errors
fly logs --app funnelsight --since 5m

# Verify secrets are set
fly secrets list --app funnelsight
```

## Production Checklist Insights

From analyzing the production checklist, key learnings include:

1. **TypeScript Path Aliases**: Use relative imports with .js extensions in production or ensure tsx runtime is properly configured
2. **Environment Variables**: Client-side variables MUST have VITE_ prefix to be accessible
3. **CORS Security**: Never use wildcard (*) origins in production; explicitly list allowed domains
4. **Health Checks**: HTTP health checks are critical - implement `/api/health` endpoint returning 200
5. **Static File Order**: Serve static files BEFORE auth middleware to avoid authentication on assets
6. **Bundle Size**: Keep frontend bundle under 500KB gzipped for optimal performance
7. **Console Logging**: Remove or conditionally execute console.log statements in production
8. **Docker Security**: Use multi-stage builds, non-root users, and exclude secrets from image

## Timeline Estimate

- **Stage 1 (Setup)**: Complexity 2/5 - 30 minutes
  - Create Dockerfile and fly.toml
  - Configure environment variables

- **Stage 2 (Build)**: Complexity 3/5 - 1 hour
  - Test Docker build locally
  - Verify static file serving
  - Fix any TypeScript/path issues

- **Stage 3 (Deploy)**: Complexity 2/5 - 30 minutes
  - Run fly deploy
  - Set secrets
  - Verify deployment

Total estimated time: 2-3 hours for initial deployment

## Risk Assessment

**High Risk Areas**:
- Environment variable configuration (missing VITE_ prefix breaks frontend)
- CORS misconfiguration (blocks legitimate requests or allows attacks)
- Health check failures (causes machine restarts)

**Medium Risk Areas**:
- TypeScript path alias resolution in production
- Bundle size optimization
- Static file serving order

**Low Risk Areas**:
- Docker build process (well-documented pattern)
- Fly.io deployment (straightforward with fly deploy)
- Supabase integration (remote database, no local setup)

## Recommended Next Steps

1. Create the Dockerfile and .dockerignore files using the provided templates
2. Update fly.toml with the FunnelSight-specific configuration
3. Ensure all environment variables follow the VITE_ prefix convention for frontend
4. Implement the `/api/health` endpoint if not already present
5. Configure Express to serve static files in production
6. Test the Docker build locally before deploying
7. Run through the production checklist before first deployment
8. Deploy to Fly.io using the provided commands
9. Monitor logs and health checks after deployment
10. Document any app-specific configuration for future deployments

## Additional Considerations

- Consider implementing rate limiting for API endpoints
- Add Sentry or similar error tracking for production monitoring
- Set up GitHub Actions for automated deployments on merge to main
- Implement graceful shutdown handlers for SIGTERM/SIGINT signals
- Consider using Fly.io's autoscaling features for handling traffic spikes
- Review and implement the CORS security recommendations from the checklist
- Ensure all console.log statements are removed or wrapped in development checks