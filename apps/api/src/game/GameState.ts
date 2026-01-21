import {
  GamePlayer,
  GameState,
  Player,
  PlayerResources,
} from '@catan/shared';
import { generateBoard } from './BoardGenerator';

const createInitialResources = (): PlayerResources => ({
  wood: 0,
  wheat: 0,
  sheep: 0,
  brick: 0,
  ore: 0,
});

const createGamePlayer = (player: Player): GamePlayer => ({
  ...player,
  resources: createInitialResources(),
  settlements: [],
  cities: [],
  roads: [],
  victoryPoints: 0,
});

const resolveBoardMode = (): 'balanced' | 'natural' =>
  process.env.BOARD_GEN_MODE === 'natural' ? 'natural' : 'balanced';

export const createInitialGameState = (
  roomId: string,
  players: Player[]
): GameState => {
  const board = generateBoard(resolveBoardMode());
  const gamePlayers = players.map(createGamePlayer);

  return {
    roomId,
    phase: 'initial_placement',
    turnPhase: null,
    currentPlayer: gamePlayers[0]?.id ?? '',
    board,
    players: gamePlayers,
    placementRound: 1,
    lastDiceRoll: null,
  };
};
