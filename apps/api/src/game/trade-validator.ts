import { ResourceType, PlayerResources } from '@catan/shared';
import { getBestTradeRate, PortAccess } from './port-access';

export type TradeResponse = 'pending' | 'accepted' | 'declined';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Count total resources in a resource record.
 */
function countResources(
  resources: Partial<Record<ResourceType, number>>,
): number {
  let total = 0;
  for (const amount of Object.values(resources)) {
    total += amount || 0;
  }
  return total;
}

/**
 * Check if player has at least the required resources.
 */
function hasEnoughResources(
  playerResources: PlayerResources,
  required: Partial<Record<ResourceType, number>>,
): boolean {
  for (const [resource, amount] of Object.entries(required)) {
    const resourceType = resource as ResourceType;
    if ((playerResources[resourceType] || 0) < (amount || 0)) {
      return false;
    }
  }
  return true;
}

/**
 * Validate a domestic trade proposal.
 * - Proposer must be the current turn player
 * - Offering must have at least one resource
 * - Requesting must have at least one resource
 * - Proposer must have enough resources for the offer
 */
export function validateProposeTrade(
  proposerId: string,
  offering: Partial<Record<ResourceType, number>>,
  requesting: Partial<Record<ResourceType, number>>,
  playerResources: PlayerResources,
  currentPlayerId: string,
): ValidationResult {
  // Check proposer is current turn player
  if (proposerId !== currentPlayerId) {
    return {
      valid: false,
      error: 'Only the current player can propose trades',
    };
  }

  // Check offering has at least one resource
  if (countResources(offering) === 0) {
    return { valid: false, error: 'Must offer at least one resource' };
  }

  // Check requesting has at least one resource
  if (countResources(requesting) === 0) {
    return { valid: false, error: 'Must request at least one resource' };
  }

  // Check proposer has enough resources for offering
  if (!hasEnoughResources(playerResources, offering)) {
    return { valid: false, error: 'Not enough resources to offer' };
  }

  return { valid: true };
}

/**
 * Validate a trade response.
 * - Responder cannot be the proposer
 * - Responder hasn't already responded
 */
export function validateTradeResponse(
  responderId: string,
  proposerId: string,
  responses: Record<string, TradeResponse>,
): ValidationResult {
  // Check responder is not the proposer
  if (responderId === proposerId) {
    return { valid: false, error: 'Cannot respond to your own trade' };
  }

  // Check responder hasn't already responded
  if (responses[responderId] !== undefined) {
    return { valid: false, error: 'Already responded to this trade' };
  }

  return { valid: true };
}

/**
 * Validate partner selection for trade execution.
 * - Partner must have accepted the trade
 * - Partner must have enough resources for what proposer is requesting
 */
export function validatePartnerSelection(
  proposerId: string,
  partnerId: string,
  responses: Record<string, TradeResponse>,
  partnerResources: PlayerResources,
  requesting: Partial<Record<ResourceType, number>>,
): ValidationResult {
  // Check partner has accepted
  if (responses[partnerId] !== 'accepted') {
    return {
      valid: false,
      error: 'Selected partner has not accepted the trade',
    };
  }

  // Check partner has enough resources
  if (!hasEnoughResources(partnerResources, requesting)) {
    return { valid: false, error: 'Partner does not have enough resources' };
  }

  return { valid: true };
}

/**
 * Get the single resource type being traded, or null if multiple/none.
 */
function getSingleResourceType(
  resources: Partial<Record<ResourceType, number>>,
): { type: ResourceType; amount: number } | null {
  let foundResource: ResourceType | null = null;
  let foundAmount = 0;

  for (const [resource, amount] of Object.entries(resources)) {
    if (amount && amount > 0) {
      if (foundResource !== null) {
        // Multiple resource types - invalid for bank trade
        return null;
      }
      foundResource = resource as ResourceType;
      foundAmount = amount;
    }
  }

  if (foundResource === null) {
    return null;
  }

  return { type: foundResource, amount: foundAmount };
}

/**
 * Validate a bank/maritime trade.
 * - Only one resource type can be given
 * - Only one resource type can be received
 * - Amounts must match the trade rate (2:1, 3:1, or 4:1)
 * - Player must have enough resources
 */
export function validateBankTrade(
  playerId: string,
  giving: Partial<Record<ResourceType, number>>,
  receiving: Partial<Record<ResourceType, number>>,
  playerResources: PlayerResources,
  portAccess: PortAccess,
): ValidationResult {
  // Check only one resource type being given
  const givingResource = getSingleResourceType(giving);
  if (!givingResource) {
    return { valid: false, error: 'Must give exactly one type of resource' };
  }

  // Check only one resource type being received
  const receivingResource = getSingleResourceType(receiving);
  if (!receivingResource) {
    return { valid: false, error: 'Must receive exactly one type of resource' };
  }

  // Cannot trade same resource type
  if (givingResource.type === receivingResource.type) {
    return { valid: false, error: 'Cannot trade same resource type' };
  }

  // Calculate required rate
  const rate = getBestTradeRate(givingResource.type, portAccess);

  // Check amounts match rate (giving X of resource for 1 of another)
  // Rate is how many of the giving resource are needed per 1 of receiving
  const expectedGiving = rate * receivingResource.amount;
  if (givingResource.amount !== expectedGiving) {
    return {
      valid: false,
      error: `Trade rate is ${rate}:1. Need ${expectedGiving} ${givingResource.type} for ${receivingResource.amount} ${receivingResource.type}`,
    };
  }

  // Check player has enough resources
  if (!hasEnoughResources(playerResources, giving)) {
    return { valid: false, error: 'Not enough resources for bank trade' };
  }

  return { valid: true };
}
