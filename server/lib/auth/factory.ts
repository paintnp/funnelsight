import type { IAuthAdapter } from './types.js';
import { mockAuth } from './mock-adapter.js';
import { supabaseAuth } from './supabase-adapter.js';

// Lazy instance holder
let instance: IAuthAdapter | null = null;

function createAuth(): IAuthAdapter {
  const mode = process.env.AUTH_MODE || 'mock';

  console.log(`🔐 [Auth Factory] Initializing in ${mode} mode`);

  if (mode === 'supabase') {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.warn('⚠️  [Auth Factory] Missing Supabase env vars, falling back to mock');
      return mockAuth;
    }
    return supabaseAuth;
  }

  return mockAuth;
}

// Lazy Proxy: delays initialization until first access
export const auth: IAuthAdapter = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    if (!instance) {
      instance = createAuth();
    }
    return instance[prop as keyof IAuthAdapter];
  }
}) as IAuthAdapter;
