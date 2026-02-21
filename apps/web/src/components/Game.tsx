import { useState } from 'react';
import { Box, Button, Container, Stack, Title, Text } from '@mantine/core';
import { Board } from './Board/Board';
import {
  useGameStore,
  useCurrentPlayer,
  useSocket,
  useTurnPhase,
  useGameEnded,
  useVictoryState,
  useOrderedPlayers,
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
import { VPRevealOverlay, VictoryModal } from './Victory';
import { DisconnectOverlay } from './DisconnectOverlay';
import { SettingsButton, SettingsPanel } from './Settings';

export function Game() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const board = useGameStore(useShallow((state) => state.board));
  const players = useGameStore(
    useShallow((state) => state.room?.players || []),
  );
  const playerOrder = useGameStore(
    useShallow((state) => state.room?.playerOrder || []),
  );
  const orderedPlayers = useOrderedPlayers();
  const setVictoryPhase = useGameStore((s) => s.setVictoryPhase);
  const { id: currentPlayerId } = useCurrentPlayer();
  const socket = useSocket();
  const { phase: placementPhase } = usePlacementState();
  const turnPhase = useTurnPhase();
  const gameEnded = useGameEnded();
  const { victoryPhase } = useVictoryState();

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
        display: 'grid',
        gridTemplateRows: '1fr auto',
        // gridTemplateColumns: 'minmax(250px, 20%) minmax(600px, 2fr) minmax(350px, 20%)',
        gridTemplateColumns: '300px minmax(600px, 2fr) minmax(350px, 20%)',
        width: '100%',
        height: '100vh',
        backgroundColor: '#F9F4EF', // Warm beige from Phase 1.1
        gap: '16px',
        padding: '16px 16px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Placement UI (only during setup) - absolute positioned overlays */}
      {placementPhase && (
        <Stack
          style={{
            gridRowStart: 1,
            gridRowEnd: 3,
            gridColumn: 3,
            paddingLeft: 16,
            paddingRight: 44,
            display: 'flex',
            flexDirection: 'column',
          }}
          gap="md"
        >
          <PlacementBanner players={orderedPlayers} />
          <DraftOrderDisplay players={orderedPlayers} />
        </Stack>
      )}

      {/* Row 1, Column 1: Player list */}
      <Box
        style={{
          gridRowStart: 1,
          gridRowEnd: 3,
          gridColumn: 1,
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflowY: 'auto',
        }}
      >
        <GamePlayerList players={orderedPlayers} />
      </Box>

      {/* Row 1, Column 2: Board */}
      <Box
        style={{
          gridRow: 1,
          gridColumn: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Board board={board} />
      </Box>

      {/* Row 1, Column 3: Turn controls and dice roller (main game phase only) */}
      {isMainGamePhase && (
        <Stack
          style={{
            gridRowStart: 1,
            gridRowEnd: 3,
            gridColumn: 3,
            paddingLeft: 16,
            paddingRight: 44,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
          }}
          gap="md"
        >
          <Stack gap="md">
            <TurnControls />
            <DiceRoller />
          </Stack>
          <BuildControls />
        </Stack>
      )}

      {/* Row 2, Columns 1-3: Cards and building controls */}
      {isMainGamePhase && (
        <Box
          style={{
            gridRow: 2,
            gridColumn: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            // padding: '0 16px 16px',
            gap: '16px',
          }}
        >
          <Box
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end',
              width: '100%',
              height: '100%',
            }}
          >
            <ResourceHand />
          </Box>
        </Box>
      )}

      {/* Placement controls at bottom center - absolute positioned overlay */}
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
      <GameLog />

      {/* Debug panel - development only */}
      <DebugPanel />

      {/* Show Results button when modal has been dismissed */}
      {gameEnded && victoryPhase === 'dismissed' && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
          }}
        >
          <Button
            color="yellow"
            size="lg"
            onClick={() => setVictoryPhase('modal')}
          >
            🏆 Show Results
          </Button>
        </div>
      )}

      {/* Victory announcement - overlays when game ends */}
      {gameEnded && victoryPhase === 'reveal' && <VPRevealOverlay />}
      {gameEnded && victoryPhase === 'modal' && <VictoryModal />}

      {/* Settings button and panel */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 25,
        }}
      >
        <SettingsButton onClick={() => setSettingsOpen(true)} />
      </div>
      <SettingsPanel
        opened={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Disconnect overlay - blocks all interaction when any player disconnects */}
      <DisconnectOverlay />
    </Box>
  );
}
