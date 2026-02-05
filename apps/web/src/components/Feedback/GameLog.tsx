import { useState } from 'react';
import { Button, Paper, ScrollArea, Title } from '@mantine/core';
import { useGameLog } from '@web/stores/gameStore';

/**
 * GameLog component displays a collapsible side panel with game log entries.
 * - Positioned on the right side of the screen
 * - 300px wide when open, 40px when collapsed
 * - Shows log entries oldest-first (chat-style, scroll down for latest)
 * - Entries are simple strings with no timestamps or turn numbers
 */
export function GameLog() {
  const [isOpen, setIsOpen] = useState(false);
  const logEntries = useGameLog();

  return (
    <Paper
      shadow="md"
      style={{
        position: 'fixed',
        top: '80px', // Below header
        right: 0,
        bottom: 0,
        width: isOpen ? '300px' : '40px',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        background: '#fdf6e3',
        border: '4px solid #8d6e63',
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        borderRight: 'none',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header with toggle button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          borderBottom: isOpen ? '2px dashed #d7ccc8' : 'none',
          minHeight: '48px',
          background: 'rgba(0,0,0,0.03)',
        }}
      >
        {isOpen && (
          <Title order={4} style={{ margin: 0, color: '#5d4037' }}>
            Game Log
          </Title>
        )}
        <Button
          variant="subtle"
          size="xs"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Collapse log' : 'Expand log'}
          style={{
            minWidth: '24px',
            padding: '4px 8px',
            fontSize: '18px',
            color: '#5d4037',
          }}
          styles={{
            root: {
              '&:hover': {
                backgroundColor: 'rgba(93, 64, 55, 0.1)',
              },
            },
          }}
        >
          {isOpen ? '›' : '‹'}
        </Button>
      </div>

      {/* Log entries (only visible when open) */}
      {isOpen && (
        <ScrollArea
          style={{ flex: 1 }}
          type="auto"
          offsetScrollbars
          scrollbarSize={8}
        >
          <div style={{ padding: '12px' }}>
            {logEntries.length === 0 ? (
              <div
                style={{
                  color: '#8d6e63',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  marginTop: '20px',
                }}
              >
                No events yet
              </div>
            ) : (
              logEntries.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    marginBottom: '4px',
                    borderBottom: '1px solid #d7ccc8',
                    borderRadius: '6px',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    color: '#5d4037',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {entry}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </Paper>
  );
}
