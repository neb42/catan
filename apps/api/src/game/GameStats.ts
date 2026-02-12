import { ResourceType, DevelopmentCardType } from '@catan/shared';

/**
 * GameStats tracks all game statistics for post-game display.
 *
 * Tracks:
 * - Dice roll frequency (2-12)
 * - Per-player resource flows (gained, spent, traded)
 * - Per-player development cards drawn
 *
 * Server-side tracking ensures data integrity and prevents client manipulation.
 */
export class GameStats {
  // Dice roll tracking: number (2-12) -> count
  private diceRolls: Record<number, number>;

  // Resource stats per player: playerId -> { gained, spent, traded }
  private resourceStats: Map<
    string,
    {
      gained: Record<ResourceType, number>;
      spent: Record<ResourceType, number>;
      traded: Record<ResourceType, number>;
    }
  >;

  // Development cards drawn per player: playerId -> DevelopmentCardType[]
  private devCardStats: Map<string, DevelopmentCardType[]>;

  constructor() {
    // Initialize dice rolls (2-12) to 0
    this.diceRolls = {
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
    };

    this.resourceStats = new Map();
    this.devCardStats = new Map();
  }

  /**
   * Initialize resource stats for a player if not already tracked.
   */
  private ensurePlayerResourceStats(playerId: string): void {
    if (!this.resourceStats.has(playerId)) {
      this.resourceStats.set(playerId, {
        gained: {
          wood: 0,
          brick: 0,
          sheep: 0,
          wheat: 0,
          ore: 0,
        },
        spent: {
          wood: 0,
          brick: 0,
          sheep: 0,
          wheat: 0,
          ore: 0,
        },
        traded: {
          wood: 0,
          brick: 0,
          sheep: 0,
          wheat: 0,
          ore: 0,
        },
      });
    }
  }

  /**
   * Initialize dev card stats for a player if not already tracked.
   */
  private ensurePlayerDevCardStats(playerId: string): void {
    if (!this.devCardStats.has(playerId)) {
      this.devCardStats.set(playerId, []);
    }
  }

  /**
   * Record a dice roll.
   * @param total - The dice roll total (2-12)
   */
  public recordRoll(total: number): void {
    if (total >= 2 && total <= 12) {
      this.diceRolls[total]++;
    }
  }

  /**
   * Record resources gained by a player (from dice distribution or bank).
   * Separate from traded resources to avoid inflating production numbers.
   *
   * @param playerId - Player receiving resources
   * @param resources - Resources gained by type
   */
  public recordResourceGain(
    playerId: string,
    resources: Partial<Record<ResourceType, number>>,
  ): void {
    this.ensurePlayerResourceStats(playerId);
    const stats = this.resourceStats.get(playerId)!;

    for (const [resourceType, count] of Object.entries(resources)) {
      if (count > 0) {
        stats.gained[resourceType as ResourceType] += count;
      }
    }
  }

  /**
   * Record resources spent by a player (on buildings or development cards).
   *
   * @param playerId - Player spending resources
   * @param resources - Resources spent by type
   */
  public recordResourceSpend(
    playerId: string,
    resources: Partial<Record<ResourceType, number>>,
  ): void {
    this.ensurePlayerResourceStats(playerId);
    const stats = this.resourceStats.get(playerId)!;

    for (const [resourceType, count] of Object.entries(resources)) {
      if (count > 0) {
        stats.spent[resourceType as ResourceType] += count;
      }
    }
  }

  /**
   * Record a trade between players.
   * Tracks net flow for each player (given as negative, received as positive).
   *
   * Pitfall avoidance: "traded" is separate from "gained" to avoid inflating
   * production numbers with trade activity.
   *
   * @param fromPlayerId - Player giving resources
   * @param toPlayerId - Player receiving resources
   * @param given - Resources given by fromPlayer
   * @param received - Resources received by fromPlayer (in return)
   */
  public recordResourceTrade(
    fromPlayerId: string,
    toPlayerId: string,
    given: Partial<Record<ResourceType, number>>,
    received: Partial<Record<ResourceType, number>>,
  ): void {
    this.ensurePlayerResourceStats(fromPlayerId);
    this.ensurePlayerResourceStats(toPlayerId);

    const fromStats = this.resourceStats.get(fromPlayerId)!;
    const toStats = this.resourceStats.get(toPlayerId)!;

    // fromPlayer: gave resources (subtract from traded)
    for (const [resourceType, count] of Object.entries(given)) {
      if (count > 0) {
        fromStats.traded[resourceType as ResourceType] -= count;
      }
    }

    // fromPlayer: received resources (add to traded)
    for (const [resourceType, count] of Object.entries(received)) {
      if (count > 0) {
        fromStats.traded[resourceType as ResourceType] += count;
      }
    }

    // toPlayer: received resources that fromPlayer gave (add to traded)
    for (const [resourceType, count] of Object.entries(given)) {
      if (count > 0) {
        toStats.traded[resourceType as ResourceType] += count;
      }
    }

    // toPlayer: gave resources back (subtract from traded)
    for (const [resourceType, count] of Object.entries(received)) {
      if (count > 0) {
        toStats.traded[resourceType as ResourceType] -= count;
      }
    }
  }

  /**
   * Record a development card drawn by a player.
   *
   * @param playerId - Player who drew the card
   * @param card - Development card type drawn
   */
  public recordDevCard(playerId: string, card: DevelopmentCardType): void {
    this.ensurePlayerDevCardStats(playerId);
    const cards = this.devCardStats.get(playerId)!;
    cards.push(card);
  }

  /**
   * Get complete statistics payload for all players.
   * Called on victory to include in victory message.
   *
   * @returns Statistics payload with dice rolls, resource stats, and dev card stats
   */
  public getStats(): {
    diceRolls: Record<number, number>;
    resourceStats: Record<
      string,
      {
        gained: Record<ResourceType, number>;
        spent: Record<ResourceType, number>;
        traded: Record<ResourceType, number>;
      }
    >;
    devCardStats: Record<string, DevelopmentCardType[]>;
  } {
    // Convert Maps to plain objects for serialization
    const resourceStatsObj: Record<
      string,
      {
        gained: Record<ResourceType, number>;
        spent: Record<ResourceType, number>;
        traded: Record<ResourceType, number>;
      }
    > = {};

    for (const [playerId, stats] of this.resourceStats.entries()) {
      resourceStatsObj[playerId] = stats;
    }

    const devCardStatsObj: Record<string, DevelopmentCardType[]> = {};
    for (const [playerId, cards] of this.devCardStats.entries()) {
      devCardStatsObj[playerId] = cards;
    }

    return {
      diceRolls: this.diceRolls,
      resourceStats: resourceStatsObj,
      devCardStats: devCardStatsObj,
    };
  }
}
