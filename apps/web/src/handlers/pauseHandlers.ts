import { notifications } from '@mantine/notifications';

import { useGameStore } from '@web/stores/gameStore';

import { MessageHandler } from './types';

export const handleGamePaused: MessageHandler = (message) => {
  if (message.type !== 'game_paused') return;

  useGameStore
    .getState()
    .setGamePaused(true, message.disconnectedPlayerNickname);

  // Add log entry
  useGameStore
    .getState()
    .addLogEntry(`${message.disconnectedPlayerNickname} disconnected`);
};

export const handleGameResumed: MessageHandler = (message) => {
  if (message.type !== 'game_resumed') return;

  useGameStore.getState().setGamePaused(false, null);

  // Show toast notification
  notifications.show({
    title: 'Player reconnected',
    message: `${message.reconnectedPlayerNickname} has reconnected`,
    color: 'green',
    autoClose: 3000,
    withBorder: true,
  });

  // Add log entry
  useGameStore
    .getState()
    .addLogEntry(`${message.reconnectedPlayerNickname} reconnected`);
};
