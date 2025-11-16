#!/bin/bash

echo "🧪 Quick API Test"
echo "================="
echo ""

# Test 1: Signup
echo "1️⃣  Testing Signup..."
SIGNUP_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"quicktest@example.com","password":"Test@123456","fullName":"Quick Test"}')

echo "$SIGNUP_RESULT" | jq '.'
echo ""

# Test 2: Login
echo "2️⃣  Testing Login..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"quicktest@example.com","password":"Test@123456"}')

echo "$LOGIN_RESULT" | jq '.'
echo ""

# Test 3: Simple Profile (No Token!)
echo "3️⃣  Testing Simple Profile (No Token Required)..."
PROFILE_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/profile/simple \
  -H "Content-Type: application/json" \
  -d '{"email":"quicktest@example.com"}')

echo "$PROFILE_RESULT" | jq '.'
echo ""

echo "✅ Test Complete!"
