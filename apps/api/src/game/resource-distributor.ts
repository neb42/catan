import { Hex, ResourceType, Settlement, PlayerResources } from '@catan/shared';
import { Vertex } from '@catan/shared';

/**
 * Maps terrain type to resource type.
 * Desert returns null as it produces no resources.
 */
export function terrainToResource(terrain: string): ResourceType | null {
  const mapping: Record<string, ResourceType> = {
    forest: 'wood',
    hills: 'brick',
    pasture: 'sheep',
    fields: 'wheat',
    mountains: 'ore',
  };
  return mapping[terrain] ?? null;
}

export interface ResourceGrant {
  type: ResourceType;
  count: number;
}

export interface PlayerResourceGrant {
  playerId: string;
  resources: ResourceGrant[];
}

/**
 * Distributes resources based on a dice roll.
 *
 * @param diceTotal - The sum of the two dice (2-12)
 * @param hexes - All hexes on the board
 * @param settlements - All settlements/cities placed
 * @param vertices - All unique vertices (for adjacency lookup)
 * @param playerResources - Player resource records to mutate in-place
 * @param robberHexId - Hex ID where robber is placed (null if no blocking)
 * @returns Array of resource grants per player for broadcasting
 */
export function distributeResources(
  diceTotal: number,
  hexes: Hex[],
  settlements: Settlement[],
  vertices: Vertex[],
  playerResources: Record<string, PlayerResources>,
  robberHexId: string | null,
): PlayerResourceGrant[] {
  // Find all hexes that match the dice roll (excluding desert and robber hex)
  const matchingHexes = hexes.filter(
    (hex) =>
      hex.number === diceTotal &&
      hex.terrain !== 'desert' &&
      `${hex.q},${hex.r}` !== robberHexId,
  );

  if (matchingHexes.length === 0) {
    return [];
  }

  // Build a map of vertex ID -> settlement for quick lookup
  const settlementMap = new Map<string, Settlement>();
  for (const settlement of settlements) {
    settlementMap.set(settlement.vertexId, settlement);
  }

  // Build a map of vertex ID -> vertex for adjacency lookup
  const vertexMap = new Map<string, Vertex>();
  for (const vertex of vertices) {
    vertexMap.set(vertex.id, vertex);
  }

  // Aggregate grants per player
  const playerGrants = new Map<string, Map<ResourceType, number>>();

  for (const hex of matchingHexes) {
    const hexId = `${hex.q},${hex.r}`;
    const resourceType = terrainToResource(hex.terrain);

    if (!resourceType) {
      continue; // Should not happen since we filter desert, but be safe
    }

    // Find all vertices adjacent to this hex by scanning vertices
    for (const vertex of vertices) {
      if (!vertex.adjacentHexes.includes(hexId)) {
        continue;
      }

      // Check if there's a settlement at this vertex
      const settlement = settlementMap.get(vertex.id);
      if (!settlement) {
        continue;
      }

      // Determine count: 1 for settlement, 2 for city
      const count = settlement.isCity ? 2 : 1;

      // Add to player's grant aggregation
      if (!playerGrants.has(settlement.playerId)) {
        playerGrants.set(settlement.playerId, new Map());
      }
      const resourceMap = playerGrants.get(settlement.playerId)!;
      resourceMap.set(
        resourceType,
        (resourceMap.get(resourceType) ?? 0) + count,
      );

      // Update playerResources in-place
      if (!playerResources[settlement.playerId]) {
        playerResources[settlement.playerId] = {
          wood: 0,
          brick: 0,
          sheep: 0,
          wheat: 0,
          ore: 0,
        };
      }
      playerResources[settlement.playerId][resourceType] += count;
    }
  }

  // Convert to output format
  const result: PlayerResourceGrant[] = [];
  for (const [playerId, resourceMap] of playerGrants) {
    const resources: ResourceGrant[] = [];
    for (const [type, count] of resourceMap) {
      resources.push({ type, count });
    }
    result.push({ playerId, resources });
  }

  return result;
}
