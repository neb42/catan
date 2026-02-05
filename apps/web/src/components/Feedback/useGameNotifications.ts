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
 * Show a game notification (toast only - no log entry)
 * For log entries, handlers should call useGameStore.getState().addLogEntry() directly
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
}

/**
 * Hook that provides notification functions for use in components
 * Shows toast notifications only (no log entries)
 */
export function useGameNotifications() {
  const notify = (message: string, type: NotificationType = 'info') => {
    notifications.show({
      message,
      color: TYPE_COLORS[type],
      autoClose: 3000,
      withCloseButton: true,
    });
  };

  return {
    info: (message: string) => notify(message, 'info'),
    success: (message: string) => notify(message, 'success'),
    warning: (message: string) => notify(message, 'warning'),
    error: (message: string) => notify(message, 'error'),
  };
}
