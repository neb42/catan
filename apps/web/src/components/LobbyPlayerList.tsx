import { Player, PLAYER_COLORS, PLAYER_COLOR_HEX } from '@catan/shared';
import {
  Avatar,
  Badge,
  Card,
  ColorSwatch,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { motion } from 'motion/react';
import { useState } from 'react';

type LobbyPlayerListProps = {
  players: Player[];
  currentPlayerId: string | null;
  onColorChange: (color: Player['color']) => void;
  onNicknameChange: (nickname: string) => void;
  onReadyToggle: () => void;
};

export function LobbyPlayerList({
  players,
  currentPlayerId,
  onColorChange,
  onNicknameChange,
  onReadyToggle,
}: LobbyPlayerListProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [editingNickname, setEditingNickname] = useState<{
    [playerId: string]: string;
  }>({});

  // Create 4 slots (max players)
  const slots = Array.from({ length: 4 }, (_, index) => {
    return players[index] || null;
  });

  // Color mapping for backgrounds
  const colorMap: Record<string, string> = PLAYER_COLOR_HEX;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '1.5rem',
      }}
    >
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
        const playerColorHex = PLAYER_COLOR_HEX[player.color] || player.color;
        const selectedColors = players.map((p) => p.color);

        return (
          <motion.div
            key={player.id}
            animate={{}}
            style={{
              borderRadius: 16, // Matches Card radius="lg"
            }}
          >
            <Card
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
                transition: 'transform 0.3s, border 0.3s',
              }}
            >
              <Stack gap="xs" align="center">
                {/* Avatar with initials */}
                <Avatar
                  size={80}
                  radius="xl"
                  style={{
                    backgroundColor: colorMap[player.color] || player.color,
                    color: player.color === 'white' ? '#2D3142' : 'white',
                    fontSize: '2rem',
                    fontWeight: 800,
                    fontFamily: 'Fraunces, serif',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {initials}
                </Avatar>

                {/* Player name - editable for self */}
                {isSelf ? (
                  <TextInput
                    value={
                      editingNickname[player.id] !== undefined
                        ? editingNickname[player.id]
                        : player.nickname
                    }
                    onChange={(e) =>
                      setEditingNickname({
                        ...editingNickname,
                        [player.id]: e.currentTarget.value,
                      })
                    }
                    onBlur={() => {
                      const newNickname =
                        editingNickname[player.id] ?? player.nickname;
                      if (newNickname !== player.nickname) {
                        onNicknameChange(newNickname);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    size="lg"
                    styles={{
                      input: {
                        fontFamily: 'Fraunces, serif',
                        fontWeight: 700,
                        textAlign: 'center',
                        borderColor: playerColorHex,
                        borderWidth: '2px',
                        padding: '0.25rem',
                        background: 'transparent',
                        transition: 'border-color 0.2s',
                        '&:hover': {
                          borderBottomColor: '#D1D5DB',
                        },
                        '&:focus': {
                          borderBottomColor: 'var(--color-secondary)',
                        },
                      },
                    }}
                  />
                ) : (
                  <Text
                    size="lg"
                    fw={700}
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {player.nickname}
                  </Text>
                )}

                {/* Ready status */}
                <Badge
                  size="md"
                  variant={player.ready ? 'filled' : 'outline'}
                  color={player.ready ? 'teal' : 'gray'}
                  style={{
                    cursor: isSelf ? 'pointer' : 'default',
                    pointerEvents: isSelf ? 'auto' : 'none',
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
                      padding: '0.4rem',
                    }}
                  >
                    {PLAYER_COLORS.map((color) => (
                      <ColorSwatch
                        key={color}
                        color={colorMap[color] || color}
                        size={32}
                        radius="xl"
                        style={{
                          cursor: selectedColors.includes(color) ? 'not-allowed' : 'pointer',
                          border:
                            player.color === color
                              ? '3px solid var(--color-text)'
                              : '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s',
                          opacity: selectedColors.includes(color) && player.color !== color ? 0.5 : 1,
                        }}
                        onClick={() => selectedColors.includes(color) ? undefined : onColorChange(color)}
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
          </motion.div>
        );
      })}
    </div>
  );
}
