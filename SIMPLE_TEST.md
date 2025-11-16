# 🚀 Simple Testing Guide (No Token Required!)

## Changes Made:
1. ✅ Removed strict password validation (no more "common words" error)
2. ✅ Added simple profile endpoint that doesn't require authentication

## 📝 Test Commands

### 1. Signup (Create User)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456","fullName":"Test User"}'
```

**Expected Response:**
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

### 2. Login (Get Tokens)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'
```

**Expected Response:**
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

### 3. Get Profile (Simple - No Token Required!)
```bash
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response:**
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

### 4. Get Profile (With Token - Original Method)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_FROM_LOGIN"
```

---

## 🎯 Quick Test Script

Copy and paste all at once:

```bash
# 1. Signup
echo "=== SIGNUP ==="
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"MyPass@123","fullName":"John Doe"}'

echo -e "\n\n=== LOGIN ==="
# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"MyPass@123"}'

echo -e "\n\n=== GET PROFILE (SIMPLE) ==="
# 3. Get Profile (No token needed!)
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

---

## 📊 API Endpoints Summary

| Endpoint | Method | Auth Required | Body |
|----------|--------|---------------|------|
| `/api/auth/signup` | POST | ❌ No | `{email, password, fullName}` |
| `/api/auth/login` | POST | ❌ No | `{email, password}` |
| `/api/auth/profile/simple` | POST | ❌ No | `{email}` |
| `/api/auth/profile` | GET | ✅ Yes | - |
| `/api/auth/refresh` | POST | ❌ No | `{refreshToken}` |
| `/api/auth/logout` | POST | ✅ Yes | `{refreshToken}` |

---

## 🎨 Using Postman/Thunder Client

### Signup
- Method: `POST`
- URL: `http://localhost:3000/api/auth/signup`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "Pass@123",
  "fullName": "User Name"
}
```

### Login
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "Pass@123"
}
```

### Get Profile (Simple - No Auth!)
- Method: `POST`
- URL: `http://localhost:3000/api/auth/profile/simple`
- Body (JSON):
```json
{
  "email": "user@example.com"
}
```

---

## ✅ What Changed?

### Before:
- ❌ Password "Test@123456" was rejected (contains "test")
- ❌ Profile required access token
- ❌ Had to copy/paste tokens

### After:
- ✅ Password "Test@123456" works fine
- ✅ Can get profile with just email (no token)
- ✅ Much simpler testing!

---

## 💡 Notes

1. **Simple Profile** (`/profile/simple`) - Use this for easy testing without tokens
2. **Secure Profile** (`/profile`) - Still available if you want to use tokens
3. **Password Rules** - Still requires 8+ chars, number, and symbol (but no dictionary check)

---

## 🐛 Troubleshooting

### "User not found"
**Solution:** Signup first with that email

### "Email is already registered"
**Solution:** User already exists, just login or use different email

### "Validation failed"
**Solution:** Check password has 8+ chars, number, and symbol

---

## 🎉 Success!

Now you can test the API easily without dealing with tokens!

Just remember:
1. Signup → Creates user
2. Login → Returns tokens (optional to use)
3. Profile/Simple → Get user info with just email
