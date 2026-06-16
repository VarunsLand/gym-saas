const { PrismaClient } = require('@prisma/client');

// Create a PrismaClient singleton mechanism.
// In development, tools like nodemon frequently restart the Node process or clear the module cache,
// which can accidentally spawn hundreds of disconnected PrismaClient instances and exhaust the database connection limit.
// We prevent this by caching the instance on the `global` object.
let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production, always spin up a fresh instance (process restarts are clean)
  prisma = new PrismaClient();
} else {
  // In development, preserve the instance across hot-reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      // Optional: uncomment the line below to log every SQL query to the console for debugging
      // log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;
