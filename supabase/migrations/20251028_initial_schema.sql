-- ============================================================================
-- FUNNELSIGHT DATABASE SCHEMA
-- Generated from Drizzle ORM schema
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'marketer',
  team_id INTEGER REFERENCES teams(id),
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);

-- ============================================================================
-- DATA SOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_sources (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  connection_config JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'connected',
  last_sync_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);

-- ============================================================================
-- DATA SYNCS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_syncs (
  id SERIAL PRIMARY KEY,
  data_source_id INTEGER NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  records_processed INTEGER NOT NULL DEFAULT 0,
  errors JSONB,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_syncs_data_source_id ON data_syncs(data_source_id);
CREATE INDEX IF NOT EXISTS idx_data_syncs_status ON data_syncs(status);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  target_registrations INTEGER,
  actual_registrations INTEGER NOT NULL DEFAULT 0,
  attendance_count INTEGER NOT NULL DEFAULT 0,
  engagement_score REAL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

-- ============================================================================
-- EVENT METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_metrics (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_event_metrics_event_id ON event_metrics(event_id);
CREATE INDEX IF NOT EXISTS idx_event_metrics_metric_type ON event_metrics(metric_type);

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  budget REAL,
  spend REAL NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  registrations INTEGER NOT NULL DEFAULT 0,
  attendees INTEGER NOT NULL DEFAULT 0,
  conversion_rate REAL,
  quality_score REAL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ============================================================================
-- CAMPAIGN METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_metrics (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_metric_type ON campaign_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON campaign_metrics(date);

-- ============================================================================
-- UNIFIED RECORDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS unified_records (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  email TEXT,
  campaign_name TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  registration_id TEXT,
  attendance_status TEXT,
  engagement_score REAL,
  data_source_id INTEGER NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  raw_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unified_records_event_id ON unified_records(event_id);
CREATE INDEX IF NOT EXISTS idx_unified_records_email ON unified_records(email);
CREATE INDEX IF NOT EXISTS idx_unified_records_data_source_id ON unified_records(data_source_id);

-- ============================================================================
-- IDENTIFIER MAPPINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS identifier_mappings (
  id SERIAL PRIMARY KEY,
  source_identifier TEXT NOT NULL,
  target_identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL,
  confidence REAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identifier_mappings_type ON identifier_mappings(identifier_type);
CREATE INDEX IF NOT EXISTS idx_identifier_mappings_source ON identifier_mappings(source_identifier);

-- ============================================================================
-- INSIGHTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL,
  metrics JSONB,
  generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_event_id ON insights(event_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(type);

-- ============================================================================
-- INSIGHT COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS insight_comments (
  id SERIAL PRIMARY KEY,
  insight_id INTEGER NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insight_comments_insight_id ON insight_comments(insight_id);

-- ============================================================================
-- DASHBOARDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_ids JSONB NOT NULL,
  filters JSONB,
  layout JSONB,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);

-- ============================================================================
-- DASHBOARD SHARES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_shares (
  id SERIAL PRIMARY KEY,
  dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  shared_with_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_shares_dashboard_id ON dashboard_shares(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_user_id ON dashboard_shares(shared_with_user_id);

-- ============================================================================
-- EXPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS exports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dashboard_id INTEGER REFERENCES dashboards(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);

-- ============================================================================
-- SPREADSHEET IMPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS spreadsheet_imports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  row_count INTEGER,
  valid_row_count INTEGER,
  status TEXT NOT NULL,
  column_mappings JSONB,
  validation_errors JSONB,
  error_summary TEXT,
  preview_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spreadsheet_imports_user_id ON spreadsheet_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_imports_status ON spreadsheet_imports(status);

-- ============================================================================
-- GA4 CONNECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ga4_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  account_id TEXT,
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  last_sync_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ga4_connections_user_id ON ga4_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_ga4_connections_status ON ga4_connections(status);

-- ============================================================================
-- GA4 METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ga4_metrics (
  id SERIAL PRIMARY KEY,
  connection_id INTEGER NOT NULL REFERENCES ga4_connections(id) ON DELETE CASCADE,
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
  date TIMESTAMP NOT NULL,
  source TEXT NOT NULL,
  medium TEXT,
  campaign_name TEXT,
  sessions INTEGER NOT NULL,
  users INTEGER NOT NULL,
  new_users INTEGER NOT NULL,
  conversions INTEGER NOT NULL,
  engagement_rate REAL,
  avg_session_duration REAL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ga4_metrics_connection_id ON ga4_metrics(connection_id);
CREATE INDEX IF NOT EXISTS idx_ga4_metrics_campaign_id ON ga4_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ga4_metrics_date ON ga4_metrics(date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all user-owned tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Data sources policies
CREATE POLICY "Users can view own data sources"
  ON data_sources FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create data sources"
  ON data_sources FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own data sources"
  ON data_sources FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own data sources"
  ON data_sources FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Events policies
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Campaigns policies
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Insights policies
CREATE POLICY "Users can view own insights"
  ON insights FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create insights"
  ON insights FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own insights"
  ON insights FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Dashboards policies
CREATE POLICY "Users can view own dashboards"
  ON dashboards FOR SELECT
  USING (auth.uid()::text = user_id::text OR is_shared = true);

CREATE POLICY "Users can create dashboards"
  ON dashboards FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own dashboards"
  ON dashboards FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own dashboards"
  ON dashboards FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Spreadsheet imports policies
CREATE POLICY "Users can view own imports"
  ON spreadsheet_imports FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create imports"
  ON spreadsheet_imports FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own imports"
  ON spreadsheet_imports FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- GA4 connections policies
CREATE POLICY "Users can view own GA4 connections"
  ON ga4_connections FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create GA4 connections"
  ON ga4_connections FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own GA4 connections"
  ON ga4_connections FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own GA4 connections"
  ON ga4_connections FOR DELETE
  USING (auth.uid()::text = user_id::text);
