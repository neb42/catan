import { Stack, Text, Group, Badge } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { Player, ResourceType, PLAYER_COLOR_HEX } from '@catan/shared';

interface ResourceStatsChartProps {
  resourceStats: Record<
    string,
    {
      gained: Record<ResourceType, number>;
      spent: Record<ResourceType, number>;
      traded: Record<ResourceType, number>;
    }
  >;
  players: Player[];
}

/**
 * Resource statistics showing:
 * 1. Resources collected from dice rolls (distribution per player)
 * 2. Net resource flow (gained vs spent per resource type)
 * 3. Trade activity (net trade flow per player)
 *
 * Per CONTEXT.md locked decision: Shows distribution, net flow, and trade activity separately.
 */
export function ResourceStatsChart({
  resourceStats,
  players,
}: ResourceStatsChartProps) {
  const resourceTypes: ResourceType[] = [
    'wood',
    'brick',
    'sheep',
    'wheat',
    'ore',
  ];

  const resourceLabels: Record<ResourceType, string> = {
    wood: 'Wood',
    brick: 'Brick',
    sheep: 'Sheep',
    wheat: 'Wheat',
    ore: 'Ore',
  };

  const resourceColors: Record<ResourceType, string> = {
    wood: '#4A7C3D',
    brick: '#C44536',
    sheep: '#90C850',
    wheat: '#E8C547',
    ore: '#7A7A7A',
  };

  // Section 1: Resources Collected (Distribution) - Stacked bar chart
  const distributionData = players.map((player) => {
    const stats = resourceStats[player.id];
    if (!stats) return { player: player.nickname };

    const data: Record<string, number | string> = { player: player.nickname };
    resourceTypes.forEach((resource) => {
      data[resource] = stats.gained[resource] || 0;
    });
    return data;
  });

  const distributionSeries = resourceTypes.map((resource) => ({
    name: resource,
    color: resourceColors[resource],
    label: resourceLabels[resource],
  }));

  // Section 2: Net Resource Flow (Gained - Spent) per resource type
  const netFlowData = resourceTypes.map((resource) => {
    const data: Record<string, number | string> = {
      resource: resourceLabels[resource],
    };

    players.forEach((player) => {
      const stats = resourceStats[player.id];
      if (stats) {
        const gained = stats.gained[resource] || 0;
        const spent = stats.spent[resource] || 0;
        data[player.id] = gained - spent;
      }
    });

    return data;
  });

  const netFlowSeries = players.map((player) => ({
    name: player.id,
    color: PLAYER_COLOR_HEX[player.color],
    label: player.nickname,
  }));

  // Section 3: Trade Activity - Net trade per player (sum of all resources)
  const tradeData = players.map((player) => {
    const stats = resourceStats[player.id];
    if (!stats) return { player: player.nickname, netTrade: 0 };

    const netTrade = resourceTypes.reduce((sum, resource) => {
      return sum + (stats.traded[resource] || 0);
    }, 0);

    return {
      player: player.nickname,
      netTrade,
    };
  });

  return (
    <Stack gap="xl">
      <Text
        size="lg"
        fw={700}
        style={{ fontFamily: 'Fraunces, serif', color: '#5d4037' }}
      >
        Resource Statistics
      </Text>

      {/* Section 1: Distribution */}
      <Stack gap="xs">
        <Text size="md" fw={600} style={{ color: '#5d4037' }}>
          Resources Collected (Distribution)
        </Text>
        <Text size="xs" c="dimmed" style={{ color: '#8d6e63' }}>
          Shows which resources each player collected from dice rolls
        </Text>
        <BarChart
          h={300}
          data={distributionData}
          dataKey="player"
          series={distributionSeries}
          type="stacked"
          style={{ background: 'transparent' }}
        />
        <Group gap="xs" mt="xs">
          {resourceTypes.map((resource) => (
            <Badge
              key={resource}
              size="sm"
              styles={{
                root: {
                  background: resourceColors[resource],
                  color: 'white',
                },
              }}
            >
              {resourceLabels[resource]}
            </Badge>
          ))}
        </Group>
      </Stack>

      {/* Section 2: Net Flow */}
      <Stack gap="xs">
        <Text size="md" fw={600} style={{ color: '#5d4037' }}>
          Net Resource Flow (Gained vs Spent)
        </Text>
        <Text size="xs" c="dimmed" style={{ color: '#8d6e63' }}>
          Positive = gained more than spent, negative = spent more than gained
        </Text>
        <BarChart
          h={300}
          data={netFlowData}
          dataKey="resource"
          series={netFlowSeries}
          style={{ background: 'transparent' }}
        />
        <Group gap="xs" mt="xs">
          {players.map((player) => (
            <Badge
              key={player.id}
              size="sm"
              styles={{
                root: {
                  background: PLAYER_COLOR_HEX[player.color],
                  color: 'white',
                },
              }}
            >
              {player.nickname}
            </Badge>
          ))}
        </Group>
      </Stack>

      {/* Section 3: Trade Activity */}
      <Stack gap="xs">
        <Text size="md" fw={600} style={{ color: '#5d4037' }}>
          Trade Activity
        </Text>
        <Text size="xs" c="dimmed" style={{ color: '#8d6e63' }}>
          Net resources traded (positive = received more, negative = gave more)
        </Text>
        <BarChart
          h={250}
          data={tradeData}
          dataKey="player"
          series={[
            {
              name: 'netTrade',
              color: '#8d6e63',
              label: 'Net Trade',
            },
          ]}
          style={{ background: 'transparent' }}
        />
      </Stack>
    </Stack>
  );
}
