import { MIN_PLAYERS, Room } from '@catan/shared';

import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleRoomCreated: MessageHandler = (message, ctx) => {
  if (message.type !== 'room_created') return;

  ctx.setRoomId(message.roomId);
  ctx.setCurrentPlayerId(message.player.id);
  useGameStore.getState().setMyPlayerId(message.player.id);
  ctx.setPendingNickname(message.player.nickname);
  ctx.setCurrentView('lobby');
  ctx.setCreateError(null);
  ctx.setJoinError(null);
  ctx.setGeneralError(null);

  // Persist to localStorage for reconnection
  localStorage.setItem('catan_roomId', message.roomId);
  localStorage.setItem('catan_nickname', message.player.nickname);

  // Navigate to room URL
  ctx.navigate(`/room/${message.roomId}`);

  // Prevent URL join useEffect from triggering after room creation
  ctx.setAttemptedRoomId(message.roomId);
};

export const handleRoomState: MessageHandler = (message, ctx) => {
  if (message.type !== 'room_state') return;

  const selfFromNickname =
    !ctx.currentPlayerId && ctx.pendingNickname
      ? message.room.players.find(
          (player) => player.nickname === ctx.pendingNickname,
        )
      : null;

  if (selfFromNickname) {
    ctx.setCurrentPlayerId(selfFromNickname.id);
    useGameStore.getState().setMyPlayerId(selfFromNickname.id);
    ctx.setPendingNickname(null);

    // Persist to localStorage for reconnection (join room success)
    localStorage.setItem('catan_roomId', message.room.id);
    localStorage.setItem('catan_nickname', selfFromNickname.nickname);
  }

  const readyToStart =
    message.room.players.length >= MIN_PLAYERS &&
    message.room.players.every((player) => player.ready);

  if (!readyToStart) {
    ctx.setCountdown(null);
  }

  ctx.setRoom(message.room);
  ctx.setRoomId(message.room.id);
  useGameStore.getState().setRoom(message.room);
  ctx.setCurrentView('lobby');
  ctx.setGeneralError(null);
};

export const handlePlayerJoined: MessageHandler = (message, ctx) => {
  if (message.type !== 'player_joined') return;

  ctx.setRoom((previous) => {
    if (!previous) return previous;
    const filtered = previous.players.filter(
      (player) => player.id !== message.player.id,
    );
    const updatedRoom = {
      ...previous,
      players: [...filtered, message.player],
    };
    useGameStore.getState().setRoom(updatedRoom as Room);
    return updatedRoom;
  });
};

export const handlePlayerLeft: MessageHandler = (message, ctx) => {
  if (message.type !== 'player_left') return;

  ctx.setRoom((previous) => {
    if (!previous) return previous;
    const updatedRoom = {
      ...previous,
      players: previous.players.filter(
        (player) => player.id !== message.playerId,
      ),
    };
    useGameStore.getState().setRoom(updatedRoom as Room);
    return updatedRoom;
  });
};

export const handlePlayerReady: MessageHandler = (message, ctx) => {
  if (message.type !== 'player_ready') return;

  ctx.setRoom((previous) => {
    if (!previous) return previous;
    const updatedPlayers = previous.players.map((player) =>
      player.id === message.playerId
        ? { ...player, ready: message.ready }
        : player,
    );

    const readyToStart =
      updatedPlayers.length >= MIN_PLAYERS &&
      updatedPlayers.every((player) => player.ready);

    if (!readyToStart) {
      ctx.setCountdown(null);
    }

    const updatedRoom = { ...previous, players: updatedPlayers };
    useGameStore.getState().setRoom(updatedRoom as Room);
    return updatedRoom;
  });
};

export const handleColorChanged: MessageHandler = (message, ctx) => {
  if (message.type !== 'color_changed') return;

  ctx.setRoom((previous) => {
    if (!previous) return previous;
    const updatedPlayers = previous.players.map((player) =>
      player.id === message.playerId
        ? { ...player, color: message.color }
        : player,
    );
    const updatedRoom = {
      ...previous,
      players: updatedPlayers,
    } as Room;
    useGameStore.getState().setRoom(updatedRoom);
    return updatedRoom;
  });
};

export const handleNicknameChanged: MessageHandler = (message, ctx) => {
  if (message.type !== 'nickname_changed') return;

  ctx.setRoom((previous) => {
    if (!previous) return previous;
    const updatedPlayers = previous.players.map((player) =>
      player.id === message.playerId
        ? { ...player, nickname: message.nickname }
        : player,
    );
    const updatedRoom = {
      ...previous,
      players: updatedPlayers,
    } as Room;
    useGameStore.getState().setRoom(updatedRoom);
    return updatedRoom;
  });

  // Update localStorage if it's the current player
  if (message.playerId === ctx.currentPlayerId) {
    localStorage.setItem('catan_nickname', message.nickname);
  }
};
