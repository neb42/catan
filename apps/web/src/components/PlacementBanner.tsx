import { motion } from 'motion/react';
import { PLAYER_COLOR_HEX } from '@catan/shared';
import { usePlacementState } from '../hooks/usePlacementState';

interface PlacementBannerProps {
  players: Array<{ id: string; nickname: string; color: string }>;
}

export function PlacementBanner({ players }: PlacementBannerProps) {
  const { phase, currentPlayerIndex, isMyTurn, draftRound } =
    usePlacementState();

  if (phase === null || currentPlayerIndex === null) return null;

  const currentPlayer = players[currentPlayerIndex];
  if (!currentPlayer) return null;

  const actionText = phase === 'settlement' ? 'Place Settlement' : 'Place Road';
  const colorHex = PLAYER_COLOR_HEX[currentPlayer.color] || currentPlayer.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div
        style={{
          background: '#fdf6e3',
          border: '4px solid #8d6e63',
          borderLeft: `4px solid ${colorHex}`,
          borderRadius: '12px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {isMyTurn ? (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#5d4037',
                  fontFamily: 'Fraunces, serif',
                }}
              >
                Your Turn: {actionText}
              </span>
            </motion.div>
          ) : (
            <span
              style={{
                fontSize: '18px',
                color: '#8d6e63',
              }}
            >
              <span style={{ fontWeight: 600, color: colorHex }}>
                {currentPlayer.nickname}
              </span>
              {' is placing a '}
              <span style={{ fontWeight: 500, color: '#5d4037' }}>{phase}</span>
            </span>
          )}

          <div
            style={{
              background: 'rgba(141, 110, 99, 0.15)',
              color: '#5d4037',
              border: '1px solid #d7ccc8',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Round {draftRound}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
