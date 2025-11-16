# Authentication API Design Document

## Overview

This document outlines the technical design for a Node.js-based Authentication API using MySQL as the sole data persistence layer. The system provides secure user registration and login functionality with JWT-based authentication, rate limiting, and session management—all implemented using MySQL database tables.

### Technology Stack

- **Runtime**: Node.js v22.19.0
- **Database**: MySQL 8.0+ / MariaDB 10.11+
- **Database Driver**: mysql2 (with Promise support)
- **Authentication**: JWT (jsonwebtoken package)
- **Password Hashing**: bcrypt
- **Validation**: express-validator or joi
- **Framework**: Express.js

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Client App     │
│  (Angular 17)   │
└────────┬────────┘
         │ HTTP/REST
         │ (JSON)
         ▼
┌─────────────────────────────────┐
│     Express.js API Server       │
│  ┌──────────────────────────┐  │
│  │   Middleware Layer       │  │
│  │  - CORS                  │  │
│  │  - Body Parser           │  │
│  │  - Rate Limit Check      │  │
│  │  - JWT Verification      │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │   Route Handlers         │  │
│  │  - /auth/signup          │  │
│  │  - /auth/login           │  │
│  │  - /auth/refresh         │  │
│  │  - /auth/logout          │  │
│  │  - /auth/profile         │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │   Service Layer          │  │
│  │  - AuthService           │  │
│  │  - TokenService          │  │
│  │  - RateLimitService      │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │   Repository Layer       │  │
│  │  - UserRepository        │  │
│  │  - TokenRepository       │  │
│  │  - RateLimitRepository   │  │
│  └──────────────────────────┘  │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────┐
    │  MySQL Server  │
    │  ┌──────────┐  │
    │  │  users   │  │
    │  │  tokens  │  │
    │  │  rate_   │  │
    │  │  limits  │  │
    │  └──────────┘  │
    └────────────────┘
```

### Layered Architecture Pattern

1. **API Layer**: Express routes and controllers handling HTTP requests/responses
2. **Service Layer**: Business logic for authentication, token management, and rate limiting
3. **Repository Layer**: Data access layer abstracting database operations
4. **Database Layer**: MySQL tables for persistent storage

## Components and Interfaces

### 1. Database Connection Pool

**File**: `src/config/database.js`

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

module.exports = pool;
```

### 2. Authentication Routes

**File**: `src/routes/auth.routes.js`

**Endpoints**:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Authenticate user | No |
| POST | `/api/auth/refresh` | Refresh access token | No (requires refresh token) |
| POST | `/api/auth/logout` | Invalidate session | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |

### 3. Middleware Components

#### Rate Limit Middleware

**File**: `src/middleware/rateLimit.middleware.js`

- Checks `rate_limits` table for IP address
- Counts attempts within time window
- Blocks requests exceeding threshold
- Returns 429 status when limit exceeded

#### JWT Authentication Middleware

**File**: `src/middleware/auth.middleware.js`

- Extracts JWT from Authorization header
- Verifies token signature and expiration
- Attaches user data to request object
- Returns 401 for invalid/expired tokens

#### Validation Middleware

**File**: `src/middleware/validation.middleware.js`

- Validates request body against schemas
- Sanitizes inputs
- Returns 400 with field-specific errors

### 4. Service Layer

#### AuthService

**File**: `src/services/auth.service.js`

**Methods**:
- `signup(email, password, fullName)`: Creates new user with hashed password
- `login(email, password)`: Authenticates user and generates tokens
- `verifyPassword(plainPassword, hashedPassword)`: Compares passwords using bcrypt
- `hashPassword(password)`: Hashes password with bcrypt (10 rounds)

#### TokenService

**File**: `src/services/token.service.js`

**Methods**:
- `generateAccessToken(userId, email)`: Creates JWT with 15-minute expiration
- `generateRefreshToken(userId)`: Creates refresh token and stores in database
- `verifyAccessToken(token)`: Validates JWT signature and expiration
- `refreshAccessToken(refreshToken)`: Validates refresh token and generates new access token
- `revokeRefreshToken(token)`: Deletes token from database

#### RateLimitService

**File**: `src/services/rateLimit.service.js`

**Methods**:
- `checkRateLimit(ipAddress, action)`: Checks if IP has exceeded rate limit
- `recordAttempt(ipAddress, action, success)`: Records attempt in database
- `resetAttempts(ipAddress, action)`: Clears rate limit records for IP
- `cleanupExpiredRecords()`: Removes old rate limit entries (scheduled job)

### 5. Repository Layer

#### UserRepository

**File**: `src/repositories/user.repository.js`

**Methods**:
- `create(userData)`: Inserts new user record
- `findByEmail(email)`: Retrieves user by email (case-insensitive)
- `findById(userId)`: Retrieves user by ID
- `emailExists(email)`: Checks if email already registered
- `updateLastLogin(userId)`: Updates last_login timestamp

#### TokenRepository

**File**: `src/repositories/token.repository.js`

