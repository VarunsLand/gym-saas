const ApiError = require('../utils/ApiError');

/**
 * Express middleware to intercept and strictly validate incoming payloads using Zod schemas.
 * Replaces Express request properties with perfectly sanitized and coerced values.
 *
 * @param {import('zod').ZodObject} schema - The Zod schema defining the expected shape (body, query, params)
 */
const validate = (schema) => (req, res, next) => {
  // Execute validation synchronously (schemas are memory-bound)
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    // Format all Zod errors into a single, clean comma-separated string for the frontend
    const errorMessage = result.error.errors.map(err => err.message).join(', ');
    
    // Immediately reject the request before it ever reaches a controller
    return next(new ApiError(400, `Validation Error: ${errorMessage}`));
  }

  // Safely inject sanitized, type-coerced, and undocumented-field-stripped values back into the request.
  // This guarantees controllers only ever receive exactly what is defined in the schema.
  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.query = result.data.query;
  if (result.data.params) req.params = result.data.params;

  next();
};

module.exports = validate;
