# 🚀 Quick Reference Card

## Test All Endpoints
```bash
./test-all.sh
```

## Individual Tests

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass@123","fullName":"User"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass@123"}'
```

### 3. Profile (No Token)
```bash
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com"}'
```

### 4. Logout (No Token)
```bash
curl -X POST http://localhost:3000/api/auth/logout/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com"}'
```

## All Endpoints

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/health` | GET | ❌ |
| `/api/auth/signup` | POST | ❌ |
| `/api/auth/login` | POST | ❌ |
| `/api/auth/profile/simple` | POST | ❌ |
| `/api/auth/logout/simple` | POST | ❌ |
| `/api/auth/profile` | GET | ✅ |
| `/api/auth/refresh` | POST | ❌ |
| `/api/auth/logout` | POST | ✅ |

## Password Rules
- 8+ characters
- Must include number
- Must include symbol

## Documentation
- **COMPLETE_TEST.md** - Full testing guide
- **FINAL_SUMMARY.md** - Complete summary
- **README.md** - Full documentation
