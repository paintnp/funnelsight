import { Card, Title, LineChart } from '@tremor/react';
import { useMemo } from 'react';
import { format } from 'date-fns';

interface TimelineDataPoint {
  date: string;
  clicks: number;
  registrations: number;
  attendance: number;
}

interface TimelineChartProps {
  data: TimelineDataPoint[];
  className?: string;
}

/**
 * TimelineChart - Displays registration trends over time
 * Shows multiple metrics: Clicks, Registrations, and Attendance
 * Uses line chart for temporal analysis
 */
export function TimelineChart({ data, className }: TimelineChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => {
      const date = new Date(d.date);
      return {
        date: format(date, 'MMM dd'),
        'Clicks': d.clicks,
        'Registrations': d.registrations,
        'Attendance': d.attendance,
      };
    });
  }, [data]);

  return (
    <Card className={className}>
      <Title>Performance Timeline</Title>
      <LineChart
        className="mt-6 h-80"
        data={chartData}
        index="date"
        categories={['Clicks', 'Registrations', 'Attendance']}
        colors={['blue', 'indigo', 'green']}
        valueFormatter={(value) => value.toLocaleString()}
        yAxisWidth={48}
        showLegend={true}
        showGridLines={true}
        showAnimation={true}
        curveType="natural"
      />
    </Card>
  );
}
