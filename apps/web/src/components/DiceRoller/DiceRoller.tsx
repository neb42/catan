import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  useCanRollDice,
  useLastDiceRoll,
  useSocket,
  useGameStore,
} from '../../stores/gameStore';
import styles from './dice.module.css';

export function DiceRoller() {
  const canRollDice = useCanRollDice();
  const lastDiceRoll = useLastDiceRoll();
  const sendMessage = useSocket();
  const setAnimating = useGameStore((state) => state.setAnimating);

  const [isRolling, setIsRolling] = useState(false);
  const [displayValues, setDisplayValues] = useState<[number, number] | null>(
    null,
  );

  // When lastDiceRoll changes and we're rolling, finish the animation
  useEffect(() => {
    if (lastDiceRoll && isRolling) {
      // Wait for animation to complete before showing result
      const timer = setTimeout(() => {
        setDisplayValues([lastDiceRoll.dice1, lastDiceRoll.dice2]);
        setIsRolling(false);
        setAnimating(false);
      }, 800); // Match animation duration

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [lastDiceRoll, isRolling, setAnimating]);

  // If we have a dice roll but aren't rolling (e.g., reconnection), show the values
  useEffect(() => {
    if (lastDiceRoll && !isRolling && displayValues === null) {
      setDisplayValues([lastDiceRoll.dice1, lastDiceRoll.dice2]);
    }
  }, [lastDiceRoll, isRolling, displayValues]);

  const handleRoll = useCallback(() => {
    if (!canRollDice || !sendMessage) return;

    setIsRolling(true);
    setAnimating(true);
    sendMessage({ type: 'roll_dice' });
  }, [canRollDice, sendMessage, setAnimating]);

  const total = lastDiceRoll?.total ?? null;
  const isRobber = total === 7;

  return (
    <div className={styles['diceContainer']}>
      <div className={styles['diceRow']}>
        <motion.div
          className={`${styles['die']} ${isRobber ? styles['dieRobber'] : ''}`}
          animate={
            isRolling
              ? {
                  rotateX: [0, 360, 720],
                  rotateY: [0, 180, 360],
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {displayValues?.[0] ?? '?'}
        </motion.div>
        <motion.div
          className={`${styles['die']} ${isRobber ? styles['dieRobber'] : ''}`}
          animate={
            isRolling
              ? {
                  rotateX: [0, 360, 720],
                  rotateY: [0, 180, 360],
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
        >
          {displayValues?.[1] ?? '?'}
        </motion.div>
      </div>

      {total !== null && (
        <div className={styles['result']}>
          <span>Total:</span>
          <span
            className={`${styles['resultTotal']} ${isRobber ? styles['resultTotalRobber'] : ''}`}
          >
            {total}
          </span>
        </div>
      )}

      {isRobber && (
        <div className={styles['robberWarning']}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Robber!
        </div>
      )}

      <button
        className={styles['rollButton']}
        onClick={handleRoll}
        disabled={!canRollDice || isRolling}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
}
