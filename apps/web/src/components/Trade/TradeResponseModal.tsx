import { Modal } from '@mantine/core';
import { ResourceType } from '@catan/shared';

import {
  useActiveTrade,
  useNeedsToRespondToTrade,
} from '../../hooks/useTradeState';
import { useSocket, useGameStore } from '../../stores/gameStore';
import { ResourceIcon } from '../ResourceIcon/ResourceIcon';

function ResourceDisplay({
  resources,
  label,
}: {
  resources: Record<ResourceType, number>;
  label: string;
}) {
  const nonZero = Object.entries(resources).filter(([_, count]) => count > 0);
  if (nonZero.length === 0) return null;

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #d7ccc8',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#5d4037',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {nonZero.map(([resource, count]) => (
          <div
            key={resource}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              color: '#5d4037',
            }}
          >
            <span>{count}x</span>
            <ResourceIcon type={resource as ResourceType} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TradeResponseModal() {
  const activeTrade = useActiveTrade();
  const needsToRespond = useNeedsToRespondToTrade();
  const sendMessage = useSocket();
  const room = useGameStore((state) => state.room);
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const myResources = useGameStore(
    (state) => state.playerResources[state.myPlayerId || ''],
  );

  // Find proposer name
  const proposerName =
    room?.players.find((p) => p.id === activeTrade?.proposerId)?.nickname ||
    'Unknown';

  if (!needsToRespond || !activeTrade) return null;

  // Check if player can afford what's being requested
  const canAffordTrade =
    myPlayerId &&
    myResources &&
    Object.entries(activeTrade.requesting).every(
      ([resource, amount]) =>
        (myResources[resource as ResourceType] || 0) >= amount,
    );

  const handleAccept = () => {
    sendMessage?.({ type: 'respond_trade', response: 'accept' });
  };

  const handleDecline = () => {
    sendMessage?.({ type: 'respond_trade', response: 'decline' });
  };

  return (
    <Modal
      opened={true}
      onClose={() => {}} // No-op - cannot close without responding
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      title={`Trade Offer from ${proposerName}`}
      centered
      styles={{
        content: {
          backgroundColor: '#fdf6e3',
        },
        header: {
          borderBottom: '2px dashed #d7ccc8',
          background: 'rgba(0,0,0,0.03)',
        },
        title: {
          color: '#5d4037',
          fontWeight: 600,
          fontFamily: 'Fraunces, serif',
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p
          style={{
            fontSize: '14px',
            color: '#5d4037',
            margin: 0,
          }}
        >
          {proposerName} wants to trade with you:
        </p>

        <ResourceDisplay resources={activeTrade.offering} label="They offer:" />
        <ResourceDisplay
          resources={activeTrade.requesting}
          label="They want:"
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <button
            onClick={handleAccept}
            disabled={!canAffordTrade}
            style={{
              background: canAffordTrade ? '#27ae60' : '#d7ccc8',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: canAffordTrade ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              minWidth: '100px',
            }}
            onMouseEnter={(e) => {
              if (canAffordTrade) {
                e.currentTarget.style.background = '#229954';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (canAffordTrade) {
                e.currentTarget.style.background = '#27ae60';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            style={{
              background: 'transparent',
              color: '#c0392b',
              border: '2px solid #c0392b',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '100px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#c0392b';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#c0392b';
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </Modal>
  );
}
