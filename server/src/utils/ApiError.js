/**
 * Custom Error class designed to streamline HTTP error handling across the Express architecture.
 * Extends the native Node.js Error object to securely attach HTTP status codes.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);

    // Attach standard HTTP Status Code (e.g., 400, 401, 404, 500)
    this.statusCode = statusCode;

    // Tag the error as "operational". 
    // This explicitly tells our global error handler that this was an expected, 
    // safely handled business logic exception (like a bad password or missing record),
    // differentiating it from fatal unknown programmatic bugs (like memory leaks or syntax crashes).
    this.isOperational = true;

    // Capture the V8 engine stack trace cleanly,
    // explicitly hiding this exact constructor call from the output log to keep traces legible.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
