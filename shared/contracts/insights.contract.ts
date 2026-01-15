import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  insights,
  insertInsightsSchema,
  
  insightsQuerySchema,
  insightComments,
  insertInsightCommentsSchema,
} from '../schema.zod';

const c = initContract();

export const insightsContract = c.router({
  getInsights: {
    method: 'GET',
    path: '/api/insights',
    query: insightsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(insights),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      }),
    },
    summary: 'Get all insights',
  },
  getInsight: {
    method: 'GET',
    path: '/api/insights/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: insights,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get insight by ID',
  },
  createInsight: {
    method: 'POST',
    path: '/api/insights',
    body: insertInsightsSchema,
    responses: {
      201: insights,
      400: z.object({ error: z.string() }),
    },
    summary: 'Create new insight',
  },
  acknowledgeInsight: {
    method: 'PUT',
    path: '/api/insights/:id/acknowledge',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({}),
    responses: {
      200: insights,
      404: z.object({ error: z.string() }),
    },
    summary: 'Acknowledge insight',
  },
  generateInsights: {
    method: 'POST',
    path: '/api/insights/generate',
    body: z.object({
      eventId: z.number().optional(),
      timeRange: z.object({
        start: z.string().datetime(),
        end: z.string().datetime(),
      }).optional(),
    }),
    responses: {
      200: z.object({
        insights: z.array(insights),
        generatedCount: z.number(),
      }),
    },
    summary: 'Generate insights using AI',
  },
  getInsightComments: {
    method: 'GET',
    path: '/api/insights/:id/comments',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: z.array(insightComments),
    },
    summary: 'Get comments for insight',
  },
  addInsightComment: {
    method: 'POST',
    path: '/api/insights/:id/comments',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: insertInsightCommentsSchema.omit({ insightId: true, userId: true }),
    responses: {
      201: insightComments,
    },
    summary: 'Add comment to insight',
  },
});
