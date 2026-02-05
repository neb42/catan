import { Loader, Title, Text } from '@mantine/core';

import { useGameStore } from '../stores/gameStore';

/**
 * Full-screen blocking overlay that displays when game is paused due to disconnect.
 * Shows "Waiting for [player name] to reconnect..." with a spinner.
 * Blocks all game interaction until the player reconnects.
 */
export function DisconnectOverlay() {
  const isPaused = useGameStore((s) => s.isPaused);
  const disconnectedNickname = useGameStore(
    (s) => s.disconnectedPlayerNickname,
  );

  if (!isPaused || !disconnectedNickname) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div style={{ textAlign: 'center', color: 'white' }}>
        <Loader size="xl" />
        <Title order={2} mt="xl">
          Waiting for {disconnectedNickname} to reconnect...
        </Title>
        <Text size="sm" c="dimmed" mt="md">
          Game will resume when they return
        </Text>
      </div>
    </div>
  );
}
