import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Insight {
  id: string;
  category: string;
  priority: number;
  title: string;
  narrative: string;
  supportingData: {
    metric: string;
    value: number | string;
    context?: string;
  }[];
  actionable: boolean;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  generatedAt: string;
}

interface InsightCardProps {
  insight: Insight;
}

/**
 * InsightCard displays a single natural language insight with supporting data
 */
export function InsightCard({ insight }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityIcon = () => {
    switch (insight.severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = () => {
    switch (insight.severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getCategoryBadge = () => {
    const categoryLabels: Record<string, string> = {
      top_performer: 'Top Performer',
      bottleneck: 'Bottleneck',
      trend: 'Trend',
      cross_source: 'Cross-Source',
      quality: 'Quality',
      anomaly: 'Anomaly',
      roi: 'ROI',
      lifecycle: 'Lifecycle',
      optimization: 'Optimization',
      goal_progress: 'Goal Progress'
    };
    return categoryLabels[insight.category] || insight.category;
  };

  return (
    <Card className="dark:bg-card hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start gap-3 flex-1">
          {getSeverityIcon()}
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{insight.title}</CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              {getSeverityBadge()}
              <Badge variant="outline">{getCategoryBadge()}</Badge>
              {insight.actionable && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Actionable</Badge>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.narrative}
        </p>

        {insight.supportingData.length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? 'Hide' : 'Show'} Supporting Data
              <TrendingUp className="ml-1 h-3 w-3" />
            </Button>

            {expanded && (
              <div className="mt-3 grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-md">
                {insight.supportingData.map((data, index) => (
                  <div key={index} className="text-xs">
                    <div className="text-muted-foreground">{data.metric}</div>
                    <div className="font-semibold">
                      {data.value}
                      {data.context && <span className="ml-1 text-muted-foreground">({data.context})</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground">
          Generated {new Date(insight.generatedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
