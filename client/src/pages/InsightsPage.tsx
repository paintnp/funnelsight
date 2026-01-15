import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Lightbulb, CheckCircle, AlertCircle, TrendingUp, Target } from 'lucide-react';

export default function InsightsPage() {
  const queryClient = useQueryClient();

  // Fetch database insights (existing)
  const { data: dbInsights, isLoading: isLoadingDbInsights } = useQuery({
    queryKey: ['insights'],
    queryFn: () => apiClient.insights.getInsights({ query: {} }),
  });

  // Fetch campaign analysis insights (new)
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['analytics-insights'],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(`${apiUrl}/api/analytics/insights`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => apiClient.insights.acknowledgeInsight({ params: { id: String(id) }, body: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });

  const insights = dbInsights?.status === 200 ? dbInsights.body.data : [];
  const campaignInsights = analyticsData?.insights || [];
  const summary = analyticsData?.summary || {};
  const isLoading = isLoadingDbInsights || isLoadingAnalytics;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing your marketing data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getImpactIcon = (impact: string) => {
    if (impact === 'high') return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (impact === 'medium') return <Target className="h-5 w-5 text-yellow-500" />;
    return <TrendingUp className="h-5 w-5 text-blue-500" />;
  };

  const getTypeColor = (type: string) => {
    if (type === 'performance') return 'bg-blue-100 text-blue-700';
    if (type === 'correlation') return 'bg-purple-100 text-purple-700';
    if (type === 'anomaly') return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-muted-foreground mt-2">AI-powered insights about your marketing performance</p>
          </div>
        </div>

        {campaignInsights.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalCampaigns}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalRegistrations}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Insights Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.insightsGenerated}</div>
                </CardContent>
              </Card>
            </div>

            {campaignInsights.map((insight: any, index: number) => (
              <Card key={index} className={
                insight.priority === 'high' ? 'border-l-4 border-l-primary' :
                insight.priority === 'medium' ? 'border-l-4 border-l-yellow-500' :
                'border-l-4 border-l-gray-500'
              }>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription className="mt-2">{insight.description}</CardDescription>
                    </div>
                    <Badge variant={
                      insight.priority === 'high' ? 'default' :
                      insight.priority === 'medium' ? 'secondary' :
                      'outline'
                    }>
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Object.entries(insight.metrics).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <div className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="font-semibold">
                          {typeof value === 'number' && value % 1 !== 0
                            ? value.toFixed(2)
                            : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {insight.recommendation && (
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-sm font-medium mb-1">Recommendation</div>
                      <div className="text-sm text-muted-foreground">{insight.recommendation}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Lightbulb className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">No Insights Yet</h3>
              <p className="text-muted-foreground">
                No insights available yet. Upload marketing data to see campaign performance analysis.
              </p>
            </CardContent>
          </Card>
        )}

        {insights.length > 0 && (
          <>
            <div className="pt-8 border-t">
              <h2 className="text-2xl font-bold mb-4">Saved Insights</h2>
            </div>
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className={insight.acknowledgedAt ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getImpactIcon(insight.impact)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(insight.type)}`}>
                              {insight.type}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                      {!insight.acknowledgedAt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeMutation.mutate(insight.id)}
                          disabled={acknowledgeMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {insight.metrics && Object.keys(insight.metrics).length > 0 && (
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary rounded-lg">
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="text-sm font-medium">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
