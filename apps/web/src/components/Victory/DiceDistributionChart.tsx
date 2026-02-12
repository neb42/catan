import { BarChart } from '@mantine/charts';
import { Stack, Text } from '@mantine/core';

interface DiceDistributionChartProps {
  diceRolls: Record<number, number>;
}

/**
 * Bar chart showing frequency distribution of dice rolls (2-12).
 * Per CONTEXT.md: "Frequency distribution (how many times each number 2-12 was rolled)
 * with bar chart visualization"
 *
 * The bar height represents how many times each number was rolled.
 */
export function DiceDistributionChart({
  diceRolls,
}: DiceDistributionChartProps) {
  // Transform data into array format for BarChart
  const chartData = Array.from({ length: 11 }, (_, i) => {
    const number = i + 2; // Numbers 2-12
    return {
      number: number.toString(),
      count: diceRolls[number] || 0,
    };
  });

  return (
    <Stack gap="md">
      <Text
        size="lg"
        fw={700}
        style={{ fontFamily: 'Fraunces, serif', color: '#5d4037' }}
      >
        Dice Roll Distribution
      </Text>

      <BarChart
        h={300}
        data={chartData}
        dataKey="number"
        series={[{ name: 'count', color: '#8d6e63', label: 'Frequency' }]}
        xAxisLabel="Dice Number (2-12)"
        yAxisLabel="Times Rolled"
        style={{ background: 'transparent' }}
      />
    </Stack>
  );
}
