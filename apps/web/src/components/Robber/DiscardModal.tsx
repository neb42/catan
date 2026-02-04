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
          You rolled a 7 and have 8+ cards. Select {target} cards to discard.
        </Text>

        <div
          style={{
            borderTop: '2px dashed #d7ccc8',
            paddingTop: '12px',
          }}
        >
          <Text size="sm" fw={500} style={{ color: '#5d4037' }}>
            Selected: {selectedTotal} / {target}
          </Text>
        </div>

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
                  <Text size="sm" style={{ color: '#5d4037' }}>
                    ({have} available)
                  </Text>
                </Group>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => toggleSelection(res, -1)}
                    disabled={choosing === 0}
                    styles={{
                      root: {
                        border: '2px solid #8d6e63',
                        color: '#5d4037',
                        background: 'transparent',
                        '&:hover': {
                          background: 'rgba(141, 110, 99, 0.1)',
                        },
                        '&:disabled': {
                          background: 'transparent',
                          border: '2px solid #d7ccc8',
                          color: '#d7ccc8',
                        },
                      },
                    }}
                  >
                    -
                  </Button>
                  <Text w={30} ta="center" style={{ color: '#5d4037' }}>
                    {choosing}
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => toggleSelection(res, 1)}
                    disabled={choosing >= have || selectedTotal >= target}
                    styles={{
                      root: {
                        border: '2px solid #8d6e63',
                        color: '#5d4037',
                        background: 'transparent',
                        '&:hover': {
                          background: 'rgba(141, 110, 99, 0.1)',
                        },
                        '&:disabled': {
                          background: 'transparent',
                          border: '2px solid #d7ccc8',
                          color: '#d7ccc8',
                        },
                      },
                    }}
                  >
                    +
                  </Button>
                </Group>
              </Group>
            );
          },
        )}

        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={!canSubmit}
          mt="md"
          styles={{
            root: {
              background: canSubmit ? '#8d6e63' : '#d7ccc8',
              color: '#fdf6e3',
              '&:hover': {
                background: canSubmit ? '#6d4c41' : '#d7ccc8',
              },
              '&:disabled': {
                background: '#d7ccc8',
                color: '#a1887f',
              },
            },
          }}
        >
          Discard {selectedTotal} Cards
        </Button>
      </Stack>
    </Modal>
  );
}
