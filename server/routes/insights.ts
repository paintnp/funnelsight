import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { storage } from '../lib/storage/factory.js';
import { InsightEngine } from '../lib/insights/insight-engine.js';

const router = express.Router();
const insightEngine = new InsightEngine();

/**
 * GET /api/insights/natural-language
 * Generate natural language insights from campaign data
 */
router.get('/api/insights/natural-language', authMiddleware(), async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Fetch campaigns for the user
    const campaigns = await storage.getCampaigns(userId);

    // Calculate aggregate metrics
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalRegistrations = campaigns.reduce((sum, c) => sum + (c.registrations || 0), 0);
    const totalAttendees = campaigns.reduce((sum, c) => sum + (c.attendees || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalRegistrations / totalClicks) * 100 : 0;
    const attendanceRate = totalRegistrations > 0 ? (totalAttendees / totalRegistrations) * 100 : 0;

    // Calculate channel breakdown
    const channelMap = new Map<string, any>();
    campaigns.forEach(campaign => {
      const channel = campaign.channel || 'other';
      const channelName = channel.charAt(0).toUpperCase() + channel.slice(1);

      if (!channelMap.has(channelName)) {
        channelMap.set(channelName, {
          channel: channelName,
          clicks: 0,
          registrations: 0,
          attendees: 0,
        });
      }
      const channelData = channelMap.get(channelName)!;
      channelData.clicks += campaign.clicks || 0;
      channelData.registrations += campaign.registrations || 0;
      channelData.attendees += campaign.attendees || 0;
    });

    const channelBreakdown = Array.from(channelMap.values()).map(ch => ({
      ...ch,
      qualityScore: ch.registrations > 0 ? (ch.attendees / ch.registrations) * 100 : 0
    }));

    // Find top channel
    const topChannelData = channelBreakdown.reduce((top, ch) =>
      ch.registrations > top.registrations ? ch : top,
      channelBreakdown[0] || { channel: 'None', registrations: 0, clicks: 0, attendees: 0, qualityScore: 0 }
    );

    const topChannel = {
      name: topChannelData.channel,
      percentage: totalRegistrations > 0 ? (topChannelData.registrations / totalRegistrations) * 100 : 0,
      count: topChannelData.registrations,
      qualityScore: topChannelData.qualityScore
    };

    // Prepare analytics data
    const analyticsData = {
      campaigns,
      totalClicks,
      totalRegistrations,
      totalAttendees,
      conversionRate,
      attendanceRate,
      channelBreakdown,
      topChannel
    };

    // Generate insights
    const insights = await insightEngine.generateInsights(analyticsData);

    res.json({
      success: true,
      insights,
      summary: {
        totalInsights: insights.length,
        critical: insights.filter(i => i.severity === 'critical').length,
        warnings: insights.filter(i => i.severity === 'warning').length,
        actionable: insights.filter(i => i.actionable).length
      }
    });
  } catch (error) {
    console.error('[Insights API] Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;
