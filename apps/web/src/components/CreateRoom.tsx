import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Button, Card, Stack, Text, TextInput, Title } from '@mantine/core';

type CreateRoomProps = {
  isConnected: boolean;
  onCreate: (nickname: string) => void;
  error?: string | null;
};

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 30;

export default function CreateRoom({ isConnected, onCreate, error }: CreateRoomProps) {
  const [nickname, setNickname] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(error ?? null);
  }, [error]);

  const isNicknameValid = useMemo(() => {
    const trimmed = nickname.trim();
    return trimmed.length >= MIN_NICKNAME_LENGTH && trimmed.length <= MAX_NICKNAME_LENGTH;
  }, [nickname]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = nickname.trim();

    if (!isNicknameValid) {
      setLocalError('Nickname must be between 2 and 30 characters.');
      return;
    }

    setLocalError(null);
    onCreate(trimmed);
  };

  return (
    <div style={{ animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      <Card withBorder radius="md" padding="lg" shadow="lg" component="form" onSubmit={handleSubmit}>
        <Stack gap="sm">
          <Title order={2} fw={800} ff="Fraunces, serif">Create Room</Title>
          <Text c="dimmed" fz="lg">Enter a nickname to start a new room.</Text>
          <TextInput
            label="Nickname"
            placeholder="Your nickname"
            value={nickname}
            onChange={(event) => setNickname(event.currentTarget.value)}
            error={localError ?? undefined}
            maxLength={MAX_NICKNAME_LENGTH}
            required
            size="lg"
            styles={{ input: { fontSize: '1.2rem', padding: '1rem 1.25rem' } }}
          />
          <Button type="submit" disabled={!isConnected || !isNicknameValid} size="lg" fw={800}>
            {isConnected ? 'Create room' : 'Waiting for connection...'}
          </Button>
        </Stack>
      </Card>
    </div>
  );
}
