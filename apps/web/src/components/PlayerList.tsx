import { Player, PLAYER_COLORS } from '@catan/shared';
import {
  Avatar,
  Badge,
  Card,
  ColorSwatch,
  Group,
  Stack,
  Text,
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
  // Create 4 slots (max players)
  const slots = Array.from({ length: 4 }, (_, index) => {
    return players[index] || null;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {slots.map((player, index) => {
        if (!player) {
          // Empty slot
          return (
            <Card
              key={`empty-${index}`}
              padding="xl"
              radius="lg"
              shadow="sm"
              style={{
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.5)',
                border: '2px dashed #D1D5DB',
                boxShadow: 'none',
              }}
            >
              <Text c="dimmed" fw={500}>
                Waiting for player...
              </Text>
            </Card>
          );
        }

        const isSelf = player.id === currentPlayerId;
        const initials = player.nickname.slice(0, 2).toUpperCase();

        return (
          <Card
            key={player.id}
            padding="xl"
            radius="lg"
            shadow="md"
            style={{
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              border: '2px solid #EEE',
              transition: 'transform 0.3s',
            }}
          >
            <Stack gap="xs" align="center">
              {/* Avatar with initials */}
              <Avatar
                size={80}
                radius="xl"
                className={`c-${player.color}`}
                style={{
                  backgroundColor: `var(--color-${player.color}, ${player.color})`,
                  color: player.color === 'white' ? '#2D3142' : 'white',
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: 'Fraunces, serif',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
              >
                {initials}
              </Avatar>

              {/* Player name */}
              <Text
                size="lg"
                fw={700}
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {player.nickname}
              </Text>

              {/* Ready status */}
              <Badge
                size="md"
                variant={player.ready ? 'filled' : 'outline'}
                color={player.ready ? 'teal' : 'gray'}
                style={{
                  cursor: isSelf ? 'pointer' : 'default',
                }}
                onClick={isSelf ? onReadyToggle : undefined}
              >
                {player.ready ? 'Ready' : 'Not ready'}
              </Badge>

              {/* Color picker for current player */}
              {isSelf && (
                <Group
                  gap="xs"
                  style={{
                    marginTop: '0.5rem',
                    background: '#F3F4F6',
                    padding: '0.4rem',
                    borderRadius: '99px',
                  }}
                >
                  {PLAYER_COLORS.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={`var(--color-${color}, ${color})`}
                      size={32}
                      radius="xl"
                      className={`c-${color}`}
                      style={{
                        cursor: 'pointer',
                        border: player.color === color ? '3px solid var(--color-text)' : '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                      }}
                      onClick={() => onColorChange(color)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </Group>
              )}
            </Stack>
          </Card>
        );
      })}
    </div>
  );
}
