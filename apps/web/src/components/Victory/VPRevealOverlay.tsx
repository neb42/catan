import { Overlay, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useGameStore, useVictoryState } from '../../stores/gameStore';

/**
 * Brief overlay showing VP card reveal before victory modal.
 * Per CONTEXT.md: "Dedicated reveal overlay appears BEFORE victory modal:
 * 'Revealed: X VP cards!' Brief overlay duration (1-2 seconds),
 * then auto-transitions to victory modal."
 */
export function VPRevealOverlay() {
  const { revealedVPCards } = useVictoryState();
  const setVictoryPhase = useGameStore((s) => s.setVictoryPhase);

  // Calculate total VP cards revealed
  const totalCards = revealedVPCards.reduce((sum, p) => sum + p.cardCount, 0);

  // Auto-transition to modal after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVictoryPhase('modal');
    }, 1500);
    return () => clearTimeout(timer);
  }, [setVictoryPhase]);

  return (
    <Overlay blur={2} color="#000" backgroundOpacity={0.7} zIndex={1000}>
      <Stack align="center" justify="center" h="100vh">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Text
            size="3rem"
            fw={900}
            c="white"
            ta="center"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Revealed: {totalCards} VP Card{totalCards !== 1 ? 's' : ''}!
          </Text>
        </motion.div>
      </Stack>
    </Overlay>
  );
}
