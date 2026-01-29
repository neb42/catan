import { Button, Paper, Text, Stack, Badge } from '@mantine/core';
import { motion, AnimatePresence } from 'motion/react';
import {
  useCanEndTurn,
  useTurnNumber,
  useTurnPhase,
  useSocket,
  useIsMyTurnInMainGame,
} from '../../stores/gameStore';

export function TurnControls() {
  const canEndTurn = useCanEndTurn();
  const turnNumber = useTurnNumber();
  const turnPhase = useTurnPhase();
  const isMyTurn = useIsMyTurnInMainGame();
  const sendMessage = useSocket();

  const handleEndTurn = () => {
    if (!canEndTurn || !sendMessage) return;
    sendMessage({ type: 'end_turn' });
  };

  // Only show turn controls during main game phase (not during placement)
  if (turnPhase === null) {
    return null;
  }

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        minWidth: 200,
      }}
    >
      <Stack gap="sm" align="center">
        {/* Turn counter */}
        <Badge
          size="lg"
          variant="light"
          color="gray"
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '0.9rem',
          }}
        >
          Turn {turnNumber}
        </Badge>

        {/* My turn banner */}
        <AnimatePresence>
          {isMyTurn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(32, 201, 151, 0.4)',
                    '0 0 20px 4px rgba(32, 201, 151, 0.3)',
                    '0 0 0 0 rgba(32, 201, 151, 0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ borderRadius: 8 }}
              >
                <Paper
                  p="xs"
                  radius="md"
                  style={{
                    background:
                      'linear-gradient(135deg, #20c997 0%, #12b886 100%)',
                    color: 'white',
                  }}
                >
                  <Text
                    size="sm"
                    fw={700}
                    ta="center"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    It's your turn!
                  </Text>
                </Paper>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase indicator */}
        <Text size="xs" c="dimmed" ta="center">
          {turnPhase === 'roll' ? 'Roll the dice' : 'Trade & Build'}
        </Text>

        {/* End Turn button */}
        <Button
          onClick={handleEndTurn}
          disabled={!canEndTurn}
          size="lg"
          variant={canEndTurn ? 'filled' : 'light'}
          color={canEndTurn ? 'teal' : 'gray'}
          fullWidth
          styles={{
            root: {
              fontWeight: 700,
              fontSize: '1.1rem',
              fontFamily: 'Fraunces, serif',
              transition: 'all 0.2s ease',
              ...(canEndTurn && {
                boxShadow: '0 4px 12px rgba(32, 201, 151, 0.3)',
              }),
            },
          }}
        >
          End Turn
        </Button>
      </Stack>
    </Paper>
  );
}
