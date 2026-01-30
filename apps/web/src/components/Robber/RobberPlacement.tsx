import { useRobberPlacementMode, useGameStore } from '@web/stores/gameStore';

interface RobberPlacementProps {
  hexes: Array<{
    q: number;
    r: number;
    terrain: string;
    center: { x: number; y: number };
  }>;
  hexSize: number;
}

export function RobberPlacement({ hexes, hexSize }: RobberPlacementProps) {
  const placementMode = useRobberPlacementMode();
  const sendMessage = useGameStore((s) => s.sendMessage);

  if (!placementMode) return null;

  const handleHexClick = (hexId: string) => {
    if (!sendMessage) return;
    sendMessage({
      type: 'move_robber',
      hexId,
    });
  };

  // Filter to land hexes only
  const landTerrains = [
    'forest',
    'hills',
    'pasture',
    'fields',
    'mountains',
    'desert',
  ];
  const landHexes = hexes.filter((h) => landTerrains.includes(h.terrain));

  return (
    <g className="robber-placement-overlay">
      {landHexes.map((hex) => {
        const hexId = `${hex.q},${hex.r}`;
        return (
          <circle
            key={hexId}
            cx={hex.center.x}
            cy={hex.center.y}
            r={hexSize * 0.6}
            fill="rgba(0, 0, 0, 0.3)"
            stroke="#FF4444"
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
            onClick={() => handleHexClick(hexId)}
          >
            <title>Move robber here</title>
          </circle>
        );
      })}
    </g>
  );
}
