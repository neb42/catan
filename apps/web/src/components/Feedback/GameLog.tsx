import { useState, useEffect } from 'react';
import {
  Paper,
  Text,
  Stack,
  Group,
  ActionIcon,
  ScrollArea,
  Badge,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useGameLog } from '@web/stores/gameStore';

export function GameLog() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [expanded, setExpanded] = useState(false);
  const entries = useGameLog();

  // Default to closed on mobile
  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    }
  }, [isMobile]);

  const recentEntries = entries.slice(-50).reverse(); // Most recent first

  return (
    <Paper
      withBorder
      p="xs"
      style={{
        position: 'fixed',
        bottom: 60, // Above notifications
        right: 16,
        width: 300,
        maxHeight: expanded ? 400 : 48,
        overflow: 'hidden',
        transition: 'max-height 0.2s ease',
        zIndex: 100,
      }}
    >
      <Group justify="space-between" mb={expanded ? 'xs' : 0}>
        <Group gap="xs">
          <Text size="sm" fw={500}>
            Game Log
          </Text>
          <Badge size="xs" variant="light">
            {entries.length}
          </Badge>
        </Group>
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse game log' : 'Expand game log'}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <Text size="xs">{expanded ? '▼' : '▲'}</Text>
        </ActionIcon>
      </Group>

      {expanded && (
        <ScrollArea h={340} offsetScrollbars>
          <Stack gap="xs">
            {recentEntries.length === 0 && (
              <Text size="xs" c="dimmed" ta="center">
                No actions yet
              </Text>
            )}
            {recentEntries.map((entry, index) => (
              <Text key={index} size="xs" style={{ flex: 1 }}>
                {entry}
              </Text>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Paper>
  );
}
