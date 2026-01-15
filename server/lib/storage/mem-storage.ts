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

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private dataSources: DataSource[] = [];
  private dataSyncs: DataSync[] = [];
  private events: Event[] = [];
  private eventMetrics: EventMetric[] = [];
  private campaigns: Campaign[] = [];
  private campaignMetrics: CampaignMetric[] = [];
  private unifiedRecords: UnifiedRecord[] = [];
  private identifierMappings: IdentifierMapping[] = [];
  private insights: Insight[] = [];
  private insightComments: InsightComment[] = [];
  private dashboards: Dashboard[] = [];
  private dashboardShares: DashboardShare[] = [];
  private exports: Export[] = [];

  private spreadsheetImports: SpreadsheetImport[] = [];
  private ga4Connections: GA4Connection[] = [];
  private ga4Metrics: GA4Metric[] = [];

  private nextId = {
    users: 1,
    dataSources: 1,
    dataSyncs: 1,
    events: 1,
    eventMetrics: 1,
    campaigns: 1,
    campaignMetrics: 1,
    unifiedRecords: 1,
    identifierMappings: 1,
    insights: 1,
    insightComments: 1,
    dashboards: 1,
    dashboardShares: 1,
    exports: 1,
    spreadsheetImports: 1,
    ga4Connections: 1,
    ga4Metrics: 1,
  };

  // Users
  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUser(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async createUser(data: InsertUser): Promise<User> {
    const user: User = {
      ...data,
      id: this.nextId.users++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date().toISOString() };
    return this.users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  // Data Sources
  async getDataSources(userId: number): Promise<DataSource[]> {
    return this.dataSources.filter(ds => ds.userId === userId);
  }

  async getDataSource(id: number): Promise<DataSource | null> {
    return this.dataSources.find(ds => ds.id === id) || null;
  }

  async createDataSource(data: InsertDataSource): Promise<DataSource> {
    const dataSource: DataSource = {
      ...data,
      id: this.nextId.dataSources++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.dataSources.push(dataSource);
    return dataSource;
  }

  async updateDataSource(id: number, updates: UpdateDataSource): Promise<DataSource> {
    const index = this.dataSources.findIndex(ds => ds.id === id);
    if (index === -1) throw new Error('Data source not found');
    this.dataSources[index] = { ...this.dataSources[index], ...updates, updatedAt: new Date().toISOString() };
    return this.dataSources[index];
  }

  async deleteDataSource(id: number): Promise<boolean> {
    const index = this.dataSources.findIndex(ds => ds.id === id);
    if (index === -1) return false;
    this.dataSources.splice(index, 1);
    return true;
  }

  // Data Syncs
  async getDataSyncs(dataSourceId: number): Promise<DataSync[]> {
    return this.dataSyncs.filter(ds => ds.dataSourceId === dataSourceId);
  }

  async createDataSync(data: InsertDataSync): Promise<DataSync> {
    const dataSync: DataSync = {
      ...data,
      id: this.nextId.dataSyncs++,
    };
    this.dataSyncs.push(dataSync);
    return dataSync;
  }

  async updateDataSync(id: number, updates: Partial<DataSync>): Promise<DataSync> {
    const index = this.dataSyncs.findIndex(ds => ds.id === id);
    if (index === -1) throw new Error('Data sync not found');
    this.dataSyncs[index] = { ...this.dataSyncs[index], ...updates };
    return this.dataSyncs[index];
  }

  // Events
  async getEvents(userId: number): Promise<Event[]> {
    return this.events.filter(e => e.userId === userId);
  }

  async getEvent(id: number): Promise<Event | null> {
    return this.events.find(e => e.id === id) || null;
  }

  async createEvent(data: InsertEvent): Promise<Event> {
    const event: Event = {
      ...data,
      id: this.nextId.events++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.events.push(event);
    return event;
  }

  async updateEvent(id: number, updates: UpdateEvent): Promise<Event> {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    this.events[index] = { ...this.events[index], ...updates, updatedAt: new Date().toISOString() };
    return this.events[index];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.events.splice(index, 1);
    return true;
  }

  // Event Metrics
  async getEventMetrics(eventId: number): Promise<EventMetric[]> {
    return this.eventMetrics.filter(em => em.eventId === eventId);
  }

  async createEventMetric(data: InsertEventMetric): Promise<EventMetric> {
    const metric: EventMetric = {
      ...data,
      id: this.nextId.eventMetrics++,
    };
    this.eventMetrics.push(metric);
    return metric;
  }

  // Campaigns
  async getCampaigns(userId: number): Promise<Campaign[]> {
    return this.campaigns.filter(c => c.userId === userId);
  }

  async getCampaign(id: number): Promise<Campaign | null> {
    return this.campaigns.find(c => c.id === id) || null;
  }

  async createCampaign(data: InsertCampaign): Promise<Campaign> {
    const campaign: Campaign = {
      ...data,
      id: this.nextId.campaigns++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: UpdateCampaign): Promise<Campaign> {
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    this.campaigns[index] = { ...this.campaigns[index], ...updates, updatedAt: new Date().toISOString() };
    return this.campaigns[index];
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.campaigns.splice(index, 1);
    return true;
  }

  // Campaign Metrics
  async getCampaignMetrics(campaignId: number): Promise<CampaignMetric[]> {
    return this.campaignMetrics.filter(cm => cm.campaignId === campaignId);
  }

  async createCampaignMetric(data: InsertCampaignMetric): Promise<CampaignMetric> {
    const metric: CampaignMetric = {
      ...data,
      id: this.nextId.campaignMetrics++,
      createdAt: new Date().toISOString(),
    };
    this.campaignMetrics.push(metric);
    return metric;
  }

  // Unified Records
  async getUnifiedRecords(eventId?: number): Promise<UnifiedRecord[]> {
    if (eventId) {
      return this.unifiedRecords.filter(ur => ur.eventId === eventId);
    }
    return this.unifiedRecords;
  }

  async createUnifiedRecord(data: InsertUnifiedRecord): Promise<UnifiedRecord> {
    const record: UnifiedRecord = {
      ...data,
      id: this.nextId.unifiedRecords++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.unifiedRecords.push(record);
    return record;
  }

  async updateUnifiedRecord(id: number, updates: UpdateUnifiedRecord): Promise<UnifiedRecord> {
    const index = this.unifiedRecords.findIndex(ur => ur.id === id);
    if (index === -1) throw new Error('Unified record not found');
    this.unifiedRecords[index] = { ...this.unifiedRecords[index], ...updates, updatedAt: new Date().toISOString() };
    return this.unifiedRecords[index];
  }

  // Identifier Mappings
  async getIdentifierMappings(type?: string): Promise<IdentifierMapping[]> {
    if (type) {
      return this.identifierMappings.filter(im => im.identifierType === type);
    }
    return this.identifierMappings;
  }

  async createIdentifierMapping(data: InsertIdentifierMapping): Promise<IdentifierMapping> {
    const mapping: IdentifierMapping = {
      ...data,
      id: this.nextId.identifierMappings++,
      createdAt: new Date().toISOString(),
    };
    this.identifierMappings.push(mapping);
    return mapping;
  }

  // Insights
  async getInsights(userId: number): Promise<Insight[]> {
    return this.insights.filter(i => i.userId === userId);
  }

  async getInsight(id: number): Promise<Insight | null> {
    return this.insights.find(i => i.id === id) || null;
  }

  async createInsight(data: InsertInsight): Promise<Insight> {
    const insight: Insight = {
      ...data,
      id: this.nextId.insights++,
      generatedAt: new Date().toISOString(),
      acknowledgedAt: null,
    };
    this.insights.push(insight);
    return insight;
  }

  async acknowledgeInsight(id: number): Promise<Insight> {
    const index = this.insights.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Insight not found');
    this.insights[index].acknowledgedAt = new Date().toISOString();
    return this.insights[index];
  }

  // Insight Comments
  async getInsightComments(insightId: number): Promise<InsightComment[]> {
    return this.insightComments.filter(ic => ic.insightId === insightId);
  }

  async createInsightComment(data: InsightComment): Promise<InsightComment> {
    const comment: InsightComment = {
      ...data,
      id: this.nextId.insightComments++,
      createdAt: new Date().toISOString(),
    };
    this.insightComments.push(comment);
    return comment;
  }

  // Dashboards
  async getDashboards(userId: number): Promise<Dashboard[]> {
    return this.dashboards.filter(d => d.userId === userId);
  }

  async getDashboard(id: number): Promise<Dashboard | null> {
    return this.dashboards.find(d => d.id === id) || null;
  }

  async createDashboard(data: InsertDashboard): Promise<Dashboard> {
    const dashboard: Dashboard = {
      ...data,
      id: this.nextId.dashboards++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.dashboards.push(dashboard);
    return dashboard;
  }

  async updateDashboard(id: number, updates: UpdateDashboard): Promise<Dashboard> {
    const index = this.dashboards.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Dashboard not found');
    this.dashboards[index] = { ...this.dashboards[index], ...updates, updatedAt: new Date().toISOString() };
    return this.dashboards[index];
  }

  async deleteDashboard(id: number): Promise<boolean> {
    const index = this.dashboards.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.dashboards.splice(index, 1);
    return true;
  }

  // Dashboard Shares
  async getDashboardShares(dashboardId: number): Promise<DashboardShare[]> {
    return this.dashboardShares.filter(ds => ds.dashboardId === dashboardId);
  }

  async createDashboardShare(data: InsertDashboardShare): Promise<DashboardShare> {
    const share: DashboardShare = {
      ...data,
      id: this.nextId.dashboardShares++,
      createdAt: new Date().toISOString(),
    };
    this.dashboardShares.push(share);
    return share;
  }

  // Exports
  async createExport(data: InsertExport): Promise<Export> {
    const exportData: Export = {
      ...data,
      id: this.nextId.exports++,
      createdAt: new Date().toISOString(),
    };
    this.exports.push(exportData);
    return exportData;
  }

  async getExport(id: number): Promise<Export | null> {
    return this.exports.find(e => e.id === id) || null;
  }

  // Spreadsheet Imports
  async getSpreadsheetImports(userId: number): Promise<SpreadsheetImport[]> {
    return this.spreadsheetImports.filter(imp => imp.userId === userId);
  }

  async getSpreadsheetImport(id: number): Promise<SpreadsheetImport | null> {
    return this.spreadsheetImports.find(imp => imp.id === id) || null;
  }

  async createSpreadsheetImport(importData: InsertSpreadsheetImport): Promise<SpreadsheetImport> {
    const newImport: SpreadsheetImport = {
      ...importData,
      id: this.nextId.spreadsheetImports++,
      createdAt: new Date().toISOString(),
      processedAt: null,
    };
    this.spreadsheetImports.push(newImport);
    return newImport;
  }

  async updateSpreadsheetImport(id: number, updates: UpdateSpreadsheetImport): Promise<SpreadsheetImport> {
    const index = this.spreadsheetImports.findIndex(imp => imp.id === id);
    if (index === -1) throw new Error('Import not found');

    this.spreadsheetImports[index] = {
      ...this.spreadsheetImports[index],
      ...updates,
    };
    return this.spreadsheetImports[index];
  }

  async deleteSpreadsheetImport(id: number): Promise<boolean> {
    const index = this.spreadsheetImports.findIndex(imp => imp.id === id);
    if (index === -1) return false;
    this.spreadsheetImports.splice(index, 1);
    return true;
  }

  // GA4 Connections
  async getGA4Connections(userId: number): Promise<GA4Connection[]> {
    return this.ga4Connections.filter(conn => conn.userId === userId);
  }

  async getGA4Connection(id: number): Promise<GA4Connection | null> {
    return this.ga4Connections.find(conn => conn.id === id) || null;
  }

  async createGA4Connection(connection: InsertGA4Connection): Promise<GA4Connection> {
    const newConnection: GA4Connection = {
      ...connection,
      id: this.nextId.ga4Connections++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.ga4Connections.push(newConnection);
    return newConnection;
  }

  async updateGA4Connection(id: number, updates: UpdateGA4Connection): Promise<GA4Connection> {
    const index = this.ga4Connections.findIndex(conn => conn.id === id);
    if (index === -1) throw new Error('GA4 connection not found');

    this.ga4Connections[index] = {
      ...this.ga4Connections[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.ga4Connections[index];
  }

  async deleteGA4Connection(id: number): Promise<boolean> {
    const index = this.ga4Connections.findIndex(conn => conn.id === id);
    if (index === -1) return false;
    this.ga4Connections.splice(index, 1);
    // Also delete associated metrics
    this.ga4Metrics = this.ga4Metrics.filter(m => m.connectionId !== id);
    return true;
  }

  // GA4 Metrics
  async getGA4Metrics(connectionId: number, startDate?: string, endDate?: string): Promise<GA4Metric[]> {
    let metrics = this.ga4Metrics.filter(m => m.connectionId === connectionId);

    if (startDate) {
      metrics = metrics.filter(m => new Date(m.date) >= new Date(startDate));
    }
    if (endDate) {
      metrics = metrics.filter(m => new Date(m.date) <= new Date(endDate));
    }

    return metrics;
  }

  async createGA4Metric(metric: InsertGA4Metric): Promise<GA4Metric> {
    const newMetric: GA4Metric = {
      ...metric,
      id: this.nextId.ga4Metrics++,
      createdAt: new Date().toISOString(),
    };
    this.ga4Metrics.push(newMetric);
    return newMetric;
  }

  async deleteGA4Metrics(connectionId: number): Promise<boolean> {
    const before = this.ga4Metrics.length;
    this.ga4Metrics = this.ga4Metrics.filter(m => m.connectionId !== connectionId);
    return this.ga4Metrics.length < before;
  }
}
