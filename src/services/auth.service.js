const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const tokenService = require('./token.service');
const { validateEmail, validatePassword, validateFullName } = require('../utils/validator');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

class AuthService {
  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async signup(email, password, fullName) {
    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password, email);
    const nameValidation = validateFullName(fullName);
    
    const errors = {};
    if (!emailValidation.valid) errors.email = emailValidation.errors;
    if (!passwordValidation.valid) errors.password = passwordValidation.errors;
    if (!nameValidation.valid) errors.fullName = nameValidation.errors;
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
    
    // Check if email already exists
    const emailExists = await userRepository.emailExists(emailValidation.value);
    if (emailExists) {
      throw new ConflictError('Email is already registered');
    }
    
    // Hash password
    const passwordHash = await this.hashPassword(password);
    
    // Create user
    const user = await userRepository.create({
      email: emailValidation.value,
      passwordHash,
      fullName: nameValidation.value
    });
    
    logger.info('User registered successfully', { userId: user.id, email: user.email });
    
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt
    };
  }

  async login(email, password, ipAddress) {
    // Validate inputs
    const emailValidation = validateEmail(email);
    
    if (!emailValidation.valid) {
      throw new ValidationError('Invalid email format', { email: emailValidation.errors });
    }
    
    if (!password) {
      throw new ValidationError('Password is required', { password: ['Password is required'] });
    }
    
    // Find user
    const user = await userRepository.findByEmail(emailValidation.value);
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email: emailValidation.value, ipAddress });
      throw new AuthenticationError('Invalid email or password');
    }
    
    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', { userId: user.id, email: user.email, ipAddress });
      throw new AuthenticationError('Invalid email or password');
    }
    
    // Update last login
    await userRepository.updateLastLogin(user.id);
    
    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id, user.email);
    const refreshToken = await tokenService.generateRefreshToken(user.id);
    
    logger.info('User logged in successfully', { userId: user.id, email: user.email, ipAddress });
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    };
  }
}

module.exports = new AuthService();
