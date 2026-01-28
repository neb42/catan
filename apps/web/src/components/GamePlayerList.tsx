import { Player } from '@catan/shared';
import { Avatar, Badge, Card, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';
import { useCurrentPlayer } from '../stores/gameStore';

type GamePlayerListProps = {
  players: Player[];
};

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

export function GamePlayerList({ players }: GamePlayerListProps) {
  // Get active player from store for turn highlighting
  const { id: activePlayerId } = useCurrentPlayer();

  // Color mapping for backgrounds
  const colorMap: Record<string, string> = {
    red: '#E76F51',
    blue: '#264653',
    white: '#FFFFFF',
    orange: '#F4A261',
    green: '#2A9D8F',
    yellow: '#E9C46A',
    purple: '#9B59B6',
    brown: '#8B4513',
  };

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
    >
      {players.map((player) => {
        const isActiveTurn = player.id === activePlayerId;
        const initials = player.nickname.slice(0, 2).toUpperCase();
        const playerColorHex = PLAYER_COLOR_HEX[player.color] || player.color;

        return (
          <motion.div
            key={player.id}
            animate={
              isActiveTurn
                ? {
                    boxShadow: [
                      `0 0 0 0 ${playerColorHex}40`,
                      `0 0 0 8px ${playerColorHex}40`,
                      `0 0 0 0 ${playerColorHex}40`,
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: isActiveTurn ? Infinity : 0 }}
            style={{
              borderRadius: 12, // Matches Card radius="md"
            }}
          >
            <Card
              padding="md"
              radius="md"
              shadow="sm"
              style={{
                minHeight: '140px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                border: isActiveTurn
                  ? `3px solid ${playerColorHex}`
                  : '2px solid #EEE',
                transition: 'transform 0.3s, border 0.3s',
              }}
            >
              <Stack gap="xs" align="center">
                {/* Avatar with initials */}
                <Avatar
                  size={60}
                  radius="xl"
                  style={{
                    backgroundColor: colorMap[player.color] || player.color,
                    color: player.color === 'white' ? '#2D3142' : 'white',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    fontFamily: 'Fraunces, serif',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {initials}
                </Avatar>

                {/* Player name */}
                <Text
                  size="md"
                  fw={700}
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {player.nickname}
                </Text>

                {/* Active turn indicator */}
                {isActiveTurn && (
                  <Badge size="xs" color="blue" variant="light" mt={2}>
                    Taking Turn
                  </Badge>
                )}
              </Stack>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
