import { useActiveTrade, useTradeActions } from '../../hooks/useTradeState';
import { useSocket, useGameStore } from '../../stores/gameStore';

export function TradeProposerView() {
  const activeTrade = useActiveTrade();
  const { clearTrade } = useTradeActions();
  const sendMessage = useSocket();
  const room = useGameStore((state) => state.room);
  const myPlayerId = useGameStore((state) => state.myPlayerId);

  // Only show to proposer when there's an active trade they proposed
  if (!activeTrade || activeTrade.proposerId !== myPlayerId) return null;

  const handleCancel = () => {
    sendMessage?.({ type: 'cancel_trade' });
  };

  const handleSelectPartner = (partnerId: string) => {
    sendMessage?.({ type: 'select_trade_partner', partnerId });
  };

  // Get all non-proposer players with their response status
  const otherPlayers =
    room?.players
      .filter((p) => p.id !== activeTrade.proposerId)
      .map((p) => ({
        ...p,
        response: activeTrade.responses[p.id] || 'pending',
      })) || [];

  return (
    <div
      style={{
        background: '#fdf6e3',
        border: '2px solid #8d6e63',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Header */}
        <div
          style={{
            background: 'rgba(0,0,0,0.03)',
            borderBottom: '2px dashed #d7ccc8',
            padding: '8px 0',
            marginBottom: '4px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#5d4037',
              fontFamily: 'Fraunces, serif',
            }}
          >
            Trade Proposal Active
          </h3>
        </div>

        <p
          style={{
            fontSize: '14px',
            color: '#a1887f',
            margin: 0,
          }}
        >
          Waiting for responses...
        </p>

        {/* Response status for each player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {otherPlayers.map((player) => (
            <div
              key={player.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                background: 'white',
                border: '1px solid #d7ccc8',
                borderRadius: '6px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#5d4037' }}>
                {player.nickname}
              </span>
              {player.response === 'pending' && (
                <span
                  style={{
                    background: '#808080',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Pending
                </span>
              )}
              {player.response === 'accepted' && (
                <div
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <span
                    style={{
                      background: '#27ae60',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Accepted
                  </span>
                  <button
                    onClick={() => handleSelectPartner(player.id)}
                    style={{
                      background: '#5d4037',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#4e342e';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#5d4037';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Trade with {player.nickname}
                  </button>
                </div>
              )}
              {player.response === 'declined' && (
                <span
                  style={{
                    background: '#c0392b',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Declined
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleCancel}
          style={{
            background: 'transparent',
            color: '#c0392b',
            border: '2px solid #c0392b',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: '8px',
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
          Cancel Trade
        </button>
      </div>
    </div>
  );
}
