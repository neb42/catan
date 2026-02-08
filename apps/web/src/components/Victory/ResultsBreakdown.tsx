import { Stack, Text, Card, Group, Avatar, Badge } from '@mantine/core';
import { Player, PLAYER_COLOR_HEX } from '@catan/shared';

interface VPBreakdown {
  settlements: number;
  cities: number;
  longestRoad: number;
  largestArmy: number;
  victoryPointCards: number;
  total: number;
}

interface ResultsBreakdownProps {
  players: Player[];
  allPlayerVP: Record<string, VPBreakdown>;
}

/**
 * ResultsBreakdown displays the final standings with detailed VP breakdown.
 * Winner is emphasized with gold styling and trophy emoji.
 * Per CONTEXT.md: "Use player colors from the game for their data in charts/stats"
 */
export function ResultsBreakdown({
  players,
  allPlayerVP,
}: ResultsBreakdownProps) {
  // Sort players by total VP (descending) - winner is first
  const sortedPlayers = [...players].sort((a, b) => {
    const vpA = allPlayerVP[a.id]?.total || 0;
    const vpB = allPlayerVP[b.id]?.total || 0;
    return vpB - vpA;
  });

  const winnerId = sortedPlayers[0]?.id;

  return (
    <Stack gap="sm" w="100%">
      <Text
        fw={700}
        ta="center"
        style={{
          fontFamily: 'Fraunces, serif',
          color: '#5d4037',
          fontSize: '18px',
        }}
      >
        Final Standings
      </Text>
      {sortedPlayers.map((player) => {
        const vp = allPlayerVP[player.id];
        const isWinner = player.id === winnerId;

        return (
          <Card
            key={player.id}
            padding="md"
            radius="md"
            style={{
              border: isWinner ? '3px solid #f1c40f' : '1px solid #d7ccc8',
              backgroundColor: isWinner ? 'rgba(241, 196, 15, 0.1)' : 'white',
            }}
          >
            {/* Header: Avatar + Nickname + Winner Badge + Total VP */}
            <Group justify="space-between" mb={isWinner ? 'xs' : 0}>
              <Group gap="xs">
                <Avatar
                  size="md"
                  radius="xl"
                  style={{
                    backgroundColor: PLAYER_COLOR_HEX[player.color],
                  }}
                >
                  {player.nickname.slice(0, 2).toUpperCase()}
                </Avatar>
                <Text fw={isWinner ? 700 : 500} style={{ color: '#5d4037' }}>
                  {isWinner && '🏆 '}
                  {player.nickname}
                </Text>
                {isWinner && (
                  <Badge
                    size="sm"
                    styles={{
                      root: {
                        background: '#f1c40f',
                        color: '#333',
                      },
                    }}
                  >
                    WINNER
                  </Badge>
                )}
              </Group>
              <Badge
                size="lg"
                styles={{
                  root: {
                    background: isWinner ? '#f1c40f' : '#e0e0e0',
                    color: isWinner ? '#333' : '#5d4037',
                    fontWeight: 700,
                  },
                }}
              >
                {vp?.total || 0} VP
              </Badge>
            </Group>

            {/* VP Breakdown */}
            <Group gap="xs" mt="xs" style={{ flexWrap: 'wrap' }}>
              {vp && (
                <>
                  {/* Settlements */}
                  <Text size="sm" style={{ color: '#5d4037' }}>
                    🏘️ {vp.settlements} Settlement
                    {vp.settlements !== 1 ? 's' : ''} ({vp.settlements}×1 VP)
                  </Text>

                  {/* Cities */}
                  {vp.cities > 0 && (
                    <Text size="sm" style={{ color: '#5d4037' }}>
                      🏛️ {Math.floor(vp.cities / 2)} Cit
                      {Math.floor(vp.cities / 2) !== 1 ? 'ies' : 'y'} (
                      {Math.floor(vp.cities / 2)}×2 VP)
                    </Text>
                  )}

                  {/* Longest Road */}
                  {vp.longestRoad > 0 && (
                    <Text size="sm" style={{ color: '#5d4037' }}>
                      🛤️ Longest Road (2 VP)
                    </Text>
                  )}

                  {/* Largest Army */}
                  {vp.largestArmy > 0 && (
                    <Text size="sm" style={{ color: '#5d4037' }}>
                      ⚔️ Largest Army (2 VP)
                    </Text>
                  )}

                  {/* VP Cards */}
                  {vp.victoryPointCards > 0 && (
                    <Text size="sm" style={{ color: '#5d4037' }}>
                      🏆 Victory Point Cards ({vp.victoryPointCards} VP)
                    </Text>
                  )}
                </>
              )}
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
