import { useState, useMemo } from 'react';
import { Button, Divider, Stack, Text, Group, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ResourceType } from '@catan/shared';
import { ResourceSelector } from './ResourceSelector';
import { useGameStore, useSocket } from '../../stores/gameStore';
import { usePortAccess, getBestRate } from '../../hooks/usePortAccess';

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

export function MaritimeTrade() {
  const playerResources = useGameStore(
    (state) =>
      state.playerResources[state.myPlayerId || ''] || createEmptyResources(),
  );
  const sendMessage = useSocket();
  const portAccess = usePortAccess();

  const [giving, setGiving] = useState<{
    resource: ResourceType | null;
    amount: number;
  }>({
    resource: null,
    amount: 0,
  });
  const [receiving, setReceiving] = useState<{
    resource: ResourceType | null;
    amount: number;
  }>({
    resource: null,
    amount: 0,
  });

  // Get rates for each resource
  const rates = useMemo(() => {
    const result: Record<ResourceType, number> = {} as Record<
      ResourceType,
      number
    >;
    for (const resource of RESOURCE_TYPES) {
      result[resource] = getBestRate(resource, portAccess);
    }
    return result;
  }, [portAccess]);

  const handleGiveSelect = (resource: ResourceType) => {
    const rate = rates[resource];
    const maxCanGive = Math.floor(playerResources[resource] / rate);

    if (maxCanGive === 0) {
      // Can't afford to trade this resource
      return;
    }

    // If selecting same resource, deselect
    if (giving.resource === resource) {
      setGiving({ resource: null, amount: 0 });
      setReceiving({ resource: null, amount: 0 });
      return;
    }

    // Select this resource for giving
    setGiving({ resource, amount: rate });
    // If receiving is set, keep it; if not, don't auto-set
    if (receiving.resource) {
      setReceiving({ resource: receiving.resource, amount: 1 });
    }
  };

  const handleReceiveSelect = (resource: ResourceType) => {
    // Can't receive what you're giving
    if (resource === giving.resource) return;

    // If selecting same resource, deselect
    if (receiving.resource === resource) {
      setReceiving({ resource: null, amount: 0 });
      return;
    }

    // Need to select giving resource first
    if (!giving.resource) {
      notifications.show({
        title: 'Select resource to give first',
        message: 'Choose which resource you want to trade away',
        color: 'yellow',
      });
      return;
    }

    setReceiving({ resource, amount: 1 });
  };

  const canTrade =
    giving.resource !== null &&
    receiving.resource !== null &&
    giving.amount > 0 &&
    receiving.amount > 0 &&
    playerResources[giving.resource] >= giving.amount;

  const handleTrade = () => {
    if (!sendMessage || !canTrade || !giving.resource || !receiving.resource)
      return;

    const givingResources = createEmptyResources();
    const receivingResources = createEmptyResources();
    givingResources[giving.resource] = giving.amount;
    receivingResources[receiving.resource] = receiving.amount;

    sendMessage({
      type: 'execute_bank_trade',
      giving: givingResources,
      receiving: receivingResources,
    });

    // Reset state
    setGiving({ resource: null, amount: 0 });
    setReceiving({ resource: null, amount: 0 });

    notifications.show({
      title: 'Trade Complete',
      message: `Traded ${giving.amount} ${giving.resource} for ${receiving.amount} ${receiving.resource}`,
      color: 'green',
    });
  };

  // Check if player has any port access
  const hasAnyPortAccess =
    portAccess.hasGeneric3to1 || portAccess.specificPorts.length > 0;

  return (
    <Stack gap="md">
      {/* Port access info */}
      {hasAnyPortAccess && (
        <Alert color="blue" variant="light">
          <Text size="sm">
            You have access to:{' '}
            {portAccess.specificPorts.length > 0 &&
              portAccess.specificPorts.map((r) => `${r} (2:1)`).join(', ')}
            {portAccess.specificPorts.length > 0 &&
              portAccess.hasGeneric3to1 &&
              ', '}
            {portAccess.hasGeneric3to1 && 'Generic (3:1)'}
          </Text>
        </Alert>
      )}

      <Group justify="space-around" align="flex-start">
        {/* Give section */}
        <Stack gap="xs">
          <Text fw={600} size="sm" c="dimmed">
            Give (select one resource)
          </Text>
          {RESOURCE_TYPES.map((resource) => {
            const rate = rates[resource];
            const maxCanGive = Math.floor(playerResources[resource] / rate);
            const isSelected = giving.resource === resource;
            const canAfford = maxCanGive > 0;

            return (
              <Group
                key={`give-${resource}`}
                gap="xs"
                style={{
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.5,
                  backgroundColor: isSelected
                    ? 'var(--mantine-color-blue-light)'
                    : undefined,
                  padding: '4px 8px',
                  borderRadius: 4,
                }}
                onClick={() => canAfford && handleGiveSelect(resource)}
              >
                <ResourceSelector
                  resource={resource}
                  value={isSelected ? giving.amount : 0}
                  max={playerResources[resource]}
                  onChange={() => {}}
                  rateLabel={`(${rate}:1)`}
                  disabled={true}
                />
                <Text size="xs" c="dimmed">
                  (have {playerResources[resource]})
                </Text>
              </Group>
            );
          })}
        </Stack>

        <Divider />

        {/* Receive section */}
        <Stack gap="xs">
          <Text fw={600} size="sm" c="dimmed">
            Receive (select one resource)
          </Text>
          {RESOURCE_TYPES.map((resource) => {
            const isSelected = receiving.resource === resource;
            const isGiving = giving.resource === resource;

            return (
              <Group
                key={`receive-${resource}`}
                gap="xs"
                style={{
                  cursor: isGiving ? 'not-allowed' : 'pointer',
                  opacity: isGiving ? 0.5 : 1,
                  backgroundColor: isSelected
                    ? 'var(--mantine-color-green-light)'
                    : undefined,
                  padding: '4px 8px',
                  borderRadius: 4,
                }}
                onClick={() => !isGiving && handleReceiveSelect(resource)}
              >
                <ResourceSelector
                  resource={resource}
                  value={isSelected ? receiving.amount : 0}
                  max={99}
                  onChange={() => {}}
                  disabled={true}
                />
              </Group>
            );
          })}
        </Stack>
      </Group>

      <Divider />

      {/* Trade summary and button */}
      {giving.resource && receiving.resource && (
        <Alert color="gray" variant="light">
          <Text size="sm" fw={500}>
            Trade: {giving.amount} {giving.resource} ➔ {receiving.amount}{' '}
            {receiving.resource}
          </Text>
        </Alert>
      )}

      <Group justify="center">
        <Button
          color="green"
          size="md"
          disabled={!canTrade}
          onClick={handleTrade}
        >
          Trade with Bank
        </Button>
      </Group>

      {!giving.resource && (
        <Text size="xs" c="dimmed" ta="center">
          Click a resource above to select what to trade away
        </Text>
      )}
    </Stack>
  );
}
