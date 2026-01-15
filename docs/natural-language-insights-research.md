# Research Report: Natural Language Insight Generation for FunnelSight

## Executive Summary

After comprehensive research, I recommend a **Hybrid Approach** for FunnelSight's natural language insight generation: **Rule-based templates for core insights (80%) with optional LLM enhancement for complex narratives (20%)**. This approach provides deterministic, fast insights for common patterns while allowing sophisticated analysis when needed. The implementation should start with templates (MVP in 1 week) and add LLM capabilities later based on user feedback.

**Key Decision**: Begin with rule-based templates using a prioritization engine, then add Claude Haiku 4.5 API integration for complex insights at $1/1M input tokens.

## Implementation Approach Comparison

### Option A: Rule-Based Template System ✅ **Recommended for MVP**

**Advantages:**
- **Zero API costs** - No recurring expenses
- **Sub-100ms latency** - Instant insights
- **100% deterministic** - Predictable outputs
- **No external dependencies** - Works offline
- **GDPR compliant** - Data never leaves server
- **Easy debugging** - Clear logic flow

**Disadvantages:**
- Limited to predefined patterns
- Requires manual template creation
- Less natural phrasing variation
- Cannot handle novel insights

**Implementation Effort:** 3-5 days

### Option B: LLM API Integration

**Advantages:**
- Natural, varied phrasing
- Handles complex patterns
- Contextual understanding
- Adapts to any data shape
- Can explain correlations

**Disadvantages:**
- **API costs:** ~$0.50-2.00/month per user
- **Latency:** 500ms-2s per insight
- **External dependency risk**
- **Data privacy concerns**
- **Non-deterministic outputs**

**Implementation Effort:** 5-7 days

### Option C: Hybrid Approach 🎯 **Recommended Long-term**

**Strategy:**
1. Use templates for 80% of common insights (instant, free)
2. Trigger LLM for complex patterns or user request
3. Cache LLM responses for 24 hours
4. Fall back to templates if API fails

**Cost Model:**
- Templates: $0
- LLM (20% of insights): ~$0.10/month per user
- Total: <$0.15/month per user with caching

**Implementation Effort:** Start with templates (3 days), add LLM later (2 days)

## Insight Categories & Templates

### 1. Top Performer Template
```typescript
interface TopPerformerInsight {
  template: (data: {
    channel: string;
    percentage: number;
    count: number;
    trend: 'up' | 'down' | 'stable';
    changePercent: number;
  }) => string;
}

const topPerformerTemplate: TopPerformerInsight = {
  template: ({channel, percentage, count, trend, changePercent}) => {
    const trendPhrase = trend === 'up'
      ? `up ${changePercent}% from last period`
      : trend === 'down'
      ? `down ${changePercent}% from last period`
      : 'holding steady';

    return `${channel} dominated this period, driving ${percentage}% of all registrations (${count.toLocaleString()} total), ${trendPhrase}. Consider reallocating budget to maximize this channel's momentum.`;
  }
};

// Output: "LinkedIn Ads dominated this period, driving 62% of all registrations (1,247 total), up 18% from last period. Consider reallocating budget to maximize this channel's momentum."
```

### 2. Conversion Bottleneck Template
```typescript
const bottleneckTemplate = {
  template: ({stage, dropOffRate, lostCount, suggestion}) =>
    `⚠️ Critical bottleneck detected: ${dropOffRate}% of users abandon at ${stage} (${lostCount.toLocaleString()} lost conversions). ${suggestion}`
};

// Output: "⚠️ Critical bottleneck detected: 73% of users abandon at Registration Form (2,431 lost conversions). Consider simplifying the form or adding social login options."
```

### 3. Temporal Trend Template
```typescript
const trendTemplate = {
  template: ({metric, direction, magnitude, period, context}) =>
    `${metric} ${direction} ${magnitude}% ${period}. ${context}`
};

