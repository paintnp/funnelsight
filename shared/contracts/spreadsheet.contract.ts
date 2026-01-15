import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  spreadsheetImports,
  uploadResponseSchema,
  confirmMappingSchema,
  importStatusSchema,
  paginationQuerySchema,
} from '../schema.zod';

const c = initContract();

export const spreadsheetContract = c.router({
  // Upload a spreadsheet file
  upload: {
    method: 'POST',
    path: '/api/spreadsheets/upload',
    // Note: File upload handled by multer middleware, not in contract body
    body: z.undefined(),
    responses: {
      201: uploadResponseSchema,
      400: z.object({ error: z.string() }),
      413: z.object({ error: z.literal('File too large') }),
    },
    summary: 'Upload a spreadsheet file (CSV or Excel)',
  },

  // Get import status
  getImportStatus: {
    method: 'GET',
    path: '/api/spreadsheets/imports/:id/status',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: importStatusSchema,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get import status and progress',
  },

  // Confirm column mappings and start import
  confirmMapping: {
    method: 'POST',
    path: '/api/spreadsheets/imports/:id/confirm',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({
      mappings: confirmMappingSchema.shape.mappings,
    }),
    responses: {
      200: importStatusSchema,
      400: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Confirm column mappings and start importing data',
  },

  // Get all imports for current user
  getImports: {
    method: 'GET',
    path: '/api/spreadsheets/imports',
    query: paginationQuerySchema,
    responses: {
      200: z.object({
        data: z.array(spreadsheetImports),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      }),
    },
    summary: 'Get all spreadsheet imports for current user',
  },

  // Get single import details
  getImport: {
    method: 'GET',
    path: '/api/spreadsheets/imports/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    responses: {
      200: spreadsheetImports,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get import details including preview data and errors',
  },

  // Delete an import
  deleteImport: {
    method: 'DELETE',
    path: '/api/spreadsheets/imports/:id',
    pathParams: z.object({
      id: z.string().transform(Number),
    }),
    body: z.undefined(),
    responses: {
      204: z.undefined(),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete an import record',
  },
});
