# Supabase Integration - FunnelSight

## ✅ Setup Complete!

FunnelSight is now fully integrated with Supabase for production-ready cloud persistence.

## 🗄️ Database & Authentication

### Supabase Project Details
- **Project Name**: funnelsight
- **Project ID**: `qricrqoeoiukobkaakjb`
- **Region**: East US (North Virginia)
- **Dashboard**: https://supabase.com/dashboard/project/qricrqoeoiukobkaakjb

### What Was Configured

1. **Database Schema** (PostgreSQL)
   - All 18 tables created and deployed
   - Row Level Security (RLS) policies configured
   - Indexes optimized for query performance
   - Foreign key relationships established

2. **Authentication**
   - Supabase Auth integration
   - JWT token-based authentication
   - Email/password authentication enabled
   - User records synchronized between Supabase Auth and application database

3. **Storage**
   - Drizzle ORM connected to Supabase PostgreSQL
   - Connection pooling configured
   - Automatic snake_case ↔ camelCase conversion

## 🔧 Environment Configuration

The `.env` file has been updated with production credentials:

```bash
# Authentication & Storage Modes
AUTH_MODE=supabase          # ✅ Using Supabase Auth
STORAGE_MODE=database       # ✅ Using PostgreSQL database

# Supabase Configuration
SUPABASE_URL=https://qricrqoeoiukobkaakjb.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...  # (anon public key)
DATABASE_URL=postgresql://postgres.qricrqoeoiukobkaakjb:FunnelSight2025%21Secure@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### 🔐 Database Password

The database password is: `FunnelSight2025!Secure`

**Important**: In the connection string, special characters must be URL-encoded:
- `!` becomes `%21`
- Thus: `FunnelSight2025!Secure` → `FunnelSight2025%21Secure`

## 📊 Database Schema

All tables have been created with proper relationships:

### Core Tables
- `users` - User accounts with roles (admin, marketer, analyst, etc.)
- `teams` - Team management with plans (free, pro, enterprise)
- `data_sources` - Connected data sources (GA4, spreadsheets, CRMs)
- `events` - Marketing events (webinars, conferences, workshops)
- `campaigns` - Marketing campaigns across channels
- `unified_records` - Unified customer data from all sources

### Analytics & Insights
- `event_metrics` - Event performance metrics
- `campaign_metrics` - Campaign performance over time
- `insights` - AI-generated insights and recommendations
- `insight_comments` - Team collaboration on insights

### Integrations
- `ga4_connections` - Google Analytics 4 integrations
- `ga4_metrics` - GA4 data synced to database
- `spreadsheet_imports` - Spreadsheet upload tracking
- `identifier_mappings` - Data unification mappings

### Sharing & Exports
- `dashboards` - Custom dashboard configurations
- `dashboard_shares` - Dashboard sharing permissions
- `exports` - Export history

## 🧪 Testing the Integration

### 1. Test Database Connection

```bash
npm run server:dev
```

You should see:
```
🚀 Starting FunnelSight server...
🔐 Auth Mode: supabase
💾 Storage Mode: database
✅ Server running on http://localhost:5013
```

### 2. Test User Signup

```bash
curl -X POST http://localhost:5013/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "Test User",
    "role": "marketer"
  }'
```

### 3. Test User Login

```bash
curl -X POST http://localhost:5013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

This returns a JWT token:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Test User",
    "role": "marketer"
  },
  "token": "eyJhbGci..."
}
```

### 4. Test Authenticated API Requests

```bash
TOKEN="<your-jwt-token>"

# Get events
curl http://localhost:5013/api/events \
  -H "Authorization: Bearer $TOKEN"

# Create an event
curl -X POST http://localhost:5013/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Launch Webinar",
    "type": "webinar",
    "status": "upcoming",
    "startDate": "2025-11-01T14:00:00Z",
    "endDate": "2025-11-01T15:00:00Z",
    "targetRegistrations": 500
  }'
```

## 🔄 How It Works

### Authentication Flow

1. **Signup/Login**: User credentials are validated by Supabase Auth
2. **User Record**: A corresponding user record is created/retrieved in the PostgreSQL database
3. **JWT Token**: Supabase returns a JWT token for subsequent requests
4. **Token Verification**: Each API request verifies the token with Supabase and loads user data from PostgreSQL

### Storage Pattern

```
Client Request
     ↓
Auth Middleware (verifies Supabase JWT)
     ↓
Storage Layer (DatabaseStorage via Drizzle ORM)
     ↓
Supabase PostgreSQL
```

## 📁 Key Files Modified/Created

### Configuration
- `.env` - Updated with Supabase credentials
- `drizzle.config.ts` - Drizzle ORM configuration

### Database
- `supabase/migrations/20251028_initial_schema.sql` - Complete database schema
- `server/lib/db.ts` - Database connection (unchanged)
- `server/lib/storage/database-storage.ts` - PostgreSQL storage implementation (unchanged)

### Authentication
- `server/lib/auth/supabase-adapter.ts` - **Updated** to sync with database and properly verify tokens
- `server/lib/auth/factory.ts` - Factory pattern for auth switching (unchanged)

## 🚀 Deployment Notes

### For Production Deployment

1. **Environment Variables**: Ensure all Supabase credentials are set in your hosting environment

2. **Database Migrations**: Migrations are already applied to the Supabase project

3. **Supabase Dashboard**: Access the dashboard to:
   - View database tables and data
   - Monitor authentication logs
   - Configure email templates
   - Set up custom domains
   - Enable additional auth providers (Google, GitHub, etc.)

### Optional: Enable Email Confirmation

By default, Supabase may require email confirmation for new signups. To disable for development:

1. Go to: https://supabase.com/dashboard/project/qricrqoeoiukobkaakjb/auth/settings
2. Under "Auth Settings" → "Email Auth"
3. Uncheck "Enable email confirmations"

## 🔧 Development vs Production

### Current Setup (Production-Ready)
```bash
AUTH_MODE=supabase       # Cloud authentication
STORAGE_MODE=database    # Cloud PostgreSQL
```

### Switch to Development (Optional)
```bash
AUTH_MODE=mock           # Local mock authentication
STORAGE_MODE=memory      # In-memory data (resets on restart)
```

## 📚 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/
- **FunnelSight Schema**: See `shared/schema.ts` and `shared/schema.zod.ts`

## ✅ Success Criteria

All tests passed:
- ✅ Database connection established
- ✅ Schema deployed with all tables
- ✅ User signup working
- ✅ User login working
- ✅ JWT token verification working
- ✅ Authenticated API requests working
- ✅ Data persistence confirmed

## 🎉 Next Steps

Your FunnelSight application now has full cloud persistence! You can:

1. **Deploy to Production**: Use the same environment variables on your hosting platform
2. **Invite Users**: Share the signup link with your team
3. **Import Data**: Use the spreadsheet import or GA4 integration features
4. **Build Dashboards**: Create custom analytics dashboards
5. **Generate Insights**: Let AI analyze your marketing funnel data

---

**Setup completed on**: October 28, 2025
**Database Status**: ✅ Active and Healthy
**Auth Status**: ✅ Configured and Working
