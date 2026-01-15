import type { User } from '../../../shared/schema.zod.js';

export interface IAuthAdapter {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  signup(email: string, password: string, name: string, role?: string): Promise<{ user: User; token: string }>;
  verifyToken(token: string): Promise<User>;
  logout(token: string): Promise<void>;
}
