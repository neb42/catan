import {
  Hex,
  PlayerResources,
  ResourceType,
  Settlement,
  Vertex,
} from '@catan/shared';

/**
 * Check if player must discard (8+ cards in hand)
 */
export function mustDiscard(resources: PlayerResources): boolean {
  const total = Object.values(resources).reduce((sum, count) => sum + count, 0);
  return total >= 8;
}

/**
 * Calculate how many cards player must discard (half rounded down)
 */
export function getDiscardTarget(resources: PlayerResources): number {
  const total = Object.values(resources).reduce((sum, count) => sum + count, 0);
  return Math.floor(total / 2);
}

/**
 * Validate discard submission matches target and player has resources
 */
export function validateDiscard(
  submitted: Partial<Record<ResourceType, number>>,
  currentResources: PlayerResources,
  targetCount: number,
): { valid: boolean; error?: string } {
  // Check submitted total equals target
  const submittedTotal = Object.values(submitted).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  );
  if (submittedTotal !== targetCount) {
    return {
      valid: false,
      error: `Must discard exactly ${targetCount} cards, got ${submittedTotal}`,
    };
  }

  // Check player has each resource being discarded
  for (const [resource, count] of Object.entries(submitted)) {
    const resType = resource as ResourceType;
    const discarding = count ?? 0;
    const has = currentResources[resType] ?? 0;
    if (discarding > has) {
      return {
        valid: false,
        error: `Cannot discard ${discarding} ${resType}, only have ${has}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get list of players adjacent to a hex who can be stolen from
 */
export function getStealCandidates(
  hexId: string,
  settlements: Settlement[],
  vertices: Vertex[],
  playerResources: Record<string, PlayerResources>,
  excludePlayerId: string, // The thief (can't steal from self)
): Array<{ playerId: string; cardCount: number }> {
  // Find vertices adjacent to this hex
  const adjacentVertexIds = vertices
    .filter((v) => v.adjacentHexes.includes(hexId))
    .map((v) => v.id);

  // Find settlements on those vertices (excluding thief's own)
  const adjacentSettlements = settlements.filter(
    (s) =>
      adjacentVertexIds.includes(s.vertexId) && s.playerId !== excludePlayerId,
  );

  // Get unique players with card counts
  const playerMap = new Map<string, number>();
  for (const settlement of adjacentSettlements) {
    if (!playerMap.has(settlement.playerId)) {
      const resources = playerResources[settlement.playerId] ?? {
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        ore: 0,
      };
      const cardCount = Object.values(resources).reduce((sum, c) => sum + c, 0);
      playerMap.set(settlement.playerId, cardCount);
    }
  }

  // Filter to only players with cards
  return Array.from(playerMap.entries())
    .filter(([, cardCount]) => cardCount > 0)
    .map(([playerId, cardCount]) => ({ playerId, cardCount }));
}

/**
 * Execute steal: pick random resource from victim
 */
export function executeSteal(
  victimResources: PlayerResources,
): ResourceType | null {
  // Build array of resource types weighted by count
  const pool: ResourceType[] = [];
  for (const [resource, count] of Object.entries(victimResources)) {
    for (let i = 0; i < count; i++) {
      pool.push(resource as ResourceType);
    }
  }

  if (pool.length === 0) {
    return null; // Victim has no cards
  }

  // Pick random
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Validate robber can be placed on hex (must be land, can be anywhere including current position)
 */
export function validateRobberPlacement(
  hexId: string,
  hexes: Hex[],
): { valid: boolean; error?: string } {
  const hex = hexes.find((h) => `${h.q},${h.r}` === hexId);

  if (!hex) {
    return { valid: false, error: 'Invalid hex' };
  }

  // Robber can be placed on any land hex including desert and current position
  // Per ROBBER-02 and ROBBER-04: any land hex, including same position
  const landTerrains = [
    'forest',
    'hills',
    'pasture',
    'fields',
    'mountains',
    'desert',
  ];
  if (!landTerrains.includes(hex.terrain)) {
    return { valid: false, error: 'Robber must be placed on land hex' };
  }

  return { valid: true };
}
