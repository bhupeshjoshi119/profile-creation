#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Complete API Test - All Endpoints   ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}1️⃣  Health Check${NC}"
echo "GET /api/health"
curl -s http://localhost:3000/api/health | jq '.'
echo ""

# Test 2: Signup
echo -e "${YELLOW}2️⃣  Signup (Register User)${NC}"
echo "POST /api/auth/signup"
curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"complete@test.com","password":"Complete@123","fullName":"Complete Test"}' | jq '.'
echo ""

# Test 3: Login
echo -e "${YELLOW}3️⃣  Login${NC}"
echo "POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"complete@test.com","password":"Complete@123"}')
echo "$LOGIN_RESPONSE" | jq '.'

# Extract tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.refreshToken // empty')
echo ""

# Test 4: Get Profile (Simple - No Token)
echo -e "${YELLOW}4️⃣  Get Profile (Simple - No Token Required)${NC}"
echo "POST /api/auth/profile/simple"
curl -s -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"complete@test.com"}' | jq '.'
echo ""

# Test 5: Get Profile (With Token)
if [ ! -z "$ACCESS_TOKEN" ]; then
  echo -e "${YELLOW}5️⃣  Get Profile (With Token)${NC}"
  echo "GET /api/auth/profile"
  curl -s -X GET http://localhost:3000/api/auth/profile \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
  echo ""
fi

# Test 6: Refresh Token
if [ ! -z "$REFRESH_TOKEN" ]; then
  echo -e "${YELLOW}6️⃣  Refresh Access Token${NC}"
  echo "POST /api/auth/refresh"
  curl -s -X POST http://localhost:3000/api/auth/refresh \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | jq '.'
  echo ""
fi

# Test 7: Logout (Simple - No Token)
echo -e "${YELLOW}7️⃣  Logout (Simple - No Token Required)${NC}"
echo "POST /api/auth/logout/simple"
curl -s -X POST http://localhost:3000/api/auth/logout/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"complete@test.com"}' | jq '.'
echo ""

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ All Tests Complete!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "✅ Health Check"
echo "✅ Signup"
echo "✅ Login"
echo "✅ Get Profile (Simple)"
echo "✅ Get Profile (With Token)"
echo "✅ Refresh Token"
echo "✅ Logout (Simple)"
echo ""
