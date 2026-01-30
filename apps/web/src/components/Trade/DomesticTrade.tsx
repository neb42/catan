import { useState, useMemo } from 'react';
import { Button, Divider, Stack, Text, Group } from '@mantine/core';
import { ResourceType } from '@catan/shared';
import { ResourceSelector } from './ResourceSelector';
import { useGameStore, useSocket } from '../../stores/gameStore';
import { useActiveTrade } from '../../hooks/useTradeState';

const RESOURCE_TYPES: ResourceType[] = [
  'wood',
  'brick',
  'sheep',
  'wheat',
  'ore',
];

function createEmptyResources(): Record<ResourceType, number> {
  return { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
}

export function DomesticTrade() {
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const playerResources = useGameStore(
    (state) =>
      state.playerResources[state.myPlayerId || ''] || createEmptyResources(),
  );
  const sendMessage = useSocket();
  const activeTrade = useActiveTrade();

  const [offering, setOffering] = useState<Record<ResourceType, number>>(
    createEmptyResources(),
  );
  const [requesting, setRequesting] = useState<Record<ResourceType, number>>(
    createEmptyResources(),
  );

  const handleOfferingChange = (resource: ResourceType, value: number) => {
    setOffering((prev) => ({ ...prev, [resource]: value }));
  };

  const handleRequestingChange = (resource: ResourceType, value: number) => {
    setRequesting((prev) => ({ ...prev, [resource]: value }));
  };

  const totalOffering = useMemo(
    () => Object.values(offering).reduce((sum, v) => sum + v, 0),
    [offering],
  );

  const totalRequesting = useMemo(
    () => Object.values(requesting).reduce((sum, v) => sum + v, 0),
    [requesting],
  );

  const canPropose = totalOffering > 0 && totalRequesting > 0;

  const handlePropose = () => {
    if (!sendMessage || !canPropose) return;

    sendMessage({
      type: 'propose_trade',
      offering,
      requesting,
    });
  };

  // Show waiting state if we have an active trade proposal from us
  const isWaiting = activeTrade && activeTrade.proposerId === myPlayerId;

  if (isWaiting) {
    return (
      <Stack align="center" py="xl">
        <Text size="lg" fw={500}>
          Waiting for responses...
        </Text>
        <Text size="sm" c="dimmed">
          Other players are reviewing your trade offer
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* You Give section */}
      <Stack gap="xs">
        <Text fw={600} size="sm" c="dimmed">
          You Give
        </Text>
        {RESOURCE_TYPES.map((resource) => (
          <ResourceSelector
            key={`offer-${resource}`}
            resource={resource}
            value={offering[resource]}
            max={playerResources[resource]}
            onChange={(v) => handleOfferingChange(resource, v)}
          />
        ))}
      </Stack>

      <Divider />

      {/* You Want section */}
      <Stack gap="xs">
        <Text fw={600} size="sm" c="dimmed">
          You Want
        </Text>
        {RESOURCE_TYPES.map((resource) => (
          <ResourceSelector
            key={`request-${resource}`}
            resource={resource}
            value={requesting[resource]}
            max={99}
            onChange={(v) => handleRequestingChange(resource, v)}
          />
        ))}
      </Stack>

      <Divider />

      {/* Propose button */}
      <Group justify="center">
        <Button
          color="blue"
          size="md"
          disabled={!canPropose}
          onClick={handlePropose}
        >
          Propose Trade
        </Button>
      </Group>

      {!canPropose && (
        <Text size="xs" c="dimmed" ta="center">
          Select at least one resource to give and one to receive
        </Text>
      )}
    </Stack>
  );
}
