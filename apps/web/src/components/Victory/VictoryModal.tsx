import { Modal, Stack, Text, Group, Badge, Button, Tabs } from '@mantine/core';
import { motion } from 'motion/react';
import { useEffect, useRef, useCallback, useState } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';
import type { CreateTypes } from 'canvas-confetti';
import {
  useVictoryState,
  useGameStore,
  useGameStats,
  useRematchState,
} from '../../stores/gameStore';
import { ResultsBreakdown } from './ResultsBreakdown';
import { DevCardStatsChart } from './DevCardStatsChart';
import { DiceDistributionChart } from './DiceDistributionChart';
import { ResourceStatsChart } from './ResourceStatsChart';

/**
 * Victory modal showing winner announcement with confetti celebration.
 * Per CONTEXT.md: "Large centered modal with board still visible (dimmed) behind.
 * Modal shows: winner highlighted, ALL players' final VP with full component breakdown.
 * Festive celebration effects: confetti, fireworks.
 * Two actions: 'Close' (dismiss modal to view final board state) and 'Return to Lobby'."
 */
export function VictoryModal() {
  const { winnerId, winnerNickname, winnerVP, allPlayerVP, victoryPhase } =
    useVictoryState();
  const room = useGameStore((s) => s.room);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const sendMessage = useGameStore((s) => s.sendMessage);
  const setVictoryPhase = useGameStore((s) => s.setVictoryPhase);
  const gameStats = useGameStats();
  const { readyPlayers, readyCount, totalPlayers } = useRematchState();
  const [hasVotedRematch, setHasVotedRematch] = useState(false);
  const confettiRef = useRef<CreateTypes | null>(null);

  // Derive modal visibility from store state
  // const modalOpen = victoryPhase === 'modal';
  const modalOpen = true;

  const handleInit = useCallback(({ confetti }: { confetti: CreateTypes }) => {
    confettiRef.current = confetti;
  }, []);

  // Fire confetti/fireworks on mount
  useEffect(() => {
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      if (Date.now() < end && confettiRef.current) {
        confettiRef.current({
          particleCount: 30,
          spread: 70,
          origin: { x: Math.random(), y: Math.random() * 0.3 },
          colors: ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#FDD835'],
        });
        requestAnimationFrame(frame);
      }
    };
    // Small delay to ensure confetti ref is ready
    const startDelay = setTimeout(frame, 100);
    return () => clearTimeout(startDelay);
  }, []);

  const handleClose = () => setVictoryPhase('dismissed');
  const handleReturnToLobby = () => {
    // Navigate to home/lobby - use window.location for simplicity
    window.location.href = '/';
  };

  const handleRematch = () => {
    if (hasVotedRematch || !sendMessage || !myPlayerId) return;

    sendMessage({
      type: 'request_rematch',
      playerId: myPlayerId,
    });

    setHasVotedRematch(true);
  };

  return (
    <>
      <ReactCanvasConfetti
        onInit={handleInit}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1001,
          pointerEvents: 'none',
        }}
      />

      <Modal
        opened={modalOpen}
        onClose={handleClose}
        centered
        size="lg"
        withCloseButton={false}
        overlayProps={{ blur: 2, backgroundOpacity: 0.6 }}
        zIndex={1002}
        styles={{
          content: {
            background: '#fdf6e3',
            border: '4px solid #8d6e63',
            borderRadius: '12px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            maxHeight: '80vh',
            overflow: 'auto',
          },
          header: {
            background: 'transparent',
          },
          body: {
            color: '#5d4037',
          },
        }}
      >
        <Stack align="center" gap="lg" p="md">
          {/* Winner announcement */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Text
              size="2.5rem"
              fw={900}
              ta="center"
              style={{ fontFamily: 'Fraunces, serif', color: '#5d4037' }}
            >
              {winnerNickname} Wins!
            </Text>
          </motion.div>

          {/* Winner VP breakdown */}
          <Badge
            size="xl"
            variant="filled"
            radius="lg"
            styles={{
              root: {
                background: '#f1c40f',
                color: '#333',
              },
            }}
          >
            {winnerVP?.total} Victory Points
          </Badge>

          <Tabs
            defaultValue="dice"
            styles={{
              root: { background: '#fdf6e3' },
              tab: {
                color: '#5d4037',
                fontFamily: 'Fraunces, serif',
                '&[data-active]': {
                  borderBottomColor: '#8d6e63',
                  color: '#8d6e63',
                },
              },
              panel: { paddingTop: 16 },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              {gameStats && (
                <>
                  <Tabs.Tab value="dice">Dice Stats</Tabs.Tab>
                  <Tabs.Tab value="devcards">Dev Cards</Tabs.Tab>
                  <Tabs.Tab value="resources">Resources</Tabs.Tab>
                </>
              )}
            </Tabs.List>


            <Tabs.Panel value="overview">
              <ResultsBreakdown
                players={room?.players || []}
                allPlayerVP={allPlayerVP}
              />
            </Tabs.Panel>

            {gameStats && (
              <>
                <Tabs.Panel value="dice">
                  <DiceDistributionChart diceRolls={gameStats.diceRolls} />
                </Tabs.Panel>

                <Tabs.Panel value="devcards">
                  <DevCardStatsChart
                    devCardStats={gameStats.devCardStats}
                    players={room?.players || []}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="resources">
                  <ResourceStatsChart
                    resourceStats={gameStats.resourceStats}
                    players={room?.players || []}
                  />
                </Tabs.Panel>
              </>
            )}
          </Tabs>

          {/* Action buttons */}
          <Stack w="100%" gap="xs">
            {/* Ready count display */}
            {readyCount > 0 && (
              <Text size="sm" ta="center" c="#5d4037">
                Ready for rematch: {readyCount}/{totalPlayers} players
              </Text>
            )}

            <Group gap="md" justify="center">
              <Button
                variant="outline"
                onClick={handleClose}
                styles={{
                  root: {
                    border: '2px solid #8d6e63',
                    color: '#8d6e63',
                    background: 'transparent',
                    '&:hover': {
                      background: 'rgba(141, 110, 99, 0.1)',
                    },
                  },
                }}
              >
                View Board
              </Button>

              <Button
                onClick={handleRematch}
                disabled={hasVotedRematch}
                styles={{
                  root: {
                    background: hasVotedRematch ? '#ccc' : '#8d6e63',
                    color: '#fdf6e3',
                    '&:hover': {
                      background: hasVotedRematch ? '#ccc' : '#6d4c41',
                    },
                  },
                }}
              >
                {hasVotedRematch ? 'Waiting for others...' : 'Rematch'}
              </Button>
            </Group>

            {/* Show checkmarks next to player names who voted */}
            {readyCount > 0 && room?.players && (
              <Stack gap={4}>
                {room.players.map((p) => (
                  <Group key={p.id} gap="xs" justify="center">
                    <Text size="xs" c="#5d4037">
                      {p.nickname}
                    </Text>
                    {readyPlayers.includes(p.id) && <Text size="xs">✓</Text>}
                  </Group>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Modal>
    </>
  );
}
