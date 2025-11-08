#!/bin/bash
# GIXAT Backend API - cURL Command Reference
# Backend URL: http://192.168.1.214:4006/api/graphql

# ============================================================================
# AUTHENTICATION MUTATIONS
# ============================================================================

# 1. REGISTER NEW USER
# Usage: Register a new user account
# User Types: CLIENT, BUSINESS, SYSTEM
echo "=== REGISTER NEW USER ==="
curl -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(input: { email: \"newuser@example.com\", password: \"Password123!\", name: \"New User\", type: CLIENT }) { accessToken refreshToken user { id email name } expiresIn } }"
  }'

# ============================================================================
# 2. LOGIN USER
# Usage: Authenticate existing user and get tokens
echo -e "\n=== LOGIN USER ==="
curl -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"newuser@example.com\", password: \"Password123!\" }) { accessToken refreshToken user { id email name } expiresIn } }"
  }'

# ============================================================================
# AUTHENTICATED QUERIES (Requires accessToken)
# ============================================================================

# 3. GET CURRENT USER INFO
# Usage: Get authenticated user details
# Note: Replace TOKEN with actual access token
echo -e "\n=== GET CURRENT USER INFO (REQUIRES TOKEN) ==="
TOKEN="your_access_token_here"
curl -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { me { id email name } }"
  }'

# ============================================================================
# 4. VALIDATE TOKEN
# Usage: Check if token is still valid
echo -e "\n=== VALIDATE TOKEN ==="
TOKEN="your_access_token_here"
curl -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { validateToken }"
  }'

# ============================================================================
# BUSINESS QUERIES
# ============================================================================

# 5. GET ALL BUSINESSES
echo -e "\n=== GET ALL BUSINESSES ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { businesses { id name } }"
  }' | jq '.'

# 6. GET SINGLE BUSINESS
echo -e "\n=== GET SINGLE BUSINESS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { business(id: \"1\") { id name } }"
  }' | jq '.'

# ============================================================================
# CLIENT QUERIES
# ============================================================================

# 7. GET ALL CLIENTS
echo -e "\n=== GET ALL CLIENTS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { clients { id name email } }"
  }' | jq '.'

# 8. GET SINGLE CLIENT
echo -e "\n=== GET SINGLE CLIENT ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { client(id: \"1\") { id name email } }"
  }' | jq '.'

# 9. SEARCH CLIENTS
echo -e "\n=== SEARCH CLIENTS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { searchClients(query: \"john\") { id name email } }"
  }' | jq '.'

# 10. GET CLIENT STATS
echo -e "\n=== GET CLIENT STATS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { clientStats { total active } }"
  }' | jq '.'

# ============================================================================
# CAR QUERIES
# ============================================================================

# 11. GET ALL CARS
echo -e "\n=== GET ALL CARS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { cars { id make model year } }"
  }' | jq '.'

# 12. GET SINGLE CAR
echo -e "\n=== GET SINGLE CAR ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { car(id: \"1\") { id make model year } }"
  }' | jq '.'

# 13. GET CARS BY CLIENT
echo -e "\n=== GET CARS BY CLIENT ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { carsByClient(clientId: \"1\") { id make model year } }"
  }' | jq '.'

# 14. GET CARS BY BUSINESS
echo -e "\n=== GET CARS BY BUSINESS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { carsByBusiness(businessId: \"1\") { id make model year } }"
  }' | jq '.'

# 15. SEARCH CARS
echo -e "\n=== SEARCH CARS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { searchCars(query: \"toyota\") { id make model year } }"
  }' | jq '.'

# 16. GET CARS WITH EXPIRING INSURANCE
echo -e "\n=== GET CARS WITH EXPIRING INSURANCE ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { carsWithExpiringInsurance { id make model } }"
  }' | jq '.'

# 17. GET CAR STATS
echo -e "\n=== GET CAR STATS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { carStats { total byMake { make count } } }"
  }' | jq '.'

# ============================================================================
# APPOINTMENT QUERIES
# ============================================================================

# 18. GET ALL APPOINTMENTS
echo -e "\n=== GET ALL APPOINTMENTS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { appointments { id dateTime status } }"
  }' | jq '.'

