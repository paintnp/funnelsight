import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema.js';

// Use DATABASE_URL from .env
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/funnelsight';

// Create PostgreSQL client
const client = postgres(connectionString);

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema };
