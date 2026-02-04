import { ActionIcon, Group, Text } from '@mantine/core';
import { ResourceType } from '@catan/shared';
import { ResourceIcon } from '../ResourceIcon/ResourceIcon';

const RESOURCE_LABELS: Record<ResourceType, string> = {
  wood: 'Wood',
  brick: 'Brick',
  sheep: 'Sheep',
  wheat: 'Wheat',
  ore: 'Ore',
};

interface ResourceSelectorProps {
  resource: ResourceType;
  value: number;
  max: number; // Max selectable (owned amount for "give" side)
  onChange: (value: number) => void;
  rateLabel?: string; // Optional rate label like "(2:1)"
  disabled?: boolean;
  showMax?: boolean;
}

export function ResourceSelector({
  resource,
  value,
  max,
  onChange,
  rateLabel,
  disabled = false,
  showMax = false,
}: ResourceSelectorProps) {
  return (
    <Group gap="xs" align="center">
      <ResourceIcon type={resource} size="md" />
      <Text size="sm" w={50}>
        {RESOURCE_LABELS[resource]}
      </Text>
      {rateLabel && (
        <Text size="xs" c="dimmed">
          {rateLabel}
        </Text>
      )}

      <ActionIcon
        variant="default"
        size="sm"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value <= 0}
      >
        -
      </ActionIcon>

      <Text w={40} ta="center" fw={600}>
        {showMax ? `${value} / ${max}` : value}
      </Text>

      <ActionIcon
        variant="default"
        size="sm"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
      >
        +
      </ActionIcon>
    </Group>
  );
}
