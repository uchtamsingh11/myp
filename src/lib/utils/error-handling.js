/**
 * Standard API error with contextual information
 */
export class AppError extends Error {
  constructor({ message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', context }) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;

    // Ensure proper stack trace in modern Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Returns a sanitized version of the error for client consumption
   */
  toJSON() {
    const isProduction = process.env.NODE_ENV === 'production';

    const error = {
      message: this.message,
      code: this.code,
      ...(isProduction ? {} : { context: this.context }),
    };

    return error;
  }
}

/**
 * Create standard errors with consistent structure
 */
export const createError = {
  badRequest: (message, context) =>
    new AppError({ message, statusCode: 400, code: 'BAD_REQUEST', context }),

  unauthorized: (message = 'Unauthorized', context) =>
    new AppError({ message, statusCode: 401, code: 'UNAUTHORIZED', context }),

  forbidden: (message = 'Forbidden', context) =>
    new AppError({ message, statusCode: 403, code: 'FORBIDDEN', context }),

  notFound: (message = 'Not found', context) =>
    new AppError({ message, statusCode: 404, code: 'NOT_FOUND', context }),

  conflict: (message, context) =>
    new AppError({ message, statusCode: 409, code: 'CONFLICT', context }),

  internal: (message = 'Internal server error', context) =>
    new AppError({ message, statusCode: 500, code: 'INTERNAL_SERVER_ERROR', context }),
};

/**
 * Handle errors consistently throughout the application
 */
export function handleError(error) {
  // Already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }

  // Convert standard Error to AppError
  if (error instanceof Error) {
    const isProduction = process.env.NODE_ENV === 'production';
    return new AppError({
      message: error.message,
      context: { originalError: error.name, stack: isProduction ? undefined : error.stack },
    });
  }

  // Handle unexpected error types
  return new AppError({
    message: 'An unexpected error occurred',
    context: { originalError: error },
  });
}
