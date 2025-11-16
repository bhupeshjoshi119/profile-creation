const rateLimitRepository = require('../repositories/rateLimit.repository');
const { RateLimitError } = require('../utils/errors');
const logger = require('../utils/logger');

const RATE_LIMITS = {
  login: {
    max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
    window: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW) || 15
  },
  signup: {
    max: parseInt(process.env.RATE_LIMIT_SIGNUP_MAX) || 3,
    window: parseInt(process.env.RATE_LIMIT_SIGNUP_WINDOW) || 60
  }
};

class RateLimitService {
  async checkRateLimit(ipAddress, action) {
    const limit = RATE_LIMITS[action];
    
    if (!limit) {
      throw new Error(`Unknown rate limit action: ${action}`);
    }
    
    const attemptCount = await rateLimitRepository.countAttempts(
      ipAddress,
      action,
      limit.window
    );
    
    if (attemptCount >= limit.max) {
      logger.warn('Rate limit exceeded', { ipAddress, action, attemptCount });
      throw new RateLimitError(
        `Too many ${action} attempts. Please try again later.`,
        limit.window * 60
      );
    }
    
    return true;
  }

  async recordAttempt(ipAddress, action, attemptedEmail = null) {
    await rateLimitRepository.create(ipAddress, action, attemptedEmail);
  }

  async resetAttempts(ipAddress, action) {
    await rateLimitRepository.deleteByIp(ipAddress, action);
    logger.info('Rate limit attempts reset', { ipAddress, action });
  }
}

module.exports = new RateLimitService();
