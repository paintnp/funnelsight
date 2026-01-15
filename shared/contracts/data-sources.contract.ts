import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  dataSources,
  insertDataSourcesSchema,
  updateDataSourcesSchema,
  dataSourceQuerySchema,
  dataSyncs,
} from '../schema.zod';

const c = initContract();

export const dataSourcesContract = c.router({
  getDataSources: {
    method: 'GET',
    path: '/api/data-sources',
    query: dataSourceQuerySchema,
    responses: {
      200: z.object({
        data: z.array(dataSources),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      }),
    },
    summary: 'Get all data sources',
  },
  getDataSource: {
    method: 'GET',
    path: '/api/data-sources/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: dataSources,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get data source by ID',
  },
  createDataSource: {
    method: 'POST',
    path: '/api/data-sources',
    body: insertDataSourcesSchema,
    responses: {
      201: dataSources,
      400: z.object({ error: z.string() }),
    },
    summary: 'Create new data source',
  },
  updateDataSource: {
    method: 'PUT',
    path: '/api/data-sources/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: updateDataSourcesSchema,
    responses: {
      200: dataSources,
      404: z.object({ error: z.string() }),
    },
    summary: 'Update data source',
  },
  deleteDataSource: {
    method: 'DELETE',
    path: '/api/data-sources/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({}),
    responses: {
      200: z.object({ success: z.boolean() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete data source',
  },
  syncDataSource: {
    method: 'POST',
    path: '/api/data-sources/:id/sync',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({}),
    responses: {
      200: dataSyncs,
      404: z.object({ error: z.string() }),
    },
    summary: 'Trigger data source sync',
  },
  getSyncHistory: {
    method: 'GET',
    path: '/api/data-sources/:id/syncs',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: z.array(dataSyncs),
    },
    summary: 'Get sync history for data source',
  },
});
