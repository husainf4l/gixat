#!/bin/bash

# DateTime Serialization Error - Diagnostic Test Script
# Run this to test different DateTime formats against the backend

BACKEND_URL="https://www.gixat.com/api/graphql"
TOKEN="${JWT_TOKEN:-YOUR_TOKEN_HERE}"  # Set JWT_TOKEN env var or replace

echo "=========================================="
echo "DateTime Serialization Error - Test Script"
echo "=========================================="
echo ""

# Test 1: Current format (ISO 8601 with milliseconds)
echo "Test 1: ISO 8601 with Milliseconds"
echo "Format: 2025-11-12T10:00:00.000Z"
curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) { createJobCard(input: $input, businessId: $businessId) { id plannedStartDate plannedEndDate createdAt updatedAt } }",
    "variables": {
      "input": {
        "title": "Test Format 1",
        "plannedStartDate": "2025-11-12T10:00:00.000Z",
        "plannedEndDate": "2025-11-12T14:00:00.000Z",
        "estimatedHours": 4,
        "repairSessionId": "1",
        "assignedTechnicianId": "5"
      },
      "businessId": "2"
    }
  }' | jq '.errors // .data'
echo ""
echo "---"
echo ""

# Test 2: ISO 8601 without milliseconds
echo "Test 2: ISO 8601 without Milliseconds"
echo "Format: 2025-11-12T10:00:00Z"
curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) { createJobCard(input: $input, businessId: $businessId) { id plannedStartDate plannedEndDate createdAt updatedAt } }",
    "variables": {
      "input": {
        "title": "Test Format 2",
        "plannedStartDate": "2025-11-12T10:00:00Z",
        "plannedEndDate": "2025-11-12T14:00:00Z",
        "estimatedHours": 4,
        "repairSessionId": "2",
        "assignedTechnicianId": "5"
      },
      "businessId": "2"
    }
  }' | jq '.errors // .data'
echo ""
echo "---"
echo ""

# Test 3: ISO 8601 with timezone offset
echo "Test 3: ISO 8601 with Timezone Offset"
echo "Format: 2025-11-12T10:00:00+00:00"
curl -s -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) { createJobCard(input: $input, businessId: $businessId) { id plannedStartDate plannedEndDate createdAt updatedAt } }",
    "variables": {
      "input": {
        "title": "Test Format 3",
        "plannedStartDate": "2025-11-12T10:00:00+00:00",
        "plannedEndDate": "2025-11-12T14:00:00+00:00",
        "estimatedHours": 4,
        "repairSessionId": "3",
        "assignedTechnicianId": "5"
      },
      "businessId": "2"
    }
  }' | jq '.errors // .data'
echo ""
echo "=========================================="
echo "Results: Check which format worked"
echo "=========================================="
