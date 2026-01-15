import { Card, Title, DonutChart, Flex, Badge, Legend } from '@tremor/react';
import { useMemo } from 'react';

interface ChannelData {
  channel: string;
  registrations: number;
  attendees: number;
  spend: number;
  roi: number;
  qualityScore: number;
}

interface ChannelPieChartProps {
  channels: ChannelData[];
  className?: string;
  onChannelClick?: (channel: string) => void;
}

/**
 * ChannelPieChart - Shows channel distribution for registrations
 * Displays source attribution with percentages
 * Interactive segments for drill-down
 */
export function ChannelPieChart({ channels, className, onChannelClick }: ChannelPieChartProps) {
  const { chartData, totalRegistrations } = useMemo(() => {
    const total = channels.reduce((sum, c) => sum + c.registrations, 0);

    const data = channels.map(c => ({
      name: c.channel.charAt(0).toUpperCase() + c.channel.slice(1),
      value: c.registrations,
      percentage: total > 0 ? (c.registrations / total) * 100 : 0,
    }));

    // Sort by value descending
    data.sort((a, b) => b.value - a.value);

    return {
      chartData: data,
      totalRegistrations: total,
    };
  }, [channels]);

  const handleClick = (data: any) => {
    if (onChannelClick && data?.name) {
      onChannelClick(data.name.toLowerCase());
    }
  };

  const valueFormatter = (value: number) => {
    const percentage = totalRegistrations > 0 ? (value / totalRegistrations) * 100 : 0;
    return `${value.toLocaleString()} (${percentage.toFixed(1)}%)`;
  };

  return (
    <Card className={className}>
      <Flex justifyContent="between" alignItems="center">
        <Title>Channel Attribution</Title>
        <Badge color="blue">Registrations</Badge>
      </Flex>
      <DonutChart
        className="mt-6 h-64"
        data={chartData}
        category="value"
        index="name"
        valueFormatter={valueFormatter}
        colors={['blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink']}
        showAnimation={true}
        onValueChange={handleClick}
      />
      <Legend
        className="mt-4"
        categories={chartData.map(d => d.name)}
        colors={['blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink']}
      />
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Total Registrations: <span className="font-semibold text-foreground">{totalRegistrations.toLocaleString()}</span>
        </p>
      </div>
    </Card>
  );
}
