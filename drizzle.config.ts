import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './shared/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres',
  },
} satisfies Config;
