import { Player, PLAYER_COLOR_HEX } from '@catan/shared';
import { Avatar, Badge, Card, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';
import { useCurrentPlayer, useGameStore } from '../stores/gameStore';

type GamePlayerListProps = {
  players: Player[];
};

// Resource icon mapping
const RESOURCE_ICONS: Record<string, string> = {
  wood: '🪵',
  brick: '🧱',
  sheep: '🐑',
  wheat: '🌾',
  ore: '⛰️',
};

export function GamePlayerList({ players }: GamePlayerListProps) {
  // Get active player from store for turn highlighting
  const { id: activePlayerId } = useCurrentPlayer();

  // Read all player resources once at the top level
  const allPlayerResources = useGameStore((state) => state.playerResources);

  // Color mapping for backgrounds
  const colorMap: Record<string, string> = PLAYER_COLOR_HEX;

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
    >
      {players.map((player) => {
        const isActiveTurn = player.id === activePlayerId;
        const initials = player.nickname.slice(0, 2).toUpperCase();
        const playerColorHex = PLAYER_COLOR_HEX[player.color] || player.color;
        const playerResources = allPlayerResources[player.id] || {
          wood: 0,
          brick: 0,
          sheep: 0,
          wheat: 0,
          ore: 0,
        };

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

                {/* Resource counts */}
                <Stack gap={2} mt="xs">
                  {Object.entries(playerResources).map(([type, count]) => (
                    <Text
                      key={type}
                      size="xs"
                      c="dimmed"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>{RESOURCE_ICONS[type]}</span>
                      <span>{count}</span>
                    </Text>
                  ))}
                </Stack>

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