# 19. GET TODAYS APPOINTMENTS
echo -e "\n=== GET TODAYS APPOINTMENTS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { todaysAppointments { id dateTime status } }"
  }' | jq '.'

# 20. GET UPCOMING APPOINTMENTS
echo -e "\n=== GET UPCOMING APPOINTMENTS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { upcomingAppointments { id dateTime status } }"
  }' | jq '.'

# 21. GET OVERDUE APPOINTMENTS
echo -e "\n=== GET OVERDUE APPOINTMENTS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { overdueAppointments { id dateTime status } }"
  }' | jq '.'

# 22. GET APPOINTMENT STATISTICS
echo -e "\n=== GET APPOINTMENT STATISTICS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { appointmentStatistics { total confirmed cancelled } }"
  }' | jq '.'

# ============================================================================
# REPAIR SESSION QUERIES
# ============================================================================

# 23. GET REPAIR SESSIONS
echo -e "\n=== GET REPAIR SESSIONS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { repairSessions { id status createdAt } }"
  }' | jq '.'

# 24. GET REPAIR SESSION STATISTICS
echo -e "\n=== GET REPAIR SESSION STATISTICS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { repairSessionStatistics { total completed inProgress } }"
  }' | jq '.'

# ============================================================================
# INSPECTION QUERIES
# ============================================================================

# 25. GET INSPECTIONS
echo -e "\n=== GET INSPECTIONS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { inspections { id type status } }"
  }' | jq '.'

# 26. GET INSPECTIONS BY TYPE
echo -e "\n=== GET INSPECTIONS BY TYPE ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { inspectionsByType(type: \"SAFETY\") { id type status } }"
  }' | jq '.'

# ============================================================================
# JOB CARD QUERIES
# ============================================================================

# 27. GET JOB CARDS
echo -e "\n=== GET JOB CARDS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { jobCards { id status createdAt } }"
  }' | jq '.'

# 28. GET JOB CARD STATISTICS
echo -e "\n=== GET JOB CARD STATISTICS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { jobCardStatistics { total open completed } }"
  }' | jq '.'

# ============================================================================
# NOTIFICATION QUERIES
# ============================================================================

# 29. GET NOTIFICATIONS
echo -e "\n=== GET NOTIFICATIONS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { notifications { id message type createdAt } }"
  }' | jq '.'

# ============================================================================
# ROLE & PERMISSION QUERIES
# ============================================================================

# 30. GET ALL ROLES
echo -e "\n=== GET ALL ROLES ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { roles { id name } }"
  }' | jq '.'

# 31. GET ALL PERMISSIONS
echo -e "\n=== GET ALL PERMISSIONS ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { permissions { id name } }"
  }' | jq '.'

# ============================================================================
# HEALTH CHECK QUERIES
# ============================================================================

# 32. AWS HEALTH CHECK
echo -e "\n=== AWS HEALTH CHECK ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { awsHealthCheck }"
  }' | jq '.'

# 33. S3 HEALTH CHECK
echo -e "\n=== S3 HEALTH CHECK ==="
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { s3HealthCheck { bucket region accessible } }"
  }' | jq '.'

# ============================================================================
# USAGE INSTRUCTIONS
# ============================================================================

<<'EOF'

=== HOW TO USE THIS SCRIPT ===

1. Make the script executable:
   chmod +x api-commands.sh

2. Run individual commands:
   ./api-commands.sh | grep "=== REGISTER NEW USER ===" -A 10

3. Or run specific curl command directly:
   curl -X POST http://192.168.1.214:4006/api/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"query { me { id email name } }"}'

4. For authenticated requests, replace TOKEN with actual access token:
   TOKEN=$(curl ... login ... | jq -r '.data.login.accessToken')
   curl ... -H "Authorization: Bearer $TOKEN" ...

5. Requirements:
   - curl (command line tool)
   - jq (JSON processor) - for pretty printing
   - Backend running at http://192.168.1.214:4006

=== COMMON PATTERNS ===

# Save token to variable:
TOKEN=$(curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: {email: \"user@example.com\", password: \"Test123!\"}) { accessToken } }"}' \
  | jq -r '.data.login.accessToken')

echo "Token: $TOKEN"

# Use token in subsequent requests:
curl -s -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"query { me { id email name } }"}' \
  | jq '.'

EOF
