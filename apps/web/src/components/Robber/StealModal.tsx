import { Modal, Button, Text, Stack, Group, Badge } from '@mantine/core';
import {
  useStealRequired,
  useStealCandidates,
  useGameStore,
} from '@web/stores/gameStore';

export function StealModal() {
  const stealRequired = useStealRequired();
  const candidates = useStealCandidates();
  const sendMessage = useGameStore((s) => s.sendMessage);

  if (!stealRequired || candidates.length === 0) return null;

  const handleSteal = (victimId: string) => {
    if (!sendMessage) return;
    sendMessage({
      type: 'steal_target',
      victimId,
    });
  };

  return (
    <Modal
      opened={true}
      onClose={() => {}} // Cannot close - blocking
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      centered
      title="Choose a Player to Steal From"
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Select a player adjacent to the robber to steal one random card from.
        </Text>

        {candidates.map((candidate) => (
          <Button
            key={candidate.playerId}
            variant="light"
            fullWidth
            onClick={() => handleSteal(candidate.playerId)}
            styles={{
              root: {
                height: 'auto',
                padding: '12px 16px',
              },
            }}
          >
            <Group justify="space-between" w="100%">
              <Text fw={500}>{candidate.nickname}</Text>
              <Badge variant="filled" color="gray">
                {candidate.cardCount}{' '}
                {candidate.cardCount === 1 ? 'card' : 'cards'}
              </Badge>
            </Group>
          </Button>
        ))}
      </Stack>
    </Modal>
  );
}
