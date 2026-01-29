import { Button, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { BUILDING_COSTS } from '@catan/shared';
import type { BuildingType } from '@catan/shared';
import {
  useBuildMode,
  useCanBuild,
  useRemainingPieces,
} from '../../hooks/useBuildMode';
import { useGameStore } from '../../stores/gameStore';

// Resource emoji icons for inline display
const RESOURCE_ICONS: Record<string, string> = {
  wood: '🪵',
  brick: '🧱',
  sheep: '🐑',
  wheat: '🌾',
  ore: '⛰️',
};

// Building configuration
const BUILDING_CONFIG: Record<
  BuildingType,
  { label: string; icon: string; pieceKey: 'roads' | 'settlements' | 'cities' }
> = {
  road: { label: 'Road', icon: '🛤️', pieceKey: 'roads' },
  settlement: { label: 'Settlement', icon: '🏠', pieceKey: 'settlements' },
  city: { label: 'City', icon: '🏰', pieceKey: 'cities' },
};

/**
 * Renders inline cost icons for a building type.
 */
function CostIcons({ buildingType }: { buildingType: BuildingType }) {
  const cost = BUILDING_COSTS[buildingType];

  return (
    <span style={{ marginLeft: 4, opacity: 0.8 }}>
      {Object.entries(cost).map(([resource, amount]) => (
        <span key={resource} title={`${amount} ${resource}`}>
          {Array(amount)
            .fill(null)
            .map((_, i) => (
              <span key={i}>{RESOURCE_ICONS[resource]}</span>
            ))}
        </span>
      ))}
    </span>
  );
}

/**
 * Generates detailed cost breakdown for tooltip.
 */
function getCostBreakdown(buildingType: BuildingType): string {
  const cost = BUILDING_COSTS[buildingType];
  return Object.entries(cost)
    .map(([resource, amount]) => `${amount} ${resource}`)
    .join(', ');
}

interface BuildButtonProps {
  buildingType: BuildingType;
  isActive: boolean;
  onClick: () => void;
}

function BuildButton({ buildingType, isActive, onClick }: BuildButtonProps) {
  const { canBuild, disabledReason } = useCanBuild(buildingType);
  const remaining = useRemainingPieces();
  const config = BUILDING_CONFIG[buildingType];

  const remainingCount = remaining[config.pieceKey];

  // Tooltip content: cost breakdown if enabled, disabled reason if not
  const tooltipContent = canBuild
    ? `Cost: ${getCostBreakdown(buildingType)}`
    : disabledReason || 'Cannot build';

  return (
    <Tooltip
      label={tooltipContent}
      position="top"
      withArrow
      multiline
      w={200}
      transitionProps={{ transition: 'pop', duration: 200 }}
    >
      <Button
        variant={isActive ? 'filled' : 'light'}
        color={isActive ? 'orange' : 'gray'}
        disabled={!canBuild && !isActive}
        onClick={onClick}
        styles={{
          root: {
            height: 'auto',
            padding: '8px 12px',
            opacity: canBuild || isActive ? 1 : 0.6,
          },
        }}
      >
        <Stack gap={2} align="center">
          {/* Icon + Label row */}
          <Group gap={6} wrap="nowrap">
            <Text size="lg">{config.icon}</Text>
            <Text size="sm" fw={600}>
              {config.label}
            </Text>
          </Group>

          {/* Cost icons + remaining count row */}
          <Group gap={4} wrap="nowrap">
            <CostIcons buildingType={buildingType} />
            <Text
              size="xs"
              c="dimmed"
              style={{ marginLeft: 4 }}
            >{`(${remainingCount})`}</Text>
          </Group>
        </Stack>
      </Button>
    </Tooltip>
  );
}

export function BuildControls() {
  const buildMode = useBuildMode();
  const setBuildMode = useGameStore((state) => state.setBuildMode);
  const turnPhase = useGameStore((state) => state.turnPhase);

  // Only show during main phase
  if (turnPhase !== 'main' && turnPhase !== 'roll') {
    return null;
  }

  const handleBuildClick = (type: BuildingType) => {
    if (buildMode === type) {
      // Toggle off if same button clicked
      setBuildMode(null);
    } else {
      setBuildMode(type);
    }
  };

  const handleCancel = () => {
    setBuildMode(null);
  };

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Stack gap="sm" align="center">
        {/* Header */}
        <Text
          size="sm"
          fw={600}
          c="dimmed"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          Build
        </Text>

        {/* Build buttons */}
        <Group gap="xs">
          <BuildButton
            buildingType="road"
            isActive={buildMode === 'road'}
            onClick={() => handleBuildClick('road')}
          />
          <BuildButton
            buildingType="settlement"
            isActive={buildMode === 'settlement'}
            onClick={() => handleBuildClick('settlement')}
          />
          <BuildButton
            buildingType="city"
            isActive={buildMode === 'city'}
            onClick={() => handleBuildClick('city')}
          />
        </Group>

        {/* Cancel button when in build mode */}
        {buildMode && (
          <Button variant="subtle" color="red" size="xs" onClick={handleCancel}>
            Cancel
          </Button>
        )}

        {/* Mode indicator when active */}
        {buildMode && (
          <Text size="xs" c="orange" fw={500}>
            Click a valid location on the board to build
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
