# 🎯 Complete API Testing Guide (Simplified)

## ✅ All Simple Endpoints (No Token Required!)

All these endpoints work without authentication tokens - perfect for testing!

---

## 📝 Test Commands

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-16T..."
}
```

---

### 2. Signup (Register New User)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456","fullName":"Test User"}'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "fullName": "Test User",
      "createdAt": "2025-11-16T..."
    }
  }
}
```

---

### 3. Login (Get Tokens)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'
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
      "email": "test@example.com",
      "fullName": "Test User"
    }
  }
}
```

---

### 4. Get Profile (Simple - No Token!)
```bash
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "fullName": "Test User",
      "createdAt": "2025-11-16T...",
      "lastLogin": "2025-11-16T..."
    }
  }
}
```

---

### 5. Logout (Simple - No Token!)
```bash
curl -X POST http://localhost:3000/api/auth/logout/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful - all sessions cleared"
}
```

**Note:** This deletes all refresh tokens for the user, effectively logging them out from all devices.

---

## 🚀 Complete Test Flow

Copy and paste this entire script:

```bash
echo "=== 1. HEALTH CHECK ==="
curl http://localhost:3000/api/health
echo -e "\n\n"

echo "=== 2. SIGNUP ==="
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo@123456","fullName":"Demo User"}'
echo -e "\n\n"

echo "=== 3. LOGIN ==="
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo@123456"}'
echo -e "\n\n"

echo "=== 4. GET PROFILE (NO TOKEN) ==="
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com"}'
echo -e "\n\n"

echo "=== 5. LOGOUT (NO TOKEN) ==="
curl -X POST http://localhost:3000/api/auth/logout/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com"}'
echo -e "\n\n"

echo "✅ All tests complete!"
```

---

## 📊 API Endpoints Summary

| Endpoint | Method | Auth | Body | Description |
|----------|--------|------|------|-------------|
| `/api/health` | GET | ❌ | - | Check API health |
| `/api/auth/signup` | POST | ❌ | `{email, password, fullName}` | Register user |
| `/api/auth/login` | POST | ❌ | `{email, password}` | Login & get tokens |
| `/api/auth/profile/simple` | POST | ❌ | `{email}` | Get profile by email |
| `/api/auth/logout/simple` | POST | ❌ | `{email}` | Logout by email |
| `/api/auth/refresh` | POST | ❌ | `{refreshToken}` | Refresh access token |
| `/api/auth/profile` | GET | ✅ | - | Get profile (with token) |
| `/api/auth/logout` | POST | ✅ | `{refreshToken}` | Logout (with token) |

---

## 🎨 Postman/Thunder Client Collection

### 1. Health Check
- **Method:** GET
- **URL:** `http://localhost:3000/api/health`

### 2. Signup
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/signup`
- **Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "Pass@123",
  "fullName": "User Name"
}
```

### 3. Login
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "Pass@123"
}
```

### 4. Get Profile (Simple)
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/profile/simple`
- **Body (JSON):**
```json
{
  "email": "user@example.com"
}
```

### 5. Logout (Simple)
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/logout/simple`
- **Body (JSON):**
```json
{
  "email": "user@example.com"
}
```

---

## 🔄 Testing Different Scenarios

### Scenario 1: New User Registration
```bash
# Register
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"John@123","fullName":"John Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"John@123"}'

# Get Profile
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

### Scenario 2: Logout User
```bash
# Logout (clears all sessions)
curl -X POST http://localhost:3000/api/auth/logout/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

### Scenario 3: Multiple Users
```bash
# User 1
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Alice@123","fullName":"Alice"}'

# User 2
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"Bob@123","fullName":"Bob"}'

# Get Alice's profile
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}'

# Get Bob's profile
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com"}'
```

---

## ✅ What Each Endpoint Does

### Signup
- Creates new user in database
- Hashes password with bcrypt
- Returns user info (without password)

### Login
- Verifies email and password
- Generates access token (15 min expiry)
- Generates refresh token (7 days expiry)
- Updates last_login timestamp
- Returns tokens and user info

### Profile (Simple)
- Looks up user by email
- Returns user profile data
- No authentication required

### Logout (Simple)
- Finds user by email
- Deletes all refresh tokens for that user
- Logs out user from all devices
- No authentication required

---

## 🐛 Common Errors

### "Email is already registered"
**Cause:** User already exists
**Solution:** Use different email or login with existing one

### "Invalid email or password"
**Cause:** Wrong credentials or user doesn't exist
**Solution:** Check email/password or signup first

### "User not found"
**Cause:** Email doesn't exist in database
**Solution:** Signup first with that email

### "Validation failed"
**Cause:** Invalid input (email format, password requirements)
**Solution:** 
- Email: Valid format (user@domain.com)
- Password: 8+ chars, must include number and symbol
- Full Name: Letters and spaces only

---

## 💡 Pro Tips

1. **Test in order:** Health → Signup → Login → Profile → Logout
2. **Use different emails:** For testing multiple users
3. **Save responses:** Keep track of tokens if you want to test secure endpoints
4. **Simple endpoints:** Perfect for quick testing without token management
5. **Secure endpoints:** Still available if you need proper authentication

---

## 🎉 Success Indicators

Your API is working correctly if:
- ✅ Health check returns "healthy"
- ✅ Can signup new users
- ✅ Can login and receive tokens
- ✅ Can get profile with just email
- ✅ Can logout with just email
- ✅ Proper error messages for invalid inputs

---

## 📚 Additional Resources

- **FIXED.md** - What was changed
- **SIMPLE_TEST.md** - Simple testing guide
- **test-api.html** - Visual testing interface
- **README.md** - Complete API documentation

---

**All endpoints are working! Test them in any order you like!** 🚀