// Output: "Registrations increased 156% in the 3 weeks before the event. Email campaigns launched 21 days out drove this surge."
```

### 4. Cross-Source Discrepancy Template
```typescript
const discrepancyTemplate = {
  template: ({source1, value1, source2, value2, difference, implication}) =>
    `⚠️ Data mismatch: ${source1} shows ${value1}, but ${source2} reports ${value2} (${difference}% gap). ${implication}`
};

// Output: "⚠️ Data mismatch: GA4 shows 3,200 sessions, but Spreadsheet reports 1,800 clicks (44% gap). Check UTM tracking or potential bot traffic."
```

### 5. ROI Efficiency Template
```typescript
const roiTemplate = {
  template: ({channel, costPerConversion, benchmark, performance}) => {
    const comparison = costPerConversion < benchmark ? 'below' : 'above';
    const emoji = costPerConversion < benchmark ? '✅' : '⚠️';

    return `${emoji} ${channel} cost per registration: $${costPerConversion.toFixed(2)}, ${Math.abs(((costPerConversion/benchmark - 1) * 100)).toFixed(0)}% ${comparison} benchmark. ${performance}`;
  }
};

// Output: "✅ Email cost per registration: $2.34, 67% below benchmark. Top efficiency performer this period."
```

### 6. Attendance Quality Template
```typescript
const qualityTemplate = {
  template: ({channel, attendanceRate, avgRate, quality}) => {
    const comparison = attendanceRate > avgRate ? 'higher' : 'lower';
    return `${channel} registrants show ${attendanceRate}% attendance rate (${comparison} than ${avgRate}% average), indicating ${quality} lead quality.`;
  }
};

// Output: "Email registrants show 78% attendance rate (higher than 65% average), indicating superior lead quality."
```

### 7. Anomaly Detection Template
```typescript
const anomalyTemplate = {
  template: ({metric, actual, expected, deviation, possibleCause}) =>
    `🔍 Unusual pattern: ${metric} at ${actual} (expected ~${expected}, ${deviation}% deviation). Possible cause: ${possibleCause}`
};

// Output: "🔍 Unusual pattern: Twitter conversions at 12 (expected ~85, -86% deviation). Possible cause: Recent algorithm changes affecting organic reach."
```

### 8. Campaign Lifecycle Template
```typescript
const lifecycleTemplate = {
  template: ({phase, daysToEvent, activity, result}) =>
    `${phase} phase (${Math.abs(daysToEvent)} days ${daysToEvent < 0 ? 'before' : 'after'} event): ${activity}, resulting in ${result}.`
};

// Output: "Ramp-up phase (21 days before event): Email frequency doubled, resulting in 3x registration velocity."
```

### 9. Channel Mix Optimization Template
```typescript
const channelMixTemplate = {
  template: ({topChannels, recommendation}) => {
    const channelList = topChannels.map(ch => `${ch.name} (${ch.percentage}%)`).join(', ');
    return `Current channel mix: ${channelList}. ${recommendation}`;
  }
};

// Output: "Current channel mix: Paid Social (45%), Email (30%), Organic (25%). Recommend testing 60/25/15 split based on conversion rates."
```

### 10. Goal Progress Template
```typescript
const goalProgressTemplate = {
  template: ({current, target, percentage, daysLeft, projection}) => {
    const onTrack = percentage >= (100 - (daysLeft / 30) * 100);
    const emoji = onTrack ? '✅' : '⚠️';
    return `${emoji} Registration goal: ${current.toLocaleString()}/${target.toLocaleString()} (${percentage}%). ${projection}`;
  }
};

// Output: "⚠️ Registration goal: 423/1,000 (42%). At current rate, expect 67% of target. Increase marketing spend by 40% to reach goal."
```

## Temporal Comparison Patterns

### Time Window Definitions
```typescript
interface TimeComparison {
  current: DateRange;
  previous: DateRange;
  type: 'week_over_week' | 'month_over_month' | 'pre_event' | 'year_over_year';
  minDataPoints: number; // Minimum required for valid comparison
}

