import express from 'express';
import { storage } from '../lib/storage/factory.js';
import { authMiddleware } from '../middleware/auth.js';
import { CampaignAnalyzer } from '../lib/analytics/campaign-analyzer.js';

const router = express.Router();

// ============================================================================
// DATA SOURCES ROUTES
// ============================================================================

router.get('/api/data-sources', authMiddleware(), async (req, res) => {
  try {
    const dataSources = await storage.getDataSources(req.user!.id);
    res.json({
      data: dataSources,
      total: dataSources.length,
      page: 1,
      limit: 100,
    });
  } catch (error: any) {
    console.error('[Data Sources] Get error:', error.message);
    res.status(500).json({ error: 'Failed to get data sources' });
  }
});

router.get('/api/data-sources/:id', authMiddleware(), async (req, res) => {
  try {
    const dataSource = await storage.getDataSource(Number(req.params.id));
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    res.json(dataSource);
  } catch (error: any) {
    console.error('[Data Sources] Get by ID error:', error.message);
    res.status(500).json({ error: 'Failed to get data source' });
  }
});

router.post('/api/data-sources', authMiddleware(), async (req, res) => {
  try {
    const dataSource = await storage.createDataSource({
      ...req.body,
      userId: req.user!.id,
      status: 'connected',
      lastSyncAt: null,
      errorMessage: null,
    });
    res.status(201).json(dataSource);
  } catch (error: any) {
    console.error('[Data Sources] Create error:', error.message);
    res.status(400).json({ error: 'Failed to create data source' });
  }
});

router.put('/api/data-sources/:id', authMiddleware(), async (req, res) => {
  try {
    const dataSource = await storage.updateDataSource(Number(req.params.id), req.body);
    res.json(dataSource);
  } catch (error: any) {
    console.error('[Data Sources] Update error:', error.message);
    res.status(404).json({ error: 'Data source not found' });
  }
});

router.delete('/api/data-sources/:id', authMiddleware(), async (req, res) => {
  try {
    const success = await storage.deleteDataSource(Number(req.params.id));
    res.json({ success });
  } catch (error: any) {
    console.error('[Data Sources] Delete error:', error.message);
    res.status(404).json({ error: 'Data source not found' });
  }
});

router.post('/api/data-sources/:id/sync', authMiddleware(), async (req, res) => {
  try {
    const dataSync = await storage.createDataSync({
      dataSourceId: Number(req.params.id),
      status: 'pending',
      recordsProcessed: 0,
      errors: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    });
    res.json(dataSync);
  } catch (error: any) {
    console.error('[Data Sources] Sync error:', error.message);
    res.status(404).json({ error: 'Data source not found' });
  }
});

router.get('/api/data-sources/:id/syncs', authMiddleware(), async (req, res) => {
  try {
    const syncs = await storage.getDataSyncs(Number(req.params.id));
    res.json(syncs);
  } catch (error: any) {
    console.error('[Data Sources] Get syncs error:', error.message);
    res.status(500).json({ error: 'Failed to get sync history' });
  }
});

// ============================================================================
// EVENTS ROUTES
// ============================================================================

