import { Container, Stack, Text, Title } from '@mantine/core';

import Lobby from '../components/Lobby';

export function App() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={2}>Catan Lobby</Title>
          <Text c="dimmed">Create a room, share the code, and get everyone ready.</Text>
        </Stack>
        <Lobby />
      </Stack>
    </Container>
  );
}

export default App;
