# Authentication API

A secure Node.js authentication API with MySQL database, featuring user registration, login, JWT token management, and rate limiting.

## Features

- ✅ User registration with email and password
- ✅ User login with JWT token generation
- ✅ Access token (15 min) and refresh token (7 days)
- ✅ Token refresh mechanism
- ✅ User profile retrieval
- ✅ Rate limiting to prevent brute force attacks
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ MySQL database with connection pooling
- ✅ Scheduled cleanup jobs for expired tokens
- ✅ Comprehensive error handling and logging

## Technology Stack

- **Runtime**: Node.js v22.19.0
- **Framework**: Express.js
- **Database**: MySQL 8.0+ / MariaDB 10.11+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Security**: helmet, cors

## Prerequisites

- Node.js v22.19.0 or higher
- MySQL 8.0+ or MariaDB 10.11+
- npm or yarn

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Setup database (automated):**
```bash
./setup-database.sh
```

This will create the database, optionally create a MySQL user, and run migrations.

3. **Update `.env` file with the credentials shown by the setup script**

4. **Start the server:**
```bash
npm run dev
```

5. **Test the API:**
```bash
./test-api.sh
```

## Detailed Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

#### Option A: Automated Setup (Recommended)
```bash
./setup-database.sh
```

#### Option B: Manual Setup

1. Create MySQL database:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'auth_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

2. Update `.env` file:
```env
DB_USER=auth_user
DB_PASSWORD=your_secure_password
DB_NAME=auth_db
```

3. Run migrations:
```bash
node database/migrate.js
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
```

Key variables to configure:
```env
# Database
DB_USER=auth_user
DB_PASSWORD=your_secure_password
DB_NAME=auth_db

# JWT Secret (must be at least 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# CORS
FRONTEND_URL=http://localhost:4200
```

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### 1. User Registration

**POST** `/api/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "fullName": "John Doe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "createdAt": "2025-11-16T10:30:00.000Z"
    }
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one number
- At least one symbol (!@#$%^&*(),.?":{}|<>)

### 2. User Login

**POST** `/api/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Success Response (200):**
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

### 3. Refresh Access Token

**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Get User Profile

**GET** `/api/auth/profile`

Retrieve authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "createdAt": "2025-11-16T10:30:00.000Z",
      "lastLogin": "2025-11-16T14:20:00.000Z"
    }
  }
}
```

### 5. Logout

**POST** `/api/auth/logout`

Invalidate refresh token and logout user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 6. Health Check

**GET** `/api/health`

Check API and database health status.

**Success Response (200):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-16T14:30:00.000Z"
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | INVALID_CREDENTIALS | Wrong email/password |
| 401 | TOKEN_EXPIRED | Access token expired |
| 401 | TOKEN_INVALID | Invalid token |
| 401 | UNAUTHORIZED | Authentication required |
| 404 | USER_NOT_FOUND | User does not exist |
| 409 | EMAIL_EXISTS | Email already registered |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 500 | DATABASE_ERROR | Database operation failed |

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Action | Limit | Window | Lockout |
|--------|-------|--------|---------|
| Login | 5 attempts | 15 minutes | 15 minutes |
| Signup | 3 attempts | 60 minutes | 60 minutes |

When rate limit is exceeded, you'll receive a 429 response with `retryAfter` seconds.

## Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: HS256 algorithm with configurable expiration
- **Rate Limiting**: IP-based request throttling
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Comprehensive validation and sanitization
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: helmet.js middleware

## Project Structure

```
.
├── database/
│   ├── migrations/          # SQL migration files
│   └── migrate.js          # Migration runner
├── src/
│   ├── config/
│   │   └── database.js     # MySQL connection pool
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validation.middleware.js
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── token.repository.js
│   │   └── rateLimit.repository.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── token.service.js
│   │   └── rateLimit.service.js
│   ├── utils/
│   │   ├── errors.js
│   │   ├── logger.js
│   │   └── validator.js
│   ├── jobs/
│   │   └── cleanup.job.js
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Scheduled Jobs

The API runs background jobs to maintain database health:

- **Token Cleanup**: Removes expired tokens every hour
- **Rate Limit Cleanup**: Removes old rate limit records every 30 minutes

## Development

### Running in development mode:
```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Testing the API:

You can use tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)
- REST Client (VS Code extension)

Example cURL request:
```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| DB_HOST | MySQL host | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_USER | MySQL username | - |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | MySQL database name | - |
| JWT_SECRET | JWT signing secret (min 32 chars) | - |
| JWT_ACCESS_EXPIRATION | Access token expiration | 15m |
| JWT_REFRESH_EXPIRATION | Refresh token expiration (days) | 7 |
| BCRYPT_ROUNDS | Bcrypt salt rounds | 10 |
| FRONTEND_URL | Allowed CORS origin | http://localhost:4200 |
| RATE_LIMIT_LOGIN_MAX | Max login attempts | 5 |
| RATE_LIMIT_LOGIN_WINDOW | Login window (minutes) | 15 |
| RATE_LIMIT_SIGNUP_MAX | Max signup attempts | 3 |
| RATE_LIMIT_SIGNUP_WINDOW | Signup window (minutes) | 60 |

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
# profile-creation
