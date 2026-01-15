import { Card, Metric, Text, Flex, BadgeDelta, AreaChart } from '@tremor/react';
import { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

interface TrendDataPoint {
  date: string;
  value: number;
}

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  trendData?: TrendDataPoint[];
  icon?: LucideIcon;
  valueFormatter?: (value: number) => string;
  className?: string;
}

/**
 * MetricCard - Enhanced stat card with trends
 * Shows current value, percentage change vs previous period
 * Optional micro sparkline for 7-day trend
 */
export function MetricCard({
  title,
  value,
  previousValue,
  trendData,
  icon: Icon,
  valueFormatter = (v) => v.toLocaleString(),
  className,
}: MetricCardProps) {
  const { percentageChange, deltaType } = useMemo(() => {
    if (previousValue === undefined || previousValue === 0) {
      return { percentageChange: 0, deltaType: 'unchanged' as const };
    }

    const change = ((value - previousValue) / previousValue) * 100;

    return {
      percentageChange: change,
      deltaType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'unchanged',
    } as const;
  }, [value, previousValue]);

  const chartData = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];

    return trendData.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Value': d.value,
    }));
  }, [trendData]);

  return (
    <Card className={className}>
      <Flex justifyContent="between" alignItems="start">
        <div className="flex-1">
          <Flex alignItems="center" className="space-x-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <Text>{title}</Text>
          </Flex>
          <Metric className="mt-2">{valueFormatter(value)}</Metric>
        </div>
        {previousValue !== undefined && (
          <BadgeDelta deltaType={deltaType} size="xs">
            {percentageChange >= 0 ? '+' : ''}
            {percentageChange.toFixed(1)}%
          </BadgeDelta>
        )}
      </Flex>

      {chartData.length > 0 && (
        <AreaChart
          className="mt-4 h-12"
          data={chartData}
          index="date"
          categories={['Value']}
          colors={['blue']}
          showXAxis={false}
          showYAxis={false}
          showLegend={false}
          showGridLines={false}
          showAnimation={true}
          curveType="natural"
          valueFormatter={valueFormatter}
        />
      )}

      {previousValue !== undefined && (
        <Text className="mt-2 text-xs text-muted-foreground">
          vs. previous period: {valueFormatter(previousValue)}
        </Text>
      )}
    </Card>
  );
}
