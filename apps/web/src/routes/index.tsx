import { createRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Alert, Text, Title, Stack } from '@mantine/core';
import { Route as rootRoute } from './__root';
import { apiFetch } from '../lib/api';

interface HealthResponse {
  status: string;
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

function HomePage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<HealthResponse>('/health'),
  });

  return (
    <Stack gap="md">
      <Title order={1}>Welcome to Catan</Title>
      <Text>Your game awaits.</Text>

      {healthQuery.isLoading && (
        <Alert color="blue" title="Checking API connection...">
          Connecting to backend server...
        </Alert>
      )}

      {healthQuery.isSuccess && (
        <Alert color="green" title="API Connected">
          Backend server is running (status: {healthQuery.data.status})
        </Alert>
      )}

      {healthQuery.isError && (
        <Alert color="red" title="API Connection Error">
          Unable to connect to backend server. Make sure the API is running on
          localhost:3000.
        </Alert>
      )}
    </Stack>
  );
}
