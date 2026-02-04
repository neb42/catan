import { Paper, Text, Stack, Group, Divider, Box } from '@mantine/core';
import { motion, AnimatePresence } from 'motion/react';
import { ResourceType } from '@catan/shared';
import { useGameStore, usePlayerResources } from '../../stores/gameStore';
import { ResourceIcon } from '../ResourceIcon/ResourceIcon';
import { DevCardButton } from '../DevCard/DevCardButton';

// Resource card configuration
const RESOURCE_CARD_COLORS: Record<string, string> = {
  wood: '#228B22',
  brick: '#B22222',
  sheep: '#90EE90',
  wheat: '#FFD700',
  ore: '#708090',
};

const RESOURCE_LABELS: Record<string, string> = {
  wood: 'Wood',
  brick: 'Brick',
  sheep: 'Sheep',
  wheat: 'Wheat',
  ore: 'Ore',
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
  const color = RESOURCE_CARD_COLORS[type];
  const label = RESOURCE_LABELS[type];
  if (!color || !label) return null;

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
          backgroundColor: color,
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
        <div style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
          <ResourceIcon type={type as ResourceType} size="lg" />
        </div>

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
          {label}
        </Text>
      </Paper>
    </motion.div>
  );
}

export function ResourceHand() {
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const resources = usePlayerResources(myPlayerId || '');
  const myDevCards = useGameStore((s) => s.myDevCards);

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

  // Separate VP cards for distinct display
  const vpCards = myDevCards.filter((c) => c.type === 'victory_point');
  const playableCards = myDevCards.filter((c) => c.type !== 'victory_point');
  const hasDevCards = myDevCards.length > 0;

  // Empty state - show when BOTH resources and dev cards are empty
  if (totalCards === 0 && !hasDevCards) {
    return (
      <Paper
        radius="md"
        p="md"
        style={{
          background: '#fdf6e3',
          border: '4px solid #8d6e63',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
          textAlign: 'center',
          width: '100%',
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
      radius="md"
      p="md"
      style={{
        background: '#fdf6e3',
        border: '4px solid #8d6e63',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        perspective: 1000,
        width: '100%',
      }}
    >
      <Stack gap="xs" align="center">
        {/* Combined header */}
        <div
          style={{
            borderBottom: '2px dashed #d7ccc8',
            paddingBottom: '8px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Text
            size="sm"
            fw={600}
            c="dimmed"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            YOUR HAND
          </Text>
        </div>

        {/* Horizontal layout for resources and dev cards */}
        <Group
          gap="md"
          align="flex-start"
          wrap="nowrap"
          style={{ width: '100%' }}
        >
          {/* Resources section */}
          {totalCards > 0 && (
            <Stack gap="xs" align="center" style={{ flex: 1 }}>
              <Text
                size="sm"
                fw={600}
                c="dimmed"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                Resources ({totalCards})
              </Text>

              {/* Resource counts */}
              <Group gap={2}>
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
                    <ResourceIcon type={type as ResourceType} size="xs" />
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
          )}

          {/* Vertical divider (only show when both resources and dev cards exist) */}
          {totalCards > 0 && hasDevCards && (
            <Divider
              orientation="vertical"
              style={{
                borderColor: '#d7ccc8',
                height: 'auto',
                alignSelf: 'stretch',
              }}
            />
          )}

          {/* Development cards section */}
          {hasDevCards && (
            <Stack gap="xs" align="flex-start" style={{ flex: 1 }}>
              <Text
                size="sm"
                fw={600}
                c="dimmed"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
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
            </Stack>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
