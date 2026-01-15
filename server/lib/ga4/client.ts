import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';
import { TokenEncryption } from '../crypto/encryption.js';
import type { GA4Connection } from '../../../shared/schema.zod.js';

export interface GA4Report {
  source: string;
  medium: string | null;
  campaignName: string | null;
  date: string;
  sessions: number;
  users: number;
  newUsers: number;
  conversions: number;
  engagementRate: number | null;
  avgSessionDuration: number | null;
}

/**
 * GA4 Client for interacting with Google Analytics 4 API
 */
export class GA4Client {
  private connection: GA4Connection;
  private analyticsDataClient: BetaAnalyticsDataClient | null = null;

  constructor(connection: GA4Connection) {
    this.connection = connection;
  }

  /**
   * Initialize the GA4 client with OAuth credentials
   */
  private async getClient(): Promise<BetaAnalyticsDataClient> {
    if (this.analyticsDataClient) {
      return this.analyticsDataClient;
    }

    // Check if token is expired
    const expiresAt = new Date(this.connection.tokenExpiresAt);
    const now = new Date();

    if (expiresAt <= now) {
      // Token expired, need to refresh
      await this.refreshAccessToken();
    }

    // Decrypt the access token
    const accessToken = TokenEncryption.decrypt(this.connection.encryptedAccessToken);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    // Add the getUniverseDomain method that BetaAnalyticsDataClient expects
    // This method is required by newer versions of google-gax/google-analytics-data
    (oauth2Client as any).getUniverseDomain = async () => 'googleapis.com';

    // Add getClient method if needed by the library
    (oauth2Client as any).getClient = async () => oauth2Client;

    // Create analytics data client with auth
    this.analyticsDataClient = new BetaAnalyticsDataClient({
      auth: oauth2Client as any,
    });

    return this.analyticsDataClient;
  }

  /**
   * Refresh the OAuth access token
   */
  private async refreshAccessToken(): Promise<void> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const refreshToken = TokenEncryption.decrypt(this.connection.encryptedRefreshToken);
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update connection with new tokens (this should be done by the caller)
    if (credentials.access_token) {
      this.connection.encryptedAccessToken = TokenEncryption.encrypt(credentials.access_token);
      this.connection.tokenExpiresAt = new Date(credentials.expiry_date || Date.now() + 3600000).toISOString();
    }
  }

  /**
   * Fetch GA4 report for a date range
   */
  async fetchReport(startDate: string, endDate: string): Promise<GA4Report[]> {
    try {
      const client = await this.getClient();

      const [response] = await client.runReport({
        property: `properties/${this.connection.propertyId}`,
        dateRanges: [
          {
            startDate,
            endDate,
          },
        ],
        dimensions: [
          { name: 'date' },
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
          { name: 'sessionCampaignName' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'conversions' },
          { name: 'engagementRate' },
          { name: 'averageSessionDuration' },
        ],
      });

      const reports: GA4Report[] = [];

      if (response.rows) {
        for (const row of response.rows) {
          const dimensions = row.dimensionValues || [];
          const metrics = row.metricValues || [];

          reports.push({
            date: dimensions[0]?.value || '',
            source: dimensions[1]?.value || 'direct',
            medium: dimensions[2]?.value || null,
            campaignName: dimensions[3]?.value || null,
            sessions: parseInt(metrics[0]?.value || '0', 10),
            users: parseInt(metrics[1]?.value || '0', 10),
            newUsers: parseInt(metrics[2]?.value || '0', 10),
            conversions: parseInt(metrics[3]?.value || '0', 10),
            engagementRate: parseFloat(metrics[4]?.value || '0'),
            avgSessionDuration: parseFloat(metrics[5]?.value || '0'),
          });
        }
      }

      return reports;
    } catch (error) {
      console.error('[GA4Client] fetchReport error:', error);

      // Provide a more user-friendly error message
      if (error instanceof Error) {
        // Check for common GA4 errors
        if (error.message.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied. Please ensure the GA4 property access is granted.');
        } else if (error.message.includes('INVALID_ARGUMENT')) {
          throw new Error('Invalid request parameters. Please check the property ID and date range.');
        } else if (error.message.includes('UNAUTHENTICATED')) {
          throw new Error('Authentication failed. Please reconnect your GA4 account.');
        }

        throw new Error(`GA4 sync failed: ${error.message}`);
      }

      throw new Error('GA4 sync failed: Unknown error occurred');
    }
  }

  /**
   * List available GA4 properties for the authenticated user
   */
  static async listProperties(accessToken: string): Promise<Array<{ id: string; name: string; accountId: string }>> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const analyticsAdmin = google.analyticsadmin({
      version: 'v1beta',
      auth: oauth2Client,
    });

    const response = await analyticsAdmin.properties.list({
      filter: 'parent:accounts/*',
    });

    const properties: Array<{ id: string; name: string; accountId: string }> = [];

    if (response.data.properties) {
      for (const property of response.data.properties) {
        if (property.name && property.displayName && property.parent) {
          // Extract property ID from name (format: "properties/123456789")
          const propertyId = property.name.split('/')[1];
          // Extract account ID from parent (format: "accounts/123456")
          const accountId = property.parent.split('/')[1];

          properties.push({
            id: propertyId,
            name: property.displayName,
            accountId,
          });
        }
      }
    }

    return properties;
  }
}
