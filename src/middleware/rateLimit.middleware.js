const rateLimitService = require('../services/rateLimit.service');

function rateLimitMiddleware(action) {
  return async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      await rateLimitService.checkRateLimit(ipAddress, action);
      
      next();
    } catch (error) {
      if (error.name === 'RateLimitError') {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.errorCode,
            message: error.message,
            retryAfter: error.retryAfter
          }
        });
      }
      next(error);
    }
  };
}

module.exports = rateLimitMiddleware;
