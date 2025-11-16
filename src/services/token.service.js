const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const tokenRepository = require('../repositories/token.repository');
const { AuthenticationError } = require('../utils/errors');

class TokenService {
  generateAccessToken(userId, email) {
    const payload = {
      userId,
      email
    };
    
    const options = {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m'
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }

  async generateRefreshToken(userId) {
    const token = uuidv4();
    const expiresAt = new Date();
    const expirationDays = parseInt(process.env.JWT_REFRESH_EXPIRATION) || 7;
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    
    await tokenRepository.create(userId, token, expiresAt);
    
    return token;
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Access token has expired', 'TOKEN_EXPIRED');
      }
      throw new AuthenticationError('Invalid access token', 'TOKEN_INVALID');
    }
  }

  async refreshAccessToken(refreshToken) {
    const tokenRecord = await tokenRepository.findByToken(refreshToken);
    
    if (!tokenRecord) {
      throw new AuthenticationError('Invalid or expired refresh token', 'TOKEN_INVALID');
    }
    
    const accessToken = this.generateAccessToken(
      tokenRecord.userId,
      tokenRecord.user.email
    );
    
    return accessToken;
  }

  async revokeRefreshToken(token) {
    await tokenRepository.deleteByToken(token);
  }
}

module.exports = new TokenService();
