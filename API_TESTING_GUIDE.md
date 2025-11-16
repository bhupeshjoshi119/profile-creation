# API Testing Guide

## Quick Start

### 1. Setup Database

First, make sure MySQL is running and create the database:

```bash
# Create database (using MySQL CLI)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Update `.env` file with your MySQL credentials:
```env
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 2. Run Migrations

```bash
node database/migrate.js
```

### 3. Start Server

```bash
npm run dev
```

### 4. Run Tests

#### Option A: Using the test script (requires jq)
```bash
./test-api.sh
```

#### Option B: Manual testing with cURL

See examples below.

## Manual API Testing Examples

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-16T14:30:00.000Z"
}
```

---

### 2. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecureP@ss123",
    "fullName": "John Doe"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "createdAt": "2025-11-16T10:30:00.000Z"
    }
  }
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "password": [
        "Password must be at least 8 characters long",
        "Password must contain at least one number",
        "Password must contain at least one symbol"
      ]
    }
  }
}
```

---

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecureP@ss123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzE3NjMyMDAsImV4cCI6MTczMTc2NDEwMH0.abc123...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "fullName": "John Doe"
    }
  }
}
```

**Save the tokens for next requests!**

---

### 4. Get User Profile

```bash
# Replace YOUR_ACCESS_TOKEN with the token from login response
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "createdAt": "2025-11-16T10:30:00.000Z",
      "lastLogin": "2025-11-16T14:20:00.000Z"
    }
  }
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

### 5. Refresh Access Token

```bash
# Replace YOUR_REFRESH_TOKEN with the token from login response
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 6. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Testing Rate Limiting

### Test Login Rate Limit (5 attempts in 15 minutes)

```bash
# Try logging in with wrong password 6 times
for i in {1..6}; do
  echo "Attempt $i"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "john.doe@example.com",
      "password": "WrongPassword123!"
    }'
  echo -e "\n"
done
```

**After 5 failed attempts, you'll get (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again later.",
    "retryAfter": 900
  }
}
```

---

## Testing with Postman

### Import Collection

Create a new Postman collection with these requests:

1. **Health Check**
   - Method: GET
   - URL: `http://localhost:3000/api/health`

2. **Signup**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/signup`
   - Body (JSON):
     ```json
     {
       "email": "{{email}}",
       "password": "{{password}}",
       "fullName": "{{fullName}}"
     }
     ```

3. **Login**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "{{email}}",
       "password": "{{password}}"
     }
     ```
   - Tests (to save tokens):
     ```javascript
     const response = pm.response.json();
     pm.environment.set("accessToken", response.data.accessToken);
     pm.environment.set("refreshToken", response.data.refreshToken);
     ```

4. **Get Profile**
   - Method: GET
   - URL: `http://localhost:3000/api/auth/profile`
   - Headers:
     - Authorization: `Bearer {{accessToken}}`

5. **Refresh Token**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/refresh`
   - Body (JSON):
     ```json
     {
       "refreshToken": "{{refreshToken}}"
     }
     ```

6. **Logout**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/logout`
   - Headers:
     - Authorization: `Bearer {{accessToken}}`
   - Body (JSON):
     ```json
     {
       "refreshToken": "{{refreshToken}}"
     }
     ```

### Postman Environment Variables

Create environment with:
- `email`: john.doe@example.com
- `password`: SecureP@ss123
- `fullName`: John Doe
- `accessToken`: (auto-set by login test)
- `refreshToken`: (auto-set by login test)

---

## Common Issues

### 1. Database Connection Error

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:** Update `.env` with correct MySQL credentials

### 2. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Change PORT in `.env` or kill the process using port 3000

### 3. JWT Secret Too Short

**Warning:** JWT secret should be at least 32 characters

**Solution:** Update JWT_SECRET in `.env`

### 4. Rate Limit Blocking Tests

**Issue:** Can't test because of rate limiting

**Solution:** 
- Wait for the lockout period to expire
- Or manually delete rate limit records:
  ```sql
  DELETE FROM rate_limits WHERE ip_address = 'YOUR_IP';
  ```

---

## Database Queries for Testing

### View all users:
```sql
SELECT id, email, full_name, created_at, last_login FROM users;
```

### View all tokens:
```sql
SELECT t.id, t.user_id, u.email, t.expires_at, t.created_at 
FROM tokens t 
JOIN users u ON t.user_id = u.id;
```

### View rate limit attempts:
```sql
SELECT * FROM rate_limits ORDER BY attempt_time DESC LIMIT 10;
```

### Clear rate limits for testing:
```sql
DELETE FROM rate_limits;
```

### Delete a test user:
```sql
DELETE FROM users WHERE email = 'john.doe@example.com';
```

---

## Performance Testing

### Using Apache Bench (ab)

Test signup endpoint:
```bash
ab -n 100 -c 10 -p signup.json -T application/json http://localhost:3000/api/auth/signup
```

Where `signup.json` contains:
```json
{"email":"test@example.com","password":"Test@123","fullName":"Test User"}
```

---

## Next Steps

1. ✅ Test all endpoints manually
2. ✅ Verify rate limiting works
3. ✅ Test token expiration (wait 15 minutes for access token)
4. ✅ Test refresh token flow
5. ✅ Verify database records are created correctly
6. ✅ Test error handling with invalid inputs
7. ✅ Check logs for proper logging

## Integration with Frontend

When integrating with Angular 17 frontend:

1. Store tokens in localStorage or sessionStorage
2. Add Authorization header to all protected requests
3. Implement token refresh logic before access token expires
4. Handle 401 errors by redirecting to login
5. Handle 429 errors with user-friendly messages
6. Clear tokens on logout

Example Angular service:
```typescript
// auth.service.ts
login(email: string, password: string) {
  return this.http.post(`${API_URL}/auth/login`, { email, password })
    .pipe(
      tap((response: any) => {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      })
    );
}

getProfile() {
  const token = localStorage.getItem('accessToken');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get(`${API_URL}/auth/profile`, { headers });
}
```
