import { useState } from 'react';
import { Modal, Tabs, Text, Group, Badge, ScrollArea } from '@mantine/core';
import {
  useTradeModalOpen,
  useTradeActions,
  useActiveTrade,
} from '../../hooks/useTradeState';
import { usePortAccess } from '../../hooks/usePortAccess';
import { useSocket, useGameStore } from '../../stores/gameStore';
import { DomesticTrade } from './DomesticTrade';
import { MaritimeTrade } from './MaritimeTrade';

/**
 * TradeModal - Main trade interface modal
 *
 * Provides tabbed navigation between:
 * - Players tab: Compose and propose domestic trades to other players
 * - Bank tab: Execute maritime trades using bank rates or port access
 *
 * The modal is controlled by the trade state in gameStore via useTradeState hooks.
 */
export function TradeModal() {
  const isOpen = useTradeModalOpen();
  const { setTradeModalOpen } = useTradeActions();
  const portAccess = usePortAccess();
  const activeTrade = useActiveTrade();
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const sendMessage = useSocket();

  // Track active tab for potential future analytics or state
  const [activeTab, setActiveTab] = useState<string | null>('players');

  // Determine best rate badge for bank tab
  const getBestAvailableRate = () => {
    if (portAccess.specificPorts.length > 0) return '2:1';
    if (portAccess.hasGeneric3to1) return '3:1';
    return '4:1';
  };

  const handleClose = () => {
    // If there's an active trade and we're the proposer, cancel it
    if (activeTrade && activeTrade.proposerId === myPlayerId) {
      sendMessage?.({ type: 'cancel_trade' });
    }
    setTradeModalOpen(false);
    // Reset tab to default when closing
    setActiveTab('players');
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <Text size="lg" fw={600} style={{ color: '#5d4037' }}>
            Trade
          </Text>
        </Group>
      }
      size="lg"
      centered
      styles={{
        content: {
          maxHeight: '85vh',
          backgroundColor: '#fdf6e3',
        },
        header: {
          borderBottom: '2px dashed #d7ccc8',
          background: 'rgba(0,0,0,0.03)',
          paddingBottom: '12px',
        },
        body: {
          padding: 0,
        },
      }}
    >
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        styles={{
          list: {
            background: 'rgba(0,0,0,0.03)',
            borderBottom: '2px dashed #d7ccc8',
          },
          tab: {
            color: '#a1887f',
            fontWeight: 600,
            '&[data-active]': {
              color: '#5d4037',
              borderBottomColor: '#8d6e63',
              borderBottomWidth: '3px',
            },
            '&:hover': {
              backgroundColor: 'rgba(141, 110, 99, 0.1)',
            },
          },
          panel: {
            paddingTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 16,
          },
        }}
      >
        <Tabs.List grow>
          <Tabs.Tab value="players">Players</Tabs.Tab>
          <Tabs.Tab value="bank">
            <Group gap="xs">
              <span>Bank</span>
              <Badge
                size="xs"
                variant="filled"
                style={{
                  backgroundColor: '#d35400',
                  color: 'white',
                  border: '1px solid #e67e22',
                }}
              >
                {getBestAvailableRate()}
              </Badge>
            </Group>
          </Tabs.Tab>
        </Tabs.List>

        <ScrollArea.Autosize mah={500}>
          <Tabs.Panel value="players">
            <DomesticTrade />
          </Tabs.Panel>

          <Tabs.Panel value="bank">
            <MaritimeTrade />
          </Tabs.Panel>
        </ScrollArea.Autosize>
      </Tabs>
    </Modal>
  );
}
