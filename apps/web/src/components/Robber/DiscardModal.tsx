import { Modal, Button, Text, Group, Stack, Badge } from '@mantine/core';
import { useDiscardState, useGameStore } from '@web/stores/gameStore';
import { ResourceType } from '@catan/shared';

const RESOURCE_COLORS: Record<ResourceType, string> = {
  wood: '#228B22',
  brick: '#B22222',
  sheep: '#90EE90',
  wheat: '#FFD700',
  ore: '#808080',
};

export function DiscardModal() {
  const { required, target, resources, selected } = useDiscardState();
  const toggleSelection = useGameStore((s) => s.toggleDiscardSelection);
  const sendMessage = useGameStore((s) => s.sendMessage);

  if (!required || !resources) return null;

  const selectedTotal = Object.values(selected).reduce((sum, c) => sum + c, 0);
  const canSubmit = selectedTotal === target;

  const handleSubmit = () => {
    if (!sendMessage) return;
    sendMessage({
      type: 'discard_submitted',
      resources: selected,
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
      title={`Discard ${target} Cards`}
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          You rolled a 7 and have 8+ cards. Select {target} cards to discard.
        </Text>

        <Text size="sm" fw={500}>
          Selected: {selectedTotal} / {target}
        </Text>

        {(['wood', 'brick', 'sheep', 'wheat', 'ore'] as ResourceType[]).map(
          (res) => {
            const have = resources[res] || 0;
            const choosing = selected[res] || 0;

            if (have === 0) return null;

            return (
              <Group key={res} justify="space-between" align="center">
                <Group gap="xs">
                  <Badge
                    color={RESOURCE_COLORS[res]}
                    variant="filled"
                    size="lg"
                  >
                    {res.charAt(0).toUpperCase() + res.slice(1)}
                  </Badge>
                  <Text size="sm">({have} available)</Text>
                </Group>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => toggleSelection(res, -1)}
                    disabled={choosing === 0}
                  >
                    -
                  </Button>
                  <Text w={30} ta="center">
                    {choosing}
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => toggleSelection(res, 1)}
                    disabled={choosing >= have || selectedTotal >= target}
                  >
                    +
                  </Button>
                </Group>
              </Group>
            );
          },
        )}

        <Button fullWidth onClick={handleSubmit} disabled={!canSubmit} mt="md">
          Discard {selectedTotal} Cards
        </Button>
      </Stack>
    </Modal>
  );
}
