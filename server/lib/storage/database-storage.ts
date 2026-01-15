// @ts-nocheck
import { db, schema } from '../db.js';
import { eq, and, desc, asc, sql, or } from 'drizzle-orm';
import type { IStorage } from './types.js';
import type {
  User, InsertUser, UpdateUser,
  DataSource, InsertDataSource, UpdateDataSource,
  DataSync, InsertDataSync,
  Event, InsertEvent, UpdateEvent,
  EventMetric, InsertEventMetric,
  Campaign, InsertCampaign, UpdateCampaign,
  CampaignMetric, InsertCampaignMetric,
  UnifiedRecord, InsertUnifiedRecord, UpdateUnifiedRecord,
  IdentifierMapping, InsertIdentifierMapping,
  Insight, InsertInsight,
  InsightComment, InsertInsightComment,
  Dashboard, InsertDashboard, UpdateDashboard,
  DashboardShare, InsertDashboardShare,
  Export, InsertExport,
  SpreadsheetImport, InsertSpreadsheetImport, UpdateSpreadsheetImport,
  GA4Connection, InsertGA4Connection, UpdateGA4Connection,
  GA4Metric, InsertGA4Metric,
} from '../../../shared/schema.zod.js';

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    const result = await db
      .select()
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));
    return result as any;
  }

  async getUser(id: number): Promise<User | null> {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return (result[0] as any) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return (result[0] as any) || null;
  }

  async createUser(data: InsertUser): Promise<User> {
    const result = await db
      .insert(schema.users)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User> {
    const result = await db
      .update(schema.users)
      .set({ ...updates, updatedAt: new Date().toISOString() } as any)
      .where(eq(schema.users.id, id))
      .returning();
    if (!result[0]) throw new Error('User not found');
    return result[0] as any;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning();
    return result.length > 0;
  }

  // Data Sources
  async getDataSources(userId: number): Promise<DataSource[]> {
    const result = await db
      .select()
      .from(schema.dataSources)
      .where(eq(schema.dataSources.userId, userId))
      .orderBy(desc(schema.dataSources.createdAt));
    return result as any;
  }

  async getDataSource(id: number): Promise<DataSource | null> {
    const result = await db
      .select()
      .from(schema.dataSources)
      .where(eq(schema.dataSources.id, id))
      .limit(1);
    return (result[0] as any) || null;
  }

  async createDataSource(data: InsertDataSource): Promise<DataSource> {
    const result = await db
      .insert(schema.dataSources)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async updateDataSource(id: number, updates: UpdateDataSource): Promise<DataSource> {
    const result = await db
      .update(schema.dataSources)
      .set({ ...updates, updatedAt: new Date().toISOString() } as any)
      .where(eq(schema.dataSources.id, id))
      .returning();
    if (!result[0]) throw new Error('Data source not found');
    return result[0] as any;
  }

  async deleteDataSource(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.dataSources)
      .where(eq(schema.dataSources.id, id))
      .returning();
    return result.length > 0;
  }

  // Data Syncs
  async getDataSyncs(dataSourceId: number): Promise<DataSync[]> {
    const result = await db
      .select()
      .from(schema.dataSyncs)
      .where(eq(schema.dataSyncs.dataSourceId, dataSourceId))
      .orderBy(desc(schema.dataSyncs.startedAt));
    return result as any;
  }

  async createDataSync(data: InsertDataSync): Promise<DataSync> {
    const result = await db
      .insert(schema.dataSyncs)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async updateDataSync(id: number, updates: Partial<DataSync>): Promise<DataSync> {
    const result = await db
      .update(schema.dataSyncs)
      .set(updates as any)
      .where(eq(schema.dataSyncs.id, id))
      .returning();
    if (!result[0]) throw new Error('Data sync not found');
    return result[0] as any;
  }

  // Events
  async getEvents(userId: number): Promise<Event[]> {
    const result = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.userId, userId))
      .orderBy(desc(schema.events.startDate));
    return result as any;
  }

  async getEvent(id: number): Promise<Event | null> {
    const result = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, id))
      .limit(1);
    return (result[0] as any) || null;
  }

  async createEvent(data: InsertEvent): Promise<Event> {
    const result = await db
      .insert(schema.events)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async updateEvent(id: number, updates: UpdateEvent): Promise<Event> {
    const result = await db
      .update(schema.events)
      .set({ ...updates, updatedAt: new Date().toISOString() } as any)
      .where(eq(schema.events.id, id))
      .returning();
    if (!result[0]) throw new Error('Event not found');
    return result[0] as any;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.events)
      .where(eq(schema.events.id, id))
      .returning();
    return result.length > 0;
  }

  // Event Metrics
  async getEventMetrics(eventId: number): Promise<EventMetric[]> {
    const result = await db
      .select()
      .from(schema.eventMetrics)
      .where(eq(schema.eventMetrics.eventId, eventId))
      .orderBy(asc(schema.eventMetrics.timestamp));
    return result as any;
  }

  async createEventMetric(data: InsertEventMetric): Promise<EventMetric> {
    const result = await db
      .insert(schema.eventMetrics)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  // Campaigns
  async getCampaigns(userId: number): Promise<Campaign[]> {
    const result = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.userId, userId))
      .orderBy(desc(schema.campaigns.startDate));
    return result as any;
  }

  async getCampaign(id: number): Promise<Campaign | null> {
    const result = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, id))
      .limit(1);
    return (result[0] as any) || null;
  }

  async createCampaign(data: InsertCampaign): Promise<Campaign> {
    const result = await db
      .insert(schema.campaigns)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async updateCampaign(id: number, updates: UpdateCampaign): Promise<Campaign> {
    const result = await db
      .update(schema.campaigns)
      .set({ ...updates, updatedAt: new Date().toISOString() } as any)
      .where(eq(schema.campaigns.id, id))
      .returning();
    if (!result[0]) throw new Error('Campaign not found');
    return result[0] as any;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.campaigns)
      .where(eq(schema.campaigns.id, id))
      .returning();
    return result.length > 0;
  }

  // Campaign Metrics
  async getCampaignMetrics(campaignId: number): Promise<CampaignMetric[]> {
    const result = await db
      .select()
      .from(schema.campaignMetrics)
      .where(eq(schema.campaignMetrics.campaignId, campaignId))
      .orderBy(asc(schema.campaignMetrics.date));
    return result as any;
  }

  async createCampaignMetric(data: InsertCampaignMetric): Promise<CampaignMetric> {
    const result = await db
      .insert(schema.campaignMetrics)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  // Unified Records
  async getUnifiedRecords(eventId?: number): Promise<UnifiedRecord[]> {
    if (eventId) {
      const result = await db
        .select()
        .from(schema.unifiedRecords)
        .where(eq(schema.unifiedRecords.eventId, eventId))
        .orderBy(desc(schema.unifiedRecords.createdAt));
      return result as any;
    }
    const result = await db
      .select()
      .from(schema.unifiedRecords)
      .orderBy(desc(schema.unifiedRecords.createdAt));
    return result as any;
  }

  async createUnifiedRecord(data: InsertUnifiedRecord): Promise<UnifiedRecord> {
    const result = await db
      .insert(schema.unifiedRecords)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async updateUnifiedRecord(id: number, updates: UpdateUnifiedRecord): Promise<UnifiedRecord> {
    const result = await db
      .update(schema.unifiedRecords)
      .set({ ...updates, updatedAt: new Date().toISOString() } as any)
      .where(eq(schema.unifiedRecords.id, id))
      .returning();
    if (!result[0]) throw new Error('Unified record not found');
    return result[0] as any;
  }

  // Identifier Mappings
  async getIdentifierMappings(type?: string): Promise<IdentifierMapping[]> {
    if (type) {
      const result = await db
        .select()
        .from(schema.identifierMappings)
        .where(eq(schema.identifierMappings.identifierType, type))
        .orderBy(desc(schema.identifierMappings.confidence));
      return result as any;
    }
    const result = await db
      .select()
      .from(schema.identifierMappings)
      .orderBy(desc(schema.identifierMappings.confidence));
    return result as any;
  }

  async createIdentifierMapping(data: InsertIdentifierMapping): Promise<IdentifierMapping> {
    const result = await db
      .insert(schema.identifierMappings)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  // Insights
  async getInsights(userId: number): Promise<Insight[]> {
    const result = await db
      .select()
      .from(schema.insights)
      .where(eq(schema.insights.userId, userId))
      .orderBy(desc(schema.insights.generatedAt));
    return result as any;
  }

  async getInsight(id: number): Promise<Insight | null> {
    const result = await db
      .select()
      .from(schema.insights)
      .where(eq(schema.insights.id, id))
      .limit(1);
    return (result[0] as any) || null;
  }

  async createInsight(data: InsertInsight): Promise<Insight> {
    const result = await db
      .insert(schema.insights)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async acknowledgeInsight(id: number): Promise<Insight> {
    const result = await db
      .update(schema.insights)
      .set({ acknowledgedAt: new Date().toISOString() } as any)
      .where(eq(schema.insights.id, id))
      .returning();
    if (!result[0]) throw new Error('Insight not found');
    return result[0] as any;
  }

  // Insight Comments
  async getInsightComments(insightId: number): Promise<InsightComment[]> {
    const result = await db
      .select()
      .from(schema.insightComments)
      .where(eq(schema.insightComments.insightId, insightId))
      .orderBy(asc(schema.insightComments.createdAt));
    return result as any;
  }

  async createInsightComment(data: InsightComment): Promise<InsightComment> {
    const result = await db
      .insert(schema.insightComments)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  // Dashboards
  async getDashboards(userId: number): Promise<Dashboard[]> {
    const result = await db
      .select()
      .from(schema.dashboards)
      .where(eq(schema.dashboards.userId, userId))
      .orderBy(desc(schema.dashboards.updatedAt));
    return result as any;
  }

  async getDashboard(id: number): Promise<Dashboard | null> {
    const result = await db
      .select()
      .from(schema.dashboards)
      .where(eq(schema.dashboards.id, id))
      .limit(1);
    return (result[0] as any) || null;
  }

  async createDashboard(data: InsertDashboard): Promise<Dashboard> {
    const result = await db
      .insert(schema.dashboards)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async updateDashboard(id: number, updates: UpdateDashboard): Promise<Dashboard> {
    const result = await db
      .update(schema.dashboards)
      .set({ ...updates, updatedAt: new Date().toISOString() } as any)
      .where(eq(schema.dashboards.id, id))
      .returning();
    if (!result[0]) throw new Error('Dashboard not found');
    return result[0] as any;
  }

  async deleteDashboard(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.dashboards)
      .where(eq(schema.dashboards.id, id))
      .returning();
    return result.length > 0;
  }

  // Dashboard Shares
  async getDashboardShares(dashboardId: number): Promise<DashboardShare[]> {
    const result = await db
      .select()
      .from(schema.dashboardShares)
      .where(eq(schema.dashboardShares.dashboardId, dashboardId))
      .orderBy(desc(schema.dashboardShares.createdAt));
    return result as any;
  }

  async createDashboardShare(data: InsertDashboardShare): Promise<DashboardShare> {
    const result = await db
      .insert(schema.dashboardShares)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  // Exports
  async createExport(data: InsertExport): Promise<Export> {
    const result = await db
      .insert(schema.exports)
      .values(data as any)
      .returning();
    return result[0] as any;
  }

  async getExport(id: number): Promise<Export | null> {
    const result = await db
      .select()
      .from(schema.exports)
      .where(eq(schema.exports.id, id))
      .limit(1);
    return (result[0] as any) || null;
  }

  // Spreadsheet Imports
  async getSpreadsheetImports(userId: number): Promise<SpreadsheetImport[]> {
    const result = await db
      .select()
      .from(schema.spreadsheetImports)
      .where(eq(schema.spreadsheetImports.userId, userId))
      .orderBy(desc(schema.spreadsheetImports.createdAt));
    return result as any;
  }

  async getSpreadsheetImport(id: number): Promise<SpreadsheetImport | null> {
    const result = await db
      .select()
      .from(schema.spreadsheetImports)
      .where(eq(schema.spreadsheetImports.id, id));
    return result[0] as any || null;
  }

  async createSpreadsheetImport(importData: InsertSpreadsheetImport): Promise<SpreadsheetImport> {
    const result = await db
      .insert(schema.spreadsheetImports)
      .values(importData as any)
      .returning();
    return result[0] as any;
  }

  async updateSpreadsheetImport(id: number, updates: UpdateSpreadsheetImport): Promise<SpreadsheetImport> {
    const result = await db
      .update(schema.spreadsheetImports)
      .set(updates as any)
      .where(eq(schema.spreadsheetImports.id, id))
      .returning();
    if (!result[0]) throw new Error('Import not found');
    return result[0] as any;
  }

  async deleteSpreadsheetImport(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.spreadsheetImports)
      .where(eq(schema.spreadsheetImports.id, id))
      .returning();
    return result.length > 0;
  }

  // GA4 Connections
  async getGA4Connections(userId: number): Promise<GA4Connection[]> {
    const result = await db
      .select()
      .from(schema.ga4Connections)
      .where(eq(schema.ga4Connections.userId, userId))
      .orderBy(desc(schema.ga4Connections.createdAt));
    return result as any;
  }

  async getGA4Connection(id: number): Promise<GA4Connection | null> {
    const result = await db
      .select()
      .from(schema.ga4Connections)
      .where(eq(schema.ga4Connections.id, id));
    return result[0] as any || null;
  }

  async createGA4Connection(connection: InsertGA4Connection): Promise<GA4Connection> {
    const result = await db
      .insert(schema.ga4Connections)
      .values(connection as any)
      .returning();
    return result[0] as any;
  }

  async updateGA4Connection(id: number, updates: UpdateGA4Connection): Promise<GA4Connection> {
    const result = await db
      .update(schema.ga4Connections)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(schema.ga4Connections.id, id))
      .returning();
    if (!result[0]) throw new Error('GA4 connection not found');
    return result[0] as any;
  }

  async deleteGA4Connection(id: number): Promise<boolean> {
    // First delete associated metrics
    await db
      .delete(schema.ga4Metrics)
      .where(eq(schema.ga4Metrics.connectionId, id));

    // Then delete connection
    const result = await db
      .delete(schema.ga4Connections)
      .where(eq(schema.ga4Connections.id, id))
      .returning();
    return result.length > 0;
  }

  // GA4 Metrics
  async getGA4Metrics(connectionId: number, startDate?: string, endDate?: string): Promise<GA4Metric[]> {
    let query = db
      .select()
      .from(schema.ga4Metrics)
      .where(eq(schema.ga4Metrics.connectionId, connectionId));

    // Add date filters if provided
    // Note: This is a simplified version. In production, you'd use proper date comparison

    const result = await query.orderBy(desc(schema.ga4Metrics.date));

    let metrics = result as any;

    if (startDate) {
      metrics = metrics.filter((m: any) => new Date(m.date) >= new Date(startDate));
    }
    if (endDate) {
      metrics = metrics.filter((m: any) => new Date(m.date) <= new Date(endDate));
    }

    return metrics;
  }

  async createGA4Metric(metric: InsertGA4Metric): Promise<GA4Metric> {
    const result = await db
      .insert(schema.ga4Metrics)
      .values(metric as any)
      .returning();
    return result[0] as any;
  }

  async deleteGA4Metrics(connectionId: number): Promise<boolean> {
    const result = await db
      .delete(schema.ga4Metrics)
      .where(eq(schema.ga4Metrics.connectionId, connectionId))
      .returning();
    return result.length > 0;
  }
}
