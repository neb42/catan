import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MIN_PLAYERS,
  Player,
  Room,
  WebSocketMessage,
  PLAYER_COLORS,
} from '@catan/shared';
import { Alert, Button, CopyButton, Title } from '@mantine/core';

import LandingForm from './LandingForm';
import { LobbyPlayerList } from './LobbyPlayerList';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGameStore } from '../stores/gameStore';
import { handleWebSocketMessage, HandlerContext } from '@web/handlers';
import { getNickname } from '../utils/nickname';

// Dynamically construct WebSocket URL based on current page location
// In production (Cloud Run): wss://domain.run.app/ws
// In local Docker: ws://localhost:8080/ws
// In development: ws://localhost:3333/ws
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host; // includes port if present
  return `${protocol}//${host}/ws`;
};

const WS_URL = getWebSocketUrl();

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
  const [preferredColor, setPreferredColor] = useState<Player['color'] | null>(
    null,
  );

  // Load saved room ID and color from localStorage on mount
  useEffect(() => {
    const savedRoomId = localStorage.getItem('catan_roomId');
    const savedColor = localStorage.getItem('catan_color');
    if (savedColor && PLAYER_COLORS.includes(savedColor as Player['color'])) {
      setPreferredColor(savedColor as Player['color']);
    }
    if (savedRoomId) {
      setRoomId(savedRoomId);
      setShowJoinForm(true);
    }
  }, []);

  const players: Player[] = useMemo(() => room?.players ?? [], [room]);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      const context: HandlerContext = {
        setRoom,
        setRoomId,
        setCurrentPlayerId,
        setPendingNickname,
        setCurrentView,
        setCreateError,
        setJoinError,
        setGeneralError,
        setCountdown,
        setLastAction,
        currentPlayerId,
        pendingNickname,
        lastAction,
        room,
      };
      handleWebSocketMessage(message, context);
    },
    [
      setRoom,
      setRoomId,
      setCurrentPlayerId,
      setPendingNickname,
      setCurrentView,
      setCreateError,
      setJoinError,
      setGeneralError,
      setCountdown,
      setLastAction,
      currentPlayerId,
      pendingNickname,
      lastAction,
      room,
    ],
  );

  const { isConnected, sendMessage } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
  });

  useEffect(() => {
    useGameStore.getState().setSendMessage(sendMessage);
  }, [sendMessage]);

  const handleCreateRoom = useCallback(() => {
    setLastAction('create');
    setCreateError(null);
    setJoinError(null);
    const nickname = getNickname();
    setPendingNickname(nickname);
    setCurrentView('lobby');
    sendMessage({
      type: 'create_room',
      nickname,
      preferredColor: preferredColor || undefined,
    });
  }, [preferredColor, sendMessage]);

  const handleJoinRoom = useCallback(
    (roomCode: string) => {
      setLastAction('join');
      setCreateError(null);
      setJoinError(null);
      const nickname = getNickname();
      setPendingNickname(nickname);
      setCurrentView('lobby');
      sendMessage({
        type: 'join_room',
        roomId: roomCode,
        nickname,
        preferredColor: preferredColor || undefined,
      });
    },
    [preferredColor, sendMessage],
  );

  const handleColorChange = useCallback(
    (color: Player['color']) => {
      if (!currentPlayerId) return;
      localStorage.setItem('catan_color', color);
      setPreferredColor(color);
      sendMessage({ type: 'change_color', playerId: currentPlayerId, color });
    },
    [currentPlayerId, sendMessage],
  );

  const handleNicknameChange = useCallback(
    (nickname: string) => {
      if (!currentPlayerId) return;
      const trimmed = nickname.trim();
      if (trimmed.length < 2 || trimmed.length > 30) return;
      localStorage.setItem('catan_nickname', trimmed);
      sendMessage({
        type: 'change_nickname',
        playerId: currentPlayerId,
        nickname: trimmed,
      });
    },
    [currentPlayerId, sendMessage],
  );

  const handleReadyToggle = useCallback(() => {
    if (!currentPlayerId) return;
    sendMessage({ type: 'toggle_ready', playerId: currentPlayerId });
  }, [currentPlayerId, sendMessage]);

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
            position: 'relative',
          }}
        >
          {/* Countdown Overlay */}
          {countdown !== null && countdown >= 0 && (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                pointerEvents: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 10px 40px -10px var(--color-shadow)',
                height: '200px',
                width: '200px',
                borderRadius: '50%',
              }}
            >
              <Title
                order={1}
                style={{
                  fontSize: '160px',
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 900,
                  color: 'var(--color-secondary)',
                  textAlign: 'center',
                  textShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                {countdown}
              </Title>
            </div>
          )}

          {!isConnected && (
            <Alert
              color="yellow"
              title="Reconnecting..."
              variant="light"
              style={{ marginBottom: '1rem' }}
            >
              Connection lost. Attempting to reconnect to the lobby server.
            </Alert>
          )}

          {generalError && (
            <Alert
              color="red"
              title="Error"
              variant="light"
              style={{ marginBottom: '1rem' }}
            >
              {generalError}
            </Alert>
          )}

          <header
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
              animation: 'fadeInDown 0.6s ease',
            }}
          >
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
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Room Code
                </span>
                <span
                  style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem' }}
                >
                  {roomId}
                </span>
                <CopyButton value={roomId} timeout={1500}>
                  {({ copied, copy }) => (
                    <button
                      onClick={copy}
                      style={{
                        background: copied
                          ? 'var(--color-secondary-dark)'
                          : 'var(--color-secondary)',
                        color: 'white',
                        border: 'none',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = 'scale(1.1)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = 'scale(1)')
                      }
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
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  )}
                </CopyButton>
              </div>
            )}
          </header>

          <div style={{ marginBottom: '2.5rem', flex: '1' }}>
            <LobbyPlayerList
              players={players}
              currentPlayerId={currentPlayerId}
              onColorChange={handleColorChange}
              onNicknameChange={handleNicknameChange}
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
            <div
              style={{
                color: '#6B7280',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  background:
                    countdown !== null
                      ? 'var(--color-secondary)'
                      : 'var(--color-accent)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                }}
              />
              {countdown !== null
                ? `Starting in ${countdown}...`
                : players.length < MIN_PLAYERS
                  ? `At least ${MIN_PLAYERS} players required`
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
                    background: players.find((p) => p.id === currentPlayerId)
                      ?.ready
                      ? 'var(--color-secondary)'
                      : '#F3F4F6',
                    color: players.find((p) => p.id === currentPlayerId)?.ready
                      ? 'white'
                      : '#6B7280',
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
                {players.find((p) => p.id === currentPlayerId)?.ready
                  ? 'Ready!'
                  : "I'm Ready"}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
