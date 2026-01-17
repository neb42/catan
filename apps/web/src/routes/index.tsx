import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <h1>Welcome to Catan</h1>
      <p>Your game awaits.</p>
    </div>
  );
}
