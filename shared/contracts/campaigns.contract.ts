import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  campaigns,
  insertCampaignsSchema,
  updateCampaignsSchema,
  campaignsQuerySchema,
  campaignMetrics,
  insertCampaignMetricsSchema,
} from '../schema.zod';

const c = initContract();

export const campaignsContract = c.router({
  getCampaigns: {
    method: 'GET',
    path: '/api/campaigns',
    query: campaignsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(campaigns),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      }),
    },
    summary: 'Get all campaigns',
  },
  getCampaign: {
    method: 'GET',
    path: '/api/campaigns/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: campaigns,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get campaign by ID',
  },
  createCampaign: {
    method: 'POST',
    path: '/api/campaigns',
    body: insertCampaignsSchema,
    responses: {
      201: campaigns,
      400: z.object({ error: z.string() }),
    },
    summary: 'Create new campaign',
  },
  updateCampaign: {
    method: 'PUT',
    path: '/api/campaigns/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: updateCampaignsSchema,
    responses: {
      200: campaigns,
      404: z.object({ error: z.string() }),
    },
    summary: 'Update campaign',
  },
  deleteCampaign: {
    method: 'DELETE',
    path: '/api/campaigns/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({}),
    responses: {
      200: z.object({ success: z.boolean() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete campaign',
  },
  getCampaignMetrics: {
    method: 'GET',
    path: '/api/campaigns/:id/metrics',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: z.array(campaignMetrics),
    },
    summary: 'Get metrics for campaign',
  },
  addCampaignMetric: {
    method: 'POST',
    path: '/api/campaigns/:id/metrics',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: insertCampaignMetricsSchema.omit({ campaignId: true }),
    responses: {
      201: campaignMetrics,
    },
    summary: 'Add metric to campaign',
  },
});
