// Custom error classes for better error handling
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

// Helper to safely emit errors to socket
export function emitError(socket: any, error: unknown): void {
  if (error instanceof AppError) {
    socket.emit('error', { message: error.message, code: error.code });
  } else if (error instanceof Error) {
    socket.emit('error', { message: error.message });
  } else {
    socket.emit('error', { message: 'An unknown error occurred' });
  }
  
  // Log error server-side
  console.error('[Socket Error]', error);
}