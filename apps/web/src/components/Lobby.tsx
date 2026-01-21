import { useCallback, useEffect, useMemo, useState } from 'react';

import { MIN_PLAYERS, Player, Room, WebSocketMessage } from '@catan/shared';
import {
  Alert,
  Badge,
  Button,
  Card,
  CopyButton,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import LandingForm from './LandingForm';
import PlayerList from './PlayerList';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGameStore } from '../stores/gameStore';

const WS_URL = 'ws://localhost:3333/ws';

type View = 'create' | 'join' | 'lobby';

type PendingAction = 'create' | 'join' | null;

export default function Lobby() {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [pendingNickname, setPendingNickname] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('create');
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<PendingAction>(null);
  const [showJoinForm, setShowJoinForm] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>('');

  const gameState = useGameStore((state) => state.gameState);

  const players: Player[] = useMemo(() => room?.players ?? [], [room]);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case 'room_created': {
          setRoomId(message.roomId);
          setCurrentPlayerId(message.player.id);
          useGameStore.getState().setMyPlayerId(message.player.id);
          setPendingNickname(message.player.nickname);
          setCurrentView('lobby');
          setCreateError(null);
          setJoinError(null);
          setGeneralError(null);
          break;
        }

        case 'room_state': {
          const selfFromNickname =
            !currentPlayerId && pendingNickname
              ? message.room.players.find((player) => player.nickname === pendingNickname)
              : null;

          if (selfFromNickname) {
            setCurrentPlayerId(selfFromNickname.id);
            useGameStore.getState().setMyPlayerId(selfFromNickname.id);
            setPendingNickname(null);
          }

          const readyToStart =
            message.room.players.length >= MIN_PLAYERS &&
            message.room.players.every((player) => player.ready);

          if (!readyToStart) {
            setCountdown(null);
          }

          setRoom(message.room);
          setRoomId(message.room.id);
          setCurrentView('lobby');
          setGeneralError(null);
          break;
        }

        case 'player_joined': {
          setRoom((previous) => {
            if (!previous) return previous;
            const filtered = previous.players.filter((player) => player.id !== message.player.id);
            return { ...previous, players: [...filtered, message.player] };
          });
          break;
        }

        case 'player_left': {
          setRoom((previous) => {
            if (!previous) return previous;
            return { ...previous, players: previous.players.filter((player) => player.id !== message.playerId) };
          });
          break;
        }

        case 'player_ready': {
          setRoom((previous) => {
            if (!previous) return previous;
            const updatedPlayers = previous.players.map((player) =>
              player.id === message.playerId ? { ...player, ready: message.ready } : player,
            );

            const readyToStart =
              updatedPlayers.length >= MIN_PLAYERS && updatedPlayers.every((player) => player.ready);

            if (!readyToStart) {
              setCountdown(null);
            }

            return { ...previous, players: updatedPlayers };
          });
          break;
        }

        case 'color_changed': {
          setRoom((previous) => {
            if (!previous) return previous;
            const updatedPlayers = previous.players.map((player) =>
              player.id === message.playerId ? { ...player, color: message.color } : player,
            );
            return { ...previous, players: updatedPlayers };
          });
          break;
        }

        case 'game_starting': {
          setCountdown(message.countdown);
          break;
        }

        case 'game_state': {
          useGameStore.getState().updateGameState(message.gameState);
          useGameStore.getState().setLastError(null);
          break;
        }

        case 'error': {
          if (lastAction === 'create') {
            setCreateError(message.message);
          } else if (lastAction === 'join') {
            setJoinError(message.message);
          } else {
            setGeneralError(message.message);
            useGameStore.getState().setLastError(message.message);
          }
          break;
        }

        default:
          break;
      }
    },
    [currentPlayerId, pendingNickname, lastAction],
  );

  const { isConnected, sendMessage } = useWebSocket({ url: WS_URL, onMessage: handleMessage });

  useEffect(() => {
    useGameStore.getState().setSendMessage(sendMessage);
  }, [sendMessage]);

  const handleCreateRoom = useCallback(() => {
    if (!nickname.trim()) return;
    setLastAction('create');
    setCreateError(null);
    setJoinError(null);
    setPendingNickname(nickname);
    setCurrentView('lobby');
    sendMessage({ type: 'create_room', nickname: nickname.trim() });
  }, [nickname, sendMessage]);

  const handleJoinRoom = useCallback(
    (roomCode: string) => {
      if (!nickname.trim()) return;
      setLastAction('join');
      setCreateError(null);
      setJoinError(null);
      setPendingNickname(nickname);
      setCurrentView('lobby');
      sendMessage({ type: 'join_room', roomId: roomCode, nickname: nickname.trim() });
    },
    [nickname, sendMessage],
  );

  const handleColorChange = useCallback(
    (color: Player['color']) => {
      if (!currentPlayerId) return;
      sendMessage({ type: 'change_color', playerId: currentPlayerId, color });
    },
    [currentPlayerId, sendMessage],
  );

  const handleReadyToggle = useCallback(() => {
    if (!currentPlayerId) return;
    sendMessage({ type: 'toggle_ready', playerId: currentPlayerId });
  }, [currentPlayerId, sendMessage]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (roomId && room && currentPlayerId && !gameState) {
        const isHost = room.players[0]?.id === currentPlayerId;
        if (isHost) {
          sendMessage({ type: 'start_game', roomId });
        }
      }
      setCountdown(null);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((previous) => (previous && previous > 0 ? previous - 1 : previous));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [countdown, roomId, room, currentPlayerId, sendMessage, gameState]);

  const lobbyViewActive = currentView === 'lobby' && Boolean(roomId || room);

  return (
    <>
      {!lobbyViewActive && (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <LandingForm
            isConnected={isConnected}
            onCreate={handleCreateRoom}
            onJoin={handleJoinRoom}
            nickname={nickname}
            onNicknameChange={setNickname}
            error={createError || joinError}
          />
        </div>
      )}

      {lobbyViewActive && (
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '2rem',
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            paddingTop: '4rem',
          }}
        >
          {!isConnected && (
            <Alert color="yellow" title="Reconnecting..." variant="light" style={{ marginBottom: '1rem' }}>
              Connection lost. Attempting to reconnect to the lobby server.
            </Alert>
          )}

          {generalError && (
            <Alert color="red" title="Error" variant="light" style={{ marginBottom: '1rem' }}>
              {generalError}
            </Alert>
          )}


          <header style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeInDown 0.6s ease' }}>
            <Title
              order={1}
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 800,
                fontSize: '2.5rem',
                marginBottom: '1rem',
              }}
            >
              Expedition Party
            </Title>
            {roomId && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'white',
                  padding: '0.5rem 0.5rem 0.5rem 1.5rem',
                  borderRadius: '999px',
                  boxShadow: '0 4px 12px var(--color-shadow)',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: 'var(--color-secondary-dark)',
                  border: '2px solid var(--color-secondary)',
                }}
              >
                <span style={{ fontWeight: 400, fontSize: '0.9rem', textTransform: 'uppercase' }}>Room Code</span>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem' }}>{roomId}</span>
                <CopyButton value={roomId} timeout={1500}>
                  {({ copied, copy }) => (
                    <button
                      onClick={copy}
                      style={{
                        background: copied ? 'var(--color-secondary-dark)' : 'var(--color-secondary)',
                        color: 'white',
                        border: 'none',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      title="Copy Code"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  )}
                </CopyButton>
              </div>
            )}
          </header>

          <div style={{ marginBottom: '2.5rem', flex: '1' }}>
            <PlayerList
              players={players}
              currentPlayerId={currentPlayerId}
              onColorChange={handleColorChange}
              onReadyToggle={handleReadyToggle}
            />
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 40px -10px var(--color-shadow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeInUp 0.6s 0.2s backwards',
              position: 'sticky',
              bottom: '2rem',
            }}
          >
            <div style={{ color: '#6B7280', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  background: countdown !== null ? 'var(--color-secondary)' : 'var(--color-accent)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                }}
              />
              {countdown !== null
                ? `Starting in ${countdown}...`
                : players.length < MIN_PLAYERS
                ? 'At least 3 players required'
                : players.every((p) => p.ready)
                ? 'Ready to start!'
                : `Waiting for players... ${players.filter((p) => p.ready).length}/${players.length} ready`}
            </div>

            {currentPlayerId && (
              <Button
                onClick={handleReadyToggle}
                size="lg"
                fw={800}
                styles={{
                  root: {
                    background: players.find((p) => p.id === currentPlayerId)?.ready
                      ? 'var(--color-secondary)'
                      : '#F3F4F6',
                    color: players.find((p) => p.id === currentPlayerId)?.ready ? 'white' : '#6B7280',
                    fontSize: '1.1rem',
                  },
                }}
                leftSection={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                }
              >
                {players.find((p) => p.id === currentPlayerId)?.ready ? "Ready!" : "I'm Ready"}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
