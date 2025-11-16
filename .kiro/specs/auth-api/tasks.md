# Implementation Plan

## Overview

This implementation plan breaks down the authentication API development into discrete, actionable coding tasks. Each task builds incrementally on previous work, ensuring a systematic approach from project setup through complete API implementation.

## Tasks

- [x] 1. Initialize project structure and install dependencies
  - Create project directory structure (src/config, src/middleware, src/routes, src/controllers, src/services, src/repositories, src/utils, src/jobs)
  - Initialize package.json with Node.js v22.19.0
  - Install core dependencies: express, mysql2, bcrypt, jsonwebtoken, dotenv, cors, helmet
  - Install development dependencies: nodemon
  - Create .env.example file with all required environment variables
  - Create .gitignore file to exclude node_modules and .env
  - _Requirements: 7.1, 7.2_

- [ ] 2. Set up database connection and schema
  - [x] 2.1 Create database configuration module
    - Write src/config/database.js with MySQL connection pool using mysql2/promise
    - Configure connection pool with settings: connectionLimit=20, waitForConnections=true, queueLimit=0
    - Add connection error handling and logging
    - Export pool instance for use across application
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 2.2 Create database migration scripts
    - Write SQL script to create users table with fields: id, email (unique), password_hash, full_name, created_at, updated_at, last_login
    - Write SQL script to create tokens table with fields: id, user_id (FK), token (unique), expires_at, created_at
    - Write SQL script to create rate_limits table with fields: id, ip_address, action, attempted_email, attempt_time
    - Add indexes: users(email), tokens(token, user_id, expires_at), rate_limits(ip_address, action, attempt_time)
    - Create migration runner script to execute SQL files
    - _Requirements: 1.1, 2.4, 3.2, 5.1, 10.4_

- [ ] 3. Implement utility modules
  - [x] 3.1 Create logger utility
    - Write src/utils/logger.js using console logging with timestamp formatting
    - Implement log levels: error, warn, info, debug
    - Add request ID tracking for correlation
    - _Requirements: 8.1, 8.4_
  
  - [x] 3.2 Create validation schemas
    - Write src/utils/validator.js with validation functions for email format, password strength, full name
    - Implement email validation: regex pattern, max 255 characters, lowercase conversion
    - Implement password validation: min 8 characters, must contain number and symbol
    - Implement full name validation: alphanumeric and spaces only, max 100 characters
    - _Requirements: 1.2, 1.5, 6.1, 6.2, 6.3_
  
  - [x] 3.3 Create custom error classes
    - Write src/utils/errors.js with custom error classes: ValidationError, AuthenticationError, RateLimitError, DatabaseError
    - Each error class should include statusCode, errorCode, and message properties
    - _Requirements: 8.2, 8.3_

