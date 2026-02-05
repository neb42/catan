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
  const [isOpen, setIsOpen] = useState(true);
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
        borderRadius: 0,
      }}
    >
      {/* Header with toggle button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          borderBottom: isOpen ? '1px solid #dee2e6' : 'none',
          minHeight: '48px',
        }}
      >
        {isOpen && (
          <Title order={4} style={{ margin: 0 }}>
            Game Log
          </Title>
        )}
        <Button
          variant="subtle"
          size="xs"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Collapse log' : 'Expand log'}
          style={{ minWidth: '24px', padding: '4px 8px', fontSize: '18px' }}
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
                  color: '#868e96',
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
                    padding: '6px 8px',
                    marginBottom: '4px',
                    backgroundColor:
                      index % 2 === 0 ? '#f8f9fa' : 'transparent',
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.4',
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
