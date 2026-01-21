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
    <Card
      padding="3rem"
      radius="lg"
      shadow="xl"
      component="form"
      onSubmit={handleSubmit}
      style={{
        maxWidth: '480px',
        width: '100%',
        transform: 'translateY(20px)',
        opacity: 0,
        animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        boxShadow: '0 20px 40px -10px var(--color-shadow), 0 0 0 1px rgba(0,0,0,0.02)',
        textAlign: 'center',
      }}
    >
      <Stack gap="xl">
        <div style={{ marginBottom: '0.5rem' }}>
          <Title
            order={1}
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 800,
              fontSize: '3rem',
              lineHeight: 1.1,
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Settlers
          </Title>
          <Text
            style={{
              color: '#8D99AE',
              fontSize: '1.1rem',
              fontWeight: 400,
            }}
          >
            Explore, Build, Trade.
          </Text>
        </div>

        <div style={{ textAlign: 'left' }}>
          <Text
            size="sm"
            fw={600}
            style={{
              marginBottom: '0.5rem',
              color: '#8D99AE',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Explorer Name
          </Text>
          <TextInput
            placeholder="e.g. Captain Brick"
            value={nickname}
            onChange={(event) => setNickname(event.currentTarget.value)}
            error={localError ?? undefined}
            maxLength={MAX_NICKNAME_LENGTH}
            required
            autoFocus
            styles={{
              input: {
                padding: '1rem 1.25rem',
                fontSize: '1.2rem',
                fontWeight: 600,
                border: '2px solid #EEE',
                borderRadius: 'var(--radius-md)',
                background: '#FAFAFA',
                transition: 'all 0.2s ease',
              },
            }}
          />
        </div>

        <Button
          type="submit"
          disabled={!isConnected || !isNicknameValid}
          style={{
            padding: '1rem',
            fontWeight: 800,
            fontSize: '1.1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            boxShadow: '0 4px 6px rgba(231, 111, 81, 0.3)',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(231, 111, 81, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(231, 111, 81, 0.3)';
          }}
        >
          {isConnected ? 'Start New Expedition' : 'Waiting for connection...'}
        </Button>
      </Stack>
    </Card>
  );
}
