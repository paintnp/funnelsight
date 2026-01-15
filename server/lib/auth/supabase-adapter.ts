import { createClient } from '@supabase/supabase-js';
import type { IAuthAdapter } from './types.js';
import type { User } from '../../../shared/schema.zod.js';
import { db, schema } from '../db.js';
import { eq } from 'drizzle-orm';

export class SupabaseAuthAdapter implements IAuthAdapter {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    console.log(`[Supabase Auth] Login attempt: ${email}`);

    // Authenticate with Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      throw new Error(error?.message || 'Login failed');
    }

    // Get or create user record in our database
    let userRecord = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)
      .then(rows => rows[0]);

    if (!userRecord) {
      // Create user record if doesn't exist (shouldn't happen on login)
      const [newUser] = await db
        .insert(schema.users)
        .values({
          email: data.user.email!,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: (data.user.user_metadata?.role || 'marketer') as any,
          teamId: null,
          avatarUrl: data.user.user_metadata?.avatar_url || null,
        })
        .returning();
      userRecord = newUser;
    }

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role as any,
      teamId: userRecord.teamId,
      avatarUrl: userRecord.avatarUrl,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    };

    return { user, token: data.session.access_token };
  }

  async signup(email: string, password: string, name: string, role: string = 'marketer'): Promise<{ user: User; token: string }> {
    console.log(`[Supabase Auth] Signup: ${email}`);

    // Create Supabase Auth user
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error || !data.user || !data.session) {
      throw new Error(error?.message || 'Signup failed');
    }

    // Create user record in our database
    const [userRecord] = await db
      .insert(schema.users)
      .values({
        email: data.user.email!,
        name,
        role: role as any,
        teamId: null,
        avatarUrl: null,
      })
      .returning();

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role as any,
      teamId: userRecord.teamId,
      avatarUrl: userRecord.avatarUrl,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    };

    return { user, token: data.session.access_token };
  }

  async verifyToken(token: string): Promise<User> {
    // Create a client with the user's token
    const supabaseWithToken = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify token with Supabase Auth
    const { data, error } = await supabaseWithToken.auth.getUser();

    if (error || !data.user) {
      throw new Error('Invalid token');
    }

    // Get user record from our database
    const userRecord = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.user.email!))
      .limit(1)
      .then(rows => rows[0]);

    if (!userRecord) {
      throw new Error('User not found in database');
    }

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role as any,
      teamId: userRecord.teamId,
      avatarUrl: userRecord.avatarUrl,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    };

    return user;
  }

  async logout(token: string): Promise<void> {
    console.log(`[Supabase Auth] Logout`);
    await this.supabase.auth.signOut();
  }
}

// Lazy instance holder
let instance: SupabaseAuthAdapter | null = null;

function createSupabaseAuth(): SupabaseAuthAdapter {
  if (!instance) {
    instance = new SupabaseAuthAdapter();
  }
  return instance;
}

// Lazy Proxy: delays initialization until first access
export const supabaseAuth = new Proxy({} as SupabaseAuthAdapter, {
  get(target, prop) {
    if (!instance) {
      instance = createSupabaseAuth();
    }
    return instance[prop as keyof SupabaseAuthAdapter];
  }
}) as SupabaseAuthAdapter;
