import express from 'express';
import { google } from 'googleapis';
import { storage } from '../lib/storage/factory.js';
import { GA4Client } from '../lib/ga4/client.js';
import { TokenEncryption } from '../lib/crypto/encryption.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate OAuth URL for Google Analytics authentication
 */
router.get('/api/ga4/oauth/url', authMiddleware(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics.manage.users.readonly',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
      state: JSON.stringify({ userId: req.user.id }), // Pass user ID in state
    });

    res.json({ url });
  } catch (error) {
    console.error('[GA4 OAuth] Error generating URL:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
});

/**
 * OAuth callback handler - receives authorization code from Google
 */
router.get('/api/ga4/oauth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    const { userId } = JSON.parse(state as string);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code as string);

    if (!tokens.access_token || !tokens.refresh_token) {
      return res.status(400).json({ error: 'Failed to get tokens' });
    }

    // List available properties
    const properties = await GA4Client.listProperties(tokens.access_token);

    // Store tokens temporarily in session/state for property selection
    // In production, you'd want a more secure temporary storage
    const tempState = {
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date,
      properties,
    };

    // Redirect to frontend with state
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/ga4/connect?state=${encodeURIComponent(JSON.stringify(tempState))}`);
  } catch (error) {
    console.error('[GA4 OAuth] Callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/ga4/connect?error=${encodeURIComponent('OAuth callback failed')}`);
  }
});

/**
 * Create GA4 connection after property selection
 */
router.post('/api/ga4/connections', authMiddleware(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { propertyId, propertyName, accountId, accessToken, refreshToken, expiresAt } = req.body;

    if (!propertyId || !accessToken || !refreshToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Encrypt tokens
    const encryptedAccessToken = TokenEncryption.encrypt(accessToken);
    const encryptedRefreshToken = TokenEncryption.encrypt(refreshToken);

    // Create connection
    const connection = await storage.createGA4Connection({
      userId: req.user.id,
      propertyId,
      propertyName,
      accountId: accountId || null,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt: new Date(expiresAt || Date.now() + 3600000).toISOString(),
      status: 'connected',
      lastSyncAt: null,
      errorMessage: null,
    });

    res.status(201).json(connection);
  } catch (error) {
    console.error('[GA4] Error creating connection:', error);
    res.status(500).json({ error: 'Failed to create connection' });
  }
});

/**
 * List user's GA4 connections
 */
router.get('/api/ga4/connections', authMiddleware(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connections = await storage.getGA4Connections(req.user.id);

    // Remove sensitive data before sending
    const sanitized = connections.map(conn => ({
      id: conn.id,
      propertyId: conn.propertyId,
      propertyName: conn.propertyName,
      status: conn.status,
      lastSyncAt: conn.lastSyncAt,
      errorMessage: conn.errorMessage,
      createdAt: conn.createdAt,
    }));

    res.json({ data: sanitized });
  } catch (error) {
    console.error('[GA4] Error listing connections:', error);
    res.status(500).json({ error: 'Failed to list connections' });
  }
});

/**
 * Sync GA4 data for a specific connection
 */
router.post('/api/ga4/connections/:id/sync', authMiddleware(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connectionId = parseInt(req.params.id);
    const { startDate, endDate } = req.body;

    const connection = await storage.getGA4Connection(connectionId);

    if (!connection || connection.userId !== req.user.id) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Create GA4 client
    const client = new GA4Client(connection);

    // Fetch report with error handling
    let reports: any[] = [];
    try {
      reports = await client.fetchReport(
        startDate || '30daysAgo',
        endDate || 'today'
      );
      console.log(`[GA4 Sync] Fetched ${reports.length} rows for property ${connection.propertyId}`);
    } catch (syncError) {
      // Update connection status to error
      await storage.updateGA4Connection(connectionId, {
        status: 'error',
        errorMessage: syncError instanceof Error ? syncError.message : 'Unknown sync error',
      });

      console.error('[GA4 Sync] Failed to fetch data:', syncError);

      return res.status(500).json({
        error: 'Failed to sync GA4 data',
        details: syncError instanceof Error ? syncError.message : undefined
      });
    }

    // Store metrics
    let insertedCount = 0;
    for (const report of reports) {
      // Find or create campaign
      const campaigns = await storage.getCampaigns(req.user.id);
      let campaign = campaigns.find(c => c.name === report.campaignName);

      if (!campaign && report.campaignName && req.user) {
        campaign = await storage.createCampaign({
          userId: req.user.id,
          name: report.campaignName,
          channel: 'google',
          status: 'active',
          startDate: new Date(report.date).toISOString(),
          endDate: null,
          budget: null,
          spend: 0,
          impressions: 0,
          clicks: 0,
          registrations: 0,
          attendees: 0,
          conversionRate: null,
          qualityScore: null,
          metadata: null,
        });
      }

      // Insert GA4 metric
      await storage.createGA4Metric({
        connectionId: connection.id,
        campaignId: campaign?.id || null,
        date: new Date(report.date).toISOString(),
        source: report.source,
        medium: report.medium,
        campaignName: report.campaignName,
        sessions: report.sessions,
        users: report.users,
        newUsers: report.newUsers,
        conversions: report.conversions,
        engagementRate: report.engagementRate,
        avgSessionDuration: report.avgSessionDuration,
      });

      insertedCount++;
    }

    // Update connection sync timestamp
    await storage.updateGA4Connection(connectionId, {
      lastSyncAt: new Date().toISOString(),
      status: 'connected',
      errorMessage: null,
    });

    res.json({
      success: true,
      rowsSynced: insertedCount,
      lastSyncAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[GA4 Sync] Error:', error);

    // Update connection with error
    try {
      await storage.updateGA4Connection(parseInt(req.params.id), {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch (updateError) {
      console.error('[GA4 Sync] Failed to update error status:', updateError);
    }

    res.status(500).json({ error: 'Sync failed' });
  }
});

/**
 * Delete GA4 connection
 */
router.delete('/api/ga4/connections/:id', authMiddleware(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connectionId = parseInt(req.params.id);
    const connection = await storage.getGA4Connection(connectionId);

    if (!connection || connection.userId !== req.user.id) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await storage.deleteGA4Connection(connectionId);

    res.status(204).send();
  } catch (error) {
    console.error('[GA4] Error deleting connection:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

export default router;
