import { useMemo } from 'react';
import { ResourceType, Port, getVertexFromCorner } from '@catan/shared';
import { useGameStore, useSettlements } from '../stores/gameStore';

export interface PortAccess {
  hasGeneric3to1: boolean;
  specificPorts: ResourceType[]; // 2:1 ports player has access to
}

/**
 * Gets the two vertex IDs that a port connects to.
 * Port is on edge of hex, which connects corners i and (i+1)%6.
 */
function getPortVertexIds(
  port: Port,
  size = { x: 10, y: 10 },
): [string, string] {
  const hex = { q: port.hexQ, r: port.hexR };
  const v1 = getVertexFromCorner(hex, port.edge, size);
  const v2 = getVertexFromCorner(hex, (port.edge + 1) % 6, size);
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
