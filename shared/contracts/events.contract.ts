import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  events,
  insertEventsSchema,
  updateEventsSchema,
  eventsQuerySchema,
  eventMetrics,
  insertEventMetricsSchema,
} from '../schema.zod';

const c = initContract();

export const eventsContract = c.router({
  getEvents: {
    method: 'GET',
    path: '/api/events',
    query: eventsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(events),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      }),
    },
    summary: 'Get all events',
  },
  getEvent: {
    method: 'GET',
    path: '/api/events/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: events,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get event by ID',
  },
  createEvent: {
    method: 'POST',
    path: '/api/events',
    body: insertEventsSchema,
    responses: {
      201: events,
      400: z.object({ error: z.string() }),
    },
    summary: 'Create new event',
  },
  updateEvent: {
    method: 'PUT',
    path: '/api/events/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: updateEventsSchema,
    responses: {
      200: events,
      404: z.object({ error: z.string() }),
    },
    summary: 'Update event',
  },
  deleteEvent: {
    method: 'DELETE',
    path: '/api/events/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({}),
    responses: {
      200: z.object({ success: z.boolean() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete event',
  },
  getEventMetrics: {
    method: 'GET',
    path: '/api/events/:id/metrics',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: z.array(eventMetrics),
    },
    summary: 'Get metrics for event',
  },
  addEventMetric: {
    method: 'POST',
    path: '/api/events/:id/metrics',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: insertEventMetricsSchema.omit({ eventId: true }),
    responses: {
      201: eventMetrics,
    },
    summary: 'Add metric to event',
  },
});
