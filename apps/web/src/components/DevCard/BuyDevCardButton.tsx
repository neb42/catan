import { Tooltip } from '@mantine/core';
import type { ResourceType } from '@catan/shared';
import {
  useCanBuyDevCard,
  useDeckRemaining,
} from '../../hooks/useDevCardState';
import { useGameStore } from '../../stores/gameStore';
import { ResourceIcon } from '../ResourceIcon/ResourceIcon';

export function BuyDevCardButton() {
  const { canBuy, reason } = useCanBuyDevCard();
  const deckRemaining = useDeckRemaining();
  const sendMessage = useGameStore((s) => s.sendMessage);

  const handleBuy = () => {
    if (!canBuy || !sendMessage) return;
    sendMessage({ type: 'buy_dev_card' });
  };

  // Tooltip content: cost breakdown if enabled, disabled reason if not
  const tooltipContent = canBuy
    ? 'Cost: 1 wheat, 1 sheep, 1 ore'
    : reason || 'Cannot buy';

  return (
    <Tooltip
      label={tooltipContent}
      position="top"
      withArrow
      multiline
      w={200}
      transitionProps={{ transition: 'pop', duration: 200 }}
    >
      <button
        disabled={!canBuy}
        onClick={handleBuy}
        style={{
          background: 'white',
          border: '2px solid #d7ccc8',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '8px 12px',
          opacity: canBuy ? 1 : 0.5,
          cursor: canBuy ? 'pointer' : 'not-allowed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
        }}
      >
        {/* Icon + Label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px' }}>🃏</span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#5d4037',
            }}
          >
            Dev Card
          </span>
        </div>

        {/* Cost icons + deck count row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              marginLeft: 4,
              opacity: 0.8,
              display: 'inline-flex',
              gap: 2,
            }}
          >
            <span style={{ display: 'inline-flex' }}>
              <ResourceIcon type={'wheat' as ResourceType} size="sm" />
            </span>
            <span style={{ display: 'inline-flex' }}>
              <ResourceIcon type={'sheep' as ResourceType} size="sm" />
            </span>
            <span style={{ display: 'inline-flex' }}>
              <ResourceIcon type={'ore' as ResourceType} size="sm" />
            </span>
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#8d6e63',
              marginLeft: '4px',
            }}
          >{`(${deckRemaining})`}</span>
        </div>
      </button>
    </Tooltip>
  );
}
