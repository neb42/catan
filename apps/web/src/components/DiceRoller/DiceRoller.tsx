import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { notifications } from '@mantine/notifications';
import {
  useCanRollDice,
  useLastDiceRoll,
  useSocket,
  useGameStore,
  useLastResourcesDistributed,
} from '../../stores/gameStore';
import styles from './dice.module.css';

export function DiceRoller() {
  const canRollDice = useCanRollDice();
  const lastDiceRoll = useLastDiceRoll();
  const sendMessage = useSocket();
  const setAnimating = useGameStore((state) => state.setAnimating);
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const lastResourcesDistributed = useLastResourcesDistributed();

  const [isRolling, setIsRolling] = useState(false);
  const [displayValues, setDisplayValues] = useState<[number, number] | null>(
    null,
  );

  // Track if we've shown notification for current roll to prevent duplicates
  const lastNotifiedRollRef = useRef<string | null>(null);

  // Show notification for resources received
  const showResourceNotification = useCallback(() => {
    if (!lastResourcesDistributed || !myPlayerId) return;

    // Find resources for the current player
    const myGrant = lastResourcesDistributed.find(
      (grant) => grant.playerId === myPlayerId,
    );

    if (myGrant && myGrant.resources.length > 0) {
      // Format resources as "+2 wood, +1 wheat"
      const message = myGrant.resources
        .map((r) => `+${r.count} ${r.type}`)
        .join(', ');

      notifications.show({
        title: 'Resources received!',
        message,
        color: 'green',
        autoClose: 3000,
      });
    } else if (
      lastResourcesDistributed.length === 0 ||
      !lastResourcesDistributed.some((g) => g.resources.length > 0)
    ) {
      // No one received resources
      notifications.show({
        message: 'No resources from this roll',
        color: 'gray',
        autoClose: 2000,
      });
    }
  }, [lastResourcesDistributed, myPlayerId]);

  // When lastDiceRoll changes and we're rolling, finish the animation
  useEffect(() => {
    if (lastDiceRoll && isRolling) {
      // Wait for animation to complete before showing result
      const timer = setTimeout(() => {
        setDisplayValues([lastDiceRoll.dice1, lastDiceRoll.dice2]);
        setIsRolling(false);
        setAnimating(false);

        // Show resource notification after animation completes
        const rollKey = `${lastDiceRoll.dice1}-${lastDiceRoll.dice2}-${lastDiceRoll.total}`;
        if (lastNotifiedRollRef.current !== rollKey) {
          lastNotifiedRollRef.current = rollKey;
          showResourceNotification();
        }
      }, 800); // Match animation duration

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [lastDiceRoll, isRolling, setAnimating, showResourceNotification]);

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
