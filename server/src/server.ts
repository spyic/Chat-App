import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { setupSocketIO } from './socket';
import { setIO } from './socket/io';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const server = http.createServer(app);

// Setup Socket.IO and store reference for REST controllers
const io = setupSocketIO(server);
setIO(io);

// Graceful shutdown
function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error disconnecting from database', { error });
    }

    io.close(() => {
      logger.info('Socket.IO server closed');
    });

    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`, {
    environment: env.NODE_ENV,
    port: env.PORT,
  });
});

export { server, io };

