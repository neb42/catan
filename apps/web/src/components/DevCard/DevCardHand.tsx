import { Group, Text, Box } from '@mantine/core';
import { useGameStore } from '../../stores/gameStore';
import { DevCardButton } from './DevCardButton';

export function DevCardHand() {
  const myDevCards = useGameStore((s) => s.myDevCards);

  if (myDevCards.length === 0) {
    return null;
  }

  // Separate VP cards for distinct display
  const vpCards = myDevCards.filter((c) => c.type === 'victory_point');
  const playableCards = myDevCards.filter((c) => c.type !== 'victory_point');

  return (
    <Box style={{ marginTop: 16 }}>
      <Text size="sm" fw={500} mb={8} c="dimmed">
        Development Cards
      </Text>
      <Group gap="sm">
        {playableCards.map((card) => (
          <DevCardButton key={card.id} card={card} />
        ))}

        {vpCards.length > 0 && (
          <Box
            style={{
              borderLeft: '2px solid gold',
              paddingLeft: 12,
              display: 'flex',
              gap: 8,
            }}
          >
            {vpCards.map((card) => (
              <DevCardButton key={card.id} card={card} />
            ))}
          </Box>
        )}
      </Group>
    </Box>
  );
}
