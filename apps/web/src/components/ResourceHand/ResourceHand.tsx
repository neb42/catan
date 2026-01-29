import { Paper, Text, Stack, Group } from '@mantine/core';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore, usePlayerResources } from '../../stores/gameStore';

// Resource card configuration
const RESOURCE_CARDS: Record<
  string,
  { color: string; icon: string; label: string }
> = {
  wood: { color: '#228B22', icon: '🪵', label: 'Wood' },
  brick: { color: '#B22222', icon: '🧱', label: 'Brick' },
  sheep: { color: '#90EE90', icon: '🐑', label: 'Sheep' },
  wheat: { color: '#FFD700', icon: '🌾', label: 'Wheat' },
  ore: { color: '#708090', icon: '⛰️', label: 'Ore' },
};

// Card dimensions (playing card proportions ~2.5" x 3.5" = ~0.714 ratio)
const CARD_WIDTH = 60;
const CARD_HEIGHT = 85;

interface ResourceCardProps {
  type: string;
  index: number;
  totalCards: number;
  cardIndex: number;
}

function ResourceCard({
  type,
  index,
  totalCards,
  cardIndex,
}: ResourceCardProps) {
  const config = RESOURCE_CARDS[type];
  if (!config) return null;

  // Calculate fan angle and offset
  const centerIndex = (totalCards - 1) / 2;
  const offsetFromCenter = cardIndex - centerIndex;
  const rotation = offsetFromCenter * 4; // 4 degrees per card from center
  const yOffset = Math.abs(offsetFromCenter) * 3; // Slight parabolic lift

  return (
    <motion.div
      layoutId={`resource-card-${type}-${index}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: yOffset,
        rotate: rotation,
      }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        layout: { duration: 0.4, ease: 'easeOut' },
        opacity: { duration: 0.2 },
      }}
      whileHover={{
        y: yOffset - 15,
        scale: 1.1,
        zIndex: 100,
        transition: { duration: 0.15 },
      }}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginLeft: cardIndex === 0 ? 0 : -25, // Overlap cards
        cursor: 'pointer',
        transformOrigin: 'bottom center',
        position: 'relative',
        zIndex: cardIndex,
      }}
    >
      <Paper
        shadow="md"
        radius="md"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: config.color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Card pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />

        {/* Resource icon */}
        <Text
          style={{
            fontSize: '1.8rem',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          }}
        >
          {config.icon}
        </Text>

        {/* Resource label */}
        <Text
          size="xs"
          fw={600}
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            marginTop: 4,
          }}
        >
          {config.label}
        </Text>
      </Paper>
    </motion.div>
  );
}

export function ResourceHand() {
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const resources = usePlayerResources(myPlayerId || '');

  // Generate individual card objects from resource counts
  // Order: wood, brick, sheep, wheat, ore (grouped by type)
  const cards: Array<{ type: string; index: number }> = [];
  const resourceOrder = ['wood', 'brick', 'sheep', 'wheat', 'ore'];

  for (const type of resourceOrder) {
    const count = resources[type as keyof typeof resources] || 0;
    for (let i = 0; i < count; i++) {
      cards.push({ type, index: i });
    }
  }

  const totalCards = cards.length;

  // Empty state
  if (totalCards === 0) {
    return (
      <Paper
        shadow="sm"
        radius="lg"
        p="md"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          textAlign: 'center',
        }}
      >
        <Stack gap="xs" align="center">
          <Text size="lg" style={{ opacity: 0.5 }}>
            🃏
          </Text>
          <Text size="sm" c="dimmed" fw={500}>
            No resources yet
          </Text>
          <Text size="xs" c="dimmed">
            Roll the dice to collect resources!
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        perspective: 1000,
      }}
    >
      <Stack gap="xs" align="center">
        {/* Header with count */}
        <Text
          size="sm"
          fw={600}
          c="dimmed"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          Your Resources ({totalCards})
        </Text>

        {/* Resource counts */}
        <Group gap={2} mt="xs">
          {Object.entries(resources).map(([type, count]) => (
            <Text
              key={type}
              size="xs"
              c="dimmed"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{RESOURCE_CARDS[type].icon}</span>
              <span>{count}</span>
            </Text>
          ))}
        </Group>

        {/* Fanned hand container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingTop: 10,
            paddingBottom: 10,
            minHeight: CARD_HEIGHT + 20,
          }}
        >
          <AnimatePresence mode="popLayout">
            {cards.map((card, cardIndex) => (
              <ResourceCard
                key={`${card.type}-${card.index}`}
                type={card.type}
                index={card.index}
                totalCards={totalCards}
                cardIndex={cardIndex}
              />
            ))}
          </AnimatePresence>
        </div>
      </Stack>
    </Paper>
  );
}
