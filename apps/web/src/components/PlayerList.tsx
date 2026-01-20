import { Player, PLAYER_COLORS } from '@catan/shared';
import {
  Badge,
  Button,
  Card,
  ColorSwatch,
  Group,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';

type PlayerListProps = {
  players: Player[];
  currentPlayerId: string | null;
  onColorChange: (color: Player['color']) => void;
  onReadyToggle: () => void;
};

export default function PlayerList({
  players,
  currentPlayerId,
  onColorChange,
  onReadyToggle,
}: PlayerListProps) {
  const colorOptions = PLAYER_COLORS.map((color) => ({
    value: color,
    label: color.charAt(0).toUpperCase() + color.slice(1),
  }));

  const currentPlayer = players.find((player) => player.id === currentPlayerId) ?? null;

  return (
    <Card withBorder radius="md" padding="lg" shadow="sm">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Title order={4}>Players ({players.length}/4)</Title>
          {currentPlayer && (
            <Button
              size="sm"
              variant={currentPlayer.ready ? 'light' : 'filled'}
              color={currentPlayer.ready ? 'teal' : 'blue'}
              onClick={onReadyToggle}
            >
              {currentPlayer.ready ? 'Unready' : 'Ready up'}
            </Button>
          )}
        </Group>

        {players.length === 0 && <Text c="dimmed">No players yet.</Text>}

        <Stack gap="sm">
          {players.map((player) => {
            const isSelf = player.id === currentPlayerId;

            return (
              <Card key={player.id} withBorder radius="md" padding="md">
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Group gap="xs" align="center">
                      <ColorSwatch color={player.color} radius="xl" size={18} withShadow={false} />
                      <Text fw={600}>{player.nickname}</Text>
                      {isSelf && (
                        <Badge color="blue" variant="light">
                          You
                        </Badge>
                      )}
                    </Group>
                    <Badge color={player.ready ? 'teal' : 'gray'} variant={player.ready ? 'filled' : 'outline'}>
                      {player.ready ? 'Ready' : 'Not ready'}
                    </Badge>
                  </Group>

                  {isSelf ? (
                    <Group gap="xs" align="center">
                      <Select
                        label="Color"
                        data={colorOptions}
                        value={player.color}
                        allowDeselect={false}
                        onChange={(value) => {
                          if (!value) return;
                          onColorChange(value as Player['color']);
                        }}
                        comboboxProps={{ withinPortal: true }}
                        checkIconPosition="right"
                        w={200}
                      />
                    </Group>
                  ) : (
                    <Group gap="xs" align="center">
                      <Text c="dimmed">Color:</Text>
                      <ColorSwatch color={player.color} radius="xl" size={18} withShadow={false} />
                    </Group>
                  )}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
