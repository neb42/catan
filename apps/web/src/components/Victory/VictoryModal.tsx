import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Button,
  Avatar,
  Card,
} from '@mantine/core';
import { motion } from 'motion/react';
import { useEffect, useRef, useCallback } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';
import type { CreateTypes } from 'canvas-confetti';
import { useVictoryState, useGameStore } from '../../stores/gameStore';
import { PLAYER_COLOR_HEX } from '@catan/shared';

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
  const setVictoryPhase = useGameStore((s) => s.setVictoryPhase);
  const confettiRef = useRef<CreateTypes | null>(null);

  // Derive modal visibility from store state
  const modalOpen = victoryPhase === 'modal';

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

          {/* All players VP table */}
          <Stack gap="sm" w="100%">
            <Text
              fw={700}
              ta="center"
              style={{
                fontFamily: 'Fraunces, serif',
                color: '#5d4037',
                fontSize: '18px',
              }}
            >
              Final Standings
            </Text>
            {room?.players.map((player) => {
              const vp = allPlayerVP[player.id];
              const isWinner = player.id === winnerId;
              return (
                <Card
                  key={player.id}
                  padding="sm"
                  radius="md"
                  style={{
                    border: isWinner
                      ? `3px solid ${PLAYER_COLOR_HEX[player.color]}`
                      : '1px solid #d7ccc8',
                    backgroundColor: isWinner
                      ? 'rgba(241, 196, 15, 0.1)'
                      : 'white',
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Avatar
                        size="sm"
                        radius="xl"
                        style={{
                          backgroundColor: PLAYER_COLOR_HEX[player.color],
                        }}
                      >
                        {player.nickname.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Text
                        fw={isWinner ? 700 : 500}
                        style={{ color: '#5d4037' }}
                      >
                        {player.nickname}
                      </Text>
                      {isWinner && (
                        <Badge
                          size="xs"
                          styles={{
                            root: {
                              background: '#f1c40f',
                              color: '#333',
                            },
                          }}
                        >
                          WINNER
                        </Badge>
                      )}
                    </Group>
                    <Group gap={4}>
                      <Text
                        size="sm"
                        title="Settlements"
                        style={{ color: '#5d4037' }}
                      >
                        {vp?.settlements || 0}
                      </Text>
                      <Text
                        size="sm"
                        title="Cities"
                        style={{ color: '#5d4037' }}
                      >
                        {Math.floor((vp?.cities || 0) / 2)}
                      </Text>
                      {(vp?.longestRoad || 0) > 0 && (
                        <Text
                          size="sm"
                          title="Longest Road"
                          style={{ color: '#5d4037' }}
                        >
                          2
                        </Text>
                      )}
                      {(vp?.largestArmy || 0) > 0 && (
                        <Text
                          size="sm"
                          title="Largest Army"
                          style={{ color: '#5d4037' }}
                        >
                          2
                        </Text>
                      )}
                      {(vp?.victoryPointCards || 0) > 0 && (
                        <Text
                          size="sm"
                          title="VP Cards"
                          style={{ color: '#5d4037' }}
                        >
                          {vp?.victoryPointCards}
                        </Text>
                      )}
                      <Badge color="yellow" variant="light">
                        {vp?.total} VP
                      </Badge>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </Stack>

          {/* Action buttons */}
          <Group gap="md">
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
              onClick={handleReturnToLobby}
              styles={{
                root: {
                  background: '#8d6e63',
                  color: '#fdf6e3',
                  '&:hover': {
                    background: '#6d4c41',
                  },
                },
              }}
            >
              Return to Lobby
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
