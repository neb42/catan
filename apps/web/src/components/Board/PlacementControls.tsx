import { motion, AnimatePresence } from 'motion/react';
import { Button, Group, Text } from '@mantine/core';
import {
  useSelectedLocation,
  useGameStore,
  usePlacementActions,
} from '../../stores/gameStore';
import { usePlacementState } from '../../hooks/usePlacementState';

export function PlacementControls() {
  const selectedLocationId = useSelectedLocation();
  const { phase, isMyTurn } = usePlacementState();
  const { setSelected } = usePlacementActions();
  const sendMessage = useGameStore((state) => state.sendMessage);

  const handleConfirm = () => {
    if (!selectedLocationId || !sendMessage) return;

    if (phase === 'settlement') {
      sendMessage({ type: 'place_settlement', vertexId: selectedLocationId });
    } else if (phase === 'road') {
      sendMessage({ type: 'place_road', edgeId: selectedLocationId });
    }

    setSelected(null);
  };

  const handleCancel = () => {
    setSelected(null);
  };

  if (!isMyTurn || !phase) return null;

  return (
    <AnimatePresence>
      {selectedLocationId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            width: 300,
          }}
        >
          <Group gap="sm">
            <Button variant="default" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm {phase === 'settlement' ? 'Settlement' : 'Road'}
            </Button>
          </Group>
        </motion.div>
      )}

      {/* {!selectedLocationId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: 'rgba(255, 255, 255)',
            padding: '8px 16px',
            borderRadius: 8,
            border: '3px solid rgba(0, 0, 0)',
            width: 300,
            textAlign: 'center',
          }}
        >
          <Text size="sm">
            Click a valid location to place your {phase}
          </Text>
        </motion.div>
      )} */}
    </AnimatePresence>
  );
}
