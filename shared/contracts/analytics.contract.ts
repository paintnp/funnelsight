import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

// Analytics endpoints for dashboard data
export const analyticsContract = c.router({
  getFunnelPerformance: {
    method: 'GET',
    path: '/api/analytics/funnel',
    query: z.object({
      eventId: z.number().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
    responses: {
      200: z.object({
        stages: z.array(z.object({
          name: z.string(),
          count: z.number(),
          conversionRate: z.number(),
        })),
        totalImpressions: z.number(),
        totalClicks: z.number(),
        totalRegistrations: z.number(),
        totalAttendees: z.number(),
      }),
    },
    summary: 'Get funnel performance data',
  },
  getChannelPerformance: {
    method: 'GET',
    path: '/api/analytics/channels',
    query: z.object({
      eventId: z.number().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
    responses: {
      200: z.array(z.object({
        channel: z.string(),
        registrations: z.number(),
        attendees: z.number(),
        spend: z.number(),
        roi: z.number(),
        qualityScore: z.number(),
      })),
    },
    summary: 'Get channel performance breakdown',
  },
  getRegistrationSources: {
    method: 'GET',
    path: '/api/analytics/registration-sources',
    query: z.object({
      eventId: z.number().optional(),
    }),
    responses: {
      200: z.array(z.object({
        source: z.string(),
        count: z.number(),
        percentage: z.number(),
      })),
    },
    summary: 'Get registration source attribution',
  },
  getAttendanceTrends: {
    method: 'GET',
    path: '/api/analytics/attendance-trends',
    query: z.object({
      eventId: z.number().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      groupBy: z.enum(['day', 'week', 'month']).default('day'),
    }),
    responses: {
      200: z.array(z.object({
        date: z.string(),
        registrations: z.number(),
        attendees: z.number(),
        attendanceRate: z.number(),
      })),
    },
    summary: 'Get attendance trends over time',
  },
  getEventTimeline: {
    method: 'GET',
    path: '/api/analytics/event-timeline/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: z.object({
        event: z.object({
          id: z.number(),
          name: z.string(),
          startDate: z.string(),
          endDate: z.string(),
        }),
        marketingActivities: z.array(z.object({
          date: z.string(),
          campaign: z.string(),
          channel: z.string(),
          spend: z.number(),
          registrations: z.number(),
        })),
        milestones: z.array(z.object({
          date: z.string(),
          description: z.string(),
          metric: z.string(),
          value: z.number(),
        })),
      }),
    },
    summary: 'Get event timeline with marketing overlay',
  },
  getCampaignComparison: {
    method: 'GET',
    path: '/api/analytics/campaign-comparison',
    query: z.object({
      campaignIds: z.array(z.number()).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
    responses: {
      200: z.array(z.object({
        campaignId: z.number(),
        campaignName: z.string(),
        channel: z.string(),
        metrics: z.object({
          impressions: z.number(),
          clicks: z.number(),
          registrations: z.number(),
          attendees: z.number(),
          spend: z.number(),
          costPerRegistration: z.number(),
          conversionRate: z.number(),
          qualityScore: z.number(),
        }),
      })),
    },
    summary: 'Compare campaign performance',
  },
});
