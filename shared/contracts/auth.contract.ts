import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { users, insertUsersSchema } from '../schema.zod';

const c = initContract();

export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/api/auth/login',
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    responses: {
      200: z.object({
        user: users,
        token: z.string(),
      }),
      401: z.object({ error: z.string() }),
    },
    summary: 'Login with email and password',
  },
  signup: {
    method: 'POST',
    path: '/api/auth/signup',
    body: insertUsersSchema.extend({
      password: z.string().min(8),
    }),
    responses: {
      200: z.object({
        user: users,
        token: z.string(),
      }),
      400: z.object({ error: z.string() }),
    },
    summary: 'Create new user account',
  },
  logout: {
    method: 'POST',
    path: '/api/auth/logout',
    body: z.object({}),
    responses: {
      200: z.object({ success: z.boolean() }),
    },
    summary: 'Logout current user',
  },
  me: {
    method: 'GET',
    path: '/api/auth/me',
    responses: {
      200: z.object({ user: users }),
      401: z.object({ error: z.string() }),
    },
    summary: 'Get current user',
  },
});
