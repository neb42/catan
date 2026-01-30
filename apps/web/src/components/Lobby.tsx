import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MIN_PLAYERS,
  Player,
  Room,
  WebSocketMessage,
  ResourceType,
} from '@catan/shared';
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
import { notifications } from '@mantine/notifications';

import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import LandingForm from './LandingForm';
import { LobbyPlayerList } from './LobbyPlayerList';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGameStore } from '../stores/gameStore';
import { showGameNotification } from '@web/components/Feedback';

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
              ? message.room.players.find(
                  (player) => player.nickname === pendingNickname,
                )
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
          useGameStore.getState().setRoom(message.room);
          setCurrentView('lobby');
          setGeneralError(null);
          break;
        }

        case 'player_joined': {
          setRoom((previous) => {
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
          break;
        }

        case 'player_left': {
          setRoom((previous) => {
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
          break;
        }

        case 'player_ready': {
          setRoom((previous) => {
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
              setCountdown(null);
            }

            const updatedRoom = { ...previous, players: updatedPlayers };
            useGameStore.getState().setRoom(updatedRoom as Room);
            return updatedRoom;
          });
          break;
        }

        case 'color_changed': {
          setRoom((previous) => {
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
          break;
        }

        case 'game_starting': {
          setCountdown(message.countdown);
          setInterval(() => {
            setCountdown((prev) => {
              if (prev === null) return null;
              if (prev <= 1) return null;
              return prev - 1;
            });
          }, 1000);
          break;
        }

        case 'game_started': {
          const gameStore = useGameStore.getState();
          gameStore.setBoard(message.board);
          gameStore.setGameStarted(true);
          break;
        }

        case 'placement_turn': {
          useGameStore.getState().setPlacementTurn({
            currentPlayerIndex: message.currentPlayerIndex,
            currentPlayerId: message.currentPlayerId,
            phase: message.phase,
            round: message.round,
            turnNumber: message.turnNumber,
          });
          break;
        }

        case 'settlement_placed': {
          useGameStore.getState().addSettlement({
            vertexId: message.vertexId,
            playerId: message.playerId,
            isCity: false,
          });

          // Process starting resources from second settlement
          if (message.resourcesGranted && message.resourcesGranted.length > 0) {
            useGameStore
              .getState()
              .updatePlayerResources(
                message.playerId,
                message.resourcesGranted,
              );
          }
          break;
        }

        case 'road_placed': {
          useGameStore.getState().addRoad({
            edgeId: message.edgeId,
            playerId: message.playerId,
          });
          break;
        }

        case 'setup_complete': {
          // Clear placement-specific state
          useGameStore.getState().clearPlacementState();
          break;
        }

        case 'dice_rolled': {
          const gameStore = useGameStore.getState();
          // Update phase to 'main' FIRST (dice has been rolled)
          // This must happen before setDiceRoll because setTurnState clears lastDiceRoll
          gameStore.setTurnState({
            phase: 'main',
            currentPlayerId: gameStore.turnCurrentPlayerId || '',
            turnNumber: gameStore.turnNumber,
          });
          // Store dice result AFTER setTurnState (which clears lastDiceRoll)
          gameStore.setDiceRoll({
            dice1: message.dice1,
            dice2: message.dice2,
            total: message.total,
          });
          // Store resource distribution for notification display
          gameStore.setLastResourcesDistributed(message.resourcesDistributed);
          // Update resources for all affected players
          for (const grant of message.resourcesDistributed) {
            gameStore.updatePlayerResources(grant.playerId, grant.resources);
          }
          // Show notification for dice roll
          showGameNotification(`Rolled ${message.total}`, 'info');
          if (message.total === 7) {
            showGameNotification('Robber activated!', 'warning');
          }
          break;
        }

        case 'turn_changed': {
          const gameStore = useGameStore.getState();
          gameStore.setTurnState({
            phase: message.phase,
            currentPlayerId: message.currentPlayerId,
            turnNumber: message.turnNumber,
          });
          // Clear any active trade when turn changes
          gameStore.clearTrade();
          gameStore.setTradeModalOpen(false);
          break;
        }

        case 'road_built': {
          const gameStore = useGameStore.getState();
          const { edgeId, playerId, resourcesSpent } = message;
          gameStore.addRoad({ edgeId, playerId });

          // Deduct resources from player
          if (resourcesSpent) {
            const resources = Object.entries(resourcesSpent).map(
              ([type, count]) => ({
                type: type as ResourceType,
                count: -(count as number), // Negative to deduct
              }),
            );
            gameStore.updatePlayerResources(playerId, resources);
          }

          // Show notification for road built
          const builder = room?.players.find((p) => p.id === playerId);
          const nickname = builder?.nickname || 'A player';
          showGameNotification(`${nickname} built a road`, 'success');
          break;
        }

        case 'settlement_built': {
          const gameStore = useGameStore.getState();
          const { vertexId, playerId, resourcesSpent } = message;
          gameStore.addSettlement({ vertexId, playerId, isCity: false });

          // Deduct resources
          if (resourcesSpent) {
            const resources = Object.entries(resourcesSpent).map(
              ([type, count]) => ({
                type: type as ResourceType,
                count: -(count as number),
              }),
            );
            gameStore.updatePlayerResources(playerId, resources);
          }

          // Show notification for settlement built
          const builder = room?.players.find((p) => p.id === playerId);
          const nickname = builder?.nickname || 'A player';
          showGameNotification(`${nickname} built a settlement`, 'success');
          break;
        }

        case 'city_built': {
          const gameStore = useGameStore.getState();
          const { vertexId, playerId, resourcesSpent } = message;
          // Update existing settlement to city
          gameStore.upgradeToCity(vertexId);

          // Deduct resources
          if (resourcesSpent) {
            const resources = Object.entries(resourcesSpent).map(
              ([type, count]) => ({
                type: type as ResourceType,
                count: -(count as number),
              }),
            );
            gameStore.updatePlayerResources(playerId, resources);
          }

          // Show notification for city built
          const builder = room?.players.find((p) => p.id === playerId);
          const nickname = builder?.nickname || 'A player';
          showGameNotification(`${nickname} upgraded to a city`, 'success');
          break;
        }

        case 'build_failed': {
          const { reason } = message;
          showGameNotification(`Build failed: ${reason}`, 'error');
          break;
        }

        case 'trade_proposed': {
          const gameStore = useGameStore.getState();
          const { proposerId, offering, requesting } = message;
          // Initialize all non-proposer players with 'pending' response
          const responses: Record<string, 'pending' | 'accepted' | 'declined'> =
            {};
          room?.players.forEach((p) => {
            if (p.id !== proposerId) {
              responses[p.id] = 'pending';
            }
          });
          gameStore.setActiveTrade({
            proposerId,
            offering,
            requesting,
            responses,
          });
          break;
        }

        case 'trade_response': {
          const gameStore = useGameStore.getState();
          const { playerId, response } = message;
          gameStore.updateTradeResponse(playerId, response);
          break;
        }

        case 'trade_executed': {
          const gameStore = useGameStore.getState();
          const { proposerId, partnerId, proposerGave, partnerGave } = message;

          // Subtract resources from proposer (what they gave)
          const proposerDeductions = Object.entries(proposerGave)
            .filter(([_, count]) => (count as number) > 0)
            .map(([type, count]) => ({
              type: type as ResourceType,
              count: -(count as number),
            }));
          // Add resources to proposer (what they received)
          const proposerAdditions = Object.entries(partnerGave)
            .filter(([_, count]) => (count as number) > 0)
            .map(([type, count]) => ({
              type: type as ResourceType,
              count: count as number,
            }));
          gameStore.updatePlayerResources(proposerId, [
            ...proposerDeductions,
            ...proposerAdditions,
          ]);

          // Subtract resources from partner (what they gave)
          const partnerDeductions = Object.entries(partnerGave)
            .filter(([_, count]) => (count as number) > 0)
            .map(([type, count]) => ({
              type: type as ResourceType,
              count: -(count as number),
            }));
          // Add resources to partner (what they received)
          const partnerAdditions = Object.entries(proposerGave)
            .filter(([_, count]) => (count as number) > 0)
            .map(([type, count]) => ({
              type: type as ResourceType,
              count: count as number,
            }));
          gameStore.updatePlayerResources(partnerId, [
            ...partnerDeductions,
            ...partnerAdditions,
          ]);

          gameStore.clearTrade();
          gameStore.setTradeModalOpen(false);
          // Show trade notification
          const proposer = room?.players.find((p) => p.id === proposerId);
          const partner = room?.players.find((p) => p.id === partnerId);
          showGameNotification(
            `Trade completed: ${proposer?.nickname || 'Player'} ↔ ${partner?.nickname || 'Player'}`,
            'success',
          );
          break;
        }

        case 'trade_cancelled': {
          const gameStore = useGameStore.getState();
          gameStore.clearTrade();
          gameStore.setTradeModalOpen(false);
          break;
        }

        case 'bank_trade_executed': {
          const gameStore = useGameStore.getState();
          const { playerId, gave, received } = message;

          // Subtract what player gave to bank
          const deductions = Object.entries(gave)
            .filter(([_, count]) => (count as number) > 0)
            .map(([type, count]) => ({
              type: type as ResourceType,
              count: -(count as number),
            }));
          // Add what player received from bank
          const additions = Object.entries(received)
            .filter(([_, count]) => (count as number) > 0)
            .map(([type, count]) => ({
              type: type as ResourceType,
              count: count as number,
            }));
          gameStore.updatePlayerResources(playerId, [
            ...deductions,
            ...additions,
          ]);

          // Show bank trade notification
          const trader = room?.players.find((p) => p.id === playerId);
          showGameNotification(
            `${trader?.nickname || 'A player'} traded with the bank`,
            'info',
          );
          break;
        }

        // ============================================================================
        // ROBBER PHASE HANDLERS
        // ============================================================================

        case 'discard_required': {
          // Only show discard modal if this is for current player
          const myId = useGameStore.getState().myPlayerId;
          if (message.playerId === myId) {
            useGameStore
              .getState()
              .setDiscardRequired(
                true,
                message.targetCount,
                message.currentResources,
              );
          }
          break;
        }

        case 'discard_completed': {
          const gameStore = useGameStore.getState();
          // Update player resources (deduct discarded)
          const currentResources = gameStore.playerResources[message.playerId];
          if (currentResources && message.discarded) {
            const deductions = Object.entries(message.discarded)
              .filter(([_, count]) => (count as number) > 0)
              .map(([type, count]) => ({
                type: type as ResourceType,
                count: -(count as number),
              }));
            gameStore.updatePlayerResources(message.playerId, deductions);
          }
          // Remove this player from the list of players who must discard
          gameStore.removePlayerFromDiscard(message.playerId);
          // Clear own discard modal if it was us
          const myId = gameStore.myPlayerId;
          if (message.playerId === myId) {
            gameStore.setDiscardRequired(false, 0, null);
          }
          // Show notification for discard
          const discardingPlayer = room?.players.find(
            (p) => p.id === message.playerId,
          );
          const nickname = discardingPlayer?.nickname || 'A player';
          showGameNotification(`${nickname} discarded cards`, 'info');
          break;
        }

        case 'all_discards_complete': {
          // All discards done - clear the waiting state for all players
          useGameStore.getState().setWaitingForDiscards(false, []);
          // robber mover will receive robber_move_required separately
          break;
        }

        case 'robber_triggered': {
          // Block ALL players until discards are complete
          const { mustDiscardPlayers } = message;
          if (mustDiscardPlayers && mustDiscardPlayers.length > 0) {
            // Extract just the player IDs from the objects
            const playerIds = mustDiscardPlayers.map((p) => p.playerId);
            useGameStore.getState().setWaitingForDiscards(true, playerIds);
          }
          break;
        }

        case 'robber_move_required': {
          useGameStore.getState().setRobberPlacementMode(true);
          break;
        }

        case 'robber_moved': {
          const gameStore = useGameStore.getState();
          gameStore.setRobberHexId(message.hexId);
          gameStore.setRobberPlacementMode(false);
          // Show notification for robber moved
          const movingPlayer = room?.players.find(
            (p) => p.id === message.playerId,
          );
          const nickname = movingPlayer?.nickname || 'A player';
          showGameNotification(`${nickname} moved the robber`, 'info');
          break;
        }

        case 'steal_required': {
          useGameStore.getState().setStealRequired(true, message.candidates);
          break;
        }

        case 'stolen': {
          // Update resources for thief and victim
          const gameStore = useGameStore.getState();
          if (message.resourceType) {
            // Victim loses resource
            gameStore.updatePlayerResources(message.victimId, [
              { type: message.resourceType, count: -1 },
            ]);
            // Thief gains resource
            gameStore.updatePlayerResources(message.thiefId, [
              { type: message.resourceType, count: 1 },
            ]);
          }
          // Clear steal state
          gameStore.setStealRequired(false, []);
          // Show notification for steal
          const thief = room?.players.find((p) => p.id === message.thiefId);
          const victim = room?.players.find((p) => p.id === message.victimId);
          const thiefNickname = thief?.nickname || 'A player';
          const victimNickname = victim?.nickname || 'someone';
          if (message.resourceType) {
            showGameNotification(
              `${thiefNickname} stole from ${victimNickname}`,
              'info',
            );
          } else {
            showGameNotification(
              `${thiefNickname} stole nothing (no cards)`,
              'info',
            );
          }
          break;
        }

        case 'no_steal_possible': {
          // No one to steal from - just continue
          useGameStore.getState().setStealRequired(false, []);
          break;
        }

        // ============================================================================
        // DEVELOPMENT CARD HANDLERS
        // ============================================================================

        case 'dev_card_purchased': {
          // Buyer receives their card (only sent to buyer)
          const gameStore = useGameStore.getState();
          gameStore.addMyDevCard(message.card);
          gameStore.setDeckRemaining(message.deckRemaining);
          showGameNotification('Development card purchased!', 'success');
          break;
        }

        case 'dev_card_purchased_public': {
          // Other players see someone bought a card
          const gameStore = useGameStore.getState();
          gameStore.setDeckRemaining(message.deckRemaining);
          // Increment opponent's card count
          const currentCount =
            gameStore.opponentDevCardCounts[message.playerId] || 0;
          gameStore.setOpponentDevCardCount(message.playerId, currentCount + 1);
          // Show notification
          const buyer = room?.players.find((p) => p.id === message.playerId);
          const nickname = buyer?.nickname || 'A player';
          showGameNotification(`${nickname} bought a development card`, 'info');
          break;
        }

        case 'dev_card_played': {
          const gameStore = useGameStore.getState();
          const myId = gameStore.myPlayerId;

          if (message.playerId === myId) {
            // Remove card from my hand
            gameStore.removeMyDevCard(message.cardId);
            gameStore.setHasPlayedDevCardThisTurn(true);
          } else {
            // Decrement opponent's card count
            const currentCount =
              gameStore.opponentDevCardCounts[message.playerId] || 0;
            if (currentCount > 0) {
              gameStore.setOpponentDevCardCount(
                message.playerId,
                currentCount - 1,
              );
            }
          }

          // Increment knights played if knight
          if (message.cardType === 'knight') {
            gameStore.incrementKnightsPlayed(message.playerId);
            // Show notification
            const player = room?.players.find((p) => p.id === message.playerId);
            const nickname = player?.nickname || 'A player';
            showGameNotification(`${nickname} played a Knight!`, 'info');
          }
          break;
        }

        case 'dev_card_play_failed': {
          showGameNotification(`${message.reason}`, 'error');
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
            // Show error notification during gameplay
            showGameNotification(message.message, 'error');
          }
          break;
        }

        default:
          break;
      }
    },
    [currentPlayerId, pendingNickname, lastAction, room],
  );

  const { isConnected, sendMessage } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
  });

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
      sendMessage({
        type: 'join_room',
        roomId: roomCode,
        nickname: nickname.trim(),
      });
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
                        width: '36px',
                        height: '36px',
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