const timeComparisons = {
  weekOverWeek: {
    minDataPoints: 7,
    template: (current, previous, change) =>
      `This week: ${current}, Last week: ${previous} (${change > 0 ? '+' : ''}${change}%)`
  },

  monthOverMonth: {
    minDataPoints: 15,
    template: (current, previous, change) =>
      `This month: ${current}, Last month: ${previous} (${change > 0 ? '📈' : '📉'} ${Math.abs(change)}%)`
  },

  preEventWindow: {
    minDataPoints: 14,
    template: (metric, value, daysBeforeEvent) =>
      `${metric} peaked ${daysBeforeEvent} days before event at ${value}, suggesting optimal campaign timing`
  }
};
```

### Handling Insufficient Data
```typescript
const insufficientDataTemplate = {
  template: (required, available) =>
    `Need at least ${required} days of data for this comparison (currently have ${available}). Check back after more data is collected.`
};
```

## Prompt Engineering (If LLM Approach)

### Recommended Prompt Structure
```typescript
const ANALYTICS_INSIGHT_PROMPT = `
You are a marketing analytics expert generating insights for event marketers.

CONTEXT:
- Event: {eventName}
- Date: {eventDate}
- Current Period: {dateRange}

METRICS:
{metricsJson}

INSTRUCTIONS:
1. Generate exactly 3 insights
2. Use ONLY numbers from provided metrics (no estimates)
3. Each insight must be actionable
4. Format: [Category]: [Specific insight with numbers]
5. Categories: Performance, Bottleneck, Trend, Optimization, or Quality
6. Max 2 sentences per insight
7. Professional tone for executives

RULES:
- Never invent numbers not in the data
- If data is insufficient, say "Insufficient data for [analysis type]"
- Focus on biggest impact areas first
- Include specific percentages and counts
- Suggest one concrete action per insight

OUTPUT FORMAT:
1. [Category]: [Insight]
   Action: [Specific recommendation]

2. [Category]: [Insight]
   Action: [Specific recommendation]

3. [Category]: [Insight]
   Action: [Specific recommendation]
`;
```

### Token Usage Estimates
- Input: ~500 tokens (prompt + data)
- Output: ~200 tokens (3 insights)
- Cost per generation: ~$0.0008 (Claude Haiku 4.5)
- Monthly cost (100 generations): ~$0.08

### Structured Output Schema
```typescript
interface LLMInsightResponse {
  insights: Array<{
    category: 'Performance' | 'Bottleneck' | 'Trend' | 'Optimization' | 'Quality';
    narrative: string;
    action: string;
    confidence: number; // 0-1, based on data completeness
    metrics: string[]; // Which metrics were used
  }>;
  metadata: {
    generatedAt: string;
    tokensUsed: number;
    modelVersion: string;
  };
}
```

## UI Integration Design

### 1. Dashboard Integration (Primary)
```typescript
// Position: Above chart grid
interface InsightCardProps {
  insight: {
    id: string;
    category: string;
    priority: 1 | 2 | 3;
    narrative: string;
    icon: IconType;
    color: 'blue' | 'amber' | 'green' | 'red';
    expandedDetails?: string;
    relatedChartId?: string;
  };
  onExpand: () => void;
  onDismiss: () => void;
}

// Component Structure
<div className="insights-section">
  <h2>Key Insights</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {topInsights.map(insight => (
      <InsightCard key={insight.id} {...insight} />
    ))}
  </div>
  <Button variant="ghost" onClick={showAllInsights}>
    View All Insights ({totalCount})
  </Button>
</div>
```

### 2. Dedicated Insights Page
```typescript
// Route: /insights
interface InsightsPageFilters {
  category: string[];
  dateRange: DateRange;
  dataSource: 'all' | 'spreadsheet' | 'ga4';
  priority: 'high' | 'medium' | 'low' | 'all';
}

