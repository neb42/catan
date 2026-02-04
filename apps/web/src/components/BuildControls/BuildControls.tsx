import { Tooltip } from '@mantine/core';
import { BUILDING_COSTS } from '@catan/shared';
import type { BuildingType, ResourceType } from '@catan/shared';
import {
  useBuildMode,
  useCanBuild,
  useRemainingPieces,
} from '../../hooks/useBuildMode';
import { useGameStore } from '../../stores/gameStore';
import { BuyDevCardButton } from '../DevCard/BuyDevCardButton';
import { ResourceIcon } from '../ResourceIcon/ResourceIcon';

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
    <span
      style={{ marginLeft: 4, opacity: 0.8, display: 'inline-flex', gap: 2 }}
    >
      {Object.entries(cost).map(([resource, amount]) => (
        <span key={resource} style={{ display: 'inline-flex', gap: 1 }}>
          {Array(amount)
            .fill(null)
            .map((_, i) => (
              <ResourceIcon key={i} type={resource as ResourceType} size="sm" />
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
      <button
        disabled={!canBuild && !isActive}
        onClick={onClick}
        style={{
          background: 'white',
          border: isActive ? '2px solid #f1c40f' : '2px solid #d7ccc8',
          borderRadius: '8px',
          boxShadow: isActive
            ? '0 4px 8px rgba(241,196,15,0.3)'
            : '0 2px 4px rgba(0,0,0,0.1)',
          padding: '8px 12px',
          opacity: canBuild || isActive ? 1 : 0.5,
          cursor: canBuild || isActive ? 'pointer' : 'not-allowed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {/* Icon + Label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px' }}>{config.icon}</span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#5d4037',
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Cost icons + remaining count row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CostIcons buildingType={buildingType} />
          <span
            style={{
              fontSize: '11px',
              color: '#8d6e63',
              marginLeft: '4px',
            }}
          >{`(${remainingCount})`}</span>
        </div>
      </button>
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
    <div
      style={{
        background: '#fdf6e3',
        border: '4px solid #8d6e63',
        borderRadius: '12px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        padding: '15px',
        width: 200,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#5d4037',
            margin: 0,
            fontFamily: 'Fraunces, serif',
          }}
        >
          Build & Buy
        </h3>

        {/* Build buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
        </div>

        {/* Buy Dev Card button */}
        <BuyDevCardButton />

        {/* Cancel button when in build mode */}
        {buildMode && (
          <button
            onClick={handleCancel}
            style={{
              background: '#ffe0e0',
              border: '1px solid #ffcccc',
              borderRadius: '6px',
              color: '#c0392b',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}

        {/* Mode indicator when active */}
        {buildMode && (
          <div
            style={{
              background: '#fff3cd',
              border: '1px solid #ffd966',
              borderRadius: '6px',
              color: '#856404',
              padding: '8px',
              fontSize: '12px',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Click a valid location on the board to build
          </div>
        )}
      </div>
    </div>
  );
}
