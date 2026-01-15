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

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User>;
  deleteUser(id: number): Promise<boolean>;

  // Data Sources
  getDataSources(userId: number): Promise<DataSource[]>;
  getDataSource(id: number): Promise<DataSource | null>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, updates: UpdateDataSource): Promise<DataSource>;
  deleteDataSource(id: number): Promise<boolean>;

  // Data Syncs
  getDataSyncs(dataSourceId: number): Promise<DataSync[]>;
  createDataSync(dataSync: InsertDataSync): Promise<DataSync>;
  updateDataSync(id: number, updates: Partial<DataSync>): Promise<DataSync>;

  // Events
  getEvents(userId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | null>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: UpdateEvent): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;

  // Event Metrics
  getEventMetrics(eventId: number): Promise<EventMetric[]>;
  createEventMetric(metric: InsertEventMetric): Promise<EventMetric>;

  // Campaigns
  getCampaigns(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | null>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: UpdateCampaign): Promise<Campaign>;
  deleteCampaign(id: number): Promise<boolean>;

  // Campaign Metrics
  getCampaignMetrics(campaignId: number): Promise<CampaignMetric[]>;
  createCampaignMetric(metric: InsertCampaignMetric): Promise<CampaignMetric>;

  // Unified Records
  getUnifiedRecords(eventId?: number): Promise<UnifiedRecord[]>;
  createUnifiedRecord(record: InsertUnifiedRecord): Promise<UnifiedRecord>;
  updateUnifiedRecord(id: number, updates: UpdateUnifiedRecord): Promise<UnifiedRecord>;

  // Identifier Mappings
  getIdentifierMappings(type?: string): Promise<IdentifierMapping[]>;
  createIdentifierMapping(mapping: InsertIdentifierMapping): Promise<IdentifierMapping>;

  // Insights
  getInsights(userId: number): Promise<Insight[]>;
  getInsight(id: number): Promise<Insight | null>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  acknowledgeInsight(id: number): Promise<Insight>;

  // Insight Comments
  getInsightComments(insightId: number): Promise<InsightComment[]>;
  createInsightComment(comment: InsertInsightComment): Promise<InsightComment>;

  // Dashboards
  getDashboards(userId: number): Promise<Dashboard[]>;
  getDashboard(id: number): Promise<Dashboard | null>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, updates: UpdateDashboard): Promise<Dashboard>;
  deleteDashboard(id: number): Promise<boolean>;

  // Dashboard Shares
  getDashboardShares(dashboardId: number): Promise<DashboardShare[]>;
  createDashboardShare(share: InsertDashboardShare): Promise<DashboardShare>;

  // Exports
  createExport(exportData: InsertExport): Promise<Export>;
  getExport(id: number): Promise<Export | null>;

  // Spreadsheet Imports
  getSpreadsheetImports(userId: number): Promise<SpreadsheetImport[]>;
  getSpreadsheetImport(id: number): Promise<SpreadsheetImport | null>;
  createSpreadsheetImport(importData: InsertSpreadsheetImport): Promise<SpreadsheetImport>;
  updateSpreadsheetImport(id: number, updates: UpdateSpreadsheetImport): Promise<SpreadsheetImport>;
  deleteSpreadsheetImport(id: number): Promise<boolean>;

  // GA4 Connections
  getGA4Connections(userId: number): Promise<GA4Connection[]>;
  getGA4Connection(id: number): Promise<GA4Connection | null>;
  createGA4Connection(connection: InsertGA4Connection): Promise<GA4Connection>;
  updateGA4Connection(id: number, updates: UpdateGA4Connection): Promise<GA4Connection>;
  deleteGA4Connection(id: number): Promise<boolean>;

  // GA4 Metrics
  getGA4Metrics(connectionId: number, startDate?: string, endDate?: string): Promise<GA4Metric[]>;
  createGA4Metric(metric: InsertGA4Metric): Promise<GA4Metric>;
  deleteGA4Metrics(connectionId: number): Promise<boolean>;
}
