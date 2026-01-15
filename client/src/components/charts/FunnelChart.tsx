import { Card, Title, BarList, Flex, Text, Badge } from '@tremor/react';
import { useMemo } from 'react';

interface FunnelData {
  awareness: number;   // Clicks/Sessions
  interest: number;    // Registrations
  conversion: number;  // Attendance
}

interface FunnelChartProps {
  data: FunnelData;
  className?: string;
}

/**
 * FunnelChart - Visualizes the marketing funnel performance
 * Shows the journey from awareness (clicks) to interest (registrations) to conversion (attendance)
 * Displays drop-off percentages between stages
 */
export function FunnelChart({ data, className }: FunnelChartProps) {
  const stages = useMemo(() => {
    const total = data.awareness || 1; // Prevent division by zero

    return [
      {
        name: 'Awareness (Clicks/Sessions)',
        value: data.awareness,
        percentage: 100,
        color: 'blue' as const,
      },
      {
        name: 'Interest (Registrations)',
        value: data.interest,
        percentage: (data.interest / total) * 100,
        color: 'indigo' as const,
      },
      {
        name: 'Conversion (Attendance)',
        value: data.conversion,
        percentage: (data.conversion / total) * 100,
        color: 'green' as const,
      },
    ];
  }, [data]);

  const dropOffRates = useMemo(() => {
    return stages.map((stage, i) => {
      if (i === 0) return null;
      const previous = stages[i - 1];
      if (previous.value === 0) return null;
      const dropOff = ((previous.value - stage.value) / previous.value) * 100;
      return dropOff;
    });
  }, [stages]);

  return (
    <Card className={className}>
      <Flex justifyContent="between" alignItems="center">
        <Title>Marketing Funnel Performance</Title>
        <Badge color="blue">Last 30 Days</Badge>
      </Flex>

      <BarList
        data={stages.map(s => ({
          name: s.name,
          value: s.value,
          color: s.color,
        }))}
        valueFormatter={(value: number) => `${value.toLocaleString()}`}
        className="mt-6"
      />

      <div className="mt-4 space-y-2">
        {stages.map((stage, i) => (
          <Flex key={stage.name} justifyContent="between" className="text-sm">
            <Text>{stage.name}</Text>
            <div className="text-right">
              <Text className="text-muted-foreground">
                {stage.value.toLocaleString()} ({stage.percentage.toFixed(1)}%)
              </Text>
              {dropOffRates[i] !== null && dropOffRates[i]! > 0 && (
                <Text className="text-red-500 text-xs">
                  -{dropOffRates[i]!.toFixed(1)}% drop-off
                </Text>
              )}
            </div>
          </Flex>
        ))}
      </div>
    </Card>
  );
}
