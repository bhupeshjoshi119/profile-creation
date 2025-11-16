require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const pool = require('./src/config/database');
const { startCleanupJobs } = require('./src/jobs/cleanup.job');

const PORT = process.env.PORT || 3000;

// Test database connection on startup
async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    logger.info('Database connection successful');
    
    // Start cleanup jobs
    startCleanupJobs();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await pool.end();
        logger.info('Database connections closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await pool.end();
        logger.info('Database connections closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
