import { useState } from 'react';
import { Modal, Button, Group, Stack, Text, Badge } from '@mantine/core';
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

export function ResourcePickerModal() {
  const devCardPlayPhase = useDevCardPlayPhase();
  const sendMessage = useGameStore((s) => s.sendMessage);
  const [selected, setSelected] = useState<ResourceType[]>([]);

  const isOpen = devCardPlayPhase === 'year_of_plenty';

  const handleSelect = (resource: ResourceType) => {
    if (selected.length >= 2) return;
    setSelected([...selected, resource]);
  };

  const handleRemove = (index: number) => {
    setSelected(selected.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selected.length !== 2 || !sendMessage) return;

    sendMessage({
      type: 'year_of_plenty_select',
      resources: selected as [ResourceType, ResourceType],
    });

    setSelected([]);
  };

  if (!isOpen) return null;

  return (
    <Modal
      opened={true}
      onClose={() => {}} // Blocking modal - cannot close
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      title="Year of Plenty"
      centered
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Select 2 resources to take from the bank. You can select the same
          resource twice.
        </Text>

        <Group gap="xs">
          <Text fw={500}>Selected:</Text>
          {selected.length === 0 && <Text c="dimmed">None</Text>}
          {selected.map((resource, i) => (
            <Badge
              key={i}
              size="lg"
              color={RESOURCE_COLORS[resource]}
              style={{ cursor: 'pointer' }}
              onClick={() => handleRemove(i)}
              variant="filled"
            >
              {resource.charAt(0).toUpperCase() + resource.slice(1)} ✕
            </Badge>
          ))}
        </Group>

        <Group justify="center" gap="sm">
          {RESOURCES.map((resource) => (
            <Button
              key={resource}
              onClick={() => handleSelect(resource)}
              disabled={selected.length >= 2}
              variant="outline"
              color={RESOURCE_COLORS[resource]}
              styles={{
                root: {
                  borderColor: RESOURCE_COLORS[resource],
                  color: RESOURCE_COLORS[resource],
                },
              }}
            >
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </Button>
          ))}
        </Group>

        <Button
          onClick={handleSubmit}
          disabled={selected.length !== 2}
          fullWidth
          mt="md"
        >
          Take {selected.length}/2 Resources
        </Button>
      </Stack>
    </Modal>
  );
}
