import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  dashboards,
  insertDashboardsSchema,
  updateDashboardsSchema,
  dashboardsQuerySchema,
  dashboardShares,
  insertDashboardSharesSchema,
} from '../schema.zod';

const c = initContract();

export const dashboardsContract = c.router({
  getDashboards: {
    method: 'GET',
    path: '/api/dashboards',
    query: dashboardsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(dashboards),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      }),
    },
    summary: 'Get all dashboards',
  },
  getDashboard: {
    method: 'GET',
    path: '/api/dashboards/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: dashboards,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get dashboard by ID',
  },
  createDashboard: {
    method: 'POST',
    path: '/api/dashboards',
    body: insertDashboardsSchema,
    responses: {
      201: dashboards,
      400: z.object({ error: z.string() }),
    },
    summary: 'Create new dashboard',
  },
  updateDashboard: {
    method: 'PUT',
    path: '/api/dashboards/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: updateDashboardsSchema,
    responses: {
      200: dashboards,
      404: z.object({ error: z.string() }),
    },
    summary: 'Update dashboard',
  },
  deleteDashboard: {
    method: 'DELETE',
    path: '/api/dashboards/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({}),
    responses: {
      200: z.object({ success: z.boolean() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete dashboard',
  },
  shareDashboard: {
    method: 'POST',
    path: '/api/dashboards/:id/share',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: insertDashboardSharesSchema.omit({ dashboardId: true }),
    responses: {
      201: dashboardShares,
    },
    summary: 'Share dashboard with user',
  },
  getDashboardShares: {
    method: 'GET',
    path: '/api/dashboards/:id/shares',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: z.array(dashboardShares),
    },
    summary: 'Get dashboard shares',
  },
});
