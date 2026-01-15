import type { UnifiedRecord, Campaign, CampaignMetric } from '../../../shared/schema.zod.js';

/**
 * Represents an insight generated from campaign analysis
 */
export interface CampaignInsight {
  type: 'registration_source' | 'campaign_performance' | 'channel_effectiveness' | 'cost_efficiency';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metrics: Record<string, number | string>;
  recommendation?: string;
}

/**
 * Campaign Performance Analysis Engine
 *
 * Analyzes marketing data to generate actionable insights about:
 * - Registration sources and their effectiveness
 * - Campaign performance and cost efficiency
 * - Channel effectiveness comparisons
 * - Time-based trends
 */
export class CampaignAnalyzer {
  /**
   * Analyze registration sources and generate insights
   */
  analyzeRegistrationSources(records: UnifiedRecord[]): CampaignInsight[] {
    const insights: CampaignInsight[] = [];

    if (records.length === 0) return insights;

    // Group by UTM source
    const sourceCount = new Map<string, number>();
    records.forEach((record) => {
      const source = record.utmSource || 'direct';
      sourceCount.set(source, (sourceCount.get(source) || 0) + 1);
    });

    const total = records.length;

    // Find top source
    const sortedSources = Array.from(sourceCount.entries())
      .sort((a, b) => b[1] - a[1]);

    if (sortedSources.length === 0) return insights;

    const topSource = sortedSources[0];
    const topSourcePercentage = Math.round((topSource[1] / total) * 100);

    // Generate insight for top source
    if (topSourcePercentage >= 30) {
      insights.push({
        type: 'registration_source',
        priority: 'high',
        title: `${this.formatSource(topSource[0])} drives ${topSourcePercentage}% of registrations`,
        description: `${this.formatSource(topSource[0])} is your primary registration source with ${topSource[1]} registrations out of ${total} total.`,
        metrics: {
          source: this.formatSource(topSource[0]),
          registrations: topSource[1],
          percentage: topSourcePercentage,
          totalRegistrations: total,
        },
        recommendation: `Focus on scaling ${this.formatSource(topSource[0])} campaigns as they're your most effective channel.`,
      });
    }

    // Identify underperforming sources
    const avgRegistrations = total / sourceCount.size;
    sortedSources.forEach(([source, count]) => {
      const percentage = (count / total) * 100;
      if (percentage < 5 && count < avgRegistrations / 2) {
        insights.push({
          type: 'registration_source',
          priority: 'medium',
          title: `${this.formatSource(source)} underperforming`,
          description: `${this.formatSource(source)} accounts for only ${Math.round(percentage)}% of registrations (${count} registrations).`,
          metrics: {
            source: this.formatSource(source),
            registrations: count,
            percentage: Math.round(percentage),
          },
          recommendation: `Consider optimizing or pausing ${this.formatSource(source)} campaigns to reallocate budget to higher-performing channels.`,
        });
      }
    });

    return insights;
  }

