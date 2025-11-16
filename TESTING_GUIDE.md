# 🧪 Complete Testing Guide

## 🎯 The Problem You Had

You were accessing:
- ❌ `http://localhost:3000/login`
- ❌ `http://localhost:3000/signup`
- ❌ `http://localhost:3000/profile`

But the correct URLs are:
- ✅ `http://localhost:3000/api/auth/login`
- ✅ `http://localhost:3000/api/auth/signup`
- ✅ `http://localhost:3000/api/auth/profile`

**All routes need the `/api/auth` prefix!**

## 🚀 Three Ways to Test

### Method 1: Visual HTML Tester (Easiest!)

1. Open `test-api.html` in your browser:
```bash
open test-api.html
```

2. Click the buttons to test each endpoint
3. Tokens are automatically saved and filled in
4. See responses in real-time with color coding

### Method 2: Automated Bash Script

```bash
./test-api.sh
```

This will test all endpoints automatically.

### Method 3: Manual cURL Commands

Follow the guide in `test-manual.md` for step-by-step cURL commands.

## 📋 Testing Checklist

### Step 1: Start the Server
```bash
npm run dev
```

### Step 2: Test in Order

1. **Health Check** - Verify API is running
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Signup** - Create a new user
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test@123456","fullName":"Test User"}'
   ```

3. **Login** - Get tokens
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test@123456"}'
   ```
   
   **Save the `accessToken` and `refreshToken` from the response!**

4. **Get Profile** - Use access token
   ```bash
   curl http://localhost:3000/api/auth/profile \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

5. **Refresh Token** - Get new access token
   ```bash
   curl -X POST http://localhost:3000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
   ```

6. **Logout** - Invalidate tokens
   ```bash
   curl -X POST http://localhost:3000/api/auth/logout \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
   ```

## 🎨 Using Postman/Thunder Client

### Setup

1. **Create Environment Variable:**
   - Name: `baseUrl`
   - Value: `http://localhost:3000/api/auth`

2. **Create Requests:**

#### Signup
- Method: `POST`
- URL: `{{baseUrl}}/signup`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "Pass@123",
  "fullName": "User Name"
}
```

#### Login
- Method: `POST`
- URL: `{{baseUrl}}/login`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "Pass@123"
}
```
- **Save `accessToken` and `refreshToken` from response**

#### Get Profile
- Method: `GET`
- URL: `{{baseUrl}}/profile`
- Headers:
  - `Authorization: Bearer {{accessToken}}`

#### Refresh Token
- Method: `POST`
- URL: `{{baseUrl}}/refresh`
- Body (JSON):
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

#### Logout
- Method: `POST`
- URL: `{{baseUrl}}/logout`
- Headers:
  - `Authorization: Bearer {{accessToken}}`
- Body (JSON):
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

## 🐛 Common Errors & Solutions

### "Route not found"
**Cause:** Missing `/api/auth` prefix
**Fix:** Use `http://localhost:3000/api/auth/endpoint`

### "Invalid email or password"
**Cause:** User doesn't exist or wrong credentials
**Fix:** First signup, then login with same credentials

### "Email is already registered"
**Cause:** User already exists
**Fix:** Use different email or login with existing one

### "Authentication required"
**Cause:** Missing or invalid token
**Fix:** Include `Authorization: Bearer YOUR_TOKEN` header

### "Token expired"
**Cause:** Access token expired (15 min lifetime)
**Fix:** Use refresh token to get new access token

### "Rate limit exceeded"
**Cause:** Too many failed attempts
**Fix:** Wait 15 minutes or reset rate limits in database

## 📊 Expected Responses

### Successful Signup (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "fullName": "Test User",
      "createdAt": "2025-11-16T09:40:00.000Z"
    }
  }
}
```

### Successful Login (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "fullName": "Test User"
    }
  }
}
```

### Successful Profile (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "fullName": "Test User",
      "createdAt": "2025-11-16T09:40:00.000Z",
      "lastLogin": "2025-11-16T09:41:00.000Z"
    }
  }
}
```

## ✅ Verification

After testing, verify:
- [ ] Can register new users
- [ ] Can login with correct credentials
- [ ] Receive both access and refresh tokens
- [ ] Can access profile with access token
- [ ] Can refresh access token
- [ ] Can logout successfully
- [ ] Rate limiting works (5 failed attempts = blocked)
- [ ] Invalid credentials are rejected
- [ ] Expired tokens are rejected

## 💡 Pro Tips

1. **Use the HTML tester** (`test-api.html`) - it's the easiest way!
2. **Save your tokens** - you'll need them for authenticated requests
3. **Test signup first** - you need a user before you can login
4. **Access tokens expire in 15 minutes** - use refresh token to get new one
5. **Refresh tokens last 7 days** - after that, login again
6. **Rate limiting is per IP** - 5 failed logins = 15 min block

## 🎉 Success Indicators

Your API is working correctly if:
- ✅ Health check returns "healthy"
- ✅ Can create new users
- ✅ Can login and receive tokens
- ✅ Can access protected routes with token
- ✅ Invalid requests return proper error messages
- ✅ Rate limiting blocks after 5 failed attempts

## 📚 Additional Resources

- **Full API Docs:** `README.md`
- **Manual Testing:** `test-manual.md`
- **Setup Guide:** `START_HERE.md`
- **Quick Start:** `QUICKSTART.md`


# 1. Signup (now works with Test@123456!)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456","fullName":"Test User"}'
  curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testtoday@example.com","password":"Test@123456","fullName":"Test Do"}'

  {"success":true,"message":"User registered successfully","data":{"user":{"id":2,"email":"testtoday@example.com","fullName":"Test Do","createdAt":"2025-11-16T10:05:03.573Z"}}}%  

  curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"Test@123456","fullName":"Test User1"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'

  curl -X POST 
  http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testtoday@example.com","password":"Test@123456"}'

  {"success":true,"message":"Login successful","data":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGVzdHRvZGF5QGV4YW1wbGUuY29tIiwiaWF0IjoxNzYzMjg3Njc4LCJleHAiOjE3NjMyODg1Nzh9.08tLC8Aq721nq6Aylkuj3X5e3ZM08FcTxONTyO_RYbY","refreshToken":"27ab955a-28a0-40d1-87a8-a52b3715f882","user":{"id":2,"email":"testtoday@example.com","fullName":"Test Do"}}}% 

  curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'
{"success":true,"message":"Login successful","data":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzI4NzI2MCwiZXhwIjoxNzYzMjg4MTYwfQ.tja6Nz2QU7FF5ewTectfB7_lPtJYz_tJugJ1vRy1P-U","refreshToken":"ba7bcdaa-fc84-4307-8272-5741b6d8eeda","user":{"id":1,"email":"test@example.com","fullName":"Test User"}}}%  

# 3. Get Profile (NO TOKEN NEEDED!)
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

chmod +x test-all.sh
