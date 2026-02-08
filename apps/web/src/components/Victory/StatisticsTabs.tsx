import { Tabs } from '@mantine/core';
import { GameStats, Player } from '@catan/shared';
import { DiceDistributionChart } from './DiceDistributionChart';
import { DevCardStatsChart } from './DevCardStatsChart';
import { ResourceStatsChart } from './ResourceStatsChart';

interface StatisticsTabsProps {
  stats: GameStats;
  players: Player[];
}

/**
 * Tabbed container for game statistics display.
 *
 * Contains three tabs:
 * 1. Dice Stats - Roll frequency distribution
 * 2. Dev Cards - Card type totals and per-player breakdown
 * 3. Resources - Distribution, net flow, and trade activity
 *
 * Styled with parchment aesthetic matching game theme.
 */
export function StatisticsTabs({ stats, players }: StatisticsTabsProps) {
  return (
    <Tabs
      defaultValue="dice"
      styles={{
        root: { background: '#fdf6e3' },
        tab: {
          color: '#5d4037',
          fontFamily: 'Fraunces, serif',
          '&[data-active]': {
            borderBottomColor: '#8d6e63',
            color: '#8d6e63',
          },
        },
        panel: { paddingTop: 16 },
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="dice">Dice Stats</Tabs.Tab>
        <Tabs.Tab value="devcards">Dev Cards</Tabs.Tab>
        <Tabs.Tab value="resources">Resources</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dice">
        <DiceDistributionChart diceRolls={stats.diceRolls} />
      </Tabs.Panel>

      <Tabs.Panel value="devcards">
        <DevCardStatsChart
          devCardStats={stats.devCardStats}
          players={players}
        />
      </Tabs.Panel>

      <Tabs.Panel value="resources">
        <ResourceStatsChart
          resourceStats={stats.resourceStats}
          players={players}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
