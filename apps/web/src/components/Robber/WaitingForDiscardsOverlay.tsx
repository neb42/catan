import { Paper, Text, Stack, Loader } from '@mantine/core';
import {
  useWaitingForDiscards,
  usePlayersWhoMustDiscard,
  useDiscardRequired,
  useGameStore,
} from '../../stores/gameStore';
import { useShallow } from 'zustand/react/shallow';

export function WaitingForDiscardsOverlay() {
  const waitingForDiscards = useWaitingForDiscards();
  const playersWhoMustDiscard = usePlayersWhoMustDiscard();
  const discardRequired = useDiscardRequired();
  const room = useGameStore(useShallow((state) => state.room));

  // Only show if:
  // 1. We're waiting for discards
  // 2. We don't need to discard ourselves (if we need to discard, we see DiscardModal)
  if (!waitingForDiscards || discardRequired) {
    return null;
  }

  // Get nicknames of players who still need to discard
  const waitingPlayerNames = playersWhoMustDiscard
    .map((playerId) => {
      const player = room?.players.find((p) => p.id === playerId);
      return player?.nickname || 'Unknown';
    })
    .filter(Boolean);

  return (
    <Paper
      shadow="lg"
      radius="lg"
      p="xl"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        minWidth: 320,
        textAlign: 'center',
        border: '3px solid #E53935',
      }}
    >
      <Stack gap="md" align="center">
        <Text
          size="xl"
          fw={800}
          style={{ fontFamily: 'Fraunces, serif', color: '#E53935' }}
        >
          🚨 Robber!
        </Text>

        <Loader color="red" size="md" />

        <Text size="md" c="dimmed">
          Waiting for players to discard cards...
        </Text>

        {waitingPlayerNames.length > 0 && (
          <Paper
            p="sm"
            radius="md"
            style={{ backgroundColor: '#FFF3E0', width: '100%' }}
          >
            <Text size="sm" fw={500}>
              Still discarding:
            </Text>
            <Text size="sm" c="dimmed">
              {waitingPlayerNames.join(', ')}
            </Text>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
