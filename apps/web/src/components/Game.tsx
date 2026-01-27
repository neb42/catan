import { Box, Container, Stack, Title, Text } from '@mantine/core';
import { Board } from './Board/Board';
import { useGameStore, useCurrentPlayer, useSocket } from '../stores/gameStore';
import { PlacementBanner } from './PlacementBanner';
import { DraftOrderDisplay } from './DraftOrderDisplay';
import { PlacementControls } from './Board/PlacementControls';
import { usePlacementState } from '../hooks/usePlacementState';
import PlayerList from './PlayerList';

export function Game() {
  const board = useGameStore((state) => state.board);
  const players = useGameStore((state) => state.room?.players || []);
  const { id: currentPlayerId } = useCurrentPlayer();
  const socket = useSocket();
  const { phase: placementPhase } = usePlacementState();

  if (!board) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <Title order={2}>Loading board...</Title>
          <Text c="dimmed">Generating your adventure...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Box
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#F9F4EF', // Warm beige from Phase 1.1
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Placement UI (only during setup) */}
      {placementPhase && (
        <>
          <PlacementBanner players={players} />
          <div style={{ position: 'absolute', top: 80, right: 16, zIndex: 10 }}>
            <DraftOrderDisplay players={players} />
          </div>
        </>
      )}

      {/* Board in center */}
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Board board={board} />
      </Box>

      {/* Player list on left side - simplified for Game view compared to Lobby */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 16,
          width: 300,
          zIndex: 10,
          // Scale down slightly to fit sidebar better
          transform: 'scale(0.85)',
          transformOrigin: 'top left',
        }}
      >
        <PlayerList
          players={players}
          currentPlayerId={currentPlayerId}
          onColorChange={() => {}} // No color changing during game
          onReadyToggle={() => {}} // No ready toggling during game
        />
      </div>

      {/* Placement controls at bottom center */}
      {placementPhase && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
        >
          <PlacementControls />
        </div>
      )}
    </Box>
  );
}
