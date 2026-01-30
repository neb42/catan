import { useMemo } from 'react';
import { ResourceType, Port, getVertexFromCorner } from '@catan/shared';
import { useGameStore, useSettlements } from '../stores/gameStore';

export interface PortAccess {
  hasGeneric3to1: boolean;
  specificPorts: ResourceType[]; // 2:1 ports player has access to
}

/**
 * Gets the two vertex IDs that a port connects to.
 * Port is on edge of hex. For pointy-top hexes:
 * - Edge angles: 0=0°, 1=60°, 2=120°, 3=180°, 4=240°, 5=300°
 * - Corner angles: 0=30°, 1=90°, 2=150°, 3=210°, 4=270°, 5=330°
 * Edge i (at angle i*60°) is bordered by corners at (i*60 - 30)° and (i*60 + 30)°
 * This means edge i connects corner (i+5)%6 and corner i.
 */
function getPortVertexIds(
  port: Port,
  size = { x: 10, y: 10 },
): [string, string] {
  const hex = { q: port.hexQ, r: port.hexR };
  // Edge i connects corner (i+5)%6 to corner i
  const corner1 = (port.edge + 5) % 6;
  const corner2 = port.edge;
  const v1 = getVertexFromCorner(hex, corner1, size);
  const v2 = getVertexFromCorner(hex, corner2, size);
  return [v1.id, v2.id];
}

export function usePortAccess(): PortAccess {
  const board = useGameStore((state) => state.board);
  const settlements = useSettlements();
  const myPlayerId = useGameStore((state) => state.myPlayerId);

  return useMemo(() => {
    const access: PortAccess = {
      hasGeneric3to1: false,
      specificPorts: [],
    };

    if (!board || !myPlayerId) return access;

    // Get all vertex IDs where player has settlements/cities
    const mySettlements = settlements.filter((s) => s.playerId === myPlayerId);
    const myVertexIds = new Set(mySettlements.map((s) => s.vertexId));

    // Check each port
    for (const port of board.ports) {
      const [v1, v2] = getPortVertexIds(port);
      const hasAccess = myVertexIds.has(v1) || myVertexIds.has(v2);

      if (hasAccess) {
        if (port.type === 'generic') {
          access.hasGeneric3to1 = true;
        } else {
          access.specificPorts.push(port.type as ResourceType);
        }
      }
    }

    return access;
  }, [board, settlements, myPlayerId]);
}

export function getBestRate(
  resource: ResourceType,
  portAccess: PortAccess,
): number {
  if (portAccess.specificPorts.includes(resource)) return 2;
  if (portAccess.hasGeneric3to1) return 3;
  return 4;
}
