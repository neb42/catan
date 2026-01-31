import { Button, Tooltip, Badge, Group } from '@mantine/core';
import {
  useCanBuyDevCard,
  useDeckRemaining,
} from '../../hooks/useDevCardState';
import { useGameStore } from '../../stores/gameStore';

export function BuyDevCardButton() {
  const { canBuy, reason } = useCanBuyDevCard();
  const deckRemaining = useDeckRemaining();
  const sendMessage = useGameStore((s) => s.sendMessage);

  const handleBuy = () => {
    if (!canBuy || !sendMessage) return;
    sendMessage({ type: 'buy_dev_card' });
  };

  const button = (
    <Button
      onClick={handleBuy}
      disabled={!canBuy}
      variant="outline"
      color="violet"
    >
      <Group gap="xs">
        <span>Buy Dev Card</span>
        <Badge size="sm" variant="filled" color="violet">
          {deckRemaining}
        </Badge>
      </Group>
    </Button>
  );

  if (!canBuy && reason) {
    return (
      <Tooltip label={reason} position="top">
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
}
