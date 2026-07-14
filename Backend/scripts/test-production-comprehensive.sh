#!/bin/bash

# Comprehensive Production API Test Script
# Usage: ./scripts/test-production-comprehensive.sh

set -e

echo "Comprehensive Production API Testing"
echo "========================================"
echo ""

# Load production environment
PROD_ENV="/opt/schooliat/backend/production/shared/.env"
if [ ! -f "$PROD_ENV" ]; then
  echo "ERROR: Production environment file not found"
  exit 1
fi

export $(grep -v '^#' "$PROD_ENV" | xargs)

# Set API URL
export API_URL="${API_URL:-https://api.schooliat.com}"
export TEST_EMAIL="${TEST_EMAIL:-admin@schooliat.com}"
export TEST_PASSWORD="${TEST_PASSWORD:-Admin@123}"

echo "Configuration:"
echo "   API URL: $API_URL"
echo "   Test Email: $TEST_EMAIL"
echo ""

cd "$(dirname "$0")/.."

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-----------------------"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/" || echo "000")
if [ "$HEALTH" = "200" ]; then
  echo "PASS: Health check passed ($HEALTH)"
else
  echo "FAIL: Health check failed ($HEALTH)"
fi
echo ""

# Test 2: Authentication
echo "Test 2: Authentication"
echo "------------------------"
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/authenticate" \
  -H "Content-Type: application/json" \
  -H "x-platform: web" \
  -d "{\"request\":{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}}")

TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "PASS: Authentication successful"
  export AUTH_TOKEN="$TOKEN"
else
  echo "FAIL: Authentication failed"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Phase 1 Endpoints
echo "Test 3: Phase 1 Module Endpoints"
echo "-----------------------------------"

# Test Attendance
echo "  Testing Attendance endpoints..."
ATTENDANCE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  "$API_URL/attendance/reports/daily?date=$(date +%Y-%m-%d)" || echo "000")
[ "$ATTENDANCE_STATUS" = "200" ] && echo "    PASS: Attendance endpoint accessible" || echo "    WARNING: Attendance endpoint: $ATTENDANCE_STATUS"

# Test Timetable
echo "  Testing Timetable endpoints..."
TIMETABLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  "$API_URL/timetables" || echo "000")
[ "$TIMETABLE_STATUS" = "200" ] && echo "    PASS: Timetable endpoint accessible" || echo "    WARNING: Timetable endpoint: $TIMETABLE_STATUS"

# Test Homework
echo "  Testing Homework endpoints..."
HOMEWORK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  "$API_URL/homework" || echo "000")
[ "$HOMEWORK_STATUS" = "200" ] && echo "    PASS: Homework endpoint accessible" || echo "    WARNING: Homework endpoint: $HOMEWORK_STATUS"

# Test Marks
echo "  Testing Marks endpoints..."
MARKS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  "$API_URL/marks" || echo "000")
[ "$MARKS_STATUS" = "200" ] && echo "    PASS: Marks endpoint accessible" || echo "    WARNING: Marks endpoint: $MARKS_STATUS"

# Test Leave
echo "  Testing Leave endpoints..."
LEAVE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  "$API_URL/leave/types" || echo "000")
[ "$LEAVE_STATUS" = "200" ] && echo "    PASS: Leave endpoint accessible" || echo "    WARNING: Leave endpoint: $LEAVE_STATUS"

# Test Communication
echo "  Testing Communication endpoints..."
COMM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  "$API_URL/communication/conversations" || echo "000")
[ "$COMM_STATUS" = "200" ] && echo "    PASS: Communication endpoint accessible" || echo "    WARNING: Communication endpoint: $COMM_STATUS"

echo ""
echo "Comprehensive testing complete!"
echo ""
echo "Summary:"
echo "   Health Check: $([ "$HEALTH" = "200" ] && echo "PASS" || echo "FAIL")"
echo "   Authentication: $([ -n "$TOKEN" ] && echo "PASS" || echo "FAIL")"
echo "   Phase 1 Endpoints: Tested"

