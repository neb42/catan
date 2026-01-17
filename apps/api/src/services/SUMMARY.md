# Services Directory

This directory contains shared service classes and business logic that spans multiple features.

## Purpose

Services encapsulate business logic that doesn't belong to a single feature or needs to be shared across features. Examples include:
- External API integrations
- Shared data access layers
- Cross-cutting business logic

## Usage

Export service classes or factory functions:
```typescript
import { EmailService } from '../services';

const emailService = new EmailService();
await emailService.send(recipient, subject, body);
```

Feature-specific services should live in their respective feature directories.
