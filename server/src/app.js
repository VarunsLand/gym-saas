const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes/index');
const globalErrorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

// Trust Render proxy
app.set('trust proxy', 1);

// 1. Set security HTTP headers
app.use(helmet());

// 2. Enable Cross-Origin Resource Sharing with explicit origins
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/signup', authLimiter);

// 4. Development request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 5. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Infrastructure Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// TEMPORARY: Debug endpoint to verify database connection on Render
// DELETE THIS AFTER CONFIRMING SIGNUP WORKS
app.get('/debug/db-check', async (req, res) => {
  try {
    const prisma = require('./config/db');
    const url = new URL(process.env.DATABASE_URL);
    const tables = await prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    res.json({
      host: url.hostname,
      database: url.pathname.slice(1),
      has_pooler: url.hostname.includes('-pooler'),
      table_count: tables.length,
      tables: tables.map(t => t.table_name),
      has_users: tables.some(t => t.table_name === 'users'),
      has_tenants: tables.some(t => t.table_name === 'tenants')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Mount application routing map
app.use('/api/v1', routes);

// 8. Handle Unmatched Routes
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// 9. Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;