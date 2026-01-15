import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { Calendar, TrendingUp, Database, Lightbulb } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { FunnelChart, TimelineChart, CampaignBarChart, ChannelPieChart, MetricCard } from '@/components/charts';
import { InsightCard } from '@/components/insights/InsightCard';
import { useMemo } from 'react';

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  const { isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.events.getEvents({ query: {} }),
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiClient.campaigns.getCampaigns({ query: {} }),
  });

  const { isLoading: dataSourcesLoading } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => apiClient.dataSources.getDataSources({ query: {} }),
  });

  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => apiClient.insights.getInsights({ query: {} }),
  });

  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['funnel'],
    queryFn: () => apiClient.analytics.getFunnelPerformance({ query: {} }),
  });

  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => apiClient.analytics.getChannelPerformance({ query: {} }),
  });

  const { data: nlInsightsData, isLoading: nlInsightsLoading } = useQuery({
    queryKey: ['natural-language-insights'],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(
        `${apiUrl}/api/insights/natural-language`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      return response.json();
    },
  });

  const campaigns = campaignsData?.status === 200 ? campaignsData.body.data : [];
  const insights = insightsData?.status === 200 ? insightsData.body.data : [];
  const funnel = funnelData?.status === 200 ? funnelData.body : null;
  const channels = channelsData?.status === 200 ? channelsData.body : [];
  const nlInsights = nlInsightsData?.insights || [];

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  // Transform funnel data for FunnelChart component
  const funnelChartData = useMemo(() => {
    if (!funnel) return null;

    return {
      awareness: funnel.totalClicks,
      interest: funnel.totalRegistrations,
      conversion: funnel.totalAttendees,
    };
  }, [funnel]);

  // Transform campaigns data for timeline
  const timelineData = useMemo(() => {
    if (campaigns.length === 0) return [];

    // Group campaigns by date and aggregate metrics
    const dateMap = new Map<string, { clicks: number; registrations: number; attendance: number }>();

    campaigns.forEach(campaign => {
      const date = campaign.startDate.split('T')[0]; // Get date part only
      const existing = dateMap.get(date) || { clicks: 0, registrations: 0, attendance: 0 };

      dateMap.set(date, {
        clicks: existing.clicks + (campaign.clicks || 0),
        registrations: existing.registrations + campaign.registrations,
        attendance: existing.attendance + campaign.attendees,
      });
    });

    // Convert to array and sort by date
    const result = Array.from(dateMap.entries())
      .map(([date, metrics]) => ({
        date,
        ...metrics,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return result;
  }, [campaigns]);

  // Calculate total registrations
  const totalRegistrations = useMemo(() => {
    return campaigns.reduce((sum, c) => sum + c.registrations, 0);
  }, [campaigns]);

  // Calculate total clicks
  const totalClicks = useMemo(() => {
    return campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  }, [campaigns]);

  // Calculate total attendance
  const totalAttendance = useMemo(() => {
    return campaigns.reduce((sum, c) => sum + c.attendees, 0);
  }, [campaigns]);

  // Loading state
  const isLoading = eventsLoading || campaignsLoading || dataSourcesLoading || insightsLoading || funnelLoading || channelsLoading || nlInsightsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleCampaignClick = (campaignId: number) => {
    setLocation(`/campaigns/${campaignId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Your unified view of marketing and event performance
          </p>
        </div>

        {/* Enhanced Metric Cards with Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Clicks"
            value={totalClicks}
            icon={TrendingUp}
            className="dark:bg-card"
          />
          <MetricCard
            title="Total Registrations"
            value={totalRegistrations}
            icon={Calendar}
            className="dark:bg-card"
          />
          <MetricCard
            title="Total Attendance"
            value={totalAttendance}
            icon={Calendar}
            className="dark:bg-card"
          />
          <MetricCard
            title="Active Campaigns"
            value={activeCampaigns.length}
            icon={TrendingUp}
            className="dark:bg-card"
          />
        </div>

        {/* Natural Language Insights Section */}
        {nlInsights.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Key Insights</h2>
              <p className="text-muted-foreground">
                AI-generated summaries of your marketing performance
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {nlInsights.slice(0, 4).map((insight: any) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* Funnel Visualization */}
        {funnelChartData && (
          <FunnelChart data={funnelChartData} className="dark:bg-card" />
        )}

        {/* Charts Row 1: Timeline and Channel Attribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {timelineData.length > 0 ? (
            <TimelineChart data={timelineData} className="dark:bg-card" />
          ) : (
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle>Performance Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No timeline data yet. Create campaigns to see performance trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {channels.length > 0 ? (
            <ChannelPieChart
              channels={channels}
              className="dark:bg-card"
            />
          ) : (
            <Card className="dark:bg-card">
              <CardHeader>
                <CardTitle>Channel Attribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No channel data yet. Create campaigns to see channel attribution.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Campaign Performance Comparison */}
        {campaigns.length > 0 ? (
          <CampaignBarChart
            campaigns={campaigns}
            onCampaignClick={handleCampaignClick}
            className="dark:bg-card"
          />
        ) : (
          <Card className="dark:bg-card">
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No campaigns yet. Create your first campaign to see performance data.
                </p>
                <Link href="/campaigns">
                  <Button>Create Campaign</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Channels List */}
          <Card className="dark:bg-card">
            <CardHeader>
              <CardTitle>Top Channels</CardTitle>
            </CardHeader>
            <CardContent>
              {channels.length > 0 ? (
                <div className="space-y-4">
                  {channels.slice(0, 5).map((channel) => (
                    <div key={channel.channel} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{channel.channel}</p>
                        <p className="text-sm text-muted-foreground">
                          {channel.registrations} registrations
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {channel.qualityScore.toFixed(0)}% quality
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No campaign data yet. Create campaigns to see performance.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Insights */}
          <Card className="dark:bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Insights</CardTitle>
                <Link href="/insights">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="space-y-1">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{insight.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No insights yet. Connect data sources and campaigns to generate insights.
                  </p>
                  <Link href="/data-sources">
                    <Button variant="outline" size="sm">Connect Data Sources</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="dark:bg-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/events">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Add Campaign
                </Button>
              </Link>
              <Link href="/data-sources">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Connect Data Source
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
