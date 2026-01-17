/**
 * Application Constants
 * Central export point for all constants used throughout the application.
 */

// Re-export HTTP status codes
export * from './httpStatus';

/**
 * Common application constants
 */
export const APP_NAME = 'catan-api';
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

/**
 * Default values
 */
export const DEFAULT_PORT = 3000;
export const DEFAULT_WS_PORT = 3001;
export const DEFAULT_NODE_ENV = 'development';

/**
 * Timing constants (in milliseconds)
 */
export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  BAD_REQUEST: 'Bad request',
  VALIDATION_ERROR: 'Validation failed',
} as const;