**Methods**:
- `create(userId, token, expiresAt)`: Stores refresh token
- `findByToken(token)`: Retrieves token record
- `deleteByToken(token)`: Removes specific token
- `deleteByUserId(userId)`: Removes all tokens for user
- `deleteExpired()`: Removes expired tokens (scheduled cleanup)

#### RateLimitRepository

**File**: `src/repositories/rateLimit.repository.js`

**Methods**:
- `create(ipAddress, action, attemptedEmail)`: Records rate limit attempt
- `countAttempts(ipAddress, action, timeWindowMinutes)`: Counts recent attempts
- `deleteByIp(ipAddress, action)`: Clears attempts for IP
- `deleteExpired(olderThanMinutes)`: Removes old records

## Data Models

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields**:
- `id`: Primary key, auto-increment
- `email`: Unique, lowercase, max 255 chars
- `password_hash`: Bcrypt hashed password
- `full_name`: User's full name, max 100 chars
- `created_at`: Account creation timestamp
- `updated_at`: Last modification timestamp
- `last_login`: Last successful login timestamp

#### Tokens Table

```sql
CREATE TABLE tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields**:
- `id`: Primary key, auto-increment
- `user_id`: Foreign key to users table
- `token`: Refresh token string (unique)
- `expires_at`: Token expiration timestamp
- `created_at`: Token creation timestamp

#### Rate Limits Table

```sql
CREATE TABLE rate_limits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  action VARCHAR(50) NOT NULL,
  attempted_email VARCHAR(255) NULL,
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_action (ip_address, action),
  INDEX idx_attempt_time (attempt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields**:
- `id`: Primary key, auto-increment
- `ip_address`: Client IP address (supports IPv4 and IPv6)
- `action`: Type of action (login, signup)
- `attempted_email`: Email used in attempt (for audit)
- `attempt_time`: Timestamp of attempt

### API Request/Response Models

#### Signup Request

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "fullName": "John Doe"
}
```

#### Signup Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "createdAt": "2025-11-16T10:30:00Z"
    }
  }
}
```

#### Login Request

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

#### Login Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

#### Refresh Token Request

```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Refresh Token Response (200 OK)

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Profile Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "createdAt": "2025-11-16T10:30:00Z",
      "lastLogin": "2025-11-16T14:20:00Z"
    }
  }
}
```

## Error Handling

### Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional field-specific errors
  }
}
```

### Error Codes and HTTP Status Mapping

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | INVALID_CREDENTIALS | Wrong email/password |
| 401 | TOKEN_EXPIRED | Access token expired |
| 401 | TOKEN_INVALID | Malformed or invalid token |
| 401 | UNAUTHORIZED | Authentication required |
| 404 | USER_NOT_FOUND | User does not exist |
| 409 | EMAIL_EXISTS | Email already registered |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 500 | DATABASE_ERROR | Database operation failed |

### Error Handling Strategy

1. **Validation Errors**: Caught by middleware, return 400 with field details
2. **Authentication Errors**: Return 401 with generic message (security)
3. **Database Errors**: Log full error, return 500 with generic message
4. **Rate Limit Errors**: Return 429 with retry-after header
5. **Unexpected Errors**: Log with stack trace, return 500 with error ID

### Logging

**File**: `src/utils/logger.js`

Use Winston or similar logging library with levels:
- `error`: System errors, database failures
- `warn`: Rate limit triggers, suspicious activity
- `info`: Successful auth events, token generation
- `debug`: Detailed request/response data (dev only)

Log format:
```json
{
  "timestamp": "2025-11-16T14:30:00Z",
  "level": "info",
  "message": "User login successful",
  "userId": 1,
  "email": "user@example.com",
  "ipAddress": "192.168.1.100",
  "requestId": "req-123456"
}
```

## Security Considerations

### Password Security

1. **Hashing**: Use bcrypt with salt rounds = 10
2. **Validation**: Minimum 8 characters, must include number and symbol
3. **Storage**: Never log or expose password hashes
4. **Comparison**: Use bcrypt.compare() for timing-attack resistance

### Token Security

1. **Access Token**:
   - JWT signed with HS256 algorithm
   - Secret key stored in environment variable (min 32 characters)
   - Payload: `{ userId, email, iat, exp }`
   - Expiration: 15 minutes

2. **Refresh Token**:
   - UUID v4 format (cryptographically random)
   - Stored in database with user association
   - Expiration: 7 days
   - Single-use recommended (rotate on refresh)

### SQL Injection Prevention

- Use parameterized queries exclusively
- Never concatenate user input into SQL strings
- Validate and sanitize all inputs before database operations

### Rate Limiting Strategy

| Action | Limit | Window | Lockout |
|--------|-------|--------|---------|
| Login | 5 attempts | 15 minutes | 15 minutes |
| Signup | 3 attempts | 60 minutes | 60 minutes |
| Refresh | 10 attempts | 5 minutes | 5 minutes |

### CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Headers Security

Use helmet.js middleware for security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000

## Testing Strategy

### Unit Tests

**Tools**: Jest or Mocha + Chai

**Coverage**:
- Service layer methods (AuthService, TokenService, RateLimitService)
- Password hashing and verification
- Token generation and validation
- Input validation functions
- Repository methods with mocked database

**Example Test Cases**:
```javascript
describe('AuthService', () => {
  describe('signup', () => {
    it('should create user with hashed password');
    it('should reject duplicate email');
    it('should validate password requirements');
  });
  
  describe('login', () => {
    it('should return tokens for valid credentials');
    it('should reject invalid password');
    it('should reject non-existent email');
  });
});
```

### Integration Tests

**Tools**: Supertest + Jest

**Coverage**:
- Full API endpoint flows
- Database operations with test database
- Rate limiting behavior
- Token refresh flow
- Error handling

**Example Test Cases**:
```javascript
describe('POST /api/auth/signup', () => {
  it('should register new user and return 201');
  it('should return 409 for duplicate email');
  it('should return 400 for invalid email format');
  it('should return 400 for weak password');
});

