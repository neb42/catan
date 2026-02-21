import type { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { WebSocketMessageSchema } from '@catan/shared';

import { RoomManager } from '../managers/RoomManager';
import { logMessage } from '../utils/message-logger';
import * as BuildingHandlers from './building-handlers';
import * as DevCardHandlers from './dev-card-handlers';
import { sendError, serializeRoom } from './handler-utils';
import * as LobbyHandlers from './lobby-handlers';
import * as PlacementHandlers from './placement-handlers';
import * as RobberHandlers from './robber-handlers';
import * as TradingHandlers from './trading-handlers';
import * as TurnHandlers from './turn-handlers';

// Extended WebSocket with heartbeat tracking
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

// Heartbeat interval: 30 seconds (industry standard)
const HEARTBEAT_INTERVAL_MS = 30000;

export function handleWebSocketConnection(
  ws: WebSocket,
  roomManager: RoomManager,
  _request?: IncomingMessage,
): void {
  let currentRoomId: string | null = null;
  let playerId: string | null = null;

  // Cast to ExtendedWebSocket for heartbeat tracking
  const extWs = ws as ExtendedWebSocket;
  extWs.isAlive = true;

  // Set up heartbeat ping/pong
  const heartbeatInterval = setInterval(() => {
    if (!currentRoomId) return;

    const room = roomManager.getRoom(currentRoomId);
    if (!room) return;

    // Check all players in room for dead connections
    room.players.forEach((player) => {
      const playerWs = player.ws as ExtendedWebSocket;

      if (playerWs.isAlive === false) {
        // Connection is dead - trigger disconnect and pause game
        console.log(
          `[WebSocket] Dead connection detected for player ${player.id}`,
        );
        roomManager.pauseGame(currentRoomId!, player.id);
        return;
      }

      // Mark as not alive, will be reset by pong
      playerWs.isAlive = false;
      playerWs.ping();
    });
  }, HEARTBEAT_INTERVAL_MS);

  // Handle pong response
  extWs.on('pong', () => {
    extWs.isAlive = true;
  });

  ws.on('message', (data) => {
    let parsed: unknown;

    try {
      parsed = JSON.parse(data.toString());
    } catch (error) {
      console.error('Invalid JSON message', error);
      sendError(ws, 'Invalid room ID');
      return;
    }

    const result = WebSocketMessageSchema.safeParse(parsed);
    if (!result.success) {
      console.error(
        '[WebSocket] Message validation failed:',
        result.error.format(),
      );
      console.error(
        '[WebSocket] Received message:',
        JSON.stringify(parsed, null, 2),
      );
      sendError(ws, 'Invalid room ID');
      return;
    }

    const message = result.data;

    // Log received message (use roomId from message for create/join, otherwise currentRoomId)
    const logRoomId =
      currentRoomId ||
      ('roomId' in message ? message.roomId : null) ||
      'no-room';
    logMessage(logRoomId, 'recv', message);

    const context = { currentRoomId, playerId };

    switch (message.type) {
      // Lobby
      case 'create_room':
        LobbyHandlers.handleCreateRoom(ws, message, roomManager, context);
        currentRoomId = context.currentRoomId;
        playerId = context.playerId;
        break;
      case 'join_room':
        LobbyHandlers.handleJoinRoom(ws, message, roomManager, context);
        currentRoomId = context.currentRoomId;
        playerId = context.playerId;
        break;
      case 'toggle_ready':
        LobbyHandlers.handleToggleReady(ws, message, roomManager, context);
        break;
      case 'change_color':
        LobbyHandlers.handleChangeColor(ws, message, roomManager, context);
        break;
      case 'change_nickname':
        LobbyHandlers.handleChangeNickname(ws, message, roomManager, context);
        break;
      case 'request_rematch':
        LobbyHandlers.handleRequestRematch(ws, message, roomManager, context);
        break;

      // Placement
      case 'place_settlement':
        PlacementHandlers.handlePlaceSettlement(
          ws,
          message,
          roomManager,
          context,
        );
        break;
      case 'place_road':
        PlacementHandlers.handlePlaceRoad(ws, message, roomManager, context);
        break;

      // Turn management
      case 'roll_dice':
        TurnHandlers.handleRollDice(ws, message, roomManager, context);
        break;
      case 'end_turn':
        TurnHandlers.handleEndTurn(ws, message, roomManager, context);
        break;

      // Building
      case 'build_road':
        BuildingHandlers.handleBuildRoad(ws, message, roomManager, context);
        break;
      case 'build_settlement':
        BuildingHandlers.handleBuildSettlement(
          ws,
          message,
          roomManager,
          context,
        );
        break;
      case 'build_city':
        BuildingHandlers.handleBuildCity(ws, message, roomManager, context);
        break;

      // Trading
      case 'propose_trade':
        TradingHandlers.handleProposeTrade(ws, message, roomManager, context);
        break;
      case 'respond_trade':
        TradingHandlers.handleRespondTrade(ws, message, roomManager, context);
        break;
      case 'select_trade_partner':
        TradingHandlers.handleSelectTradePartner(
          ws,
          message,
          roomManager,
          context,
        );
        break;
      case 'cancel_trade':
        TradingHandlers.handleCancelTrade(ws, message, roomManager, context);
        break;
      case 'execute_bank_trade':
        TradingHandlers.handleExecuteBankTrade(
          ws,
          message,
          roomManager,
          context,
        );
        break;

      // Robber
      case 'discard_submitted':
        RobberHandlers.handleDiscardSubmitted(
          ws,
          message,
          roomManager,
          context,
        );
        break;
      case 'move_robber':
        RobberHandlers.handleMoveRobber(ws, message, roomManager, context);
        break;
      case 'steal_target':
        RobberHandlers.handleStealTarget(ws, message, roomManager, context);
        break;

      // Development cards
      case 'buy_dev_card':
        DevCardHandlers.handleBuyDevCard(ws, message, roomManager, context);
        break;
      case 'play_dev_card':
        DevCardHandlers.handlePlayDevCard(ws, message, roomManager, context);
        break;
      case 'year_of_plenty_select':
        DevCardHandlers.handleYearOfPlentySelect(
          ws,
          message,
          roomManager,
          context,
        );
        break;
      case 'monopoly_select':
        DevCardHandlers.handleMonopolySelect(ws, message, roomManager, context);
        break;
      case 'road_building_place':
        DevCardHandlers.handleRoadBuildingPlace(
          ws,
          message,
          roomManager,
          context,
        );
        break;

      default:
        sendError(ws, 'Invalid room ID', currentRoomId || undefined);
    }
  });

  ws.on('close', () => {
    // Clear heartbeat interval
    clearInterval(heartbeatInterval);

    if (!currentRoomId || !playerId) return;

    const room = roomManager.getRoom(currentRoomId);
    const gameManager = roomManager.getGameManager(currentRoomId);

    // If game is active, pause instead of removing player
    if (room && gameManager && room.board) {
      roomManager.pauseGame(currentRoomId, playerId);
      return;
    }

    // No active game - remove player normally
    roomManager.removePlayer(currentRoomId, playerId);
    roomManager.broadcastToRoom(currentRoomId, {
      type: 'player_left',
      playerId,
    });

    const updatedRoom = roomManager.getRoom(currentRoomId);
    if (updatedRoom) {
      roomManager.broadcastToRoom(currentRoomId, {
        type: 'room_state',
        room: serializeRoom(updatedRoom),
      });
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error', error);
  });
}
