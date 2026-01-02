/**
 * Error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userMessage?: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Storage errors
 */
export class StorageError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'STORAGE_ERROR', userMessage ?? 'Failed to save data. Please check your browser storage settings.', true);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Audio errors
 */
export class AudioError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'AUDIO_ERROR', userMessage ?? 'Unable to play audio. Please check your browser audio settings.', true);
    this.name = 'AudioError';
    Object.setPrototypeOf(this, AudioError.prototype);
  }
}

/**
 * API errors
 */
export class ApiError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'API_ERROR', userMessage ?? 'Failed to fetch data. Please check your internet connection.', true);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Handle errors with user-friendly messages
 */
export function handleError(error: unknown, defaultMessage: string = 'An unexpected error occurred'): string {
  if (error instanceof AppError) {
    return error.userMessage ?? error.message;
  }

  if (error instanceof Error) {
    // Handle specific browser errors
    if (error.name === 'QuotaExceededError') {
      return 'Storage is full. Please clear some space or delete old songs.';
    }
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.name === 'SecurityError') {
      return 'Security error. Please check your browser permissions.';
    }
    
    return error.message || defaultMessage;
  }

  return defaultMessage;
}

