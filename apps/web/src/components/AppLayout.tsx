import { ReactNode } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      footer={{ height: 50 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text size="xl" fw={700}>
            Catan
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink label="Home" href="/" />
        <NavLink label="Games" href="/games" />
        <NavLink label="Settings" href="/settings" />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Footer p="md">
        <Text size="sm" c="dimmed" ta="center">
          &copy; {new Date().getFullYear()} Catan. All rights reserved.
        </Text>
      </AppShell.Footer>
    </AppShell>
  );
}