// Features:
// - Full list with pagination
// - Export to PDF/CSV
// - Historical comparison
// - Insight search
// - Save/bookmark insights
```

### 3. Chart Annotations
```typescript
interface ChartAnnotation {
  chartId: string;
  position: 'top' | 'bottom' | 'overlay';
  insight: string;
  severity: 'info' | 'warning' | 'success';
}

// Example on Funnel Chart:
<FunnelChart>
  {showAnnotations && (
    <Annotation position="Registration">
      ⚠️ 73% drop-off - Simplify form fields
    </Annotation>
  )}
</FunnelChart>
```

### 4. Progressive Disclosure Pattern
```typescript
// Start with summary, expand for details
const InsightProgression = {
  summary: "LinkedIn drove 62% of registrations",
  expanded: "LinkedIn Ads drove 62% of registrations (1,247 total), up 18% from last week",
  full: "LinkedIn Ads drove 62% of registrations (1,247 total), up 18% from last week. CTR improved to 2.3% after creative refresh on Tuesday. Cost per registration: $4.50 (23% below target)."
};
```

## Data Source Attribution

### Phrasing Guidelines
```typescript
const sourceAttributionPhrases = {
  spreadsheetOnly: {
    prefix: "Based on your campaign data",
    suffix: "Upload GA4 data for deeper insights",
    example: "Based on your campaign data, Email drove 45% of registrations."
  },

  ga4Only: {
    prefix: "Google Analytics shows",
    suffix: "Upload campaign spreadsheet for cost analysis",
    example: "Google Analytics shows 3,400 sessions from Social Media."
  },

  combined: {
    prefix: "Cross-platform analysis reveals",
    suffix: "Data sources aligned",
    example: "Cross-platform analysis reveals Email's true ROI at 4.2x."
  },

  discrepancy: {
    prefix: "⚠️ Data inconsistency detected",
    suffix: "Review tracking setup",
    example: "⚠️ Data inconsistency detected: GA4 sessions 50% higher than reported clicks."
  }
};

// Usage
function getAttributionPhrase(sources: DataSource[]): string {
  if (sources.length === 1) {
    return sourceAttributionPhrases[sources[0].type].prefix;
  }

  const hasDiscrepancy = detectDiscrepancy(sources);
  return hasDiscrepancy
    ? sourceAttributionPhrases.discrepancy.prefix
    : sourceAttributionPhrases.combined.prefix;
}
```

## Refresh Strategy

### Recommended Approach: Smart Caching with Event-Driven Updates

```typescript
interface RefreshStrategy {
  cacheDuration: number; // milliseconds
  triggers: RefreshTrigger[];
  priority: 'immediate' | 'background' | 'scheduled';
}

const insightRefreshStrategy: RefreshStrategy = {
  cacheuration: 3600000, // 1 hour
  triggers: [
    { event: 'data_upload', priority: 'immediate' },
    { event: 'ga4_sync', priority: 'background' },
    { event: 'dashboard_view', priority: 'cached', after: 3600000 },
    { event: 'manual_refresh', priority: 'immediate' }
  ],
  priority: 'background'
};

// Implementation
class InsightCache {
  private cache: Map<string, CachedInsight> = new Map();

  async getInsights(filters: InsightFilters): Promise<Insight[]> {
    const cacheKey = this.getCacheKey(filters);
    const cached = this.cache.get(cacheKey);

    if (cached && !this.isStale(cached)) {
      return cached.insights;
    }

    // Generate new insights
    const insights = await this.generateInsights(filters);

    // Cache with TTL
    this.cache.set(cacheKey, {
      insights,
      timestamp: Date.now(),
      ttl: 3600000 // 1 hour
    });

    return insights;
  }

  invalidate(trigger: RefreshTrigger): void {
    if (trigger.priority === 'immediate') {
      this.cache.clear();
    }
  }
}
```

### Background Processing Queue
```typescript
// Process intensive insights in background
class InsightQueue {
  private queue: InsightJob[] = [];

