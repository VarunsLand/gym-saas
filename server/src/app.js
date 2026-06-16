const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes/index');
const globalErrorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

// 1. Set security HTTP headers
app.use(helmet());

// 2. Enable Cross-Origin Resource Sharing
app.use(cors());

// 3. Development request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 4. Body parsers (read JSON payload and URL encoded data into req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Infrastructure Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 6. Mount application routing map
app.use('/api/v1', routes);

// 7. Handle Unmatched Routes (404 Fallback)
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// 8. Global Error Handling Middleware (Must be the last middleware in the stack)
app.use(globalErrorHandler);

module.exports = app;
