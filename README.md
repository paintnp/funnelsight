# FunnelSight

A Marketing Intelligence Platform that helps marketers understand what drives event registrations and outcomes by automatically combining and analyzing marketing and event data from multiple sources.

## Features

- **Data Import**: Upload CSV/Excel files with campaign and event data
- **Campaign Management**: Track marketing campaigns across multiple channels (LinkedIn, Facebook, Google, Email, Organic)
- **Event Management**: Manage webinars, conferences, workshops, and trade shows
- **Google Analytics 4 Integration**: Connect GA4 properties for unified analytics
- **AI-Powered Insights**: Generate intelligent insights using Claude AI
- **Custom Dashboards**: Create and share custom analytics views
- **Multi-Channel Attribution**: Understand which channels drive registrations

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Express.js, TypeScript, ts-rest |
| Database | PostgreSQL via Drizzle ORM |
| Auth | Supabase Auth |
| AI | Anthropic Claude |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- Anthropic API key (for AI insights)

### Environment Variables

Create a `.env` file with:

```bash
# Database
DATABASE_URL=postgresql://...

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Insights (optional)
ANTHROPIC_API_KEY=your-anthropic-key

# GA4 Integration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GA4_REDIRECT_URI=http://localhost:5000/api/ga4/callback

# Mode
AUTH_MODE=supabase
STORAGE_MODE=database
NODE_ENV=production
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── pages/         # Route pages
│       ├── components/    # Reusable components
│       └── lib/           # API client utilities
├── server/                 # Express backend
│   ├── routes/            # API route handlers
│   └── lib/               # Services (auth, storage, etc.)
├── shared/                 # Shared types and contracts
│   ├── schema.ts          # Drizzle ORM schema
│   ├── schema.zod.ts      # Zod validation schemas
│   └── contracts/         # ts-rest API contracts
└── supabase/              # Database migrations
```

## API Documentation

The API uses ts-rest contracts for type-safe endpoints. See `shared/contracts/` for all available endpoints.

## License

MIT
