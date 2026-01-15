import { pgTable, serial, text, timestamp, integer, real, jsonb, boolean } from 'drizzle-orm/pg-core';

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('marketer'),
  teamId: integer('team_id').references(() => teams.id),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// TEAMS TABLE
// ============================================================================

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  plan: text('plan').notNull().default('free'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// DATA SOURCES TABLE
// ============================================================================

export const dataSources = pgTable('data_sources', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  name: text('name').notNull(),
  connectionConfig: jsonb('connection_config').notNull(),
  status: text('status').notNull().default('connected'),
  lastSyncAt: timestamp('last_sync_at', { mode: 'string' }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// DATA SYNCS TABLE
// ============================================================================

export const dataSyncs = pgTable('data_syncs', {
  id: serial('id').primaryKey(),
  dataSourceId: integer('data_source_id').notNull().references(() => dataSources.id),
  status: text('status').notNull(),
  recordsProcessed: integer('records_processed').notNull().default(0),
  errors: jsonb('errors'),
  startedAt: timestamp('started_at', { mode: 'string' }).notNull(),
  completedAt: timestamp('completed_at', { mode: 'string' }),
});

// ============================================================================
// EVENTS TABLE
// ============================================================================

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  startDate: timestamp('start_date', { mode: 'string' }).notNull(),
  endDate: timestamp('end_date', { mode: 'string' }).notNull(),
  targetRegistrations: integer('target_registrations'),
  actualRegistrations: integer('actual_registrations').notNull().default(0),
  attendanceCount: integer('attendance_count').notNull().default(0),
  engagementScore: real('engagement_score'),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// EVENT METRICS TABLE
// ============================================================================

export const eventMetrics = pgTable('event_metrics', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  metricType: text('metric_type').notNull(),
  value: real('value').notNull(),
  timestamp: timestamp('timestamp', { mode: 'string' }).notNull(),
  metadata: jsonb('metadata'),
});

// ============================================================================
// CAMPAIGNS TABLE
// ============================================================================

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  channel: text('channel').notNull(),
  status: text('status').notNull(),
  budget: real('budget'),
  spend: real('spend').notNull().default(0),
  impressions: integer('impressions').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  registrations: integer('registrations').notNull().default(0),
  attendees: integer('attendees').notNull().default(0),
  conversionRate: real('conversion_rate'),
  qualityScore: real('quality_score'),
  startDate: timestamp('start_date', { mode: 'string' }).notNull(),
  endDate: timestamp('end_date', { mode: 'string' }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// CAMPAIGN METRICS TABLE
// ============================================================================

export const campaignMetrics = pgTable('campaign_metrics', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull().references(() => campaigns.id),
  metricType: text('metric_type').notNull(),
  value: real('value').notNull(),
  date: timestamp('date', { mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// UNIFIED RECORDS TABLE
// ============================================================================

export const unifiedRecords = pgTable('unified_records', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id),
  email: text('email'),
  campaignName: text('campaign_name'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  registrationId: text('registration_id'),
  attendanceStatus: text('attendance_status'),
  engagementScore: real('engagement_score'),
  dataSourceId: integer('data_source_id').notNull().references(() => dataSources.id),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// IDENTIFIER MAPPINGS TABLE
// ============================================================================

export const identifierMappings = pgTable('identifier_mappings', {
  id: serial('id').primaryKey(),
  sourceIdentifier: text('source_identifier').notNull(),
  targetIdentifier: text('target_identifier').notNull(),
  identifierType: text('identifier_type').notNull(),
  confidence: real('confidence').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// INSIGHTS TABLE
// ============================================================================

export const insights = pgTable('insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  eventId: integer('event_id').references(() => events.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  impact: text('impact').notNull(),
  metrics: jsonb('metrics'),
  generatedAt: timestamp('generated_at', { mode: 'string' }).notNull().defaultNow(),
  acknowledgedAt: timestamp('acknowledged_at', { mode: 'string' }),
});

// ============================================================================
// INSIGHT COMMENTS TABLE
// ============================================================================

export const insightComments = pgTable('insight_comments', {
  id: serial('id').primaryKey(),
  insightId: integer('insight_id').notNull().references(() => insights.id),
  userId: integer('user_id').notNull().references(() => users.id),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// DASHBOARDS TABLE
// ============================================================================

export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  eventIds: jsonb('event_ids').notNull(),
  filters: jsonb('filters'),
  layout: jsonb('layout'),
  isShared: boolean('is_shared').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// DASHBOARD SHARES TABLE
// ============================================================================

export const dashboardShares = pgTable('dashboard_shares', {
  id: serial('id').primaryKey(),
  dashboardId: integer('dashboard_id').notNull().references(() => dashboards.id),
  sharedWithUserId: integer('shared_with_user_id').notNull().references(() => users.id),
  permission: text('permission').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// EXPORTS TABLE
// ============================================================================

export const exports = pgTable('exports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  dashboardId: integer('dashboard_id').references(() => dashboards.id),
  format: text('format').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
});

// ============================================================================
// SPREADSHEET IMPORTS TABLE
// ============================================================================

export const spreadsheetImports = pgTable('spreadsheet_imports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  fileSize: integer('file_size').notNull(),
  rowCount: integer('row_count'),
  validRowCount: integer('valid_row_count'),
  status: text('status').notNull(),
  columnMappings: jsonb('column_mappings'),
  validationErrors: jsonb('validation_errors'),
  errorSummary: text('error_summary'),
  previewData: jsonb('preview_data'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { mode: 'string' }),
});

// ============================================================================
// GA4 CONNECTIONS TABLE
// ============================================================================

export const ga4Connections = pgTable('ga4_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: text('property_id').notNull(),
  propertyName: text('property_name').notNull(),
  accountId: text('account_id'),
  encryptedAccessToken: text('encrypted_access_token').notNull(),
  encryptedRefreshToken: text('encrypted_refresh_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at', { mode: 'string' }).notNull(),
  status: text('status').notNull(),
  lastSyncAt: timestamp('last_sync_at', { mode: 'string' }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================================================
// GA4 METRICS TABLE
// ============================================================================

export const ga4Metrics = pgTable('ga4_metrics', {
  id: serial('id').primaryKey(),
  connectionId: integer('connection_id').notNull().references(() => ga4Connections.id),
  campaignId: integer('campaign_id').references(() => campaigns.id),
  date: timestamp('date', { mode: 'string' }).notNull(),
  source: text('source').notNull(),
  medium: text('medium'),
  campaignName: text('campaign_name'),
  sessions: integer('sessions').notNull(),
  users: integer('users').notNull(),
  newUsers: integer('new_users').notNull(),
  conversions: integer('conversions').notNull(),
  engagementRate: real('engagement_rate'),
  avgSessionDuration: real('avg_session_duration'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});
