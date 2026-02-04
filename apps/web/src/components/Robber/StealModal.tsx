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
      styles={{
        content: {
          background: '#fdf6e3',
          border: '4px solid #8d6e63',
          borderRadius: '12px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        },
        header: {
          background: 'transparent',
        },
        title: {
          fontFamily: 'Fraunces, serif',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#5d4037',
        },
        body: {
          color: '#5d4037',
        },
      }}
    >
      <Stack gap="md">
        <Text size="sm" style={{ color: '#5d4037' }}>
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
                background: 'white',
                border: '2px solid #8d6e63',
                color: '#5d4037',
                '&:hover': {
                  background: 'rgba(141, 110, 99, 0.1)',
                  borderColor: '#6d4c41',
                },
              },
              label: {
                width: '100%',
              },
            }}
          >
            <Group justify="space-between" w="100%">
              <Text fw={500} style={{ color: '#5d4037' }}>
                {candidate.nickname}
              </Text>
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
