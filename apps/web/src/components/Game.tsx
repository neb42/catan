import { Box, Container, Stack, Title, Text } from '@mantine/core';
import { Board } from './Board/Board';
import { useGameStore } from '../stores/gameStore';

export function Game() {
  const board = useGameStore(state => state.board);
  
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
        minHeight: '100vh',
        backgroundColor: '#F9F4EF', // Warm beige from Phase 1.1
        display: 'grid',
        gridTemplateColumns: '250px 1fr 200px',
        gridTemplateRows: '1fr 150px',
        gap: '16px',
        padding: '16px'
      }}
    >
      {/* Player info - left sidebar */}
      <Box style={{ gridColumn: '1', gridRow: '1 / 3' }}>
        {/* Placeholder for player info */}
      </Box>
      
      {/* Board - center */}
      <Box style={{ gridColumn: '2', gridRow: '1' }}>
        <Board board={board} />
      </Box>
      
      {/* Action history - right sidebar */}
      <Box style={{ gridColumn: '3', gridRow: '1 / 3' }}>
        {/* Placeholder for action history */}
      </Box>
      
      {/* Player actions - bottom */}
      <Box style={{ gridColumn: '2', gridRow: '2' }}>
        {/* Placeholder for player actions */}
      </Box>
    </Box>
  );
}
