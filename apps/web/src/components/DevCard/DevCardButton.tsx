import { Tooltip, Box, Paper, Text } from '@mantine/core';
import { motion } from 'motion/react';
import { DevelopmentCardType, OwnedDevCard } from '@catan/shared';
import { useGameStore } from '../../stores/gameStore';

interface DevCardButtonProps {
  card: OwnedDevCard;
}

// Card display names and icons
const CARD_INFO: Record<
  DevelopmentCardType,
  { name: string; icon: string; color: string }
> = {
  knight: { name: 'Knight', icon: '⚔️', color: '#8B4513' },
  victory_point: { name: 'Victory Point', icon: '⭐', color: '#FFD700' },
  road_building: { name: 'Road Building', icon: '🛤️', color: '#654321' },
  year_of_plenty: { name: 'Year of Plenty', icon: '🌾', color: '#228B22' },
  monopoly: { name: 'Monopoly', icon: '💰', color: '#4169E1' },
};

export function DevCardButton({ card }: DevCardButtonProps) {
  const myId = useGameStore((s) => s.myPlayerId);
  const turnCurrentPlayerId = useGameStore((s) => s.turnCurrentPlayerId);
  const turnPhase = useGameStore((s) => s.turnPhase);
  const turnNumber = useGameStore((s) => s.turnNumber);
  const hasPlayedDevCardThisTurn = useGameStore(
    (s) => s.hasPlayedDevCardThisTurn,
  );
  const devCardPlayPhase = useGameStore((s) => s.devCardPlayPhase);
  const sendMessage = useGameStore((s) => s.sendMessage);

  const info = CARD_INFO[card.type];

  // Check if card can be played
  let canPlay = true;
  let disabledReason = '';

  // VP cards are never "played"
  if (card.type === 'victory_point') {
    canPlay = false;
    disabledReason = 'Victory Point cards score automatically';
  } else {
    // Block during dev card play phase (road building, year of plenty, monopoly)
    if (devCardPlayPhase !== null && devCardPlayPhase !== 'none') {
      canPlay = false;
      disabledReason = 'Complete dev card action first';
    }
    // Must be our turn
    else if (turnCurrentPlayerId !== myId) {
      canPlay = false;
      disabledReason = 'Not your turn';
    }
    // Knight can be played before/after roll, others need main phase
    else if (card.type !== 'knight' && turnPhase !== 'main') {
      canPlay = false;
      disabledReason = 'Must roll dice first';
    }
    // Can't play same turn purchased
    else if (card.purchasedOnTurn === turnNumber) {
      canPlay = false;
      disabledReason = 'Cannot play card purchased this turn';
    }
    // One dev card per turn
    else if (hasPlayedDevCardThisTurn) {
      canPlay = false;
      disabledReason = 'Already played a dev card this turn';
    }
  }

  const handleClick = () => {
    if (!canPlay || !sendMessage) return;
    sendMessage({
      type: 'play_dev_card',
      cardId: card.id,
    });
  };

  // Card dimensions (slightly larger than resource cards)
  const CARD_WIDTH = 80;
  const CARD_HEIGHT = 110;

  const cardContent = (
    <motion.div
      whileHover={
        canPlay
          ? {
              scale: 1.05,
              y: -8,
              zIndex: 100,
            }
          : undefined
      }
      whileTap={canPlay ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        cursor: canPlay ? 'pointer' : 'not-allowed',
        transformOrigin: 'bottom center',
        opacity: canPlay ? 1 : 0.5,
        pointerEvents: canPlay ? 'auto' : 'none',
      }}
      onClick={handleClick}
    >
      <Paper
        shadow="md"
        radius="md"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: info.color,
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

        {/* Optional gold shimmer for VP cards */}
        {card.type === 'victory_point' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(135deg, transparent 0%, rgba(255, 215, 0, 0.3) 50%, transparent 100%)',
            }}
          />
        )}

        {/* Card icon */}
        <Box
          style={{
            fontSize: 32,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {info.icon}
        </Box>

        {/* Card name */}
        <Text
          size="xs"
          fw={600}
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            marginTop: 4,
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {info.name}
        </Text>
      </Paper>
    </motion.div>
  );

  if (!canPlay && disabledReason) {
    return (
      <Tooltip label={disabledReason} position="top">
        <span style={{ display: 'inline-block' }}>{cardContent}</span>
      </Tooltip>
    );
  }

  return cardContent;
}
