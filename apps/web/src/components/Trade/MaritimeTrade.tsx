import { useState, useMemo } from 'react';
import { Button, Stack, Text, Alert, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ResourceType } from '@catan/shared';
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

  const handleGiveChange = (value: string | null) => {
    if (!value) {
      setGiving({ resource: null, amount: 0 });
      return;
    }

    const resource = value as ResourceType;
    const rate = rates[resource];
    setGiving({ resource, amount: rate });

    // If receiving is same as giving, clear it
    if (receiving.resource === resource) {
      setReceiving({ resource: null, amount: 0 });
    }
  };

  const handleReceiveChange = (value: string | null) => {
    if (!value) {
      setReceiving({ resource: null, amount: 0 });
      return;
    }

    const resource = value as ResourceType;
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

  // Build dropdown options for giving (only resources player can afford)
  const giveOptions = useMemo(() => {
    return RESOURCE_TYPES.filter((resource) => {
      const rate = rates[resource];
      return playerResources[resource] >= rate;
    }).map((resource) => ({
      value: resource,
      label: `${resource.charAt(0).toUpperCase() + resource.slice(1)} (${rates[resource]}:1) - have ${playerResources[resource]}`,
    }));
  }, [playerResources, rates]);

  // Build dropdown options for receiving (all resources except currently giving)
  const receiveOptions = useMemo(() => {
    return RESOURCE_TYPES.filter(
      (resource) => resource !== giving.resource,
    ).map((resource) => ({
      value: resource,
      label: resource.charAt(0).toUpperCase() + resource.slice(1),
    }));
  }, [giving.resource]);

  return (
    <Stack gap="md">
      {/* Port access info */}
      {hasAnyPortAccess && (
        <Alert
          color="blue"
          variant="light"
          styles={{
            root: {
              backgroundColor: '#fdf6e3',
              border: '1px solid #d7ccc8',
            },
            message: {
              color: '#5d4037',
            },
          }}
        >
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

      {/* Give selector */}
      <Select
        label="Give"
        placeholder="Select resource to trade away"
        data={giveOptions}
        value={giving.resource}
        onChange={handleGiveChange}
        styles={{
          input: {
            backgroundColor: '#fdf6e3',
            border: '1px solid #d7ccc8',
            color: '#5d4037',
          },
          label: {
            color: '#5d4037',
            fontWeight: 600,
          },
        }}
      />

      {/* Receive selector */}
      <Select
        label="Receive"
        placeholder="Select resource to receive"
        data={receiveOptions}
        value={receiving.resource}
        onChange={handleReceiveChange}
        disabled={!giving.resource}
        styles={{
          input: {
            backgroundColor: '#fdf6e3',
            border: '1px solid #d7ccc8',
            color: '#5d4037',
          },
          label: {
            color: '#5d4037',
            fontWeight: 600,
          },
        }}
      />

      {/* Trade summary */}
      {giving.resource && receiving.resource && (
        <Alert
          color="gray"
          variant="light"
          styles={{
            root: {
              backgroundColor: '#fdf6e3',
              border: '1px solid #d7ccc8',
            },
            message: {
              color: '#5d4037',
            },
          }}
        >
          <Text size="sm" fw={500}>
            Trade: {giving.amount} {giving.resource} ➔ {receiving.amount}{' '}
            {receiving.resource}
          </Text>
        </Alert>
      )}

      {/* Trade button */}
      <Button
        color="green"
        size="md"
        disabled={!canTrade}
        onClick={handleTrade}
        fullWidth
        styles={{
          root: {
            backgroundColor: canTrade ? '#6d4c41' : undefined,
            border: '2px solid #5d4037',
            '&:hover': {
              backgroundColor: canTrade ? '#8d6e63' : undefined,
            },
          },
        }}
      >
        Trade with Bank
      </Button>
    </Stack>
  );
}