router.get('/api/events', authMiddleware(), async (req, res) => {
  try {
    const events = await storage.getEvents(req.user!.id);
    res.json({
      data: events,
      total: events.length,
      page: 1,
      limit: 100,
    });
  } catch (error: any) {
    console.error('[Events] Get error:', error.message);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

router.get('/api/events/:id', authMiddleware(), async (req, res) => {
  try {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error: any) {
    console.error('[Events] Get by ID error:', error.message);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

router.post('/api/events', authMiddleware(), async (req, res) => {
  try {
    const event = await storage.createEvent({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json(event);
  } catch (error: any) {
    console.error('[Events] Create error:', error.message);
    res.status(400).json({ error: 'Failed to create event' });
  }
});

router.put('/api/events/:id', authMiddleware(), async (req, res) => {
  try {
    const event = await storage.updateEvent(Number(req.params.id), req.body);
    res.json(event);
  } catch (error: any) {
    console.error('[Events] Update error:', error.message);
    res.status(404).json({ error: 'Event not found' });
  }
});

router.delete('/api/events/:id', authMiddleware(), async (req, res) => {
  try {
    const success = await storage.deleteEvent(Number(req.params.id));
    res.json({ success });
  } catch (error: any) {
    console.error('[Events] Delete error:', error.message);
    res.status(404).json({ error: 'Event not found' });
  }
});

router.get('/api/events/:id/metrics', authMiddleware(), async (req, res) => {
  try {
    const metrics = await storage.getEventMetrics(Number(req.params.id));
    res.json(metrics);
  } catch (error: any) {
    console.error('[Events] Get metrics error:', error.message);
    res.status(500).json({ error: 'Failed to get event metrics' });
  }
});

router.post('/api/events/:id/metrics', authMiddleware(), async (req, res) => {
  try {
    const metric = await storage.createEventMetric({
      ...req.body,
      eventId: Number(req.params.id),
    });
    res.status(201).json(metric);
  } catch (error: any) {
    console.error('[Events] Create metric error:', error.message);
    res.status(400).json({ error: 'Failed to create metric' });
  }
});

// ============================================================================
// CAMPAIGNS ROUTES
// ============================================================================

router.get('/api/campaigns', authMiddleware(), async (req, res) => {
  try {
    const campaigns = await storage.getCampaigns(req.user!.id);
    res.json({
      data: campaigns,
      total: campaigns.length,
      page: 1,
      limit: 100,
    });
  } catch (error: any) {
    console.error('[Campaigns] Get error:', error.message);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

router.get('/api/campaigns/:id', authMiddleware(), async (req, res) => {
  try {
    const campaign = await storage.getCampaign(Number(req.params.id));
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error: any) {
    console.error('[Campaigns] Get by ID error:', error.message);
    res.status(500).json({ error: 'Failed to get campaign' });
  }
});

router.post('/api/campaigns', authMiddleware(), async (req, res) => {
  try {
    const campaign = await storage.createCampaign({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json(campaign);
  } catch (error: any) {
    console.error('[Campaigns] Create error:', error.message);
    res.status(400).json({ error: 'Failed to create campaign' });
  }
});

router.put('/api/campaigns/:id', authMiddleware(), async (req, res) => {
  try {
    const campaign = await storage.updateCampaign(Number(req.params.id), req.body);
    res.json(campaign);
  } catch (error: any) {
    console.error('[Campaigns] Update error:', error.message);
    res.status(404).json({ error: 'Campaign not found' });
  }
});

router.delete('/api/campaigns/:id', authMiddleware(), async (req, res) => {
  try {
    const success = await storage.deleteCampaign(Number(req.params.id));
    res.json({ success });
  } catch (error: any) {
    console.error('[Campaigns] Delete error:', error.message);
    res.status(404).json({ error: 'Campaign not found' });
  }
});

router.get('/api/campaigns/:id/metrics', authMiddleware(), async (req, res) => {
  try {
    const metrics = await storage.getCampaignMetrics(Number(req.params.id));
    res.json(metrics);
  } catch (error: any) {
    console.error('[Campaigns] Get metrics error:', error.message);
    res.status(500).json({ error: 'Failed to get campaign metrics' });
  }
});

router.post('/api/campaigns/:id/metrics', authMiddleware(), async (req, res) => {
  try {
    const metric = await storage.createCampaignMetric({
      ...req.body,
      campaignId: Number(req.params.id),
    });
    res.status(201).json(metric);
  } catch (error: any) {
    console.error('[Campaigns] Create metric error:', error.message);
    res.status(400).json({ error: 'Failed to create metric' });
  }
});

// ============================================================================
// INSIGHTS ROUTES (AI-generated insights)
// ============================================================================

router.get('/api/insights', authMiddleware(), async (req, res) => {
  try {
    const insights = await storage.getInsights(req.user!.id);
    res.json({
      data: insights,
      total: insights.length,
      page: 1,
      limit: 100,
    });
  } catch (error: any) {
    console.error('[Insights] Get error:', error.message);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

router.get('/api/insights/:id', authMiddleware(), async (req, res) => {
  try {
    const insight = await storage.getInsight(Number(req.params.id));
    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }
    res.json(insight);
  } catch (error: any) {
    console.error('[Insights] Get by ID error:', error.message);
    res.status(500).json({ error: 'Failed to get insight' });
  }
});

router.post('/api/insights', authMiddleware(), async (req, res) => {
  try {
    const insight = await storage.createInsight({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json(insight);
  } catch (error: any) {
    console.error('[Insights] Create error:', error.message);
    res.status(400).json({ error: 'Failed to create insight' });
  }
});

router.put('/api/insights/:id/acknowledge', authMiddleware(), async (req, res) => {
  try {
    const insight = await storage.acknowledgeInsight(Number(req.params.id));
    res.json(insight);
  } catch (error: any) {
    console.error('[Insights] Acknowledge error:', error.message);
    res.status(404).json({ error: 'Insight not found' });
  }
});

// Generate insights endpoint (AI integration will be added)
router.post('/api/insights/generate', authMiddleware(), async (req, res) => {
  try {
    // TODO: AI integration to be implemented
    // For now, return empty array
    res.json({
      insights: [],
      generatedCount: 0,
    });
  } catch (error: any) {
    console.error('[Insights] Generate error:', error.message);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

router.get('/api/insights/:id/comments', authMiddleware(), async (req, res) => {
  try {
    const comments = await storage.getInsightComments(Number(req.params.id));
    res.json(comments);
  } catch (error: any) {
    console.error('[Insights] Get comments error:', error.message);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

router.post('/api/insights/:id/comments', authMiddleware(), async (req, res) => {
  try {
    const comment = await storage.createInsightComment({
      ...req.body,
      insightId: Number(req.params.id),
      userId: req.user!.id,
    });
    res.status(201).json(comment);
  } catch (error: any) {
    console.error('[Insights] Create comment error:', error.message);
    res.status(400).json({ error: 'Failed to create comment' });
  }
});

// ============================================================================
// DASHBOARDS ROUTES
// ============================================================================

router.get('/api/dashboards', authMiddleware(), async (req, res) => {
  try {
    const dashboards = await storage.getDashboards(req.user!.id);
    res.json({
      data: dashboards,
      total: dashboards.length,
      page: 1,
      limit: 100,
    });
  } catch (error: any) {
    console.error('[Dashboards] Get error:', error.message);
    res.status(500).json({ error: 'Failed to get dashboards' });
  }
});

router.get('/api/dashboards/:id', authMiddleware(), async (req, res) => {
  try {
    const dashboard = await storage.getDashboard(Number(req.params.id));
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    res.json(dashboard);
  } catch (error: any) {
    console.error('[Dashboards] Get by ID error:', error.message);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

router.post('/api/dashboards', authMiddleware(), async (req, res) => {
  try {
    const dashboard = await storage.createDashboard({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json(dashboard);
  } catch (error: any) {
    console.error('[Dashboards] Create error:', error.message);
    res.status(400).json({ error: 'Failed to create dashboard' });
  }
});

router.put('/api/dashboards/:id', authMiddleware(), async (req, res) => {
  try {
    const dashboard = await storage.updateDashboard(Number(req.params.id), req.body);
    res.json(dashboard);
  } catch (error: any) {
    console.error('[Dashboards] Update error:', error.message);
    res.status(404).json({ error: 'Dashboard not found' });
  }
});

router.delete('/api/dashboards/:id', authMiddleware(), async (req, res) => {
  try {
    const success = await storage.deleteDashboard(Number(req.params.id));
    res.json({ success });
  } catch (error: any) {
    console.error('[Dashboards] Delete error:', error.message);
    res.status(404).json({ error: 'Dashboard not found' });
  }
});

router.post('/api/dashboards/:id/share', authMiddleware(), async (req, res) => {
  try {
    const share = await storage.createDashboardShare({
      ...req.body,
      dashboardId: Number(req.params.id),
    });
    res.status(201).json(share);
  } catch (error: any) {
    console.error('[Dashboards] Share error:', error.message);
    res.status(400).json({ error: 'Failed to share dashboard' });
  }
});

router.get('/api/dashboards/:id/shares', authMiddleware(), async (req, res) => {
  try {
    const shares = await storage.getDashboardShares(Number(req.params.id));
    res.json(shares);
  } catch (error: any) {
    console.error('[Dashboards] Get shares error:', error.message);
    res.status(500).json({ error: 'Failed to get shares' });
  }
});

// ============================================================================
// ANALYTICS ROUTES (Computed analytics)
// ============================================================================

router.get('/api/analytics/funnel', authMiddleware(), async (req, res) => {
  try {
    // Simplified funnel calculation
    const campaigns = await storage.getCampaigns(req.user!.id);
    const events = await storage.getEvents(req.user!.id);

    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalRegistrations = campaigns.reduce((sum, c) => sum + c.registrations, 0);
    const totalAttendees = campaigns.reduce((sum, c) => sum + c.attendees, 0);

    res.json({
      stages: [
        { name: 'Impressions', count: totalImpressions, conversionRate: 100 },
        { name: 'Clicks', count: totalClicks, conversionRate: totalImpressions ? (totalClicks / totalImpressions) * 100 : 0 },
        { name: 'Registrations', count: totalRegistrations, conversionRate: totalClicks ? (totalRegistrations / totalClicks) * 100 : 0 },
        { name: 'Attendees', count: totalAttendees, conversionRate: totalRegistrations ? (totalAttendees / totalRegistrations) * 100 : 0 },
      ],
      totalImpressions,
      totalClicks,
      totalRegistrations,
      totalAttendees,
    });
  } catch (error: any) {
    console.error('[Analytics] Funnel error:', error.message);
    res.status(500).json({ error: 'Failed to get funnel data' });
  }
});

router.get('/api/analytics/channels', authMiddleware(), async (req, res) => {
  try {
    const campaigns = await storage.getCampaigns(req.user!.id);

    const channelMap = new Map<string, any>();

    campaigns.forEach(c => {
      const existing = channelMap.get(c.channel) || {
        channel: c.channel,
        registrations: 0,
        attendees: 0,
        spend: 0,
        roi: 0,
        qualityScore: 0,
      };

      existing.registrations += c.registrations;
      existing.attendees += c.attendees;
      existing.spend += c.spend;

      channelMap.set(c.channel, existing);
    });

    const result = Array.from(channelMap.values()).map(channel => ({
      ...channel,
      roi: channel.spend > 0 ? ((channel.attendees * 100 - channel.spend) / channel.spend) * 100 : 0,
      qualityScore: channel.registrations > 0 ? (channel.attendees / channel.registrations) * 100 : 0,
    }));

    res.json(result);
  } catch (error: any) {
    console.error('[Analytics] Channels error:', error.message);
    res.status(500).json({ error: 'Failed to get channel data' });
  }
});

router.get('/api/analytics/registration-sources', authMiddleware(), async (req, res) => {
  try {
    const campaigns = await storage.getCampaigns(req.user!.id);
    const totalRegistrations = campaigns.reduce((sum, c) => sum + c.registrations, 0);

    const sources = campaigns.map(c => ({
      source: c.name,
      count: c.registrations,
      percentage: totalRegistrations > 0 ? (c.registrations / totalRegistrations) * 100 : 0,
    }));

    res.json(sources);
  } catch (error: any) {
    console.error('[Analytics] Registration sources error:', error.message);
    res.status(500).json({ error: 'Failed to get registration sources' });
  }
});

router.get('/api/analytics/attendance-trends', authMiddleware(), async (req, res) => {
  try {
    const events = await storage.getEvents(req.user!.id);

    const trends = events.map(e => ({
      date: e.startDate,
      registrations: e.actualRegistrations,
      attendees: e.attendanceCount,
      attendanceRate: e.actualRegistrations > 0 ? (e.attendanceCount / e.actualRegistrations) * 100 : 0,
    }));

    res.json(trends);
  } catch (error: any) {
    console.error('[Analytics] Attendance trends error:', error.message);
    res.status(500).json({ error: 'Failed to get attendance trends' });
  }
});

router.get('/api/analytics/event-timeline/:id', authMiddleware(), async (req, res) => {
  try {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const campaigns = await storage.getCampaigns(req.user!.id);

    res.json({
      event: {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
      },
      marketingActivities: campaigns.map(c => ({
        date: c.startDate,
        campaign: c.name,
        channel: c.channel,
        spend: c.spend,
        registrations: c.registrations,
      })),
      milestones: [],
    });
  } catch (error: any) {
    console.error('[Analytics] Event timeline error:', error.message);
    res.status(500).json({ error: 'Failed to get event timeline' });
  }
});

router.get('/api/analytics/campaign-comparison', authMiddleware(), async (req, res) => {
  try {
    const campaigns = await storage.getCampaigns(req.user!.id);

    const comparison = campaigns.map(c => ({
      campaignId: c.id,
      campaignName: c.name,
      channel: c.channel,
      metrics: {
        impressions: c.impressions,
        clicks: c.clicks,
        registrations: c.registrations,
        attendees: c.attendees,
        spend: c.spend,
        costPerRegistration: c.registrations > 0 ? c.spend / c.registrations : 0,
        conversionRate: c.impressions > 0 ? (c.registrations / c.impressions) * 100 : 0,
        qualityScore: c.qualityScore || 0,
      },
    }));

    res.json(comparison);
  } catch (error: any) {
    console.error('[Analytics] Campaign comparison error:', error.message);
    res.status(500).json({ error: 'Failed to get campaign comparison' });
  }
});

// Generate AI-powered campaign insights
router.get('/api/analytics/insights', authMiddleware(), async (req, res) => {
  try {
    console.log('[Analytics] Generating campaign insights');

    // Get all data needed for analysis
    const campaigns = await storage.getCampaigns(req.user!.id);
    const allRecords = await storage.getUnifiedRecords();

    // Filter records that belong to user's campaigns
    const campaignNames = new Set(campaigns.map(c => c.name));
    const userRecords = allRecords.filter((r) => {
      return r.campaignName && campaignNames.has(r.campaignName);
    });

    // Get all campaign metrics
    const allMetrics: any[] = [];
    for (const campaign of campaigns) {
      const metrics = await storage.getCampaignMetrics(campaign.id);
      allMetrics.push(...metrics);
    }

    // Generate insights
    const analyzer = new CampaignAnalyzer();
    const insights = await analyzer.generateInsights(campaigns, userRecords, allMetrics);

    console.log(`[Analytics] Generated ${insights.length} insights`);

    res.json({
      insights,
      summary: {
        totalCampaigns: campaigns.length,
        totalRegistrations: userRecords.length,
        insightsGenerated: insights.length,
      },
    });
  } catch (error: any) {
    console.error('[Analytics] Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;
