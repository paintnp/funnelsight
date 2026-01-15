import { Card, Title, BarChart, Flex, Badge } from '@tremor/react';
import { useMemo } from 'react';
import type { Campaign } from '@shared/schema.zod';

interface CampaignBarChartProps {
  campaigns: Campaign[];
  className?: string;
  onCampaignClick?: (campaignId: number) => void;
}

/**
 * CampaignBarChart - Shows relative campaign performance
 * Displays registrations by campaign with quality score gradient
 * Interactive hover with detailed metrics
 */
export function CampaignBarChart({ campaigns, className, onCampaignClick }: CampaignBarChartProps) {
  const chartData = useMemo(() => {
    // Sort by registrations and take top 10
    const topCampaigns = [...campaigns]
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 10);

    return topCampaigns.map(c => ({
      name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
      'Registrations': c.registrations,
      'Attendance': c.attendees,
      campaignId: c.id,
      qualityScore: c.qualityScore || 0,
    }));
  }, [campaigns]);

  const handleBarClick = (data: any) => {
    if (onCampaignClick && data?.campaignId) {
      onCampaignClick(data.campaignId);
    }
  };

  const avgQualityScore = useMemo(() => {
    const scores = campaigns
      .filter(c => c.qualityScore !== null)
      .map(c => c.qualityScore as number);

    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [campaigns]);

  return (
    <Card className={className}>
      <Flex justifyContent="between" alignItems="center">
        <Title>Top Performing Campaigns</Title>
        <Badge color={avgQualityScore > 70 ? 'green' : avgQualityScore > 50 ? 'yellow' : 'red'}>
          Avg Quality: {avgQualityScore.toFixed(0)}%
        </Badge>
      </Flex>
      <BarChart
        className="mt-6 h-80"
        data={chartData}
        index="name"
        categories={['Registrations', 'Attendance']}
        colors={['indigo', 'green']}
        valueFormatter={(value) => value.toLocaleString()}
        yAxisWidth={48}
        showLegend={true}
        showAnimation={true}
        onValueChange={handleBarClick}
        stack={false}
      />
    </Card>
  );
}
