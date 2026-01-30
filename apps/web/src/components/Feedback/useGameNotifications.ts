import { notifications } from '@mantine/notifications';
import { useGameStore } from '@web/stores/gameStore';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

const TYPE_COLORS: Record<NotificationType, string> = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red',
};

/**
 * Show a game notification (toast + log entry)
 */
export function showGameNotification(
  message: string,
  type: NotificationType = 'info',
) {
  // Show toast
  notifications.show({
    message,
    color: TYPE_COLORS[type],
    autoClose: 3000,
    withCloseButton: true,
  });

  // Add to game log
  useGameStore.getState().addLogEntry(message, type);
}

/**
 * Hook that provides notification functions for use in components
 */
export function useGameNotifications() {
  const addLogEntry = useGameStore((s) => s.addLogEntry);

  const notify = (message: string, type: NotificationType = 'info') => {
    notifications.show({
      message,
      color: TYPE_COLORS[type],
      autoClose: 3000,
      withCloseButton: true,
    });
    addLogEntry(message, type);
  };

  return {
    info: (message: string) => notify(message, 'info'),
    success: (message: string) => notify(message, 'success'),
    warning: (message: string) => notify(message, 'warning'),
    error: (message: string) => notify(message, 'error'),
  };
}
