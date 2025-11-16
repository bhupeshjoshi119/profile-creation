# Manual API Testing Guide

## ✅ Correct API URLs

Your API is running on `http://localhost:3000`

### All endpoints need the `/api/auth` prefix:

- ❌ WRONG: `http://localhost:3000/signup`
- ✅ CORRECT: `http://localhost:3000/api/auth/signup`

- ❌ WRONG: `http://localhost:3000/login`
- ✅ CORRECT: `http://localhost:3000/api/auth/login`

- ❌ WRONG: `http://localhost:3000/profile`
- ✅ CORRECT: `http://localhost:3000/api/auth/profile`

- ❌ WRONG: `http://localhost:3000/logout`
- ✅ CORRECT: `http://localhost:3000/api/auth/logout`

## 📝 Step-by-Step Testing

### Step 1: Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-16T09:39:05.076Z"
}
```

---

### Step 2: Register a New User (Signup)

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123",
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
      "email": "john@example.com",
      "fullName": "John Doe",
      "createdAt": "2025-11-16T09:40:00.000Z"
    }
  }
}
```

---

### Step 3: Login with the User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe"
    }
  }
}
```

**⚠️ IMPORTANT:** Copy the `accessToken` from the response!

---

### Step 4: Get User Profile

Replace `YOUR_ACCESS_TOKEN` with the token from Step 3:

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTczMTc1MDAwMCwiZXhwIjoxNzMxNzUwOTAwfQ.abc123"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "createdAt": "2025-11-16T09:40:00.000Z",
      "lastLogin": "2025-11-16T09:41:00.000Z"
    }
  }
}
```

---

### Step 5: Refresh Access Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_FROM_LOGIN"
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

### Step 6: Logout

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

## 🐛 Common Errors and Solutions

### Error: "Route not found"
**Problem:** You're using wrong URL
**Solution:** Make sure to use `/api/auth/` prefix

### Error: "Invalid email or password"
**Problem:** User doesn't exist or wrong password
**Solution:** First register the user with `/api/auth/signup`

### Error: "Email is already registered"
**Problem:** User already exists
**Solution:** Use a different email or login with existing credentials

### Error: "Authentication required"
**Problem:** Missing or invalid access token
**Solution:** Include `Authorization: Bearer YOUR_TOKEN` header

### Error: "Token expired"
**Problem:** Access token expired (15 minutes)
**Solution:** Use refresh token to get a new access token

---

## 🎯 Quick Test Commands

Copy and paste these in order:

```bash
# 1. Health check
curl http://localhost:3000/api/health

# 2. Register user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456","fullName":"Test User"}'

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'

# 4. Copy the accessToken from above response and use it here:
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer PASTE_YOUR_ACCESS_TOKEN_HERE"
```

---

## 📊 Testing with Postman/Thunder Client

If you're using Postman or Thunder Client:

1. **Base URL:** `http://localhost:3000/api/auth`

2. **Signup:**
   - Method: POST
   - URL: `{{baseUrl}}/signup`
   - Body (JSON):
     ```json
     {
       "email": "user@example.com",
       "password": "Pass@123",
       "fullName": "User Name"
     }
     ```

3. **Login:**
   - Method: POST
   - URL: `{{baseUrl}}/login`
   - Body (JSON):
     ```json
     {
       "email": "user@example.com",
       "password": "Pass@123"
     }
     ```

4. **Profile:**
   - Method: GET
   - URL: `{{baseUrl}}/profile`
   - Headers:
     - `Authorization: Bearer {{accessToken}}`

---

## ✅ Verification Checklist

- [ ] Health check returns "healthy"
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Receive accessToken and refreshToken
- [ ] Can get profile with accessToken
- [ ] Can refresh token
- [ ] Can logout

---

## 💡 Tips

1. **Save your tokens:** Keep the accessToken and refreshToken from login response
2. **Token expiry:** Access tokens expire in 15 minutes
3. **Use refresh token:** Get a new access token without logging in again
4. **Rate limiting:** After 5 failed login attempts, you'll be blocked for 15 minutes
5. **Password requirements:** Min 8 chars, must include number and symbol
