// 1. Load environment variables strictly before any dependent modules execute
require('dotenv').config();

const app = require('./app');
const prisma = require('./config/db');

// 4. Define active port
const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    // 5. Explicitly verify the PostgreSQL database connection prior to accepting traffic
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected successfully');

    // 6. Bind Express server
    server = app.listen(PORT, () => {
      // 7. Log critical environment metadata
      console.log(`🚀 Server initialized in [${process.env.NODE_ENV || 'development'}] mode`);
      console.log(`🌐 Listening on port ${PORT}`);
    });

  } catch (error) {
    // 9. Handle startup failures safely
    console.error('❌ FATAL: Server failed to start');
    console.error(error);
    
    // Ensure no lingering connections remain
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Execute initialization
startServer();

// 8. Graceful Shutdown Orchestration
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
  
  const shutdownSequence = async () => {
    try {
      await prisma.$disconnect();
      console.log('✅ Prisma database connection cleanly closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during database disconnect:', err);
      process.exit(1);
    }
  };

  if (server) {
    // Stop accepting new HTTP requests, wait for existing ones to finish
    server.close(() => {
      console.log('✅ HTTP server safely terminated');
      shutdownSequence();
    });
  } else {
    // If the server never started, just close DB
    shutdownSequence();
  }
};

// Listen for termination signals from Docker, Kubernetes, or manual Ctrl+C
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Catch any stray unhandled promise rejections outside of Express
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Triggering shutdown...');
  console.error(err);
  gracefulShutdown('unhandledRejection');
});
