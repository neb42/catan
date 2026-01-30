import { Modal, Tabs } from '@mantine/core';
import { useTradeModalOpen, useTradeActions } from '../../hooks/useTradeState';
import { DomesticTrade } from './DomesticTrade';
import { MaritimeTrade } from './MaritimeTrade';

export function TradeModal() {
  const isOpen = useTradeModalOpen();
  const { setTradeModalOpen } = useTradeActions();

  return (
    <Modal
      opened={isOpen}
      onClose={() => setTradeModalOpen(false)}
      title="Trade"
      size="lg"
      centered
    >
      <Tabs defaultValue="players">
        <Tabs.List>
          <Tabs.Tab value="players">Players</Tabs.Tab>
          <Tabs.Tab value="bank">Bank</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="players" pt="md">
          <DomesticTrade />
        </Tabs.Panel>

        <Tabs.Panel value="bank" pt="md">
          <MaritimeTrade />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
