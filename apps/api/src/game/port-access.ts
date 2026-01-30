import { BoardState, ResourceType, Settlement, Hex } from '@catan/shared';
import { getVertexFromCorner } from '@catan/shared';

export interface PortAccess {
  hasGeneric3to1: boolean;
  specificPorts: ResourceType[]; // 2:1 ports player has access to
}

/**
 * Get the two vertex IDs that touch a port.
 * A port is on an edge of a hex, and an edge connects corners i and (i+1)%6.
 *
 * For pointy-top hexes with edge indices:
 * Edge 0 connects corners 5 and 0 (right edge)
 * Edge 1 connects corners 0 and 1 (upper-right)
 * Edge 2 connects corners 1 and 2 (upper-left)
 * Edge 3 connects corners 2 and 3 (left edge)
 * Edge 4 connects corners 3 and 4 (lower-left)
 * Edge 5 connects corners 4 and 5 (lower-right)
 *
 * Note: The edge index convention may differ - adjust corner mapping as needed.
 * Edges connect vertex at corner i to corner i+1 (mod 6).
 */
export function getPortVertexIds(
  hexQ: number,
  hexR: number,
  edge: number,
  hexes: Hex[],
): [string, string] {
  const hex = { q: hexQ, r: hexR };

  // Edge connects corner[edge] to corner[(edge+1) % 6]
  // However, looking at coordinates.ts getEdgeAngle, edges seem to be at angle edge * 60 degrees
  // For port positioning: edge direction points outward from hex center
  //
  // For a pointy-top hex:
  // - Corner 0 is at 30 degrees (top-right)
  // - Corner 1 is at 90 degrees (top)
  // - Corner 2 is at 150 degrees (top-left)
  // - Corner 3 is at 210 degrees (bottom-left)
  // - Corner 4 is at 270 degrees (bottom)
  // - Corner 5 is at 330 degrees (bottom-right)
  //
  // Edge 0 (at 0 degrees, E) is between corners 5 (330 deg) and 0 (30 deg)
  // Edge 1 (at 60 degrees, NE) is between corners 0 (30 deg) and 1 (90 deg)
  // etc.
  //
  // So edge i is between corner (i + 5) % 6 and corner i

  // Based on the edge angle convention:
  // Edge at angle A is between the two corners closest to that angle
  // Edge 0 (0 deg) is between corner 5 (330 deg) and corner 0 (30 deg)
  // Edge 1 (60 deg) is between corner 0 (30 deg) and corner 1 (90 deg)
  // Pattern: edge i is between corner (i-1+6)%6 = (i+5)%6 and corner i
  // Actually let's use the simpler pattern from hexGeometry.ts:
  // Edge i connects corner i to corner (i+1) % 6

  const corner1 = edge;
  const corner2 = (edge + 1) % 6;

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
