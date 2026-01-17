# Components Directory

This directory contains reusable React components for the web application.

## Purpose

Components in this directory are shared UI building blocks that can be used across multiple routes and features.

## Contents

### AppLayout.tsx

The main application layout component using Mantine's AppShell. Provides:

- **Header**: App title "Catan" with responsive burger menu for mobile
- **Navbar**: Left sidebar with navigation links (collapsible on mobile)
- **Footer**: Copyright text
- **Main**: Content area that renders children

Usage: Wrap route content with `<AppLayout>` or render children via `<Outlet />` in the root route.

## Guidelines

- Keep components focused and single-purpose
- Use Mantine components when possible for consistent styling
- Export components from their individual files (no barrel exports needed)
- Components that are feature-specific should live in the feature's directory instead
