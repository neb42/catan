import { Button, Group, Paper, Stack, Text, Badge } from '@mantine/core';

import { useActiveTrade, useTradeActions } from '../../hooks/useTradeState';
import { useSocket, useGameStore } from '../../stores/gameStore';

export function TradeProposerView() {
  const activeTrade = useActiveTrade();
  const { clearTrade } = useTradeActions();
  const sendMessage = useSocket();
  const room = useGameStore((state) => state.room);
  const myPlayerId = useGameStore((state) => state.myPlayerId);

  // Only show to proposer when there's an active trade they proposed
  if (!activeTrade || activeTrade.proposerId !== myPlayerId) return null;

  const handleCancel = () => {
    sendMessage?.({ type: 'cancel_trade' });
  };

  const handleSelectPartner = (partnerId: string) => {
    sendMessage?.({ type: 'select_trade_partner', partnerId });
  };

  // Get all non-proposer players with their response status
  const otherPlayers =
    room?.players
      .filter((p) => p.id !== activeTrade.proposerId)
      .map((p) => ({
        ...p,
        response: activeTrade.responses[p.id] || 'pending',
      })) || [];

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Text fw={600}>Trade Proposal Active</Text>
        <Text size="sm" c="dimmed">
          Waiting for responses...
        </Text>

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
                    size="xs"
                    onClick={() => handleSelectPartner(player.id)}
                  >
                    Trade with {player.nickname}
                  </Button>
                </Group>
              )}
              {player.response === 'declined' && (
                <Badge color="red">Declined</Badge>
              )}
            </Group>
          ))}
        </Stack>

        <Button color="red" variant="outline" onClick={handleCancel}>
          Cancel Trade
        </Button>
      </Stack>
    </Paper>
  );
}
