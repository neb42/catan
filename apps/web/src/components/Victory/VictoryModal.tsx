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
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {winnerNickname} Wins!
            </Text>
          </motion.div>

          {/* Winner VP breakdown */}
          <Badge size="xl" color="yellow" variant="filled" radius="lg">
            {winnerVP?.total} Victory Points
          </Badge>

          {/* All players VP table */}
          <Stack gap="sm" w="100%">
            <Text fw={700} ta="center">
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
                      : '1px solid #EEE',
                    backgroundColor: isWinner ? '#FFF9E6' : 'white',
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
                      <Text fw={isWinner ? 700 : 500}>{player.nickname}</Text>
                      {isWinner && (
                        <Badge color="yellow" size="xs">
                          WINNER
                        </Badge>
                      )}
                    </Group>
                    <Group gap={4}>
                      <Text size="sm" title="Settlements">
                        {vp?.settlements || 0}
                      </Text>
                      <Text size="sm" title="Cities">
                        {Math.floor((vp?.cities || 0) / 2)}
                      </Text>
                      {(vp?.longestRoad || 0) > 0 && (
                        <Text size="sm" title="Longest Road">
                          2
                        </Text>
                      )}
                      {(vp?.largestArmy || 0) > 0 && (
                        <Text size="sm" title="Largest Army">
                          2
                        </Text>
                      )}
                      {(vp?.victoryPointCards || 0) > 0 && (
                        <Text size="sm" title="VP Cards">
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
            <Button variant="light" onClick={handleClose}>
              View Board
            </Button>
            <Button color="teal" onClick={handleReturnToLobby}>
              Return to Lobby
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
