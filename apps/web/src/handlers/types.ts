import { Room, WebSocketMessage } from '@catan/shared';

export interface HandlerContext {
  // State setters
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  setRoomId: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentPlayerId: React.Dispatch<React.SetStateAction<string | null>>;
  setPendingNickname: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentView: React.Dispatch<
    React.SetStateAction<'create' | 'join' | 'lobby'>
  >;
  setCreateError: React.Dispatch<React.SetStateAction<string | null>>;
  setJoinError: React.Dispatch<React.SetStateAction<string | null>>;
  setGeneralError: React.Dispatch<React.SetStateAction<string | null>>;
  setCountdown: React.Dispatch<React.SetStateAction<number | null>>;
  setLastAction: React.Dispatch<React.SetStateAction<'create' | 'join' | null>>;
  setAttemptedRoomId: React.Dispatch<React.SetStateAction<string | null>>;

  // Navigation
  navigate: (path: string) => void;

  // Current state values
  currentPlayerId: string | null;
  pendingNickname: string | null;
  lastAction: 'create' | 'join' | null;
  room: Room | null;
}

export type MessageHandler<T extends WebSocketMessage = WebSocketMessage> = (
  message: T,
  ctx: HandlerContext,
) => void;
