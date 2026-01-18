import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import '@mantine/core/styles.css';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { WebSocketProvider } from './lib/websocket-context';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <MantineProvider defaultColorScheme="auto">
          <RouterProvider router={router} />
        </MantineProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  </StrictMode>,
);
