import { motion } from 'motion/react';
import { Tooltip } from '@mantine/core';
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
        padding: '12px',
        maxWidth: 280,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        <h3
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#5d4037',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Draft Order
        </h3>

        {/* Round 1 */}
        <div
          style={{
            paddingBottom: '15px',
            borderBottom: '2px dashed #d7ccc8',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#8d6e63',
              marginBottom: '8px',
            }}
          >
            Round 1 (1→{players.length})
          </div>
          <div
            style={{
              display: 'flex',
              gap: '4px',
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
            paddingBottom: '15px',
            borderBottom: '2px dashed #d7ccc8',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#8d6e63',
              marginBottom: '8px',
            }}
          >
            Round 2 ({players.length}→1)
          </div>
          <div
            style={{
              display: 'flex',
              gap: '4px',
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
            gap: '12px',
            background: 'rgba(0,0,0,0.03)',
            padding: '8px',
            borderRadius: '6px',
            borderTop: '2px dashed #d7ccc8',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
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
            <span
              style={{
                fontSize: '11px',
                color: '#8d6e63',
              }}
            >
              Settlement
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
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
            <span
              style={{
                fontSize: '11px',
                color: '#8d6e63',
              }}
            >
              Road
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
