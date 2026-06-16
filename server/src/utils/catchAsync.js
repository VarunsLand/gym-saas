/**
 * An Express utility wrapper that automatically catches rejected promises 
 * thrown inside asynchronous controllers and routes them directly to 
 * the global error handler, eliminating the need for repetitive try/catch blocks.
 *
 * @param {Function} fn - The asynchronous Express controller or middleware
 * @returns {Function} A standard Express middleware signature
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Execute the async function and append .catch() to forward any rejections
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

module.exports = catchAsync;