- [ ] 4. Implement repository layer for data access
  - [x] 4.1 Create UserRepository
    - Write src/repositories/user.repository.js with methods: create, findByEmail, findById, emailExists, updateLastLogin
    - Implement create() to insert user with parameterized query
    - Implement findByEmail() with case-insensitive search using LOWER()
    - Implement emailExists() to check for duplicate emails
    - Implement updateLastLogin() to set last_login timestamp
    - All methods should use connection pool and parameterized queries
    - _Requirements: 1.1, 1.3, 2.1, 6.4, 10.1, 10.2, 10.3_
  
  - [x] 4.2 Create TokenRepository
    - Write src/repositories/token.repository.js with methods: create, findByToken, deleteByToken, deleteByUserId, deleteExpired
    - Implement create() to insert refresh token with user_id and expires_at
    - Implement findByToken() to retrieve token record with user data
    - Implement deleteByToken() for logout functionality
    - Implement deleteExpired() to remove tokens where expires_at < NOW()
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.3 Create RateLimitRepository
    - Write src/repositories/rateLimit.repository.js with methods: create, countAttempts, deleteByIp, deleteExpired
    - Implement create() to insert rate limit record with ip_address, action, attempted_email
    - Implement countAttempts() to count records within time window using timestamp comparison
    - Implement deleteByIp() to clear attempts after successful action
    - Implement deleteExpired() to remove old records
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [ ] 5. Implement service layer business logic
  - [x] 5.1 Create TokenService
    - Write src/services/token.service.js with methods: generateAccessToken, generateRefreshToken, verifyAccessToken, refreshAccessToken, revokeRefreshToken
    - Implement generateAccessToken() using jsonwebtoken with payload {userId, email}, expiration 15 minutes
    - Implement generateRefreshToken() to create UUID v4 token, store in database with 7-day expiration
    - Implement verifyAccessToken() using jwt.verify() with error handling
    - Implement refreshAccessToken() to validate refresh token from database and generate new access token
    - Implement revokeRefreshToken() to delete token from database
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 5.2 Create AuthService
    - Write src/services/auth.service.js with methods: signup, login, hashPassword, verifyPassword
    - Implement hashPassword() using bcrypt.hash() with 10 salt rounds
    - Implement verifyPassword() using bcrypt.compare()
    - Implement signup() to validate input, check email uniqueness, hash password, create user via UserRepository
    - Implement login() to find user by email, verify password, update last_login, generate tokens
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.5_
  
  - [x] 5.3 Create RateLimitService
    - Write src/services/rateLimit.service.js with methods: checkRateLimit, recordAttempt, resetAttempts
    - Implement checkRateLimit() to query rate limit records and compare against thresholds (login: 5/15min, signup: 3/60min)
    - Implement recordAttempt() to insert rate limit record via RateLimitRepository
    - Implement resetAttempts() to delete rate limit records for IP after successful action
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Implement middleware components
  - [x] 6.1 Create rate limit middleware
    - Write src/middleware/rateLimit.middleware.js to check rate limits before processing requests
    - Extract IP address from request (req.ip or x-forwarded-for header)
    - Call RateLimitService.checkRateLimit() with IP and action type
    - Return 429 status with retry-after header if limit exceeded
    - Call next() if within limits
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 6.2 Create authentication middleware
    - Write src/middleware/auth.middleware.js to verify JWT tokens
    - Extract token from Authorization header (Bearer scheme)
    - Call TokenService.verifyAccessToken() to validate token
    - Attach decoded user data to req.user object
    - Return 401 status if token invalid or missing
    - Call next() if token valid
    - _Requirements: 3.3, 9.2, 9.3_
  
  - [x] 6.3 Create validation middleware
    - Write src/middleware/validation.middleware.js with validation functions for each endpoint
    - Create validateSignup() to check email, password, fullName using validator utility
    - Create validateLogin() to check email and password presence
    - Create validateRefreshToken() to check refreshToken presence
    - Return 400 status with field-specific errors if validation fails
    - Call next() if validation passes
    - _Requirements: 1.2, 1.5, 6.1, 6.2, 6.3, 6.5_

- [ ] 7. Implement API controllers
  - [x] 7.1 Create AuthController
    - Write src/controllers/auth.controller.js with methods: signup, login, refresh, logout, getProfile
    - Implement signup() to call AuthService.signup(), return 201 with user data (excluding password_hash)
    - Implement login() to call AuthService.login(), record rate limit attempt, return 200 with tokens and user data
    - Implement refresh() to call TokenService.refreshAccessToken(), return 200 with new access token
    - Implement logout() to call TokenService.revokeRefreshToken(), return 200 with success message
    - Implement getProfile() to fetch user by ID from req.user, return 200 with user data
    - Add try-catch blocks to handle errors and return appropriate status codes
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 2.5, 3.3, 3.4, 3.5, 9.1, 9.4, 9.5_

