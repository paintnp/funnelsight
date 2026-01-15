# FunnelSight Deployment Guide

Complete guide for deploying FunnelSight to Fly.io.

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io/
2. **Fly CLI**: Install the Fly.io command line tool
3. **Environment Variables**: Have all required secrets ready
4. **Supabase**: Ensure your Supabase project is configured and running

## Installation

### Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Verify installation
fly version
```

### Authenticate

```bash
fly auth login
```

This will open a browser window to authenticate with your Fly.io account.

## First-Time Deployment

### Step 1: Create the Fly App

```bash
# Create app (first time only)
fly apps create funnelsight

# Or if you want a different name:
fly apps create your-app-name
```

### Step 2: Configure Secrets

Set all required environment variables as secrets. These will be encrypted and securely stored:

```bash
fly secrets set \
  SUPABASE_URL="https://qricrqoeoiukobkaakjb.supabase.co" \
  SUPABASE_ANON_KEY="eyJhbGc..." \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..." \
  DATABASE_URL="postgresql://postgres.xxx:xxx@aws-1-us-east-1.pooler.supabase.com:5432/postgres" \
  ANTHROPIC_API_KEY="sk-ant-api03-xxx" \
  ENCRYPTION_KEY="your-production-encryption-key-32-chars-min" \
  --app funnelsight
```

**Important Notes:**
- Replace all `xxx` values with your actual credentials
- Get Supabase credentials from: https://app.supabase.com/project/_/settings/api
- Get Anthropic API key from: https://console.anthropic.com/
- Generate a secure ENCRYPTION_KEY (32+ characters)
- NEVER commit these secrets to git

#### Optional: Google OAuth (for GA4 Integration)

If you're using Google Analytics 4 integration:

```bash
fly secrets set \
  GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com" \
  GOOGLE_CLIENT_SECRET="your-client-secret" \
  GOOGLE_REDIRECT_URI="https://funnelsight.fly.dev/api/ga4/oauth/callback" \
  --app funnelsight
```

### Step 3: Configure CORS (Optional)

If you need to restrict CORS to specific domains:

```bash
fly secrets set \
  ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com" \
  --app funnelsight
```

**Note:** If not set, CORS will allow all origins in production (not recommended for sensitive apps).

### Step 4: Deploy

```bash
# Deploy the application
fly deploy --app funnelsight

# This will:
# 1. Build the Docker image
# 2. Push to Fly.io registry
# 3. Create and start the machine
# 4. Run health checks
```

The first deployment may take 5-10 minutes as it builds both frontend and backend.

### Step 5: Verify Deployment

```bash
# Check deployment status
fly status --app funnelsight

# View recent logs
fly logs --app funnelsight

# Open the deployed app in browser
fly open --app funnelsight

# Test health endpoint
curl https://funnelsight.fly.dev/api/health
```

Expected health response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T12:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "config": {
    "auth": "supabase",
    "storage": "supabase",
    "port": "8080"
  }
}
```

## Updating Your Deployment

### Deploy New Changes

```bash
# Standard deployment (uses cache)
fly deploy --app funnelsight

# Force fresh build (recommended after dependency changes)
fly deploy --no-cache --app funnelsight
```

### Update Secrets

```bash
# Update a single secret
fly secrets set ANTHROPIC_API_KEY="new-key-value" --app funnelsight

# Update multiple secrets
fly secrets set \
  SECRET_1="value1" \
  SECRET_2="value2" \
  --app funnelsight

# List all secrets (values are hidden)
fly secrets list --app funnelsight

# Remove a secret
fly secrets unset SECRET_NAME --app funnelsight
```

**Note:** Updating secrets automatically restarts your application.

## Monitoring & Debugging

### View Logs

```bash
# Stream live logs
fly logs --app funnelsight

# View last 5 minutes of logs
fly logs --app funnelsight --since 5m

# View logs from specific instance
fly logs --app funnelsight --instance <instance-id>
```

### Check Application Status

```bash
# View app status and instances
fly status --app funnelsight

# View detailed machine info
fly machine list --app funnelsight

# View current configuration
fly config show --app funnelsight
```

### SSH into Machine

```bash
# Open interactive shell
fly ssh console --app funnelsight

# Run a command
fly ssh console --app funnelsight -C "ls -la"

# Check disk usage
fly ssh console --app funnelsight -C "df -h"
```

### Database Connection Test

```bash
# SSH in and test database connection
fly ssh console --app funnelsight

# Inside the container:
node -e "console.log(process.env.DATABASE_URL)"
```

## Scaling

### Vertical Scaling (Increase Resources)

Edit `fly.toml` and change the VM size:

```toml
[[vm]]
  size = "shared-cpu-2x"  # Upgrade from shared-cpu-1x
  memory = "1024mb"       # Upgrade from 512mb
```

Then deploy:

```bash
fly deploy --app funnelsight
```

### Horizontal Scaling (Multiple Instances)

```bash
# Scale to 2 instances
fly scale count 2 --app funnelsight

# Scale to specific regions
fly scale count 2 --region iad,lax --app funnelsight
```

## Cost Management

### Auto-Stop Configuration

FunnelSight is configured to auto-stop when idle (saves costs):

```toml
[http_service]
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
```

- Machine stops after ~5 minutes of no traffic
- Automatically starts on first request
- First request after stop may take 2-3 seconds

### View Billing

```bash
# Check current month usage
fly billing show

# View pricing calculator
# https://fly.io/docs/about/pricing/
```

## Troubleshooting

### Build Failures

**Issue**: Docker build fails

