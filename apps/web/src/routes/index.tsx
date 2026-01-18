/**
 * Landing Page - Nickname entry form
 *
 * User enters their nickname to join the lobby.
 * Validates nickname length (3-30 chars) and sends to server for uniqueness check.
 * On success, sends JOIN_ROOM message then navigates to lobby.
 */

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useWebSocket } from '../lib/websocket-context';
import { AnimatedBackground } from '../components/AnimatedBackground';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

function LandingPage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ws, status, sendMessage } = useWebSocket();
  const navigate = useNavigate({ from: '/' });

  // Handle server validation responses
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (message: any) => {
      if (message.type === 'NICKNAME_ACCEPTED') {
        // Success - send JOIN_ROOM then navigate to lobby
        sendMessage({
          type: 'JOIN_ROOM',
          payload: { roomId: 'lobby' }
        });

        // Transition delay for visual feedback
        setTimeout(() => {
          navigate({ to: '/lobby' });
        }, 300);
      } else if (message.type === 'NICKNAME_REJECTED') {
        // Show error and reset loading state
        setError(message.payload.message || 'This nickname is already taken. Try another!');
        setIsSubmitting(false);
      }
    };

    ws.addMessageHandler(handleMessage);
    return () => ws.removeMessageHandler(handleMessage);
  }, [ws, navigate, sendMessage]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmed = nickname.trim();

    // Client-side validation
    if (trimmed.length < 3) {
      setError('Please enter a nickname');
      setIsSubmitting(false);
      return;
    }

    if (trimmed.length > 30) {
      setError('Nickname too long (max 30 characters)');
      setIsSubmitting(false);
      return;
    }

    // Check connection status
    if (status !== 'connected') {
      setError('Connection lost. Please wait...');
      setIsSubmitting(false);
      return;
    }

    // Send to server for uniqueness check
    setIsSubmitting(true);
    setError(''); // Clear any previous errors
    sendMessage({
      type: 'SET_NICKNAME',
      payload: { nickname: trimmed }
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    if (error) setError(''); // Clear error on typing
  };

  // Accurate character count including emoji
  const charCount = Array.from(nickname).length;

  return (
    <>
      <AnimatedBackground />
      <div className="landing-container">
        <h1 className="landing-title">Join the Game</h1>
        <p className="landing-subtitle">Enter your nickname to get started</p>

        <form onSubmit={handleSubmit} className="landing-form">
          <div className="input-group">
            <input
              type="text"
              className={`landing-input ${error ? 'error' : ''}`}
              placeholder="Your nickname"
              value={nickname}
              onChange={handleChange}
              maxLength={30}
              autoFocus
              disabled={isSubmitting}
            />
            <div className="character-counter">{charCount}/30</div>
            {error && (
              <div className="error-message visible">
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`landing-button ${charCount >= 3 && !isSubmitting ? 'pulse' : ''}`}
            disabled={isSubmitting || status !== 'connected'}
          >
            {isSubmitting ? 'Joining...' : 'Enter Lobby'}
          </button>
        </form>

        <p className="helper-text">
          3-4 players • Choose colors • Play together
        </p>

        {status !== 'connected' && (
          <div className="connection-status">
            {status === 'connecting' && 'Connecting...'}
            {status === 'reconnecting' && 'Reconnecting...'}
            {status === 'disconnected' && 'Disconnected. Retrying...'}
          </div>
        )}
      </div>
    </>
  );
}