  async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const job = this.queue.shift();

      // Process based on priority
      if (job.priority === 'high') {
        await this.processImmediate(job);
      } else {
        await this.processBackground(job);
      }
    }
  }
}
```

## Performance Optimization

### 1. Template Engine Optimization
```typescript
// Pre-compile templates for performance
class TemplateEngine {
  private compiledTemplates: Map<string, CompiledTemplate> = new Map();

  constructor() {
    // Pre-compile all templates on startup
    this.compileTemplates();
  }

  private compileTemplates(): void {
    templates.forEach(template => {
      this.compiledTemplates.set(
        template.id,
        this.compile(template.template)
      );
    });
  }

  generate(templateId: string, data: any): string {
    const compiled = this.compiledTemplates.get(templateId);
    return compiled(data); // <50ms execution
  }
}
```

### 2. Batch Processing for LLM
```typescript
// Batch multiple insight requests to reduce API calls
class LLMBatchProcessor {
  private batchQueue: InsightRequest[] = [];
  private batchTimeout: NodeJS.Timeout;

  async queueRequest(request: InsightRequest): Promise<Insight> {
    this.batchQueue.push(request);

    // Debounce: wait 100ms for more requests
    clearTimeout(this.batchTimeout);
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, 100);

    return request.promise;
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, 10); // Max 10 per batch
    const batchPrompt = this.createBatchPrompt(batch);

    const response = await this.llmClient.generate(batchPrompt);
    const insights = this.parseBatchResponse(response);

    // Resolve individual promises
    batch.forEach((req, i) => {
      req.resolve(insights[i]);
    });
  }
}
```

### 3. Database Indexing
```sql
-- Optimize for insight queries
CREATE INDEX idx_insights_user_date ON insights(user_id, created_at DESC);
CREATE INDEX idx_insights_category ON insights(category);
CREATE INDEX idx_insights_priority ON insights(priority);

-- Materialized view for common aggregations
CREATE MATERIALIZED VIEW mv_channel_performance AS
SELECT
  channel,
  DATE_TRUNC('day', event_date) as day,
  COUNT(*) as total_events,
  SUM(CASE WHEN event_type = 'registration' THEN 1 ELSE 0 END) as registrations,
  AVG(conversion_rate) as avg_conversion
FROM events
GROUP BY channel, DATE_TRUNC('day', event_date)
WITH DATA;