- [ ] 8. Set up Express routes and application
  - [x] 8.1 Create authentication routes
    - Write src/routes/auth.routes.js to define API endpoints
    - POST /signup with rate limit and validation middleware, calls AuthController.signup
    - POST /login with rate limit and validation middleware, calls AuthController.login
    - POST /refresh with validation middleware, calls AuthController.refresh
    - POST /logout with authentication middleware, calls AuthController.logout
    - GET /profile with authentication middleware, calls AuthController.getProfile
    - _Requirements: 1.1, 2.1, 3.3, 3.5, 9.1_
  
  - [x] 8.2 Create Express application setup
    - Write src/app.js to initialize Express app
    - Configure middleware: express.json(), cors(), helmet() for security headers
    - Mount auth routes at /api/auth prefix
    - Add global error handler middleware to catch and format errors
    - Add 404 handler for undefined routes
    - Export app instance
    - _Requirements: 8.2, 8.3_
  
  - [x] 8.3 Create server entry point
    - Write server.js to start HTTP server
    - Import app from src/app.js
    - Load environment variables using dotenv
    - Test database connection on startup
    - Start server on configured PORT
    - Add graceful shutdown handler to close database connections
    - _Requirements: 7.1, 7.4_

- [x] 9. Implement scheduled cleanup jobs
  - Write src/jobs/cleanup.job.js with functions: cleanupExpiredTokens, cleanupRateLimits
  - Implement cleanupExpiredTokens() to call TokenRepository.deleteExpired()
  - Implement cleanupRateLimits() to call RateLimitRepository.deleteExpired(120)
  - Set up cron jobs: cleanupExpiredTokens every hour, cleanupRateLimits every 30 minutes
  - Add job execution logging
  - _Requirements: 3.2, 5.5_

- [x] 10. Add environment configuration and documentation
  - Create .env.example with all required variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION, BCRYPT_ROUNDS, PORT, FRONTEND_URL
  - Create README.md with setup instructions, API endpoint documentation, and usage examples
  - Document environment variables and their purposes
  - Add API request/response examples for each endpoint
  - Include database setup instructions
  - _Requirements: 7.1_

- [ ] 11. Implement error handling improvements
  - Update all services to throw custom error classes from src/utils/errors.js
  - Update global error handler in app.js to format errors consistently with success, error.code, error.message structure
  - Add error logging with stack traces for 500 errors
  - Ensure password hashes are never exposed in error responses
  - Add request ID to all error logs for traceability
  - _Requirements: 4.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Add security enhancements
  - [ ] 12.1 Implement password strength validation
    - Update validator utility to check password does not contain email address
    - Add check for common dictionary words (implement basic blacklist)
    - Ensure validation runs before password hashing
    - _Requirements: 4.5_
  
  - [ ] 12.2 Add security headers and CORS configuration
    - Configure helmet middleware with appropriate security headers
    - Configure CORS to allow only FRONTEND_URL origin
    - Enable credentials support in CORS
    - _Requirements: 8.2_
  
  - [ ] 12.3 Implement case-insensitive email handling
    - Update UserRepository.create() to convert email to lowercase before insert
    - Update UserRepository.findByEmail() to convert email to lowercase before query
    - Update validation middleware to convert email to lowercase
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 13. Create health check endpoint
  - Add GET /api/health route in src/routes/health.routes.js
  - Implement health check controller to test database connection
  - Return status: healthy/unhealthy, database: connected/disconnected, timestamp
  - Mount health routes in app.js
  - _Requirements: 7.4_

- [ ] 14. Add comprehensive input sanitization
  - Update validation middleware to trim whitespace from all string inputs
  - Add HTML entity encoding for full_name to prevent XSS
  - Ensure all database queries use parameterized statements
  - Add input length validation for all fields
  - _Requirements: 6.1, 6.4, 6.5_

- [ ] 15. Implement database connection retry logic
  - Update database.js to add connection retry mechanism
  - Implement exponential backoff for failed connections (3 retries max)
  - Add connection timeout of 10 seconds
  - Log connection failures with error details
  - _Requirements: 7.4_