```bash
# Check build logs
fly logs --app funnelsight

# Try local Docker build first
docker build -t funnelsight:test .
```

**Common Causes**:
- Missing dependencies in package.json
- TypeScript compilation errors
- Path resolution issues

### Health Check Failures

**Issue**: Health checks failing, machine restarting

```bash
# View health check logs
fly logs --app funnelsight | grep health

# Test health endpoint
curl https://funnelsight.fly.dev/api/health
```

**Solutions**:
- Ensure `/api/health` endpoint returns 200 status
- Check if app is listening on port 8080
- Verify environment variables are set

### Database Connection Issues

**Issue**: Cannot connect to Supabase

```bash
# Verify DATABASE_URL is set
fly secrets list --app funnelsight

# Test connection
fly ssh console --app funnelsight
# Then inside: node -e "console.log(process.env.DATABASE_URL)"
```

**Solutions**:
- Verify DATABASE_URL format
- Check Supabase project is running
- Ensure pooler connection string is used (not direct)
- Verify SSL is enabled in Supabase settings

### Static Files Not Loading

**Issue**: Frontend shows blank page or 404 errors

**Check**:
1. Verify `NODE_ENV=production` is set in fly.toml
2. Check build output exists: `fly ssh console -C "ls -la client/dist"`
3. View logs for static file requests

**Solution**:
```bash
# Force rebuild
fly deploy --no-cache --app funnelsight
```

### CORS Errors

**Issue**: Browser shows CORS errors

**Solutions**:
1. Set ALLOWED_ORIGINS secret with your domain:
   ```bash
   fly secrets set ALLOWED_ORIGINS="https://funnelsight.fly.dev" --app funnelsight
   ```
2. Verify CORS middleware in server/index.ts

### Out of Memory

**Issue**: Application crashes with OOM errors

**Solution**: Increase memory in fly.toml:
```toml
[[vm]]
  memory = "1024mb"  # or "2048mb"
```

Then deploy:
```bash
fly deploy --app funnelsight
```

## Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables are set as secrets
- [ ] No secrets are committed to git
- [ ] `NODE_ENV=production` in fly.toml
- [ ] Health endpoint returns 200: `/api/health`
- [ ] TypeScript compiles without errors: `npm run typecheck`
- [ ] Frontend builds successfully: `npm run build:client`
- [ ] Backend builds successfully: `npm run build:server`
- [ ] Docker builds locally: `docker build -t funnelsight:test .`
- [ ] CORS is properly configured for production
- [ ] Database migrations are applied to Supabase
- [ ] Supabase RLS policies are configured
- [ ] All API endpoints are tested

## Local Production Testing

Test production build locally before deploying:

### Option 1: Node.js (Fast)

```bash
# Build the project
npm run build

# Set production environment
export NODE_ENV=production
export PORT=8080

# Copy your production secrets to .env (temporarily)
# Then run:
npm run start:prod

# Test in browser
open http://localhost:8080

# Test health endpoint
curl http://localhost:8080/api/health
```

### Option 2: Docker (Exact Production Environment)

```bash
# Build Docker image
docker build -t funnelsight:test .

# Run with environment variables
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e SUPABASE_URL="your-supabase-url" \
  -e SUPABASE_ANON_KEY="your-anon-key" \
  -e DATABASE_URL="your-database-url" \
  -e ANTHROPIC_API_KEY="your-anthropic-key" \
  -e ENCRYPTION_KEY="your-encryption-key" \
  funnelsight:test

# Test the containerized app
curl http://localhost:8080/api/health
open http://localhost:8080
```

## Rollback

If deployment has issues, rollback to previous version:

```bash
# List recent deployments
fly releases --app funnelsight

# Rollback to previous version
fly releases rollback --app funnelsight

# Or rollback to specific version
fly releases rollback <version-number> --app funnelsight
```

## CI/CD Integration (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Fly
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get your FLY_API_TOKEN:
```bash
fly tokens create deploy
```

Then add it to GitHub Secrets at:
`https://github.com/your-org/your-repo/settings/secrets/actions`

## Additional Resources

- **Fly.io Documentation**: https://fly.io/docs/
- **Fly.io Dashboard**: https://fly.io/dashboard
- **Supabase Dashboard**: https://app.supabase.com/
- **Anthropic Console**: https://console.anthropic.com/
- **FunnelSight Research**: See `FLYIO_DEPLOYMENT_RESEARCH.md`

## Support

For deployment issues:
1. Check logs: `fly logs --app funnelsight`
2. Review Fly.io docs: https://fly.io/docs/
3. Check Fly.io status: https://status.fly.io/
4. Community forum: https://community.fly.io/

## Security Best Practices

1. **Never commit secrets** - Always use `fly secrets set`
2. **Use strong encryption keys** - Generate random 32+ character strings
3. **Enable CORS restrictions** - Set ALLOWED_ORIGINS for production
4. **Review Supabase RLS** - Ensure Row Level Security policies are configured
5. **Monitor logs** - Regularly check for security issues
6. **Keep dependencies updated** - Run `npm audit` regularly
7. **Use environment-specific configs** - Different secrets for staging/production

## Maintenance

### Regular Tasks

**Weekly**:
- Check application logs for errors
- Monitor resource usage
- Verify health checks are passing

**Monthly**:
- Update dependencies: `npm update`
- Review and optimize bundle size
- Check Fly.io billing and usage

**Quarterly**:
- Security audit: `npm audit`
- Performance review
- Update Node.js version if needed

---

**Last Updated**: 2025-10-28
**Version**: 1.0.0
