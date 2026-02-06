import { describe, it, expect, beforeEach } from 'vitest';
import { WebSocket } from 'ws';
import { RoomManager } from '../managers/RoomManager';
import { handleCreateRoom, handleJoinRoom } from './lobby-handlers';

// Mock WebSocket
class MockWebSocket {
  sentMessages: any[] = [];

  send(data: string) {
    this.sentMessages.push(JSON.parse(data));
  }

  getLastMessage() {
    return this.sentMessages[this.sentMessages.length - 1];
  }
}

describe('handleJoinRoom - duplicate nickname handling', () => {
  let roomManager: RoomManager;
  let ws1: MockWebSocket;
  let ws2: MockWebSocket;
  let context1: { currentRoomId: string | null; playerId: string | null };
  let context2: { currentRoomId: string | null; playerId: string | null };

  beforeEach(() => {
    roomManager = new RoomManager();
    ws1 = new MockWebSocket();
    ws2 = new MockWebSocket();
    context1 = { currentRoomId: null, playerId: null };
    context2 = { currentRoomId: null, playerId: null };
  });

  it('should auto-generate unique nickname when duplicate detected', () => {
    // Create room with first player
    handleCreateRoom(
      ws1 as unknown as WebSocket,
      { type: 'create_room', nickname: 'TestPlayer' },
      roomManager,
      context1,
    );

    const roomId = context1.currentRoomId;
    expect(roomId).toBeTruthy();

    // Second player tries to join with same nickname
    handleJoinRoom(
      ws2 as unknown as WebSocket,
      { type: 'join_room', roomId: roomId!, nickname: 'TestPlayer' },
      roomManager,
      context2,
    );

    // Get the room to check players
    const room = roomManager.getRoom(roomId!);
    expect(room).toBeTruthy();
    expect(room!.players.size).toBe(2);

    // Check that nicknames are different
    const nicknames = Array.from(room!.players.values()).map((p) => p.nickname);
    expect(nicknames).toContain('TestPlayer');
    expect(nicknames).toContain('TestPlayer 2');
  });

  it('should handle multiple duplicate nicknames', () => {
    // Create room with first player
    handleCreateRoom(
      ws1 as unknown as WebSocket,
      { type: 'create_room', nickname: 'TestPlayer' },
      roomManager,
      context1,
    );

    const roomId = context1.currentRoomId;

    // Second player joins with same nickname
    const ws3 = new MockWebSocket();
    const context3 = { currentRoomId: null, playerId: null };
    handleJoinRoom(
      ws2 as unknown as WebSocket,
      { type: 'join_room', roomId: roomId!, nickname: 'TestPlayer' },
      roomManager,
      context2,
    );

    // Third player also tries same nickname
    handleJoinRoom(
      ws3 as unknown as WebSocket,
      { type: 'join_room', roomId: roomId!, nickname: 'TestPlayer' },
      roomManager,
      context3,
    );

    // Check all three players have unique nicknames
    const room = roomManager.getRoom(roomId!);
    expect(room!.players.size).toBe(3);

    const nicknames = Array.from(room!.players.values()).map((p) => p.nickname);
    expect(nicknames).toContain('TestPlayer');
    expect(nicknames).toContain('TestPlayer 2');
    expect(nicknames).toContain('TestPlayer 3');
  });

  it('should not modify nickname if it is unique', () => {
    // Create room with first player
    handleCreateRoom(
      ws1 as unknown as WebSocket,
      { type: 'create_room', nickname: 'Player1' },
      roomManager,
      context1,
    );

    const roomId = context1.currentRoomId;

    // Second player joins with different nickname
    handleJoinRoom(
      ws2 as unknown as WebSocket,
      { type: 'join_room', roomId: roomId!, nickname: 'Player2' },
      roomManager,
      context2,
    );

    // Check that nicknames are unchanged
    const room = roomManager.getRoom(roomId!);
    const nicknames = Array.from(room!.players.values()).map((p) => p.nickname);
    expect(nicknames).toContain('Player1');
    expect(nicknames).toContain('Player2');
    expect(nicknames).not.toContain('Player2 2');
  });
});
