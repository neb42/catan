import { FormEvent, useState } from 'react';
import { Button, Card, Stack, Text, TextInput, Title } from '@mantine/core';

type LandingFormProps = {
  isConnected: boolean;
  onCreate: () => void;
  onJoin: (roomId: string) => void;
  nickname: string;
  onNicknameChange: (nickname: string) => void;
  error?: string | null;
};

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 30;
const ROOM_ID_LENGTH = 6;

export default function LandingForm({
  isConnected,
  onCreate,
  onJoin,
  nickname,
  onNicknameChange,
  error,
}: LandingFormProps) {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [roomId, setRoomId] = useState('');

  const isNicknameValid = nickname.trim().length >= MIN_NICKNAME_LENGTH && 
                          nickname.trim().length <= MAX_NICKNAME_LENGTH;
  const isRoomIdValid = roomId.toUpperCase().length === ROOM_ID_LENGTH;

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!isNicknameValid) return;
    onCreate();
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!isNicknameValid || !isRoomIdValid) return;
    onJoin(roomId.toUpperCase());
  };

  const handleShowJoin = () => {
    if (!isNicknameValid) return;
    setShowJoinForm(true);
  };

  return (
    <Card
      padding="3rem"
      radius="lg"
      shadow="xl"
      component="form"
      onSubmit={showJoinForm ? handleJoin : handleCreate}
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
            onChange={(e) => onNicknameChange(e.currentTarget.value)}
            maxLength={MAX_NICKNAME_LENGTH}
            required
            autoFocus
            disabled={showJoinForm}
            styles={{
              input: {
                padding: '1rem 1.25rem',
                fontSize: '1.2rem',
                fontWeight: 600,
                border: '2px solid #EEE',
                borderRadius: 'var(--radius-md)',
                background: showJoinForm ? '#F5F5F5' : '#FAFAFA',
                transition: 'all 0.2s ease',
              },
            }}
          />
        </div>

        {showJoinForm ? (
          <>
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
                Room Code
              </Text>
              <TextInput
                placeholder="ABC123"
                value={roomId.toUpperCase()}
                onChange={(e) => setRoomId(e.currentTarget.value)}
                maxLength={ROOM_ID_LENGTH}
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
              disabled={!isConnected || !isNicknameValid || !isRoomIdValid}
              size="lg"
              fw={800}
              styles={{
                root: {
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '1.1rem',
                },
              }}
            >
              {isConnected ? 'Go' : 'Waiting for connection...'}
            </Button>

            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8D99AE',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8D99AE')}
            >
              ← Back to menu
            </button>
          </>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Button
              type="submit"
              disabled={!isConnected || !isNicknameValid}
              size="lg"
              fw={800}
              styles={{
                root: {
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '1.1rem',
                },
              }}
            >
              {isConnected ? 'Start New Expedition' : 'Waiting for connection...'}
            </Button>

            <Button
              type="button"
              onClick={handleShowJoin}
              disabled={!isConnected || !isNicknameValid}
              size="lg"
              fw={800}
              variant="outline"
              styles={{
                root: {
                  color: 'var(--color-text)',
                  fontSize: '1.1rem',
                },
              }}
            >
              Join Existing Map
            </Button>
          </div>
        )}

        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
