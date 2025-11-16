#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api"

echo -e "${YELLOW}=== Authentication API Test Script ===${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" ${API_URL}/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 2: User Registration
echo -e "${YELLOW}2. Testing User Registration...${NC}"
SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${API_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@123456",
    "fullName": "Test User"
  }')

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SIGNUP_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ User registration successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
elif [ "$HTTP_CODE" -eq 409 ]; then
    echo -e "${YELLOW}⚠ User already exists (expected if running multiple times)${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ User registration failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY" | jq '.'
fi
echo ""

# Test 3: User Login
echo -e "${YELLOW}3. Testing User Login...${NC}"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@123456"
  }')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ User login successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
    
    # Extract tokens
    ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.accessToken')
    REFRESH_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.refreshToken')
else
    echo -e "${RED}✗ User login failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY" | jq '.'
    exit 1
fi
echo ""

# Test 4: Get User Profile
echo -e "${YELLOW}4. Testing Get User Profile...${NC}"
PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET ${API_URL}/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$PROFILE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Get profile successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Get profile failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY" | jq '.'
fi
echo ""

# Test 5: Refresh Token
echo -e "${YELLOW}5. Testing Token Refresh...${NC}"
REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${API_URL}/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REFRESH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Token refresh successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
    NEW_ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.accessToken')
else
    echo -e "${RED}✗ Token refresh failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY" | jq '.'
fi
echo ""

# Test 6: Logout
echo -e "${YELLOW}6. Testing Logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${API_URL}/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGOUT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Logout successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Logout failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY" | jq '.'
fi
echo ""

# Test 7: Invalid Login (Rate Limiting Test)
echo -e "${YELLOW}7. Testing Invalid Login (Rate Limiting)...${NC}"
for i in {1..6}; do
    echo "Attempt $i..."
    INVALID_LOGIN=$(curl -s -w "\n%{http_code}" -X POST ${API_URL}/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser@example.com",
        "password": "WrongPassword123!"
      }')
    
    HTTP_CODE=$(echo "$INVALID_LOGIN" | tail -n1)
    
    if [ "$HTTP_CODE" -eq 429 ]; then
        echo -e "${GREEN}✓ Rate limiting working (blocked after 5 attempts)${NC}"
        echo "$INVALID_LOGIN" | sed '$d' | jq '.'
        break
    elif [ "$HTTP_CODE" -eq 401 ]; then
        echo "  Failed login attempt $i (expected)"
    fi
done
echo ""

echo -e "${GREEN}=== All tests completed ===${NC}"
