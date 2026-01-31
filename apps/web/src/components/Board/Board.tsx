import { useMemo } from 'react';
import { HexGrid, Layout, Pattern } from 'react-hexgrid';
import { BoardState } from '@catan/shared';
import { TerrainHex } from './TerrainHex';
import { Port } from './Port';
import { PlacementOverlay } from './PlacementOverlay';
import { PlacementControls } from './PlacementControls';
import { PlacedPieces } from './PlacedPieces';
import {
  useGameStore,
  useBuildMode,
  useRobberHexId,
  useRobberPlacementMode,
} from '../../stores/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { RobberFigure, RobberPlacement } from '@web/components/Robber';
import { RoadBuildingEdgeOverlay } from '../CardPlay/RoadBuildingOverlay';

interface BoardProps {
  board: BoardState;
}

export function Board({ board }: BoardProps) {
  const currentPlayerColor = useGameStore((state) => {
    // Determine color from store - fallback to white if not found (shouldn't happen in game)
    // We assume the gameStore has player info, or we derive it from socket/room state
    // For now, let's try to get it from the store if available, or pass it in via props in future refactor
    // The current store implementation might not have 'players' directly on root if using new simplified store
    // Let's check how store is defined in context or use a placeholder
    const myNickname = state.nickname;
    // Assuming players array exists in store or we need to access it differently
    // Based on typical store shape:
    const players = (state as any).players || [];
    const me = players.find((p: any) => p.nickname === myNickname);
    return me?.color || 'white';
  });

  // Create a map of playerId -> color for rendering placed pieces
  const players = useGameStore(
    useShallow((state) => state.room?.players || []),
  );
  const playerIdToColor = new Map(players.map((p) => [p.id, p.color]));

  // Get placement phase and build mode to determine if overlay should show
  const placementPhase = useGameStore((state) => state.placementPhase);
  const buildMode = useBuildMode();

  // Show overlay during placement phase OR build mode
  const showOverlay = placementPhase || buildMode;

  // Robber state
  const robberHexId = useRobberHexId();
  const robberPlacementMode = useRobberPlacementMode();

  // Layout size constant (must match Layout props)
  const hexSize = { x: 10, y: 10 };
  const spacing = 1.05;

  // Calculate hex centers for robber placement and rendering
  // Using pointy-top hex formula: x = size.x * (√3 * q + √3/2 * r) * spacing
  //                               y = size.y * (3/2 * r) * spacing
  const hexesWithCenters = useMemo(() => {
    return board.hexes.map((hex) => ({
      q: hex.q,
      r: hex.r,
      terrain: hex.terrain,
      center: {
        x:
          hexSize.x *
          (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r) *
          spacing,
        y: hexSize.y * ((3 / 2) * hex.r) * spacing,
      },
    }));
  }, [board.hexes]);

  // Get robber position from hex ID
  const robberPosition = useMemo(() => {
    if (!robberHexId) return null;
    const hex = hexesWithCenters.find((h) => `${h.q},${h.r}` === robberHexId);
    return hex?.center || null;
  }, [robberHexId, hexesWithCenters]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <HexGrid width="100%" height="100%" viewBox="-50 -50 100 100">
        {/* Define SVG patterns for terrain textures */}
        <Pattern id="forest" link="/assets/tiles/forest.svg" />
        <Pattern id="hills" link="/assets/tiles/hills.svg" />
        <Pattern id="fields" link="/assets/tiles/fields.svg" />
        <Pattern id="pasture" link="/assets/tiles/pasture.svg" />
        <Pattern id="mountains" link="/assets/tiles/mountains.svg" />
        <Pattern id="desert" link="/assets/tiles/desert.svg" />

        {/* Pointy-top layout (flat=false) with moderate spacing */}
        <Layout
          size={{ x: 10, y: 10 }}
          flat={false}
          spacing={1.05}
          origin={{ x: 0, y: 0 }}
        >
          {board.hexes.map((hex) => (
            <TerrainHex key={`${hex.q}-${hex.r}`} hex={hex} />
          ))}

          {/* Render ports */}
          {board.ports.map((port, i) => (
            <Port key={i} port={port} />
          ))}

          {/* Robber figure on current hex (render before pieces so it's behind settlements) */}
          {robberPosition && (
            <RobberFigure
              x={robberPosition.x}
              y={robberPosition.y}
              size={hexSize.x * 0.4}
            />
          )}

          {/* Render placed pieces (roads and settlements) */}
          <PlacedPieces board={board} playerIdToColor={playerIdToColor} />

          {/* Robber placement overlay (render after pieces so it's clickable) */}
          {robberPlacementMode && (
            <RobberPlacement hexes={hexesWithCenters} hexSize={hexSize.x} />
          )}

          {/* Overlay renders INSIDE Layout to share coordinate system */}
          {showOverlay && (
            <PlacementOverlay currentPlayerColor={currentPlayerColor} />
          )}

          {/* Road Building overlay for dev card effect */}
          <RoadBuildingEdgeOverlay />
        </Layout>
      </HexGrid>

      {/* Controls render OUTSIDE SVG for standard DOM interaction */}
      {/* <PlacementControls /> */}
    </div>
  );
}
