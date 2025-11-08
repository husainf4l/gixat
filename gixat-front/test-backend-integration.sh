#!/bin/bash

# ============================================================================
# Gixat Frontend - Backend Integration Testing Script
# ============================================================================
# 
# This script helps test the GraphQL backend integration locally
# Requires: curl, jq (for JSON formatting)
#
# Usage: bash test-backend-integration.sh
# ============================================================================

# Configuration
BACKEND_URL="http://192.168.1.214:4006/api/graphql"
BEARER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsImVtYWlsIjoic2hhZGlfZjRyQHlhaG9vLmNvbSIsInR5cGUiOiJidXNpbmVzcyIsImlhdCI6MTc2MjU5NzQyNCwiZXhwIjoxNzYyNTk4MzI0fQ.AP8lbuezH8iPdxcKmWJ8X2gZJ2PIo_FMnL5f638OBkg"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

test_query() {
  local query_name="$1"
  local query="$2"
  
  echo -e "\n${YELLOW}Testing: $query_name${NC}"
  echo -e "Query: ${BLUE}$query${NC}\n"
  
  local response=$(curl -s -X POST "$BACKEND_URL" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$query\"}")
  
  if echo "$response" | grep -q "errors"; then
    print_error "$query_name failed"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    return 1
  else
    print_success "$query_name succeeded"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    return 0
  fi
}

# ============================================================================
# Main Test Suite
# ============================================================================

main() {
  print_header "Gixat Backend Integration Test Suite"
  
  print_info "Backend URL: $BACKEND_URL"
  print_info "Testing with business user token"
  
  # Test 1: Get Current User
  print_header "Test 1: Get Current User"
  test_query "me" "{ me { id email type } }"
  
  # Test 2: Get Businesses
  print_header "Test 2: Get User Businesses"
  test_query "businesses" "{ businesses { id name email } }"
  
  # Test 3: Get My Garages
  print_header "Test 3: Get My Garages"
  test_query "myGarages" "{ myGarages { id name address city state phone } }"
  
  # Test 4: Get Client Stats
  print_header "Test 4: Get Client Statistics"
  test_query "clientStats" "{ clientStats(businessId: \"1\") { totalClients activeClients clientsWithCars totalCars } }"
  
  # Test 5: Get Car Stats
  print_header "Test 5: Get Car Statistics"
  test_query "carStats" "{ carStats(businessId: \"1\") { totalCars } }"
  
  # Test 6: Get Appointment Statistics
  print_header "Test 6: Get Appointment Statistics"
  test_query "appointmentStatistics" "{ appointmentStatistics(businessId: \"1\") { total completed pending today } }"
  
  # Test 7: Get Dashboard Statistics (Combined)
  print_header "Test 7: Get Combined Dashboard Statistics"
  query='{ clientStats(businessId: \"1\") { totalClients activeClients } carStats(businessId: \"1\") { totalCars } appointmentStatistics(businessId: \"1\") { total pending } }'
  test_query "combined-stats" "$query"
  
  # Test 8: Get Clients List
  print_header "Test 8: Get Clients List"
  test_query "clientsByBusiness" "{ clientsByBusiness(businessId: \"1\") { id firstName lastName email } }"
  
  # Test 9: Get Cars List
  print_header "Test 9: Get Cars List"
  test_query "carsByBusiness" "{ carsByBusiness(businessId: \"1\") { id make model year licensePlate status } }"
  
  # Test 10: Get Appointments
  print_header "Test 10: Get Appointments"
  test_query "appointments" "{ appointments(businessId: \"1\") { id title date time status } }"
  
  print_header "Test Suite Complete"
  print_info "All backend integration tests completed"
  echo ""
}

# ============================================================================
# Advanced Testing Functions
# ============================================================================

test_with_variables() {
  local query_name="$1"
  local query="$2"
  local variables="$3"
  
  echo -e "\n${YELLOW}Testing: $query_name${NC}"
  echo -e "Query: ${BLUE}$query${NC}"
  echo -e "Variables: ${BLUE}$variables${NC}\n"
  
  local response=$(curl -s -X POST "$BACKEND_URL" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$query\", \"variables\": $variables}")
  
  if echo "$response" | grep -q "errors"; then
    print_error "$query_name failed"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_success "$query_name succeeded"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  fi
}

test_schema_introspection() {
  print_header "Schema Introspection Test"
  
  local introspection_query=$(cat <<'EOF'
    {
      __schema {
        types {
          name
          kind
        }
      }
    }
EOF
  )
  
  # Format for curl
  introspection_query=$(echo "$introspection_query" | tr '\n' ' ')
  
  echo -e "${YELLOW}Fetching schema information...${NC}\n"
  
  local response=$(curl -s -X POST "$BACKEND_URL" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$introspection_query\"}")
  
  # Count types
  local type_count=$(echo "$response" | jq '.data.__schema.types | length' 2>/dev/null)
  
  if [ -n "$type_count" ] && [ "$type_count" -gt 0 ]; then
    print_success "Schema introspection successful"
    print_info "Total types in schema: $type_count"
    
    # Show a few types
    echo -e "\n${YELLOW}Sample types:${NC}"
    echo "$response" | jq '.data.__schema.types[0:5][] | .name' 2>/dev/null || echo "Could not parse types"
  else
    print_error "Schema introspection failed"
  fi
}

# ============================================================================
# Run Tests
# ============================================================================

# Check if running with --schema flag
if [ "$1" == "--schema" ]; then
  test_schema_introspection
elif [ "$1" == "--advanced" ]; then
  main
  test_schema_introspection
else
  main
fi

echo -e "\n${GREEN}Testing complete!${NC}\n"
