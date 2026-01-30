import { Modal, Button, Stack, Text, SimpleGrid } from '@mantine/core';
import { ResourceType } from '@catan/shared';
import { useGameStore, useDevCardPlayPhase } from '../../stores/gameStore';

const RESOURCES: ResourceType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore'];

const RESOURCE_COLORS: Record<ResourceType, string> = {
  wood: '#228B22',
  brick: '#B22222',
  sheep: '#90EE90',
  wheat: '#FFD700',
  ore: '#808080',
};

export function MonopolyModal() {
  const devCardPlayPhase = useDevCardPlayPhase();
  const sendMessage = useGameStore((s) => s.sendMessage);

  const isOpen = devCardPlayPhase === 'monopoly';

  const handleSelect = (resourceType: ResourceType) => {
    if (!sendMessage) return;
    sendMessage({
      type: 'monopoly_select',
      resourceType,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      opened={true}
      onClose={() => {}} // Blocking modal - cannot close
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      title="Monopoly"
      centered
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Choose a resource type to take from all other players. You will
          receive ALL of that resource from every opponent.
        </Text>

        <SimpleGrid cols={3} spacing="sm">
          {RESOURCES.map((resource) => (
            <Button
              key={resource}
              onClick={() => handleSelect(resource)}
              size="lg"
              variant="filled"
              color={RESOURCE_COLORS[resource]}
              styles={{
                root: {
                  height: 60,
                },
              }}
            >
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </Button>
          ))}
        </SimpleGrid>
      </Stack>
    </Modal>
  );
}
