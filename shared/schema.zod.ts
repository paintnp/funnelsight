import { z } from 'zod';

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const users = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: z.enum(['admin', 'marketer', 'event_manager', 'analyst', 'stakeholder']),
  teamId: z.number().nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertUsersSchema = users.omit({ id: true, createdAt: true, updatedAt: true });

export const updateUsersSchema = insertUsersSchema.partial();

// ============================================================================
// TEAM SCHEMAS
// ============================================================================

export const teams = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  plan: z.enum(['free', 'pro', 'enterprise']),
  settings: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
});

export const insertTeamsSchema = teams.omit({ id: true, createdAt: true });

// ============================================================================
// DATA SOURCE SCHEMAS
// ============================================================================

export const dataSources = z.object({
  id: z.number(),
  userId: z.number(),
  type: z.enum(['spreadsheet', 'google_analytics', 'crm', 'ad_platform', 'event_tool']),
  name: z.string().min(1).max(255),
  connectionConfig: z.record(z.any()),
  status: z.enum(['connected', 'syncing', 'error', 'disconnected']),
  lastSyncAt: z.string().datetime().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertDataSourcesSchema = dataSources.omit({ id: true, createdAt: true, updatedAt: true });

export const updateDataSourcesSchema = insertDataSourcesSchema.partial();

// ============================================================================
// DATA SYNC SCHEMAS
// ============================================================================

export const dataSyncs = z.object({
  id: z.number(),
  dataSourceId: z.number(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  recordsProcessed: z.number(),
  errors: z.array(z.string()).nullable(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

export const insertDataSyncsSchema = dataSyncs.omit({ id: true });

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

export const events = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string().min(1).max(255),
  type: z.enum(['webinar', 'conference', 'workshop', 'trade_show']),
  status: z.enum(['upcoming', 'live', 'completed']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetRegistrations: z.number().nullable(),
  actualRegistrations: z.number().default(0),
  attendanceCount: z.number().default(0),
  engagementScore: z.number().min(0).max(100).nullable(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertEventsSchema = events.omit({ id: true, createdAt: true, updatedAt: true });

export const updateEventsSchema = insertEventsSchema.partial();

// ============================================================================
// EVENT METRIC SCHEMAS
// ============================================================================

export const eventMetrics = z.object({
  id: z.number(),
  eventId: z.number(),
  metricType: z.enum(['registrations', 'attendance_rate', 'engagement', 'conversion']),
  value: z.number(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).nullable(),
});

export const insertEventMetricsSchema = eventMetrics.omit({ id: true });

// ============================================================================
// CAMPAIGN SCHEMAS
// ============================================================================

export const campaigns = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string().min(1).max(255),
  channel: z.enum(['linkedin', 'facebook', 'google', 'email', 'organic', 'other']),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  budget: z.number().nullable(),
  spend: z.number().default(0),
  impressions: z.number().default(0),
  clicks: z.number().default(0),
  registrations: z.number().default(0),
  attendees: z.number().default(0),
  conversionRate: z.number().min(0).max(100).nullable(),
  qualityScore: z.number().min(0).max(100).nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertCampaignsSchema = campaigns.omit({ id: true, createdAt: true, updatedAt: true });

export const updateCampaignsSchema = insertCampaignsSchema.partial();

// ============================================================================
// CAMPAIGN METRIC SCHEMAS
// ============================================================================

export const campaignMetrics = z.object({
  id: z.number(),
  campaignId: z.number(),
  metricType: z.enum(['impressions', 'clicks', 'registrations', 'cost_per_registration', 'ctr', 'conversion_rate']),
  value: z.number(),
  date: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const insertCampaignMetricsSchema = campaignMetrics.omit({ id: true, createdAt: true });

// ============================================================================
// UNIFIED RECORD SCHEMAS
// ============================================================================

export const unifiedRecords = z.object({
  id: z.number(),
  eventId: z.number().nullable(),
  email: z.string().email().nullable(),
  campaignName: z.string().nullable(),
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  registrationId: z.string().nullable(),
  attendanceStatus: z.enum(['registered', 'attended', 'no_show', 'cancelled']).nullable(),
  engagementScore: z.number().min(0).max(100).nullable(),
  dataSourceId: z.number(),
  rawData: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertUnifiedRecordsSchema = unifiedRecords.omit({ id: true, createdAt: true, updatedAt: true });

export const updateUnifiedRecordsSchema = insertUnifiedRecordsSchema.partial();

// ============================================================================
// IDENTIFIER MAPPING SCHEMAS
// ============================================================================

export const identifierMappings = z.object({
  id: z.number(),
  sourceIdentifier: z.string(),
  targetIdentifier: z.string(),
  identifierType: z.enum(['email', 'campaign', 'utm', 'registration_id']),
  confidence: z.number().min(0).max(1),
  createdAt: z.string().datetime(),
});

export const insertIdentifierMappingsSchema = identifierMappings.omit({ id: true, createdAt: true });

// ============================================================================
// INSIGHT SCHEMAS
// ============================================================================

export const insights = z.object({
  id: z.number(),
  userId: z.number(),
  eventId: z.number().nullable(),
  type: z.enum(['performance', 'correlation', 'anomaly', 'recommendation']),
  title: z.string().min(1).max(500),
  description: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  metrics: z.record(z.any()).nullable(),
  generatedAt: z.string().datetime(),
  acknowledgedAt: z.string().datetime().nullable(),
});

export const insertInsightsSchema = insights.omit({ id: true, generatedAt: true });

export const updateInsightsSchema = z.object({
  acknowledgedAt: z.string().datetime(),
});

// ============================================================================
// INSIGHT COMMENT SCHEMAS
// ============================================================================

export const insightComments = z.object({
  id: z.number(),
  insightId: z.number(),
  userId: z.number(),
  comment: z.string().min(1).max(2000),
  createdAt: z.string().datetime(),
});

export const insertInsightCommentsSchema = insightComments.omit({ id: true, createdAt: true });

// ============================================================================
// DASHBOARD SCHEMAS
// ============================================================================

export const dashboards = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string().min(1).max(255),
  eventIds: z.array(z.number()),
  filters: z.record(z.any()).nullable(),
  layout: z.record(z.any()).nullable(),
  isShared: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertDashboardsSchema = dashboards.omit({ id: true, createdAt: true, updatedAt: true });

export const updateDashboardsSchema = insertDashboardsSchema.partial();

// ============================================================================
// DASHBOARD SHARE SCHEMAS
// ============================================================================

export const dashboardShares = z.object({
  id: z.number(),
  dashboardId: z.number(),
  sharedWithUserId: z.number(),
  permission: z.enum(['view', 'comment']),
  createdAt: z.string().datetime(),
});

export const insertDashboardSharesSchema = dashboardShares.omit({ id: true, createdAt: true });

// ============================================================================
// EXPORT SCHEMAS
// ============================================================================

export const exports = z.object({
  id: z.number(),
  userId: z.number(),
  dashboardId: z.number().nullable(),
  format: z.enum(['pdf', 'csv', 'png']),
  url: z.string().url(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});

export const insertExportsSchema = exports.omit({ id: true, createdAt: true });

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const paginationQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const dataSourceQuerySchema = paginationQuerySchema.extend({
  type: z.enum(['spreadsheet', 'google_analytics', 'crm', 'ad_platform', 'event_tool']).optional(),
  status: z.enum(['connected', 'syncing', 'error', 'disconnected']).optional(),
});

export const eventsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['upcoming', 'live', 'completed']).optional(),
  type: z.enum(['webinar', 'conference', 'workshop', 'trade_show']).optional(),
});

export const campaignsQuerySchema = paginationQuerySchema.extend({
  channel: z.enum(['linkedin', 'facebook', 'google', 'email', 'organic', 'other']).optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
});

export const insightsQuerySchema = paginationQuerySchema.extend({
  eventId: z.number().optional(),
  type: z.enum(['performance', 'correlation', 'anomaly', 'recommendation']).optional(),
  impact: z.enum(['high', 'medium', 'low']).optional(),
});

export const dashboardsQuerySchema = paginationQuerySchema.extend({
  isShared: z.boolean().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = z.infer<typeof users>;
export type InsertUser = z.infer<typeof insertUsersSchema>;
export type UpdateUser = z.infer<typeof updateUsersSchema>;

export type Team = z.infer<typeof teams>;
export type InsertTeam = z.infer<typeof insertTeamsSchema>;

export type DataSource = z.infer<typeof dataSources>;
export type InsertDataSource = z.infer<typeof insertDataSourcesSchema>;
export type UpdateDataSource = z.infer<typeof updateDataSourcesSchema>;

export type DataSync = z.infer<typeof dataSyncs>;
export type InsertDataSync = z.infer<typeof insertDataSyncsSchema>;

export type Event = z.infer<typeof events>;
export type InsertEvent = z.infer<typeof insertEventsSchema>;
export type UpdateEvent = z.infer<typeof updateEventsSchema>;

export type EventMetric = z.infer<typeof eventMetrics>;
export type InsertEventMetric = z.infer<typeof insertEventMetricsSchema>;

export type Campaign = z.infer<typeof campaigns>;
export type InsertCampaign = z.infer<typeof insertCampaignsSchema>;
export type UpdateCampaign = z.infer<typeof updateCampaignsSchema>;

export type CampaignMetric = z.infer<typeof campaignMetrics>;
export type InsertCampaignMetric = z.infer<typeof insertCampaignMetricsSchema>;

export type UnifiedRecord = z.infer<typeof unifiedRecords>;
export type InsertUnifiedRecord = z.infer<typeof insertUnifiedRecordsSchema>;
export type UpdateUnifiedRecord = z.infer<typeof updateUnifiedRecordsSchema>;

export type IdentifierMapping = z.infer<typeof identifierMappings>;
export type InsertIdentifierMapping = z.infer<typeof insertIdentifierMappingsSchema>;

export type Insight = z.infer<typeof insights>;
export type InsertInsight = z.infer<typeof insertInsightsSchema>;
export type UpdateInsight = z.infer<typeof updateInsightsSchema>;

export type InsightComment = z.infer<typeof insightComments>;
export type InsertInsightComment = z.infer<typeof insertInsightCommentsSchema>;

export type Dashboard = z.infer<typeof dashboards>;
export type InsertDashboard = z.infer<typeof insertDashboardsSchema>;
export type UpdateDashboard = z.infer<typeof updateDashboardsSchema>;

export type DashboardShare = z.infer<typeof dashboardShares>;
export type InsertDashboardShare = z.infer<typeof insertDashboardSharesSchema>;

export type Export = z.infer<typeof exports>;
export type InsertExport = z.infer<typeof insertExportsSchema>;

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type DataSourceQuery = z.infer<typeof dataSourceQuerySchema>;
export type EventsQuery = z.infer<typeof eventsQuerySchema>;
export type CampaignsQuery = z.infer<typeof campaignsQuerySchema>;
export type InsightsQuery = z.infer<typeof insightsQuerySchema>;
export type DashboardsQuery = z.infer<typeof dashboardsQuerySchema>;

// ============================================================================
// SPREADSHEET UPLOAD SCHEMAS
// ============================================================================

export const columnMappingSchema = z.object({
  sourceColumn: z.string(),
  targetField: z.enum([
    'email',
    'campaign_name',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'registration_date',
    'event_name',
    'event_date',
    'cost',
    'impressions',
    'clicks',
    'conversions',
    'registrations',
    'attendees',
    'attendee_name',
    'company',
  ]),
  confidence: z.number().min(0).max(100),
  transform: z.enum(['lowercase', 'uppercase', 'trim', 'parse_date', 'parse_number']).optional(),
});

export const validationErrorSchema = z.object({
  row: z.number(),
  column: z.string().optional(),
  message: z.string(),
  value: z.any().optional(),
});

export const spreadsheetImports = z.object({
  id: z.number(),
  userId: z.number(),
  filename: z.string(),
  fileSize: z.number(),
  rowCount: z.number().nullable(),
  validRowCount: z.number().nullable(),
  status: z.enum(['uploading', 'parsing', 'mapping_required', 'validating', 'importing', 'completed', 'failed']),
  columnMappings: z.array(columnMappingSchema).nullable(),
  validationErrors: z.array(validationErrorSchema).nullable(),
  errorSummary: z.string().nullable(),
  previewData: z.array(z.record(z.any())).nullable(),
  createdAt: z.string().datetime(),
  processedAt: z.string().datetime().nullable(),
});

export const insertSpreadsheetImportsSchema = spreadsheetImports.omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const updateSpreadsheetImportsSchema = insertSpreadsheetImportsSchema
  .extend({
    processedAt: z.string().datetime().nullable().optional(),
  })
  .partial();

// Upload request/response schemas
export const uploadResponseSchema = z.object({
  importId: z.number(),
  status: z.enum(['parsing', 'mapping_required']),
  columns: z.array(z.string()).optional(),
  previewRows: z.array(z.record(z.any())).optional(),
  suggestedMappings: z.array(columnMappingSchema).optional(),
});

export const confirmMappingSchema = z.object({
  importId: z.number(),
  mappings: z.array(columnMappingSchema),
});

export const importStatusSchema = z.object({
  importId: z.number(),
  status: z.enum(['uploading', 'parsing', 'mapping_required', 'validating', 'importing', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  rowsProcessed: z.number(),
  rowsValid: z.number(),
  rowsInvalid: z.number(),
  errors: z.array(validationErrorSchema).optional(),
});

// Marketing data row schema for validation
export const marketingDataRowSchema = z.object({
  email: z.string().email().toLowerCase().optional(),
  campaignName: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  registrationDate: z.coerce.date().optional(),
  eventName: z.string().optional(),
  eventDate: z.coerce.date().optional(),
  cost: z.number().nonnegative().optional(),
  impressions: z.number().int().nonnegative().optional(),
  clicks: z.number().int().nonnegative().optional(),
  conversions: z.number().int().nonnegative().optional(),
  registrations: z.number().int().nonnegative().optional(),
  attendees: z.number().int().nonnegative().optional(),
  attendeeName: z.string().optional(),
  company: z.string().optional(),
});

export type ColumnMapping = z.infer<typeof columnMappingSchema>;
export type ValidationError = z.infer<typeof validationErrorSchema>;
export type SpreadsheetImport = z.infer<typeof spreadsheetImports>;
export type InsertSpreadsheetImport = z.infer<typeof insertSpreadsheetImportsSchema>;
export type UpdateSpreadsheetImport = z.infer<typeof updateSpreadsheetImportsSchema>;
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
export type ConfirmMapping = z.infer<typeof confirmMappingSchema>;
export type ImportStatus = z.infer<typeof importStatusSchema>;
export type MarketingDataRow = z.infer<typeof marketingDataRowSchema>;

// ============================================================================
// GA4 CONNECTION SCHEMAS
// ============================================================================

export const ga4Connections = z.object({
  id: z.number(),
  userId: z.number(),
  propertyId: z.string(), // GA4 property ID (e.g., "123456789")
  propertyName: z.string(),
  accountId: z.string().nullable(),
  encryptedAccessToken: z.string(), // Encrypted OAuth access token
  encryptedRefreshToken: z.string(),
  tokenExpiresAt: z.string().datetime(),
  status: z.enum(['connected', 'disconnected', 'error']),
  lastSyncAt: z.string().datetime().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertGA4ConnectionsSchema = ga4Connections.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateGA4ConnectionsSchema = insertGA4ConnectionsSchema.partial();

// ============================================================================
// GA4 METRICS SCHEMAS
// ============================================================================

export const ga4Metrics = z.object({
  id: z.number(),
  connectionId: z.number(),
  campaignId: z.number().nullable(),
  date: z.string().datetime(),
  source: z.string(),
  medium: z.string().nullable(),
  campaignName: z.string().nullable(),
  sessions: z.number(),
  users: z.number(),
  newUsers: z.number(),
  conversions: z.number(),
  engagementRate: z.number().nullable(),
  avgSessionDuration: z.number().nullable(),
  createdAt: z.string().datetime(),
});

export const insertGA4MetricsSchema = ga4Metrics.omit({
  id: true,
  createdAt: true,
});

// Export types
export type GA4Connection = z.infer<typeof ga4Connections>;
export type InsertGA4Connection = z.infer<typeof insertGA4ConnectionsSchema>;
export type UpdateGA4Connection = z.infer<typeof updateGA4ConnectionsSchema>;
export type GA4Metric = z.infer<typeof ga4Metrics>;
export type InsertGA4Metric = z.infer<typeof insertGA4MetricsSchema>;
