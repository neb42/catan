import { useState } from 'react';
import {
  Paper,
  Text,
  Stack,
  Group,
  ActionIcon,
  ScrollArea,
  Badge,
} from '@mantine/core';
import { useGameLog } from '@web/stores/gameStore';

const TYPE_COLORS = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red',
} as const;

export function GameLog() {
  const [expanded, setExpanded] = useState(false);
  const entries = useGameLog();

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
          size="sm"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse game log' : 'Expand game log'}
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
            {recentEntries.map((entry) => (
              <Group key={entry.id} gap="xs" wrap="nowrap" align="flex-start">
                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  {entry.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Badge
                  size="xs"
                  color={TYPE_COLORS[entry.type]}
                  variant="dot"
                />
                <Text size="xs" style={{ flex: 1 }}>
                  {entry.message}
                </Text>
              </Group>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Paper>
  );
}
