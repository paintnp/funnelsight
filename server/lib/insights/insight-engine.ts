import { Campaign } from '../../../shared/schema.zod.js';
import Anthropic from '@anthropic-ai/sdk';

export interface Insight {
  id: string;
  category: 'top_performer' | 'bottleneck' | 'trend' | 'cross_source' | 'quality' | 'anomaly' | 'roi' | 'lifecycle' | 'optimization' | 'goal_progress';
  priority: number; // 1-10, higher = more important
  title: string;
  narrative: string;
  supportingData: {
    metric: string;
    value: number | string;
    context?: string;
  }[];
  actionable: boolean;
  severity: 'info' | 'warning' | 'critical';
  source: 'spreadsheet' | 'ga4' | 'cross_source' | 'system';
  generatedAt: string;
}

export interface AnalyticsData {
  campaigns: Campaign[];
  totalClicks: number;
  totalRegistrations: number;
  totalAttendees: number;
  conversionRate: number;
  attendanceRate: number;
  channelBreakdown: {
    channel: string;
    clicks: number;
    registrations: number;
    attendees: number;
    qualityScore: number;
  }[];
  topChannel: {
    name: string;
    percentage: number;
    count: number;
    qualityScore: number;
  };
}

interface InsightTemplate {
  id: string;
  category: Insight['category'];
  priority: number;
  condition: (data: AnalyticsData) => boolean;
  generate: (data: AnalyticsData) => Insight;
}

/**
 * InsightEngine generates natural language insights from analytics data
 * using Claude AI for contextual analysis.
 */
