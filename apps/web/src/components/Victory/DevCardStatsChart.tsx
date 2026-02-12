import { Stack, Text, Group, Badge, Card, Avatar } from '@mantine/core';
import { DevelopmentCardType, Player, PLAYER_COLOR_HEX } from '@catan/shared';

interface DevCardStatsChartProps {
  devCardStats: Record<string, DevelopmentCardType[]>;
  players: Player[];
}

/**
 * Development card statistics showing overall totals and per-player breakdown.
 *
 * Displays:
 * 1. Overall totals by card type
 * 2. Per-player breakdown with avatar and card lists
 */
export function DevCardStatsChart({
  devCardStats,
  players,
}: DevCardStatsChartProps) {
  // Calculate overall totals by card type
  const cardTypeCounts: Record<DevelopmentCardType, number> = {
    knight: 0,
    victory_point: 0,
    road_building: 0,
    year_of_plenty: 0,
    monopoly: 0,
  };

  Object.values(devCardStats).forEach((cards) => {
    cards.forEach((card) => {
      cardTypeCounts[card]++;
    });
  });

  // Card type display names
  const cardTypeLabels: Record<DevelopmentCardType, string> = {
    knight: 'Knight',
    victory_point: 'Victory Point',
    road_building: 'Road Building',
    year_of_plenty: 'Year of Plenty',
    monopoly: 'Monopoly',
  };

  return (
    <Stack gap="lg">
      <Text
        size="lg"
        fw={700}
        style={{ fontFamily: 'Fraunces, serif', color: '#5d4037' }}
      >
        Development Cards Drawn
      </Text>

      {/* Overall totals */}
      <Stack gap="xs">
        <Text size="sm" fw={600} style={{ color: '#5d4037' }}>
          Overall Totals
        </Text>
        <Group gap="xs">
          {Object.entries(cardTypeCounts).map(([type, count]) => (
            <Badge
              key={type}
              size="lg"
              variant="filled"
              styles={{
                root: {
                  background: '#8d6e63',
                  color: '#fdf6e3',
                },
              }}
            >
              {cardTypeLabels[type as DevelopmentCardType]}: {count}
            </Badge>
          ))}
        </Group>
      </Stack>

      {/* Per-player breakdown */}
      <Stack gap="xs">
        <Text size="sm" fw={600} style={{ color: '#5d4037' }}>
          Per-Player Breakdown
        </Text>
        <Stack gap="sm">
          {players.map((player) => {
            const playerCards = devCardStats[player.id] || [];
            const playerCardCounts: Record<DevelopmentCardType, number> = {
              knight: 0,
              victory_point: 0,
              road_building: 0,
              year_of_plenty: 0,
              monopoly: 0,
            };

            playerCards.forEach((card) => {
              playerCardCounts[card]++;
            });

            return (
              <Card
                key={player.id}
                padding="sm"
                radius="md"
                style={{
                  border: '1px solid #d7ccc8',
                  backgroundColor: 'white',
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Avatar
                      size="sm"
                      radius="xl"
                      style={{
                        backgroundColor: PLAYER_COLOR_HEX[player.color],
                      }}
                    >
                      {player.nickname.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Text fw={500} style={{ color: '#5d4037' }}>
                      {player.nickname}
                    </Text>
                  </Group>

                  <Group gap={4} wrap="nowrap">
                    {Object.entries(playerCardCounts)
                      .filter(([_, count]) => count > 0)
                      .map(([type, count]) => (
                        <Badge
                          key={type}
                          size="sm"
                          variant="light"
                          styles={{
                            root: {
                              background: 'rgba(141, 110, 99, 0.1)',
                              color: '#5d4037',
                            },
                          }}
                        >
                          {cardTypeLabels[type as DevelopmentCardType]}: {count}
                        </Badge>
                      ))}
                    {playerCards.length === 0 && (
                      <Text size="sm" c="dimmed">
                        No cards drawn
                      </Text>
                    )}
                  </Group>
                </Group>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
}
