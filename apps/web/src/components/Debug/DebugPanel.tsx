import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
  useGameStore,
  useDebugMessages,
  useDebugPanelOpen,
} from '../../stores/gameStore';

type TabType = 'state' | 'messages';

function formatTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

function StateView() {
  const state = useGameStore(
    useShallow((s) => ({
      turnPhase: s.turnPhase,
      turnCurrentPlayerId: s.turnCurrentPlayerId,
      turnNumber: s.turnNumber,
      placementPhase: s.placementPhase,
      currentPlayerId: s.currentPlayerId,
      buildMode: s.buildMode,
      settlementsCount: s.settlements.length,
      roadsCount: s.roads.length,
      playerResources: s.playerResources,
      activeTrade: s.activeTrade,
      myPlayerId: s.myPlayerId,
      gameStarted: s.gameStarted,
      lastDiceRoll: s.lastDiceRoll,
    })),
  );

  return (
    <pre
      style={{
        margin: 0,
        fontSize: '11px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: 'monospace',
      }}
    >
      {JSON.stringify(state, null, 2)}
    </pre>
  );
}

interface MessageEntryProps {
  direction: 'sent' | 'received';
  type: string;
  data: unknown;
  timestamp: Date;
}

function MessageEntry({ direction, type, data, timestamp }: MessageEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const arrow = direction === 'sent' ? '>>' : '<<';
  const color = direction === 'sent' ? '#88ff88' : '#88ccff';

  return (
    <div
      style={{
        borderBottom: '1px solid #444',
        padding: '4px 0',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ color: '#888', fontSize: '10px' }}>
          {formatTimestamp(timestamp)}
        </span>
        <span style={{ color, fontWeight: 'bold' }}>{arrow}</span>
        <span style={{ color: '#fff' }}>{type}</span>
        <span style={{ color: '#666', fontSize: '10px' }}>
          {expanded ? '[-]' : '[+]'}
        </span>
      </div>
      {expanded && (
        <pre
          style={{
            margin: '4px 0 0 0',
            fontSize: '10px',
            color: '#ccc',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            paddingLeft: '16px',
            fontFamily: 'monospace',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function MessagesView() {
  const messages = useDebugMessages();
  const clearMessages = useGameStore((s) => s.clearDebugMessages);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '8px' }}>
        <button
          onClick={clearMessages}
          style={{
            background: '#444',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Clear
        </button>
        <span style={{ marginLeft: '8px', color: '#888', fontSize: '11px' }}>
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            No messages yet
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageEntry
              key={i}
              direction={msg.direction}
              type={msg.type}
              data={msg.data}
              timestamp={msg.timestamp}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function DebugPanel() {
  // Only render in development mode
  // Using process.env which Vite replaces at build time
  const isDev = process.env['NODE_ENV'] === 'development';

  const isOpen = useDebugPanelOpen();
  const setOpen = useGameStore((s) => s.setDebugPanelOpen);
  const [activeTab, setActiveTab] = useState<TabType>('state');

  // Early return after hooks
  if (!isDev) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#0f0',
          border: '1px solid #0f0',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '11px',
        }}
      >
        [Debug]
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        width: '400px',
        maxHeight: '50vh',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid #333',
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#0f0' }}>Debug Panel</span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px',
          }}
        >
          &times;
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #333',
        }}
      >
        <button
          onClick={() => setActiveTab('state')}
          style={{
            flex: 1,
            padding: '8px',
            background: activeTab === 'state' ? '#333' : 'transparent',
            color: activeTab === 'state' ? '#fff' : '#888',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          State
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            flex: 1,
            padding: '8px',
            background: activeTab === 'messages' ? '#333' : 'transparent',
            color: activeTab === 'messages' ? '#fff' : '#888',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Messages
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
          minHeight: '200px',
        }}
      >
        {activeTab === 'state' ? <StateView /> : <MessagesView />}
      </div>
    </div>
  );
}