export class InsightEngine {
  private anthropic: Anthropic | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.warn('[InsightEngine] ANTHROPIC_API_KEY not found. AI insights will use fallback generation.');
      this.isInitialized = false;
      return;
    }

    try {
      this.anthropic = new Anthropic({
        apiKey: apiKey
      });
      this.isInitialized = true;
      console.info('[InsightEngine] Anthropic client initialized successfully');
    } catch (error) {
      console.error('[InsightEngine] Failed to initialize Anthropic client:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Generate insights from analytics data using Claude AI
   */
  async generateInsights(data: AnalyticsData): Promise<Insight[]> {
    // If API key not configured, use fallback insights
    if (!this.isInitialized || !this.anthropic) {
      return this.generateFallbackInsights(data);
    }

    try {
      const prompt = this.buildPrompt(data);

      const startTime = Date.now();
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseTime = Date.now() - startTime;
      console.info(`[InsightEngine] Claude response received in ${responseTime}ms`);

      // Parse the AI response into structured insights
      const insights = this.parseAIResponse(message.content[0].type === 'text' ? message.content[0].text : '', data);

      return insights;
    } catch (error) {
      console.error('[InsightEngine] Error generating AI insights:', error);
      // Fallback to basic insights if AI fails
      return this.generateFallbackInsights(data);
    }
  }

  private buildPrompt(data: AnalyticsData): string {
    const clickToRegRate = data.totalClicks > 0 ? (data.totalRegistrations / data.totalClicks) * 100 : 0;
    const regToAttendRate = data.totalRegistrations > 0 ? (data.totalAttendees / data.totalRegistrations) * 100 : 0;

    // Build channel performance summary
    const channelSummary = data.channelBreakdown
      .map(ch => `${ch.channel}: ${ch.registrations} registrations, ${ch.attendees} attendees, ${ch.qualityScore.toFixed(1)}% quality`)
      .join('\n');

    return `You are a marketing analytics expert. Analyze this campaign data and provide 3-5 actionable insights.

Campaign Performance Data:
- Total Clicks: ${data.totalClicks}
- Total Registrations: ${data.totalRegistrations}
- Total Attendees: ${data.totalAttendees}
- Click-to-Registration Rate: ${clickToRegRate.toFixed(1)}%
- Registration-to-Attendance Rate: ${regToAttendRate.toFixed(1)}%

Channel Breakdown:
${channelSummary}

Top Performing Channel: ${data.topChannel.name} (${data.topChannel.percentage.toFixed(1)}% of registrations)

Generate 3-5 insights in the following JSON format. Each insight should be specific, actionable, and data-driven:

[
  {
    "category": "top_performer|bottleneck|quality|optimization",
    "priority": 1-10,
    "title": "Brief descriptive title",
    "narrative": "2-3 sentences explaining the insight with specific data points and recommendations",
    "metrics": [
      {"metric": "Metric Name", "value": "Value", "context": "Optional context"}
    ],
    "actionable": true|false,
    "severity": "info|warning|critical"
  }
]

Focus on:
1. Performance patterns and anomalies
2. Channel effectiveness comparisons
3. Conversion funnel bottlenecks
4. Actionable optimization opportunities
5. Quality metrics and attendance patterns

Return ONLY the JSON array, no additional text.`;
  }

  private parseAIResponse(response: string, data: AnalyticsData): Insight[] {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('[InsightEngine] No JSON found in AI response');
        return this.generateFallbackInsights(data);
      }

      const aiInsights = JSON.parse(jsonMatch[0]);

      // Convert AI response to Insight format
      return aiInsights.map((ai: any, index: number) => ({
        id: `ai_insight_${Date.now()}_${index}`,
        category: ai.category || 'optimization',
        priority: ai.priority || 5,
        title: ai.title || 'Campaign Insight',
        narrative: ai.narrative || '',
        supportingData: ai.metrics || [],
        actionable: ai.actionable !== false,
        severity: ai.severity || 'info',
        source: 'system' as const,
        generatedAt: new Date().toISOString()
      })).slice(0, 5); // Return top 5 insights

    } catch (error) {
      console.error('[InsightEngine] Error parsing AI response:', error);
      return this.generateFallbackInsights(data);
    }
  }

  /**
   * Generate basic insights when AI is unavailable
   */
  private generateFallbackInsights(data: AnalyticsData): Insight[] {
    const insights: Insight[] = [];
    const clickToRegRate = data.totalClicks > 0 ? (data.totalRegistrations / data.totalClicks) * 100 : 0;
    const attendanceRate = data.totalRegistrations > 0 ? (data.totalAttendees / data.totalRegistrations) * 100 : 0;

    // Top channel insight
    if (data.topChannel && data.topChannel.percentage > 30) {
      insights.push({
        id: `fallback_top_${Date.now()}`,
        category: 'top_performer',
        priority: 8,
        title: `${data.topChannel.name} Leads Performance`,
        narrative: `${data.topChannel.name} drives ${data.topChannel.percentage.toFixed(1)}% of registrations with ${data.topChannel.count} conversions. This channel shows strong performance.`,
        supportingData: [
          { metric: 'Channel', value: data.topChannel.name },
          { metric: 'Share', value: `${data.topChannel.percentage.toFixed(1)}%` },
          { metric: 'Registrations', value: data.topChannel.count }
        ],
        actionable: true,
        severity: 'info',
        source: 'system',
        generatedAt: new Date().toISOString()
      });
    }

    // Conversion rate insight
    if (clickToRegRate < 25 && data.totalClicks > 50) {
      insights.push({
        id: `fallback_conversion_${Date.now()}`,
        category: 'bottleneck',
        priority: 9,
        title: 'Low Conversion Rate Detected',
        narrative: `Only ${clickToRegRate.toFixed(1)}% of clicks convert to registrations. Review landing page and form optimization.`,
        supportingData: [
          { metric: 'Conversion Rate', value: `${clickToRegRate.toFixed(1)}%` },
          { metric: 'Total Clicks', value: data.totalClicks },
          { metric: 'Registrations', value: data.totalRegistrations }
        ],
        actionable: true,
        severity: 'warning',
        source: 'system',
        generatedAt: new Date().toISOString()
      });
    }

    // Attendance rate insight
    if (attendanceRate < 60 && data.totalRegistrations > 10) {
      insights.push({
        id: `fallback_attendance_${Date.now()}`,
        category: 'quality',
        priority: 7,
        title: 'Attendance Rate Below Target',
        narrative: `${attendanceRate.toFixed(1)}% attendance rate indicates engagement issues. Consider improving reminder sequences.`,
        supportingData: [
          { metric: 'Attendance Rate', value: `${attendanceRate.toFixed(1)}%` },
          { metric: 'Attendees', value: data.totalAttendees },
          { metric: 'Registrations', value: data.totalRegistrations }
        ],
        actionable: true,
        severity: 'warning',
        source: 'system',
        generatedAt: new Date().toISOString()
      });
    }

    return insights.sort((a, b) => b.priority - a.priority);
  }
}
