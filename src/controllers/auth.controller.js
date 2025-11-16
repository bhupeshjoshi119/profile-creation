const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const rateLimitService = require('../services/rateLimit.service');
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

class AuthController {
  async signup(req, res, next) {
    try {
      const { email, password, fullName } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const user = await authService.signup(email, password, fullName);
      
      // Reset rate limit on successful signup
      await rateLimitService.resetAttempts(ipAddress, 'signup');
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      try {
        const result = await authService.login(email, password, ipAddress);
        
        // Reset rate limit on successful login
        await rateLimitService.resetAttempts(ipAddress, 'login');
        
        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: result
        });
      } catch (error) {
        // Record failed login attempt
        await rateLimitService.recordAttempt(ipAddress, 'login', email);
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      const accessToken = await tokenService.refreshAccessToken(refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await tokenService.revokeRefreshToken(refreshToken);
      }
      
      logger.info('User logged out', { userId: req.user.userId });
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfileSimple(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required'
          }
        });
      }
      
      const user = await userRepository.findByEmail(email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutSimple(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required'
          }
        });
      }
      
      // Find user by email
      const user = await userRepository.findByEmail(email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      // Delete all tokens for this user
      const tokenRepository = require('../repositories/token.repository');
      await tokenRepository.deleteByUserId(user.id);
      
      logger.info('User logged out (simple)', { userId: user.id, email: user.email });
      
      res.status(200).json({
        success: true,
        message: 'Logout successful - all sessions cleared'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
