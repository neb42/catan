import { Box, Container, Stack, Title, Text } from '@mantine/core';
import { Board } from './Board/Board';
import {
  useGameStore,
  useCurrentPlayer,
  useSocket,
  useTurnPhase,
} from '../stores/gameStore';
import { PlacementBanner } from './PlacementBanner';
import { DraftOrderDisplay } from './DraftOrderDisplay';
import { PlacementControls } from './Board/PlacementControls';
import { usePlacementState } from '../hooks/usePlacementState';
import { GamePlayerList } from './GamePlayerList';
import { useShallow } from 'zustand/react/shallow';
import { DiceRoller } from './DiceRoller/DiceRoller';
import { TurnControls } from './TurnControls/TurnControls';
import { ResourceHand } from './ResourceHand/ResourceHand';
import { BuildControls } from './BuildControls/BuildControls';
import { TradeModal } from './Trade/TradeModal';
import { TradeResponseModal } from './Trade/TradeResponseModal';
import { TradeButton } from './Trade/TradeButton';
import { DebugPanel } from './Debug/DebugPanel';
import {
  DiscardModal,
  StealModal,
  WaitingForDiscardsOverlay,
} from '@web/components/Robber';
import { GameLog } from '@web/components/Feedback';
import { RoadBuildingOverlay } from './CardPlay/RoadBuildingOverlay';
import { ResourcePickerModal } from './CardPlay/ResourcePickerModal';
import { MonopolyModal } from './CardPlay/MonopolyModal';
import { DevCardHand } from './DevCard/DevCardHand';

export function Game() {
  const board = useGameStore(useShallow((state) => state.board));
  const players = useGameStore(
    useShallow((state) => state.room?.players || []),
  );
  const { id: currentPlayerId } = useCurrentPlayer();
  const socket = useSocket();
  const { phase: placementPhase } = usePlacementState();
  const turnPhase = useTurnPhase();

  // Determine which phase UI to show
  const isMainGamePhase = placementPhase === null && turnPhase !== null;

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
        <GamePlayerList players={players} />
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

      {/* Main game phase UI (dice roller, turn controls, resource hand, build controls) */}
      {isMainGamePhase && (
        <>
          {/* Game controls panel (top-right) */}
          <div
            style={{
              position: 'absolute',
              top: 80,
              right: 16,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <TurnControls />
            <DiceRoller />
          </div>

          {/* Resource hand and build controls (bottom center) */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '16px',
              zIndex: 20,
            }}
          >
            <ResourceHand />
            <DevCardHand />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: '16px',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'flex-end',
            }}
          >
            <TradeButton />
            <BuildControls />
          </div>
        </>
      )}

      {/* Trade modals - render at root level, they control their own visibility */}
      <TradeModal />
      <TradeResponseModal />

      {/* Robber modals - render at root level, they control their own visibility */}
      <DiscardModal />
      <StealModal />
      <WaitingForDiscardsOverlay />

      {/* Dev card modals - render at root level, they control their own visibility */}
      <RoadBuildingOverlay />
      <ResourcePickerModal />
      <MonopolyModal />

      {/* Game log - shows action history */}
      {/* <GameLog /> */}

      {/* Debug panel - development only */}
      <DebugPanel />
    </Box>
  );
}
