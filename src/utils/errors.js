class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errorCode = 'VALIDATION_ERROR';
    this.details = details;
  }
}

class AuthenticationError extends Error {
  constructor(message, errorCode = 'INVALID_CREDENTIALS') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    this.errorCode = errorCode;
  }
}

class RateLimitError extends Error {
  constructor(message, retryAfter = 900) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.errorCode = 'RATE_LIMIT_EXCEEDED';
    this.retryAfter = retryAfter;
  }
}

class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
    this.errorCode = 'DATABASE_ERROR';
    this.originalError = originalError;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.errorCode = 'USER_NOT_FOUND';
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.errorCode = 'EMAIL_EXISTS';
  }
}

module.exports = {
  ValidationError,
  AuthenticationError,
  RateLimitError,
  DatabaseError,
  NotFoundError,
  ConflictError
};
