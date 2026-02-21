import { ActionIcon } from '@mantine/core';

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <ActionIcon
      variant="filled"
      size="lg"
      onClick={onClick}
      aria-label="Open settings"
      styles={{
        root: {
          background: '#F5ECD7',
          border: '2px solid #8B7355',
          color: '#5d4037',
          borderRadius: '8px',
          '&:hover': {
            background: '#e8dcc6',
            borderColor: '#6d4c41',
          },
        },
      }}
    >
      ⚙
    </ActionIcon>
  );
}
