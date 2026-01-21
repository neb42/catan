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
import PlayerList from './PlayerList';
import { useWebSocket } from '../hooks/useWebSocket';

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

  const players: Player[] = useMemo(() => room?.players ?? [], [room]);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case 'room_created': {
          setRoomId(message.roomId);
          setCurrentPlayerId(message.player.id);
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

        case 'error': {
          if (lastAction === 'create') {
            setCreateError(message.message);
          } else if (lastAction === 'join') {
            setJoinError(message.message);
          } else {
            setGeneralError(message.message);
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

  const handleCreateRoom = useCallback(
    (nickname: string) => {
      setLastAction('create');
      setCreateError(null);
      setJoinError(null);
      setPendingNickname(nickname);
      setCurrentView('lobby');
      sendMessage({ type: 'create_room', nickname });
    },
    [sendMessage],
  );

  const handleJoinRoom = useCallback(
    (roomCode: string, nickname: string) => {
      setLastAction('join');
      setCreateError(null);
      setJoinError(null);
      setPendingNickname(nickname);
      setCurrentView('lobby');
      sendMessage({ type: 'join_room', roomId: roomCode, nickname });
    },
    [sendMessage],
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
      setCountdown(null);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((previous) => (previous && previous > 0 ? previous - 1 : previous));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [countdown]);

  const lobbyViewActive = currentView === 'lobby' && Boolean(roomId || room);

  return (
    <Stack gap="md">
      {!isConnected && (
        <Alert color="yellow" title="Reconnecting..." variant="light">
          Connection lost. Attempting to reconnect to the lobby server.
        </Alert>
      )}

      {generalError && (
        <Alert color="red" title="Error" variant="light">
          {generalError}
        </Alert>
      )}

      {countdown !== null && (
        <Alert color="teal" title="Game starting" variant="filled">
          Game starting in {countdown} second{countdown === 1 ? '' : 's'}...
        </Alert>
      )}

      {!lobbyViewActive && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <CreateRoom isConnected={isConnected} onCreate={handleCreateRoom} error={createError} />
          <JoinRoom isConnected={isConnected} onJoin={handleJoinRoom} error={joinError} />
        </SimpleGrid>
      )}

      {lobbyViewActive && (
        <Card withBorder radius="md" padding="lg" shadow="lg" style={{ animation: 'fadeInUp 0.6s ease' }}>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Stack gap={4}>
                <Group gap="xs" align="center">
                  <Title order={2} ff="Fraunces, serif" fw={800}>Room {roomId ?? room?.id}</Title>
                  <Badge color={isConnected ? 'teal' : 'yellow'}>{isConnected ? 'Connected' : 'Reconnecting'}</Badge>
                </Group>
                <Text c="dimmed" size="sm">
                  Share this code with friends to have them join.
                </Text>
              </Stack>
              {roomId && (
                <CopyButton value={roomId} timeout={1500}>
                  {({ copied, copy }) => (
                    <Button 
                      variant={copied ? 'light' : 'outline'} 
                      color={copied ? 'teal' : 'blue'} 
                      onClick={copy}
                      size="md"
                      fw={700}
                    >
                      {copied ? 'Copied!' : 'Copy room ID'}
                    </Button>
                  )}
                </CopyButton>
              )}
            </Group>

            <PlayerList
              players={players}
              currentPlayerId={currentPlayerId}
              onColorChange={handleColorChange}
              onReadyToggle={handleReadyToggle}
            />
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
