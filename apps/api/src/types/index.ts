/**
 * Base Type Definitions
 *
 * This module exports shared type definitions used across the application.
 */

// Re-export AppConfig from config module (single source of truth)
export type { AppConfig } from '../config';

/**
 * Standardized API response wrapper type.
 * All API endpoints should return responses in this format.
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the request was successful */
  success: boolean;
  /** The response payload (present on success) */
  data?: T;
  /** Error message (present on failure) */
  error?: string;
  /** Optional additional error details */
  details?: Record<string, unknown>;
}

/**
 * WebSocket message type for real-time communication.
 * All WebSocket messages should follow this structure.
 */
export interface WebSocketMessage<T = unknown> {
  /** Message type identifier */
  type: string;
  /** Message payload */
  payload?: T;
  /** Unique message ID for tracking/correlation */
  id?: string;
  /** ISO timestamp of when message was created */
  timestamp?: string;
}
