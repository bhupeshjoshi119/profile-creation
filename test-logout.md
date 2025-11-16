# 1. Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@example.com","password":"Test@123456","fullName":"Bhupesh User"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@example.com","password":"Test@123456"}'

# 3. Get Profile
curl -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@example.com"}'

# 4. Logout (NEW!)
curl -X POST http://localhost:3000/api/auth/logout/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"bhupesh@example.com"}'