  /**
   * Analyze campaign performance and efficiency
   */
  analyzeCampaignPerformance(
    campaigns: Campaign[],
    records: UnifiedRecord[],
    metrics: CampaignMetric[]
  ): CampaignInsight[] {
    const insights: CampaignInsight[] = [];

    if (campaigns.length === 0) return insights;

    // Map campaign data to detailed stats
    const campaignStats = new Map<number, {
      campaign: Campaign;
      registrations: number;
      cost: number;
      clicks: number;
      impressions: number;
    }>();

    campaigns.forEach((campaign) => {
      // Count registrations from unified records that match this campaign
      const campaignRecords = records.filter((r) => r.campaignName === campaign.name);

      // Sum up metrics from campaign metrics table
      const campaignMetrics = metrics.filter((m) => m.campaignId === campaign.id);

      const totalCost = campaignMetrics
        .filter(m => m.metricType === 'cost_per_registration')
        .reduce((sum, m) => sum + m.value, 0);

      const totalClicks = campaignMetrics
        .filter(m => m.metricType === 'clicks')
        .reduce((sum, m) => sum + m.value, 0);

      const totalImpressions = campaignMetrics
        .filter(m => m.metricType === 'impressions')
        .reduce((sum, m) => sum + m.value, 0);

      campaignStats.set(campaign.id, {
        campaign,
        registrations: campaignRecords.length || campaign.registrations,
        cost: campaign.spend || totalCost,
        clicks: campaign.clicks || totalClicks,
        impressions: campaign.impressions || totalImpressions,
      });
    });

    // Find best performing campaign by registrations
    const sortedByCampaign = Array.from(campaignStats.values())
      .filter(stat => stat.registrations > 0)
      .sort((a, b) => b.registrations - a.registrations);

    if (sortedByCampaign.length > 0) {
      const topCampaign = sortedByCampaign[0];
      const totalRegistrations = records.length;

      if (totalRegistrations > 0) {
        const percentage = Math.round((topCampaign.registrations / totalRegistrations) * 100);

        if (percentage >= 20) {
          insights.push({
            type: 'campaign_performance',
            priority: 'high',
            title: `"${topCampaign.campaign.name}" is your top campaign`,
            description: `"${topCampaign.campaign.name}" generated ${topCampaign.registrations} registrations (${percentage}% of total).`,
            metrics: {
              campaignName: topCampaign.campaign.name,
              registrations: topCampaign.registrations,
              percentage,
              clicks: topCampaign.clicks,
              impressions: topCampaign.impressions,
            },
          });
        }
      }
    }

    // Analyze cost efficiency
    const campaignsWithCost = Array.from(campaignStats.values())
      .filter((stat) => stat.cost > 0 && stat.registrations > 0);

    if (campaignsWithCost.length > 0) {
      const avgCostPerReg = campaignsWithCost.reduce((sum, s) => sum + (s.cost / s.registrations), 0) / campaignsWithCost.length;

      campaignsWithCost.forEach((stat) => {
        const costPerReg = stat.cost / stat.registrations;

        // Highlight very efficient campaigns
        if (costPerReg < avgCostPerReg * 0.7) {
          insights.push({
            type: 'cost_efficiency',
            priority: 'high',
            title: `"${stat.campaign.name}" has excellent cost efficiency`,
            description: `Cost per registration is $${costPerReg.toFixed(2)}, which is ${Math.round((1 - costPerReg / avgCostPerReg) * 100)}% lower than average.`,
            metrics: {
              campaignName: stat.campaign.name,
              costPerRegistration: parseFloat(costPerReg.toFixed(2)),
              avgCostPerRegistration: parseFloat(avgCostPerReg.toFixed(2)),
              totalCost: stat.cost,
              registrations: stat.registrations,
            },
            recommendation: `This campaign is highly cost-efficient. Consider increasing budget allocation.`,
          });
        }

        // Flag expensive campaigns
        if (costPerReg > avgCostPerReg * 1.5 && stat.registrations >= 3) {
          insights.push({
            type: 'cost_efficiency',
            priority: 'medium',
            title: `"${stat.campaign.name}" has high acquisition cost`,
            description: `Cost per registration is $${costPerReg.toFixed(2)}, which is ${Math.round((costPerReg / avgCostPerReg - 1) * 100)}% higher than average.`,
            metrics: {
              campaignName: stat.campaign.name,
              costPerRegistration: parseFloat(costPerReg.toFixed(2)),
              avgCostPerRegistration: parseFloat(avgCostPerReg.toFixed(2)),
              totalCost: stat.cost,
              registrations: stat.registrations,
            },
            recommendation: `Review campaign targeting and creative to improve efficiency or consider pausing.`,
          });
        }
      });
    }

    // Analyze click-to-registration conversion
    const campaignsWithClicks = Array.from(campaignStats.values())
      .filter((stat) => stat.clicks > 0 && stat.registrations > 0);

    if (campaignsWithClicks.length > 0) {
      const avgConversionRate = campaignsWithClicks.reduce((sum, s) => sum + ((s.registrations / s.clicks) * 100), 0) / campaignsWithClicks.length;

      campaignsWithClicks.forEach((stat) => {
        const conversionRate = (stat.registrations / stat.clicks) * 100;

        // Highlight high conversion campaigns
        if (conversionRate > avgConversionRate * 1.5 && stat.registrations >= 3) {
          insights.push({
            type: 'campaign_performance',
            priority: 'high',
            title: `"${stat.campaign.name}" has ${conversionRate.toFixed(1)}% click-to-registration rate`,
            description: `This is ${Math.round((conversionRate / avgConversionRate - 1) * 100)}% higher than average, indicating strong messaging and targeting.`,
            metrics: {
              campaignName: stat.campaign.name,
              conversionRate: parseFloat(conversionRate.toFixed(1)),
              avgConversionRate: parseFloat(avgConversionRate.toFixed(1)),
              clicks: stat.clicks,
              registrations: stat.registrations,
            },
            recommendation: `Messaging and targeting are resonating well. Use this campaign's approach as a template for others.`,
          });
        }
      });
    }

    return insights;
  }

