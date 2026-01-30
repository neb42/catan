import { Modal, Button, Group, Stack, Text, Paper } from '@mantine/core';
import { ResourceType } from '@catan/shared';

import {
  useActiveTrade,
  useNeedsToRespondToTrade,
} from '../../hooks/useTradeState';
import { useSocket, useGameStore } from '../../stores/gameStore';

const RESOURCE_ICONS: Record<ResourceType, string> = {
  wood: '🪵',
  brick: '🧱',
  sheep: '🐑',
  wheat: '🌾',
  ore: '⛰️',
};

function ResourceDisplay({
  resources,
  label,
}: {
  resources: Record<ResourceType, number>;
  label: string;
}) {
  const nonZero = Object.entries(resources).filter(([_, count]) => count > 0);
  if (nonZero.length === 0) return null;

  return (
    <Paper p="sm" withBorder>
      <Text size="sm" fw={600} mb="xs">
        {label}
      </Text>
      <Group gap="xs">
        {nonZero.map(([resource, count]) => (
          <Text key={resource}>
            {count}x {RESOURCE_ICONS[resource as ResourceType]}
          </Text>
        ))}
      </Group>
    </Paper>
  );
}

export function TradeResponseModal() {
  const activeTrade = useActiveTrade();
  const needsToRespond = useNeedsToRespondToTrade();
  const sendMessage = useSocket();
  const room = useGameStore((state) => state.room);

  // Find proposer name
  const proposerName =
    room?.players.find((p) => p.id === activeTrade?.proposerId)?.nickname ||
    'Unknown';

  if (!needsToRespond || !activeTrade) return null;

  const handleAccept = () => {
    sendMessage?.({ type: 'respond_trade', response: 'accept' });
  };

  const handleDecline = () => {
    sendMessage?.({ type: 'respond_trade', response: 'decline' });
  };

  return (
    <Modal
      opened={true}
      onClose={() => {}} // No-op - cannot close without responding
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      title={`Trade Offer from ${proposerName}`}
      centered
    >
      <Stack gap="md">
        <Text size="sm">{proposerName} wants to trade with you:</Text>

        <ResourceDisplay resources={activeTrade.offering} label="They offer:" />
        <ResourceDisplay
          resources={activeTrade.requesting}
          label="They want:"
        />

        <Group justify="center" mt="lg">
          <Button color="green" onClick={handleAccept}>
            Accept
          </Button>
          <Button color="red" variant="outline" onClick={handleDecline}>
            Decline
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
