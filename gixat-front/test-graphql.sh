#!/bin/bash

# GraphQL Backend Test Script
# Tests the GraphQL endpoint with the provided Bearer token

BACKEND_URL="http://192.168.1.214:4006/api/graphql"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsImVtYWlsIjoic2hhZGlfZjRyQHlhaG9vLmNvbSIsInR5cGUiOiJidXNpbmVzcyIsImlhdCI6MTc2MjU5NzQyNCwiZXhwIjoxNzYyNTk4MzI0fQ.AP8lbuezH8iPdxcKmWJ8X2gZJ2PIo_FMnL5f638OBkg"

echo "========================================"
echo "Testing GraphQL Backend Connection"
echo "========================================"
echo ""

# Test 1: Introspection Query to get schema
echo " Testing Schema Introspection..."
echo ""

curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "{ __schema { types { name kind } } }"
  }' | jq '.' || echo "Failed to parse JSON"

echo ""
echo "========================================"
echo ""

# Test 2: Get Queries and Mutations
echo " Fetching Available Queries and Mutations..."
echo ""

curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "{ __schema { queryType { fields { name } } mutationType { fields { name } } } }"
  }' | jq '.' || echo "Failed to parse JSON"

echo ""
echo "========================================"
echo ""

# Test 3: Get current user info
echo " Testing User Query..."
echo ""

curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { me { id email type } }"
  }' | jq '.' || echo "Failed to parse JSON"

echo ""
echo "========================================"
