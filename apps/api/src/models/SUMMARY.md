# Models Directory

This directory contains data models and entity definitions for the application.

## Purpose

Models represent the structure of data used in the application. This includes:
- Entity definitions
- Data transfer objects (DTOs)
- Database schema representations

## Usage

Define models as TypeScript classes or interfaces:
```typescript
export interface User {
  id: string;
  email: string;
  createdAt: Date;
}
```

Models may be used with ORMs or as plain TypeScript definitions.
