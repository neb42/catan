import { ActionIcon, Group, Text } from '@mantine/core';
import { ResourceType } from '@catan/shared';

const RESOURCE_ICONS: Record<ResourceType, string> = {
  wood: '🪵',
  brick: '🧱',
  sheep: '🐑',
  wheat: '🌾',
  ore: '⛰️',
};

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
}

export function ResourceSelector({
  resource,
  value,
  max,
  onChange,
  rateLabel,
  disabled = false,
}: ResourceSelectorProps) {
  return (
    <Group gap="xs" align="center">
      <Text size="lg">{RESOURCE_ICONS[resource]}</Text>
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

      <Text w={30} ta="center" fw={600}>
        {value}
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
