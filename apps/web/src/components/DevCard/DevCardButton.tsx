import { Button, Tooltip, Box } from '@mantine/core';
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

  const buttonContent = (
    <Button
      variant={card.type === 'victory_point' ? 'light' : 'filled'}
      color={info.color}
      disabled={!canPlay}
      onClick={handleClick}
      styles={{
        root: {
          opacity: canPlay ? 1 : 0.5,
          minWidth: 80,
          height: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        },
      }}
    >
      <Box style={{ fontSize: 28 }}>{info.icon}</Box>
      <Box style={{ fontSize: 12, textAlign: 'center' }}>{info.name}</Box>
    </Button>
  );

  if (!canPlay && disabledReason) {
    return (
      <Tooltip label={disabledReason} position="top">
        <span>{buttonContent}</span>
      </Tooltip>
    );
  }

  return buttonContent;
}