describe('POST /api/auth/login', () => {
  it('should return tokens for valid credentials');
  it('should return 401 for invalid credentials');
  it('should return 429 after 5 failed attempts');
});
```

### Database Testing

- Use separate test database
- Reset database state before each test
- Use transactions for test isolation
- Mock database pool for unit tests

## Performance Considerations

### Database Optimization

1. **Indexes**:
   - `users.email`: Unique index for fast lookups
   - `tokens.token`: Index for token verification
   - `tokens.expires_at`: Index for cleanup queries
   - `rate_limits.ip_action`: Composite index for rate limit checks

2. **Connection Pooling**:
   - Min connections: 5
   - Max connections: 20
   - Idle timeout: 60 seconds

3. **Query Optimization**:
   - Use prepared statements
   - Limit result sets
   - Avoid SELECT * (specify columns)

### Scheduled Cleanup Jobs

**File**: `src/jobs/cleanup.job.js`

Run periodic cleanup tasks:

```javascript
// Clean expired tokens (run every hour)
async function cleanupExpiredTokens() {
  await tokenRepository.deleteExpired();
}

// Clean old rate limit records (run every 30 minutes)
async function cleanupRateLimits() {
  await rateLimitRepository.deleteExpired(120); // older than 2 hours
}
```

Use node-cron or similar scheduler:
```javascript
cron.schedule('0 * * * *', cleanupExpiredTokens); // Every hour
cron.schedule('*/30 * * * *', cleanupRateLimits); // Every 30 min
```

### Response Time Targets

- Signup: < 500ms
- Login: < 300ms
- Token refresh: < 100ms
- Profile fetch: < 100ms

## Environment Configuration

**File**: `.env`

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=auth_user
DB_PASSWORD=secure_password
DB_NAME=auth_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Security
BCRYPT_ROUNDS=10

# CORS
FRONTEND_URL=http://localhost:4200

# Rate Limiting
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW=15
RATE_LIMIT_SIGNUP_MAX=3
RATE_LIMIT_SIGNUP_WINDOW=60
```

## Project Structure

```
src/
├── config/
│   ├── database.js          # MySQL connection pool
│   └── env.js               # Environment variable validation
├── middleware/
│   ├── auth.middleware.js   # JWT verification
│   ├── rateLimit.middleware.js
│   └── validation.middleware.js
├── routes/
│   └── auth.routes.js       # Authentication endpoints
├── controllers/
│   └── auth.controller.js   # Request handlers
├── services/
│   ├── auth.service.js      # Authentication logic
│   ├── token.service.js     # Token management
│   └── rateLimit.service.js # Rate limiting logic
├── repositories/
│   ├── user.repository.js   # User data access
│   ├── token.repository.js  # Token data access
│   └── rateLimit.repository.js
├── models/
│   └── user.model.js        # User data model/schema
├── utils/
│   ├── logger.js            # Logging utility
│   ├── validator.js         # Input validation schemas
│   └── errors.js            # Custom error classes
├── jobs/
│   └── cleanup.job.js       # Scheduled cleanup tasks
└── app.js                   # Express app setup
```

## Deployment Considerations

### Database Setup

1. Create database and user:
```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'auth_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Run migration scripts to create tables
3. Set up automated backups
4. Configure MySQL for production (increase buffer pool, optimize queries)

### Application Deployment

1. Use process manager (PM2) for Node.js
2. Set up reverse proxy (Nginx)
3. Enable HTTPS with SSL certificates
4. Configure environment variables
5. Set up monitoring and alerting
6. Implement log rotation

### Health Check Endpoint

**GET** `/api/health`

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-16T14:30:00Z"
}
```

## Future Enhancements

1. **Email Verification**: Send verification email on signup
2. **Password Reset**: Forgot password flow with email token
3. **Two-Factor Authentication**: TOTP-based 2FA
4. **OAuth Integration**: Google, Apple social login
5. **Account Lockout**: Permanent lock after repeated violations
6. **Audit Logging**: Comprehensive security audit trail
7. **Token Rotation**: Automatic refresh token rotation
8. **Device Management**: Track and manage user sessions per device
