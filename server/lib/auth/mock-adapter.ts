import type { IAuthAdapter } from './types.js';
import type { User } from '../../../shared/schema.zod.js';

// Mock auth adapter for development
export class MockAuthAdapter implements IAuthAdapter {
  private users: Map<string, { user: User; password: string }> = new Map();
  private tokens: Map<string, User> = new Map();
  private nextId = 1;

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    console.log(`[Mock Auth] Login attempt: ${email}`);

    // In mock mode, accept any credentials
    const stored = this.users.get(email);

    if (stored && stored.password === password) {
      const token = `mock-token-${Date.now()}-${Math.random()}`;
      this.tokens.set(token, stored.user);
      return { user: stored.user, token };
    }

    // Auto-create user if not exists (development convenience)
    const user: User = {
      id: Date.now() + Math.floor(Math.random() * 1000), // Unique timestamp-based ID
      email,
      name: email.split('@')[0],
      role: 'marketer',
      teamId: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(email, { user, password });

    const token = `mock-token-${Date.now()}-${Math.random()}`;
    this.tokens.set(token, user);

    console.log(`[Mock Auth] Auto-created user: ${email}`);
    return { user, token };
  }

  async signup(email: string, password: string, name: string, role: string = 'marketer'): Promise<{ user: User; token: string }> {
    console.log(`[Mock Auth] Signup: ${email}`);

    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: Date.now() + Math.floor(Math.random() * 1000), // Unique timestamp-based ID
      email,
      name,
      role: role as any,
      teamId: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(email, { user, password });

    const token = `mock-token-${Date.now()}-${Math.random()}`;
    this.tokens.set(token, user);

    return { user, token };
  }

  async verifyToken(token: string): Promise<User> {
    const user = this.tokens.get(token);
    if (!user) {
      throw new Error('Invalid token');
    }
    return user;
  }

  async logout(token: string): Promise<void> {
    console.log(`[Mock Auth] Logout`);
    this.tokens.delete(token);
  }
}

export const mockAuth = new MockAuthAdapter();
