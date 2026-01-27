import { motion } from 'motion/react';
import { Paper, Text, Group, Badge } from '@mantine/core';
import { usePlacementState } from '../hooks/usePlacementState';

// Player color hex values
const PLAYER_COLOR_HEX: Record<string, string> = {
  red: '#E53935',
  blue: '#1E88E5',
  white: '#F5F5F5',
  orange: '#FB8C00',
  green: '#43A047',
  yellow: '#FDD835',
  purple: '#8E24AA',
  brown: '#6D4C41',
};

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
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
      }}
    >
      <Paper
        shadow="md"
        p="sm"
        radius="md"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderLeft: `4px solid ${colorHex}`,
        }}
      >
        <Group gap="sm">
          {isMyTurn ? (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Text fw={700} size="lg" c="dark">
                Your Turn: {actionText}
              </Text>
            </motion.div>
          ) : (
            <Text size="lg" c="dimmed">
              <Text span fw={600} style={{ color: colorHex }}>
                {currentPlayer.nickname}
              </Text>
              {' is placing a '}
              <Text span fw={500}>
                {phase}
              </Text>
            </Text>
          )}

          <Badge variant="light" color="gray" size="sm">
            Round {draftRound}
          </Badge>
        </Group>
      </Paper>
    </motion.div>
  );
}
