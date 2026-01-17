import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from '@tanstack/react-router';
import '@mantine/core/styles.css';
import { router } from './router';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <MantineProvider defaultColorScheme="auto">
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>,
);
