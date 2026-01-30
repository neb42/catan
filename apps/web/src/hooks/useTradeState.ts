import { useGameStore } from '../stores/gameStore';
import { useShallow } from 'zustand/react/shallow';

// Active trade selector
export const useActiveTrade = () => useGameStore((state) => state.activeTrade);

// Trade modal visibility
export const useTradeModalOpen = () =>
  useGameStore((state) => state.tradeModalOpen);

// Check if current user is the trade proposer
export const useIsTradeProposer = () =>
  useGameStore((state) => state.activeTrade?.proposerId === state.myPlayerId);

// Check if user needs to respond to a trade (not proposer, trade active, hasn't responded)
export const useNeedsToRespondToTrade = () =>
  useGameStore((state) => {
    if (!state.activeTrade) return false;
    if (state.activeTrade.proposerId === state.myPlayerId) return false;
    if (!state.myPlayerId) return false;
    const myResponse = state.activeTrade.responses[state.myPlayerId];
    return !myResponse || myResponse === 'pending';
  });

// Get list of players who have accepted the trade
export const useAcceptedTraders = () =>
  useGameStore(
    useShallow((state) => {
      if (!state.activeTrade) return [];
      return Object.entries(state.activeTrade.responses)
        .filter(([_, response]) => response === 'accepted')
        .map(([playerId]) => playerId);
    }),
  );

// Trade actions
export const useTradeActions = () =>
  useGameStore(
    useShallow((state) => ({
      setActiveTrade: state.setActiveTrade,
      updateTradeResponse: state.updateTradeResponse,
      clearTrade: state.clearTrade,
      setTradeModalOpen: state.setTradeModalOpen,
    })),
  );
