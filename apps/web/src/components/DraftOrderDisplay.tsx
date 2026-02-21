import { motion } from 'motion/react';
import { Text, Tooltip } from '@mantine/core';
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
    <div
      style={{
        background: '#fdf6e3',
        border: '4px solid #8d6e63',
        borderRadius: '12px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        padding: 'var(--mantine-spacing-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--mantine-spacing-sm)',
        }}
      >
        <Text
          size="xs"
          fw={600}
          c="#5d4037"
          tt="uppercase"
          style={{ letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}
        >
          Draft Order
        </Text>

        {/* Round 1 */}
        <div
          style={{
            paddingBottom: 'var(--mantine-spacing-md)',
            borderBottom: '2px dashed #d7ccc8',
          }}
        >
          <Text size="xs" c="#8d6e63" mb="xs">
            Round 1 (1→{players.length})
          </Text>
          <div
            style={{
              display: 'flex',
              gap: 'var(--mantine-spacing-xs)',
              flexWrap: 'wrap',
            }}
          >
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
          </div>
        </div>

        {/* Round 2 */}
        <div
          style={{
            paddingBottom: 'var(--mantine-spacing-md)',
            borderBottom: '2px dashed #d7ccc8',
          }}
        >
          <Text size="xs" c="#8d6e63" mb="xs">
            Round 2 ({players.length}→1)
          </Text>
          <div
            style={{
              display: 'flex',
              gap: 'var(--mantine-spacing-xs)',
              flexWrap: 'wrap',
            }}
          >
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
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--mantine-spacing-xs)',
            background: 'rgba(0,0,0,0.03)',
            padding: 'var(--mantine-spacing-xs)',
            borderRadius: '6px',
            borderTop: '2px dashed #d7ccc8',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--mantine-spacing-xs)',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#ccc',
                borderRadius: 2,
              }}
            />
            <Text size="xs" c="#8d6e63">
              Settlement
            </Text>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--mantine-spacing-xs)',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: '#ccc',
                borderRadius: '50%',
              }}
            />
            <Text size="xs" c="#8d6e63">
              Road
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
