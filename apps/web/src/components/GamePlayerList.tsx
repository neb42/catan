import { Player, PLAYER_COLOR_HEX } from '@catan/shared';
import {
  Avatar,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { motion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import {
  useCurrentPlayer,
  useGameStore,
  useTurnCurrentPlayer,
} from '../stores/gameStore';

type GamePlayerListProps = {
  players: Player[];
};

export function GamePlayerList({ players }: GamePlayerListProps) {
  // Get active player from store for placement phase highlighting
  const { id: placementPlayerId } = useCurrentPlayer();

  // Get current player for main game phase
  const turnCurrentPlayerId = useTurnCurrentPlayer();

  // Use main game player if available, otherwise use placement player
  const activePlayerId = turnCurrentPlayerId || placementPlayerId;

  // Read all player resources once at the top level with shallow equality
  const allPlayerResources = useGameStore(
    useShallow((state) => state.playerResources),
  );

  // Dev card state for badges
  const opponentDevCardCounts = useGameStore((s) => s.opponentDevCardCounts);
  const knightsPlayed = useGameStore((s) => s.knightsPlayed);
  const myDevCards = useGameStore((s) => s.myDevCards);
  const myPlayerId = useGameStore((s) => s.myPlayerId);

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

                {/* Total card count */}
                <Text size="sm" c="dimmed" fw={500}>
                  {Object.values(playerResources).reduce(
                    (sum, count) => sum + count,
                    0,
                  )}{' '}
                  Cards
                </Text>

                {/* Dev card and knight counts */}
                <Group gap="xs">
                  {/* Dev card count */}
                  <Tooltip label="Development cards" position="top">
                    <Badge size="sm" color="violet" variant="light">
                      📜{' '}
                      {player.id === myPlayerId
                        ? myDevCards.length
                        : opponentDevCardCounts[player.id] || 0}
                    </Badge>
                  </Tooltip>

                  {/* Knights played */}
                  {(knightsPlayed[player.id] || 0) > 0 && (
                    <Tooltip label="Knights played" position="top">
                      <Badge size="sm" color="orange" variant="light">
                        ⚔️ {knightsPlayed[player.id]}
                      </Badge>
                    </Tooltip>
                  )}
                </Group>

                {/* Active turn indicator */}
                <Badge
                  size="xs"
                  color="teal"
                  variant="light"
                  mt={2}
                  style={{
                    fontFamily: 'Fraunces, serif',
                    opacity: isActiveTurn ? 1 : 0,
                  }}
                >
                  Current Turn
                </Badge>
              </Stack>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