-- Refresh every hour
CREATE OR REPLACE FUNCTION refresh_mv_channel_performance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_channel_performance;
END;
$$ LANGUAGE plpgsql;
```

### 4. Client-Side Caching
```typescript
// Use React Query for intelligent caching
const useInsights = (filters: InsightFilters) => {
  return useQuery({
    queryKey: ['insights', filters],
    queryFn: () => fetchInsights(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false
  });
};
```

## Implementation Roadmap

### Phase 1: MVP with Templates (Week 1)
```typescript
// Day 1-2: Core Template Engine
- [ ] Create TemplateEngine class
- [ ] Implement 10 core templates
- [ ] Add prioritization logic
- [ ] Create insight interfaces

// Day 3-4: Integration
- [ ] Add /api/insights endpoint
- [ ] Integrate with existing analytics service
- [ ] Create InsightCard component
- [ ] Add to dashboard

// Day 5: Testing & Polish
- [ ] Unit tests for templates
- [ ] E2E test for insight generation
- [ ] Performance optimization
- [ ] Documentation
```

### Phase 2: Enhanced UI (Week 2)
```typescript
// Day 6-7: Insights Page
- [ ] Create dedicated /insights route
- [ ] Add filtering/sorting
- [ ] Implement pagination
- [ ] Add export functionality

// Day 8-9: Chart Integration
- [ ] Add annotations to charts
- [ ] Create insight tooltips
- [ ] Link insights to visualizations
- [ ] Add dismissible alerts
```

### Phase 3: LLM Integration (Week 3)
```typescript
// Day 10-11: LLM Setup
- [ ] Add Claude Haiku 4.5 integration
- [ ] Create prompt templates
- [ ] Implement token optimization
- [ ] Add response validation

// Day 12-13: Hybrid System
- [ ] Create insight router (template vs LLM)
- [ ] Add fallback mechanisms
- [ ] Implement caching layer
- [ ] Add cost tracking

// Day 14: Production Readiness
- [ ] Add rate limiting
- [ ] Implement error handling
- [ ] Add monitoring/logging
- [ ] Performance testing
```

## Code Examples

### 1. Template Engine Implementation
```typescript
// services/insightEngine.ts
import { AnalyticsData, Insight, InsightPriority } from '../types';

export class InsightEngine {
  private templates: Map<string, InsightTemplate>;

  constructor() {
    this.templates = new Map();
    this.registerTemplates();
  }

  private registerTemplates(): void {
    // Register all templates
    this.templates.set('top_performer', {
      id: 'top_performer',
      priority: 9,
      condition: (data) => {
        const top = this.getTopChannel(data);
        return top && top.percentage > 40;
      },
      generate: (data) => {
        const top = this.getTopChannel(data);
        const trend = this.calculateTrend(top, data);

        return {
          category: 'performance',
          narrative: `${top.name} drove ${top.percentage}% of registrations (${top.count.toLocaleString()} total), ${trend}.`,
          action: top.percentage > 60
            ? `Maximize ${top.name} budget allocation`
            : `Test scaling ${top.name} further`,
          priority: this.calculatePriority(top),
          icon: 'TrendingUp',
          color: 'green'
        };
      }
    });

    // Add more templates...
  }

  async generateInsights(data: AnalyticsData): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Check each template's condition
    for (const [id, template] of this.templates) {
      if (template.condition(data)) {
        const insight = template.generate(data);
        insights.push({
          id: `${id}_${Date.now()}`,
          ...insight,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Sort by priority
    return insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10); // Top 10 insights
  }

  private getTopChannel(data: AnalyticsData) {
    return data.channels
      .sort((a, b) => b.conversions - a.conversions)[0];
  }

  private calculateTrend(channel: Channel, data: AnalyticsData): string {
    const previous = data.previousPeriod?.channels.find(c => c.name === channel.name);
    if (!previous) return 'new this period';

    const change = ((channel.conversions - previous.conversions) / previous.conversions) * 100;

    if (Math.abs(change) < 5) return 'holding steady';
    return change > 0
      ? `up ${change.toFixed(0)}% from last period`
      : `down ${Math.abs(change).toFixed(0)}% from last period`;
  }

  private calculatePriority(channel: Channel): InsightPriority {
    if (channel.percentage > 60) return 'high';
    if (channel.percentage > 40) return 'medium';
    return 'low';
  }
}
```

### 2. API Endpoint
```typescript
// server/routes/insights.ts
import { Router } from 'express';
import { InsightEngine } from '../services/insightEngine';
import { AnalyticsService } from '../services/analyticsService';
import { cache } from '../lib/cache';

const router = Router();
const insightEngine = new InsightEngine();

router.get('/api/insights', async (req, res) => {
  try {
    const { dateRange, dataSource, refresh } = req.query;

    // Check cache unless refresh requested
    const cacheKey = `insights:${dateRange}:${dataSource}`;
    if (!refresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    // Fetch analytics data
    const analyticsData = await AnalyticsService.getData({
      dateRange,
      dataSource
    });

    // Generate insights
    const insights = await insightEngine.generateInsights(analyticsData);

    // Cache for 1 hour
    await cache.set(cacheKey, insights, 3600);

    res.json({
      insights,
      meta: {
        generatedAt: new Date().toISOString(),
        dataSource,
        dateRange,
        count: insights.length
      }
    });
  } catch (error) {
    console.error('Insight generation error:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      fallback: 'Check your data and try again'
    });
  }
});

export default router;
```

### 3. React Component
```tsx
// client/src/components/InsightCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';

interface InsightCardProps {
  insight: {
    id: string;
    category: string;
    narrative: string;
    action?: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    color: 'green' | 'amber' | 'blue' | 'red';
    expandedDetails?: string;
  };
  onDismiss?: () => void;
  onAction?: () => void;
}

const iconMap = {
  TrendingUp,
  AlertTriangle,
  Target,
  Zap
};

const colorMap = {
  green: 'border-green-500 bg-green-50',
  amber: 'border-amber-500 bg-amber-50',
  blue: 'border-blue-500 bg-blue-50',
  red: 'border-red-500 bg-red-50'
};

export function InsightCard({ insight, onDismiss, onAction }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[insight.icon] || TrendingUp;

  return (
    <Card className={`border-l-4 ${colorMap[insight.color]} transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-sm font-medium">
              {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
            </CardTitle>
          </div>
          {insight.priority === 'high' && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
              High Priority
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-sm text-gray-700 mb-3">
          {insight.narrative}
        </CardDescription>

        {expanded && insight.expandedDetails && (
          <div className="mt-3 p-3 bg-white rounded-md border">
            <p className="text-sm text-gray-600">{insight.expandedDetails}</p>
          </div>
        )}

        {insight.action && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <p className="text-xs font-medium text-blue-700">Recommended Action:</p>
            <p className="text-sm text-blue-600 mt-1">{insight.action}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {insight.expandedDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs"
              >
                {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {expanded ? 'Less' : 'More'}
              </Button>
            )}

            {onAction && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAction}
                className="text-xs"
              >
                Take Action
              </Button>
            )}
          </div>

          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-xs text-gray-400"
            >
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. LLM Integration (Phase 3)
```typescript
// services/llmInsightService.ts
import Anthropic from '@anthropic-ai/sdk';

export class LLMInsightService {
  private client: Anthropic;
  private model = 'claude-3-haiku-20240307';

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateComplexInsights(data: AnalyticsData): Promise<Insight[]> {
    try {
      const prompt = this.buildPrompt(data);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.3, // Lower for more deterministic output
        system: "You are a marketing analytics expert. Generate actionable insights from data.",
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return this.parseResponse(response.content[0].text);
    } catch (error) {
      console.error('LLM generation failed:', error);
      // Fall back to templates
      return [];
    }
  }

  private buildPrompt(data: AnalyticsData): string {
    return `
      Analyze this marketing funnel data and provide 3 actionable insights:

      ${JSON.stringify(data, null, 2)}

      Format each insight as:
      [Category]: [Specific finding with exact numbers]
      Action: [Concrete recommendation]

      Categories: Performance, Bottleneck, Trend, Quality, Optimization

      Focus on the most impactful findings. Use exact numbers from the data.
    `;
  }

  private parseResponse(text: string): Insight[] {
    // Parse LLM response into structured insights
    const insights: Insight[] = [];
    const blocks = text.split('\n\n');

    blocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      if (lines.length >= 2) {
        const [categoryLine, actionLine] = lines;
        const category = categoryLine.split(':')[0].toLowerCase();
        const narrative = categoryLine.split(':').slice(1).join(':').trim();
        const action = actionLine.replace('Action:', '').trim();

        insights.push({
          id: `llm_${Date.now()}_${index}`,
          category,
          narrative,
          action,
          priority: 'medium',
          icon: 'Zap',
          color: 'blue',
          source: 'ai',
          timestamp: new Date().toISOString()
        });
      }
    });

    return insights;
  }
}
```

## Risk Assessment

### High Risk Areas

1. **LLM Hallucination**
   - **Risk**: AI inventing metrics not in data
   - **Mitigation**: Strict validation, use structured outputs, low temperature
   - **Fallback**: Always have template-based insights ready

2. **API Dependency**
   - **Risk**: External service downtime affects insights
   - **Mitigation**: Implement circuit breaker, cache aggressively
   - **Fallback**: Template system works offline

3. **Cost Overruns**
   - **Risk**: Unexpected LLM API costs
   - **Mitigation**: Set monthly limits, use cheaper models (Haiku), batch requests
   - **Monitoring**: Track token usage per user

### Medium Risk Areas

1. **Performance Degradation**
   - **Risk**: Slow insight generation affects UX
   - **Mitigation**: Background processing, progressive loading
   - **Target**: <500ms for templates, <2s for LLM

2. **Data Quality**
   - **Risk**: Bad data produces misleading insights
   - **Mitigation**: Data validation, anomaly detection
   - **User Feedback**: Allow insight reporting

3. **Template Maintenance**
   - **Risk**: Templates become outdated
   - **Mitigation**: Version templates, A/B test effectiveness
   - **Review Cycle**: Monthly template performance review

### Low Risk Areas

1. **Browser Compatibility**
   - **Risk**: Insights don't render properly
   - **Mitigation**: Use standard React components
   - **Testing**: Cross-browser testing suite

2. **Internationalization**
   - **Risk**: Insights only work in English
   - **Mitigation**: Prepare i18n structure early
   - **Future**: Template translations

## References

### Documentation & Resources

1. **LLM APIs**
   - [OpenAI GPT-4o Pricing](https://openai.com/api/pricing/) - $2.50/1M input, $10/1M output
   - [Anthropic Claude Pricing](https://www.anthropic.com/pricing) - Haiku 4.5: $1/1M input, $5/1M output
   - [Google Gemini API](https://ai.google.dev/pricing) - Free tier available

2. **Analytics Best Practices**
   - [Marketing Funnel Analysis](https://amplitude.com/templates/funnel-analysis-dashboard)
   - [Conversion Optimization Patterns](https://www.optimizely.com/optimization-glossary/conversion-funnel/)
   - [Data Storytelling](https://www.nugit.co/data-storytelling-guide/)

3. **Template Engines**
   - [Handlebars.js](https://handlebarsjs.com/) - For complex templates
   - [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) - TypeScript native

4. **Performance Optimization**
   - [React Query](https://tanstack.com/query/latest) - Client-side caching
   - [Redis](https://redis.io/docs/manual/client-side-caching/) - Server-side caching
   - [Database Indexing](https://www.postgresql.org/docs/current/indexes.html)

5. **Example Implementations**
   - [Amplitude Insights](https://amplitude.com/blog/automated-insights)
   - [Google Analytics Intelligence](https://support.google.com/analytics/answer/7411314)
   - [Mixpanel Insights](https://mixpanel.com/blog/introducing-insights/)

### Code Repositories
- [Natural Language Generation Toolkit](https://github.com/simplenlg/simplenlg)
- [Analytics Narrative Examples](https://github.com/topics/data-storytelling)
- [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide)

### Research Papers
- "Evaluating LLMs for Analytics Tasks" (2024)
- "Template vs Neural Approaches to NLG" (2023)
- "Optimizing Token Usage in Production LLM Systems" (2024)

## Conclusion

The hybrid approach offers the best balance of cost, performance, and capability for FunnelSight. Start with rule-based templates to deliver immediate value, then selectively add LLM capabilities for complex insights. This strategy minimizes risk while providing a clear upgrade path.

**Immediate Next Steps for Implementation:**
1. Implement the core TemplateEngine with 10 templates
2. Add InsightCard components to the dashboard
3. Create /api/insights endpoint
4. Deploy MVP and gather user feedback
5. Based on feedback, add LLM enhancement where templates fall short

This approach ensures FunnelSight can generate meaningful insights from day one while maintaining flexibility for future enhancements.