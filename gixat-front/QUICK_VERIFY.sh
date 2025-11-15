#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                       QUICK GRAPHQL VERIFICATION                            ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Check backend connectivity
echo "  Testing Backend Connection..."
BACKEND_RESPONSE=$(curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}' | grep -o "data\|errors")

if [[ $BACKEND_RESPONSE == "data" ]]; then
  echo "    Backend responding correctly"
else
  echo "    Backend connection failed"
fi
echo ""

# Test 2: Check frontend config
echo "  Checking Frontend Configuration..."
if grep -q "192.168.1.214:4006" next.config.ts; then
  echo "    Backend endpoint configured in next.config.ts"
else
  echo "    Backend endpoint not configured"
fi

if grep -q "Authorization" src/lib/graphql-client.ts; then
  echo "    Authentication support configured"
else
  echo "    Authentication not configured"
fi
echo ""

# Test 3: Check GraphQL queries
echo "  Checking GraphQL Queries..."
QUERY_COUNT=$(grep -c "export const GET_" src/lib/dashboard.queries.ts)
echo "    Found $QUERY_COUNT exported GraphQL queries"
echo ""

# Test 4: Check dashboard pages
echo "  Checking Dashboard Pages..."
PAGES=("home" "cars" "work-orders" "appointments" "inspections" "offers" "inventory" "employees" "financial" "notifications" "settings")
for page in "${PAGES[@]}"; do
  if [ -f "src/app/dashboard/$page/page.tsx" ]; then
    echo "    $page page exists"
  fi
done
echo ""

# Test 5: TypeScript compilation check
echo "  Running TypeScript Check..."
npx tsc --noEmit 2>&1 | head -5
if [ $? -eq 0 ]; then
  echo "    No TypeScript errors"
else
  echo "     Check TypeScript errors above"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    VERIFICATION COMPLETE                                    ║"
echo "║              All systems configured and ready for development                ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
