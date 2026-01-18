/**
 * Lobby Placeholder Page
 *
 * Simple placeholder confirming user successfully entered lobby.
 * Full lobby UI with player list, color selection, and ready states
 * will be implemented in Phase 3.
 */

import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lobby',
  component: LobbyPage,
});

function LobbyPage() {
  return (
    <div className="lobby-placeholder">
      <h1>Lobby</h1>
      <p>You're in! Lobby UI coming in Phase 3.</p>
      <style>{`
        .lobby-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }

        .lobby-placeholder h1 {
          font-family: 'Righteous', sans-serif;
          font-size: 3rem;
          color: #FF6B9D;
          margin-bottom: 16px;
        }

        .lobby-placeholder p {
          font-size: 1.25rem;
          color: #B8B9C0;
        }
      `}</style>
    </div>
  );
}
