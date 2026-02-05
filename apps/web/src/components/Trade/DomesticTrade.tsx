import { useState, useMemo } from 'react';
import { Button, Divider, Stack, Text, Group, Badge } from '@mantine/core';
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

  // Get room for player names
  const room = useGameStore((state) => state.room);

  // Get all non-proposer players with their response status
  const otherPlayers = useMemo(() => {
    if (!activeTrade || !room) return [];
    return room.players
      .filter((p) => p.id !== activeTrade.proposerId)
      .map((p) => ({
        ...p,
        response: activeTrade.responses[p.id] || 'pending',
      }));
  }, [activeTrade, room]);

  const handleSelectPartner = (partnerId: string) => {
    sendMessage?.({ type: 'select_trade_partner', partnerId });
  };

  const handleCancel = () => {
    sendMessage?.({ type: 'cancel_trade' });
  };

  if (isWaiting) {
    return (
      <Stack gap="md">
        <Text size="lg" fw={500} ta="center">
          Waiting for responses...
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Other players are reviewing your trade offer
        </Text>

        <Divider my="xs" />

        {/* Response status for each player */}
        <Stack gap="xs">
          {otherPlayers.map((player) => (
            <Group key={player.id} justify="space-between">
              <Text size="sm">{player.nickname}</Text>
              {player.response === 'pending' && (
                <Badge color="gray">Pending</Badge>
              )}
              {player.response === 'accepted' && (
                <Group gap="xs">
                  <Badge color="green">Accepted</Badge>
                  <Button
                    size="sm"
                    onClick={() => handleSelectPartner(player.id)}
                    style={{ minHeight: '44px' }}
                  >
                    Trade
                  </Button>
                </Group>
              )}
              {player.response === 'declined' && (
                <Badge color="red">Declined</Badge>
              )}
            </Group>
          ))}
        </Stack>

        <Divider my="xs" />

        <Group justify="center">
          <Button color="red" variant="outline" onClick={handleCancel}>
            Cancel Trade
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-around" align="flex-start">
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
              showMax
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
      </Group>

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
