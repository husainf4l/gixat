#!/bin/bash

# GraphQL Error Diagnostic Script
# This script tests all GraphQL queries to identify which ones are failing

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           GraphQL Query Diagnostics                           ║"
echo "║     Testing: http://192.168.1.214:4006/api/graphql           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

ENDPOINT="http://192.168.1.214:4006/api/graphql"
TOKEN_FILE="/tmp/gixat_token.txt"

# Try to get token from the frontend's storage
echo "🔐 Step 1: Checking for valid authentication token..."
if [ -f "$TOKEN_FILE" ]; then
    TOKEN=$(cat "$TOKEN_FILE")
    echo "✅ Token found (from file)"
else
    echo "⚠️  No stored token found"
    echo "   Please run: npm run dev and login first"
    echo "   Then copy your token from browser DevTools > Application > localStorage"
    echo "   And save it to: $TOKEN_FILE"
    TOKEN=""
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ Testing Simple Queries (No Parameters)                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Me Query
echo "1️⃣  Testing: query { me { id email type } }"
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN:-invalid}" \
  -d '{"query":"query { me { id email type } }"}' | jq '.' 2>/dev/null || echo "Failed to parse response"
echo ""
echo "---"
echo ""

# Test 2: Businesses Query
echo "2️⃣  Testing: query { businesses { id name } }"
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN:-invalid}" \
  -d '{"query":"query { businesses { id name } }"}' | jq '.' 2>/dev/null || echo "Failed to parse response"
echo ""
echo "---"
echo ""

# Test 3: Garages Query
echo "3️⃣  Testing: query { myGarages { id name } }"
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN:-invalid}" \
  -d '{"query":"query { myGarages { id name } }"}' | jq '.' 2>/dev/null || echo "Failed to parse response"
echo ""
echo "---"
echo ""

# Test 4: Appointments Query
echo "4️⃣  Testing: query { appointments { id status } }"
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN:-invalid}" \
  -d '{"query":"query { appointments { id status } }"}' | jq '.' 2>/dev/null || echo "Failed to parse response"
echo ""
echo "---"
echo ""

# Test 5: Inspections Query
echo "5️⃣  Testing: query { inspections { id type } }"
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN:-invalid}" \
  -d '{"query":"query { inspections { id type } }"}' | jq '.' 2>/dev/null || echo "Failed to parse response"
echo ""
echo "---"
echo ""

# Test 6: Employees Query
echo "6️⃣  Testing: query { employees { id name } }"
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN:-invalid}" \
  -d '{"query":"query { employees { id name } }"}' | jq '.' 2>/dev/null || echo "Failed to parse response"
echo ""
echo "---"
echo ""

# Test 7: Cars Query
echo "7️⃣  Testing: query { cars { id licensePlate } }"
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN:-invalid}" \
  -d '{"query":"query { cars { id licensePlate } }"}' | jq '.' 2>/dev/null || echo "Failed to parse response"
echo ""
echo "---"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ Testing Parameterized Queries (With Parameters)               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Note: These will likely fail because we don't have a businessId
# But we want to see what the error message tells us

echo "ℹ️  These queries need a businessId parameter..."
echo "8️⃣  Testing: query GetDashboardStatistics(\$businessId: ID!) { jobCardStatistics(businessId: \$businessId) }"
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN:-invalid}" \
  -d '{
    "query": "query GetDashboardStatistics($businessId: ID!) { jobCardStatistics(businessId: $businessId) }",
    "variables": { "businessId": "invalid-id" }
  }' | jq '.' 2>/dev/null || echo "Failed to parse response"
echo ""
echo "---"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ Analysis                                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Queries that return data without errors = WORKING"
echo "❌ Queries that return errors = NEED TO BE FIXED"
echo ""
echo "Common error patterns:"
echo "  • 'Unauthorized' = Token missing or invalid"
echo "  • 'Cannot query field' = Field doesn't exist in backend schema"
echo "  • 'Variable required' = Missing required parameter"
echo "  • '400 Bad Request' = Query syntax or schema mismatch"
echo ""
