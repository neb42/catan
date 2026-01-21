import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Button, Card, Stack, Text, TextInput, Title } from '@mantine/core';

type JoinRoomProps = {
  isConnected: boolean;
  onJoin: (roomId: string, nickname: string) => void;
  error?: string | null;
};

const ROOM_ID_LENGTH = 6;
const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 30;

export default function JoinRoom({ isConnected, onJoin, error }: JoinRoomProps) {
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState('');
  const [roomError, setRoomError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setSubmitError(error ?? null);
  }, [error]);

  const normalizedRoomId = useMemo(() => roomId.toUpperCase(), [roomId]);

  const isRoomIdValid = useMemo(
    () => normalizedRoomId.length === ROOM_ID_LENGTH,
    [normalizedRoomId],
  );

  const isNicknameValid = useMemo(() => {
    const trimmed = nickname.trim();
    return trimmed.length >= MIN_NICKNAME_LENGTH && trimmed.length <= MAX_NICKNAME_LENGTH;
  }, [nickname]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    setRoomError(null);
    setNicknameError(null);
    setSubmitError(null);

    if (!isRoomIdValid) {
      setRoomError('Room ID must be 6 characters.');
    }

    const trimmedNickname = nickname.trim();
    if (!isNicknameValid) {
      setNicknameError('Nickname must be between 2 and 30 characters.');
    }

    if (!isRoomIdValid || !isNicknameValid) {
      return;
    }

    onJoin(normalizedRoomId, trimmedNickname);
  };

  return (
    <Card withBorder radius="md" padding="lg" shadow="sm" component="form" onSubmit={handleSubmit}>
      <Stack gap="sm">
        <Title order={4}>Join Room</Title>
        <Text c="dimmed">Enter the room ID and your nickname to join.</Text>
        <TextInput
          label="Room ID"
          placeholder="ABC123"
          value={normalizedRoomId}
          onChange={(event) => {
            setRoomId(event.currentTarget.value);
            setRoomError(null);
            setSubmitError(null);
          }}
          error={roomError ?? undefined}
          maxLength={ROOM_ID_LENGTH}
          required
        />
        <TextInput
          label="Nickname"
          placeholder="Your nickname"
          value={nickname}
          onChange={(event) => {
            setNickname(event.currentTarget.value);
            setNicknameError(null);
            setSubmitError(null);
          }}
          error={nicknameError ?? undefined}
          maxLength={MAX_NICKNAME_LENGTH}
          required
        />
        <Button type="submit" disabled={!isConnected || !isRoomIdValid || !isNicknameValid}>
          {isConnected ? 'Join room' : 'Waiting for connection...'}
        </Button>
        {submitError && (
          <Text c="red" size="sm">
            {submitError}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
