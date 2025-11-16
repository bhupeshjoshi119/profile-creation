const cron = require('node-cron');
const tokenRepository = require('../repositories/token.repository');
const rateLimitRepository = require('../repositories/rateLimit.repository');
const logger = require('../utils/logger');

async function cleanupExpiredTokens() {
  try {
    const deletedCount = await tokenRepository.deleteExpired();
    logger.info(`Cleanup job: Deleted ${deletedCount} expired tokens`);
  } catch (error) {
    logger.error('Failed to cleanup expired tokens:', error);
  }
}

async function cleanupRateLimits() {
  try {
    const deletedCount = await rateLimitRepository.deleteExpired(120);
    logger.info(`Cleanup job: Deleted ${deletedCount} old rate limit records`);
  } catch (error) {
    logger.error('Failed to cleanup rate limits:', error);
  }
}

function startCleanupJobs() {
  // Clean expired tokens every hour
  cron.schedule('0 * * * *', cleanupExpiredTokens);
  logger.info('Scheduled cleanup job: Expired tokens (every hour)');
  
  // Clean old rate limit records every 30 minutes
  cron.schedule('*/30 * * * *', cleanupRateLimits);
  logger.info('Scheduled cleanup job: Rate limits (every 30 minutes)');
}

module.exports = { startCleanupJobs };
