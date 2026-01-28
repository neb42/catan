import { motion } from 'motion/react';
import { Paper, Text, Group, Box, Stack, Tooltip } from '@mantine/core';
import { PLAYER_COLOR_HEX } from '@catan/shared';
import { useDraftOrder } from '../hooks/usePlacementState';


interface DraftOrderDisplayProps {
  players: Array<{ id: string; nickname: string; color: string }>;
}

export function DraftOrderDisplay({ players }: DraftOrderDisplayProps) {
  const draftOrder = useDraftOrder(players.length);

  // Group by round for display
  const round1 = draftOrder.filter((d) => d.round === 1);
  const round2 = draftOrder.filter((d) => d.round === 2);

  return (
    <Paper
      shadow="sm"
      p="xs"
      radius="md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        maxWidth: 280,
      }}
    >
      <Stack gap="xs">
        <Text size="xs" fw={600} c="dimmed" tt="uppercase">
          Draft Order
        </Text>

        {/* Round 1 */}
        <Box>
          <Text size="xs" c="dimmed" mb={4}>
            Round 1 (1→{players.length})
          </Text>
          <Group gap={4} wrap="wrap">
            {round1.map((position) => {
              const player = players[position.playerIndex];
              const colorHex = PLAYER_COLOR_HEX[player?.color] || '#ccc';
              const isSettlement = position.phase === 'settlement';

              return (
                <Tooltip
                  key={position.turnNumber}
                  label={`${player?.nickname || `P${position.playerIndex + 1}`}: ${position.phase}`}
                  position="top"
                  withArrow
                >
                  <motion.div
                    animate={
                      position.isCurrent
                        ? {
                            scale: [1, 1.15, 1],
                            boxShadow: [
                              `0 0 0 0 ${colorHex}`,
                              `0 0 0 4px ${colorHex}40`,
                              `0 0 0 0 ${colorHex}`,
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 1.5,
                      repeat: position.isCurrent ? Infinity : 0,
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: isSettlement ? 4 : '50%',
                      backgroundColor: colorHex,
                      border: position.isCurrent
                        ? '2px solid #333'
                        : '1px solid rgba(0,0,0,0.2)',
                      opacity: position.isCurrent ? 1 : 0.6,
                    }}
                  />
                </Tooltip>
              );
            })}
          </Group>
        </Box>

        {/* Round 2 */}
        <Box>
          <Text size="xs" c="dimmed" mb={4}>
            Round 2 ({players.length}→1)
          </Text>
          <Group gap={4} wrap="wrap">
            {round2.map((position) => {
              const player = players[position.playerIndex];
              const colorHex = PLAYER_COLOR_HEX[player?.color] || '#ccc';
              const isSettlement = position.phase === 'settlement';

              return (
                <Tooltip
                  key={position.turnNumber}
                  label={`${player?.nickname || `P${position.playerIndex + 1}`}: ${position.phase}`}
                  position="top"
                  withArrow
                >
                  <motion.div
                    animate={
                      position.isCurrent
                        ? {
                            scale: [1, 1.15, 1],
                            boxShadow: [
                              `0 0 0 0 ${colorHex}`,
                              `0 0 0 4px ${colorHex}40`,
                              `0 0 0 0 ${colorHex}`,
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 1.5,
                      repeat: position.isCurrent ? Infinity : 0,
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: isSettlement ? 4 : '50%',
                      backgroundColor: colorHex,
                      border: position.isCurrent
                        ? '2px solid #333'
                        : '1px solid rgba(0,0,0,0.2)',
                      opacity: position.isCurrent ? 1 : 0.6,
                    }}
                  />
                </Tooltip>
              );
            })}
          </Group>
        </Box>

        {/* Legend */}
        <Group gap="xs" mt={4}>
          <Group gap={4}>
            <Box
              w={12}
              h={12}
              style={{ backgroundColor: '#ccc', borderRadius: 2 }}
            />
            <Text size="xs" c="dimmed">
              Settlement
            </Text>
          </Group>
          <Group gap={4}>
            <Box
              w={12}
              h={12}
              style={{ backgroundColor: '#ccc', borderRadius: '50%' }}
            />
            <Text size="xs" c="dimmed">
              Road
            </Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
