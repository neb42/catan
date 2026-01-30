import { BoardState, ResourceType, Settlement, Hex } from '@catan/shared';
import { getVertexFromCorner } from '@catan/shared';

export interface PortAccess {
  hasGeneric3to1: boolean;
  specificPorts: ResourceType[]; // 2:1 ports player has access to
}

/**
 * Get the two vertex IDs that touch a port.
 * A port is on an edge of a hex.
 *
 * For pointy-top hexes:
 * - Edge angles: 0=0° (E), 1=60° (NE), 2=120° (NW), 3=180° (W), 4=240° (SW), 5=300° (SE)
 * - Corner angles: 0=30°, 1=90°, 2=150°, 3=210°, 4=270°, 5=330°
 *
 * Edge i (at angle i*60°) is bordered by corners at (i*60 - 30)° and (i*60 + 30)°.
 * This means:
 * - Edge 0 (0°) connects corners 5 (330°) and 0 (30°)
 * - Edge 1 (60°) connects corners 0 (30°) and 1 (90°)
 * - Edge 2 (120°) connects corners 1 (90°) and 2 (150°)
 * - etc.
 *
 * Pattern: Edge i connects corner (i+5)%6 and corner i.
 */
export function getPortVertexIds(
  hexQ: number,
  hexR: number,
  edge: number,
  hexes: Hex[],
): [string, string] {
  const hex = { q: hexQ, r: hexR };

  // Edge i connects corner (i+5)%6 to corner i
  const corner1 = (edge + 5) % 6;
  const corner2 = edge;

  const vertex1 = getVertexFromCorner(hex, corner1);
  const vertex2 = getVertexFromCorner(hex, corner2);

  return [vertex1.id, vertex2.id];
}

/**
 * Calculate which ports a player has access to based on their settlement/city positions.
 */
export function getPlayerPortAccess(
  playerId: string,
  settlements: Settlement[],
  board: BoardState,
): PortAccess {
  // Get all vertices where player has settlements
  const playerVertexIds = new Set<string>();
  for (const settlement of settlements) {
    if (settlement.playerId === playerId) {
      playerVertexIds.add(settlement.vertexId);
    }
  }

  const portAccess: PortAccess = {
    hasGeneric3to1: false,
    specificPorts: [],
  };

  // Check each port
  for (const port of board.ports) {
    const [vertexId1, vertexId2] = getPortVertexIds(
      port.hexQ,
      port.hexR,
      port.edge,
      board.hexes,
    );

    // Check if player has settlement on either vertex
    if (playerVertexIds.has(vertexId1) || playerVertexIds.has(vertexId2)) {
      if (port.type === 'generic') {
        portAccess.hasGeneric3to1 = true;
      } else {
        // Specific port - map port type to resource type
        // Port types: 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore'
        // These match ResourceType exactly
        const resourceType = port.type as ResourceType;
        if (!portAccess.specificPorts.includes(resourceType)) {
          portAccess.specificPorts.push(resourceType);
        }
      }
    }
  }

  return portAccess;
}

/**
 * Get the best trade rate for a resource given the player's port access.
 * Returns 2 for 2:1 specific port, 3 for 3:1 generic port, 4 for bank trade.
 */
export function getBestTradeRate(
  resource: ResourceType,
  portAccess: PortAccess,
): number {
  // Check for specific 2:1 port first
  if (portAccess.specificPorts.includes(resource)) {
    return 2;
  }

  // Check for generic 3:1 port
  if (portAccess.hasGeneric3to1) {
    return 3;
  }

  // Default bank rate is 4:1
  return 4;
}
