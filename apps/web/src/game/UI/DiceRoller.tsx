import { motion } from 'motion/react';

import { useGameStore } from '../../stores/gameStore';

export function DiceRoller() {
  const gameState = useGameStore((state) => state.gameState);
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const sendMessage = useGameStore((state) => state.sendMessage);

  const lastRoll = gameState?.lastDiceRoll ?? null;
  const currentPlayer = gameState?.currentPlayer ?? null;
  const turnPhase = gameState?.turnPhase ?? null;

  const isCurrentPlayer = Boolean(
    gameState && myPlayerId && currentPlayer === myPlayerId
  );
  const canRoll = Boolean(isCurrentPlayer && turnPhase === 'roll');
  const showEndTurnButton = Boolean(
    isCurrentPlayer && (turnPhase === 'main' || turnPhase === 'end')
  );
  const canEndTurn = Boolean(showEndTurnButton && turnPhase === 'main');
  const isEndingTurn = Boolean(showEndTurnButton && turnPhase === 'end');

  const handleRollDice = () => {
    if (!myPlayerId || !sendMessage) return;
    sendMessage({ type: 'roll_dice', playerId: myPlayerId });
  };

  const handleEndTurn = () => {
    if (!myPlayerId || !sendMessage) return;
    sendMessage({ type: 'end_turn', playerId: myPlayerId });
  };

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
      {lastRoll && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          {[lastRoll[0], lastRoll[1]].map((value, index) => (
            <motion.div
              key={`${value}-${index}`}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              style={{
                width: 60,
                height: 60,
                background: 'white',
                border: '2px solid #1f1f1f',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {value}
            </motion.div>
          ))}
          <div style={{ fontWeight: 700, fontSize: 18 }}>Total: {lastRoll[0] + lastRoll[1]}</div>
        </div>
      )}

      {canRoll && (
        <button
          onClick={handleRollDice}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 10,
            border: 'none',
            background: '#2f8f2f',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: canEndTurn ? '0.5rem' : 0,
          }}
        >
          Roll Dice
        </button>
      )}

      {canEndTurn && (
        <button
          onClick={handleEndTurn}
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            borderRadius: 10,
            border: 'none',
            background: '#1f2937',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          End Turn
        </button>
      )}

      {isEndingTurn && (
        <button
          disabled
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            borderRadius: 10,
            border: 'none',
            background: '#374151',
            color: 'white',
            fontWeight: 700,
            cursor: 'not-allowed',
            opacity: 0.85,
          }}
        >
          Ending Turn...
        </button>
      )}

      {!canRoll && !showEndTurnButton && (
        <div style={{ color: '#6b7280', fontWeight: 600, textAlign: 'center' }}>Waiting to roll</div>
      )}
    </div>
  );
}