  /**
   * Analyze channel effectiveness (grouping by medium: email, social, search, etc.)
   */
  analyzeChannelEffectiveness(records: UnifiedRecord[], campaigns: Campaign[]): CampaignInsight[] {
    const insights: CampaignInsight[] = [];

    if (records.length === 0) return insights;

    // Group by channel using campaign channel classification
    const channelStats = new Map<string, {
      registrations: number;
      cost: number;
      clicks: number;
    }>();

    // Build a map of campaign names to channels
    const campaignChannelMap = new Map<string, string>();
    campaigns.forEach(c => {
      campaignChannelMap.set(c.name, c.channel);
    });

    records.forEach((record) => {
      // Get channel from campaign or normalize from UTM source/medium
      let channel: string;

      if (record.campaignName && campaignChannelMap.has(record.campaignName)) {
        channel = campaignChannelMap.get(record.campaignName)!;
      } else {
        channel = this.normalizeChannel(record.utmMedium || record.utmSource || 'direct');
      }

      const existing = channelStats.get(channel) || { registrations: 0, cost: 0, clicks: 0 };
      channelStats.set(channel, {
        ...existing,
        registrations: existing.registrations + 1,
      });
    });

    // Add cost and click data from campaigns
    campaigns.forEach((campaign) => {
      const channel = campaign.channel;
      const existing = channelStats.get(channel);
      if (existing) {
        existing.cost += campaign.spend || 0;
        existing.clicks += campaign.clicks || 0;
      }
    });

    // Compare channels
    const sortedChannels = Array.from(channelStats.entries())
      .sort((a, b) => b[1].registrations - a[1].registrations);

    if (sortedChannels.length >= 2) {
      const topChannel = sortedChannels[0];
      const secondChannel = sortedChannels[1];

      const multiplier = (topChannel[1].registrations / secondChannel[1].registrations).toFixed(1);

      insights.push({
        type: 'channel_effectiveness',
        priority: 'high',
        title: `${this.formatSource(topChannel[0])} outperforms ${this.formatSource(secondChannel[0])} by ${multiplier}x`,
        description: `${this.formatSource(topChannel[0])} generated ${topChannel[1].registrations} registrations compared to ${secondChannel[1].registrations} from ${this.formatSource(secondChannel[0])}.`,
        metrics: {
          topChannel: this.formatSource(topChannel[0]),
          topChannelRegistrations: topChannel[1].registrations,
          secondChannel: this.formatSource(secondChannel[0]),
          secondChannelRegistrations: secondChannel[1].registrations,
          multiplier: parseFloat(multiplier),
        },
        recommendation: `Consider shifting budget from ${this.formatSource(secondChannel[0])} to ${this.formatSource(topChannel[0])} to maximize registrations.`,
      });
    }

    return insights;
  }

  /**
   * Generate all insights for a user
   */
  async generateInsights(
    campaigns: Campaign[],
    records: UnifiedRecord[],
    metrics: CampaignMetric[]
  ): Promise<CampaignInsight[]> {
    const insights: CampaignInsight[] = [];

    // Run all analysis functions
    insights.push(...this.analyzeRegistrationSources(records));
    insights.push(...this.analyzeCampaignPerformance(campaigns, records, metrics));
    insights.push(...this.analyzeChannelEffectiveness(records, campaigns));

    // Sort by priority
    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Normalize channel names for grouping
   */
  private normalizeChannel(medium: string | null): string {
    const normalized = (medium || 'direct').toLowerCase().trim();

    if (normalized.includes('email')) return 'email';
    if (normalized.includes('social') || normalized.includes('facebook') || normalized.includes('linkedin') || normalized.includes('twitter')) return 'social';
    if (normalized.includes('search') || normalized.includes('google') || normalized.includes('bing')) return 'search';
    if (normalized.includes('paid') || normalized.includes('ppc') || normalized.includes('cpc')) return 'paid';
    if (normalized.includes('organic')) return 'organic';

    return normalized;
  }

  /**
   * Format source name for display
   */
  private formatSource(source: string): string {
    // Handle channel enum values
    const channelMapping: Record<string, string> = {
      'linkedin': 'LinkedIn',
      'facebook': 'Facebook',
      'google': 'Google Ads',
      'email': 'Email',
      'organic': 'Organic',
      'other': 'Other',
    };

    if (channelMapping[source.toLowerCase()]) {
      return channelMapping[source.toLowerCase()];
    }

    const formatted = source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();

    // Additional formatting for common sources
    if (formatted === 'Google') return 'Google Ads';
    if (formatted === 'Fb') return 'Facebook';
    if (formatted === 'Direct') return 'Direct Traffic';

    return formatted;
  }
}
