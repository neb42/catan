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
        background: 'rgba(253, 246, 227, 0.98)',
        backdropFilter: 'blur(8px)',
        minWidth: 320,
        textAlign: 'center',
        border: '4px solid #E53935',
        borderRadius: '12px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
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

        <Text size="md" style={{ color: '#5d4037' }}>
          Waiting for players to discard cards...
        </Text>

        {waitingPlayerNames.length > 0 && (
          <Paper
            p="sm"
            radius="md"
            style={{
              background: 'rgba(0,0,0,0.03)',
              border: '2px dashed #d7ccc8',
              width: '100%',
            }}
          >
            <Text size="sm" fw={500} style={{ color: '#5d4037' }}>
              Still discarding:
            </Text>
            <Text size="sm" style={{ color: '#5d4037' }}>
              {waitingPlayerNames.join(', ')}
            </Text>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
