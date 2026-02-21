import { Modal, Switch, Stack, Text } from '@mantine/core';
import { useSoundEnabled, useGameStore } from '@web/stores/gameStore';

interface SettingsPanelProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsPanel({ opened, onClose }: SettingsPanelProps) {
  const soundEnabled = useSoundEnabled();
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title="Settings"
      size="sm"
      styles={{
        content: {
          background: '#fdf6e3',
          border: '4px solid #8d6e63',
          borderRadius: '12px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        },
        header: {
          background: 'transparent',
        },
        title: {
          fontFamily: 'Fraunces, serif',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#5d4037',
        },
        body: {
          color: '#5d4037',
        },
      }}
    >
      <Stack gap="lg">
        <Switch
          label={
            <Text size="sm" fw={500} style={{ color: '#5d4037' }}>
              Sound Effects
            </Text>
          }
          checked={soundEnabled}
          onChange={toggleSound}
          styles={{
            track: {
              borderColor: '#8d6e63',
            },
          }}
        />
      </Stack>
    </Modal>
  );
}
