import { notifications } from '@mantine/notifications';
import { useGameStore } from '@web/stores/gameStore';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

const TYPE_COLORS: Record<NotificationType, string> = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red',
};

const TYPE_TITLES: Record<NotificationType, string> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
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
    title: TYPE_TITLES[type],
    message,
    color: TYPE_COLORS[type],
    autoClose: 3000,
    withCloseButton: true,
    withBorder: true,
  });
}

/**
 * Hook that provides notification functions for use in components
 * Shows toast notifications only (no log entries)
 */
export function useGameNotifications() {
  const notify = (message: string, type: NotificationType = 'info') => {
    notifications.show({
      title: TYPE_TITLES[type],
      message,
      color: TYPE_COLORS[type],
      autoClose: 3000,
      withCloseButton: true,
      withBorder: true,
    });
  };

  return {
    info: (message: string) => notify(message, 'info'),
    success: (message: string) => notify(message, 'success'),
    warning: (message: string) => notify(message, 'warning'),
    error: (message: string) => notify(message, 'error'),
  };
}
