# GraphQL Error Troubleshooting Guide

## Overview

Your GraphQL queries are failing for 4 main reasons:

1. **Parameterized queries without required variables**
2. **Backend schema doesn't match query expectations**
3. **Missing authentication or invalid tokens**
4. **Queries requesting fields that don't exist in backend**

---

## Common GraphQL Errors & Fixes

### ❌ Error: `Unauthorized`

**Problem:**
```
{
  "errors": [
    {
      "message": "Unauthorized: Invalid token or missing authentication",
      "path": ["jobCardStatistics"]
    }
  ]
}
```

**Causes:**
- No Bearer token in Authorization header
- Token expired (after 15 minutes)
- Token invalid or malformed

**Fix:**
```typescript
// ✅ CORRECT - Always include token
const token = storage.getAccessToken();
const response = await graphqlRequest(query, variables, token);

// ❌ WRONG - Missing token
const response = await graphqlRequest(query, variables);  // No token!
```

---

### ❌ Error: `Cannot query field "jobCardStatistics"`

**Problem:**
```
{
  "errors": [
    {
      "message": "Cannot query field \"jobCardStatistics\" on type \"Query\""
    }
  ]
}
```

**Causes:**
- Backend doesn't have this field in schema
- Field was removed/renamed in backend
- Spelling mistake in query

**Fix:**
First, check what fields the backend actually supports:

```bash
# Run this to test all available fields
bash diagnose-graphql-errors.sh
```

---

### ❌ Error: `Variable required but not provided`

**Problem:**
```
{
  "errors": [
    {
      "message": "Variable \"businessId\" of required type \"ID!\" was not provided"
    }
  ]
}
```

**Causes:**
- Query expects `$businessId` but you didn't provide it in variables
- Variables object is empty: `graphqlRequest(query, {})`

**Fix:**
```typescript
// ❌ WRONG - Query expects businessId but no variables provided
const query = `query GetStats($businessId: ID!) { jobCardStatistics(businessId: $businessId) }`;
graphqlRequest(query, {}, token);  // ❌ Empty variables object!

// ✅ CORRECT - Provide the required variable
const query = `query GetStats($businessId: ID!) { jobCardStatistics(businessId: $businessId) }`;
graphqlRequest(query, { businessId: "123" }, token);  // ✅ Provides businessId
```

---

### ❌ Error: `400 Bad Request`

**Problem:**
```
Error: HTTP error! status: 400
```

**Causes:**
- Invalid GraphQL syntax
- Required field missing from query
- Field arguments invalid
- Backend schema issue

**Fix:**
1. Check GraphQL syntax using https://www.apollographql.com/docs/apollo-server/testing/
2. Verify all required fields are included
3. Check exact field names in backend schema

---

## Root Cause Analysis

### Your Current Dashboard Setup

**File:** `src/lib/hooks/useDashboardStats.ts`

```typescript
const fetchStats = async () => {
  // ❌ Problem: This hook returns DEFAULT_STATS immediately
  // It doesn't actually fetch from backend!
  setStats(DEFAULT_STATS);
};
```

**Result:** All dashboard cards show 0 because they're using default stats.

---

## Solution: Use Individual Page Queries

Instead of one big "GET_DASHBOARD_STATISTICS" query, each dashboard page should fetch its own data:

### ✅ Correct Pattern (Already implemented on some pages)

**File:** `src/app/dashboard/cars/page.tsx`

```typescript
useEffect(() => {
  if (pageLoading || !user) return;

  const fetchCars = async () => {
    try {
      const token = storage.getAccessToken();
      
      // ✅ Simple query without parameters
      const response = await graphqlRequest<{ cars: Car[] }>(
        `query {
          cars {
            id
            licensePlate
            make
            model
            year
          }
        }`,
        {},
        token  // ✅ Token provided!
      );

      if (response.data?.cars) {
        setCars(response.data.cars);
      }
    } catch (error) {
      console.error("Error:", error);
      setCars([]);
    }
  };
  
  fetchCars();
}, [pageLoading, user]);
```

**Why this works:**
1. ✅ Token provided
2. ✅ Simple query (no parameters needed)
3. ✅ Guards inside effect (not before)
4. ✅ Error handling catches auth failures

---

## Step-by-Step Fix for Your Dashboard

### Step 1: Diagnose Your Backend

```bash
# First, test what your backend actually supports
bash diagnose-graphql-errors.sh
```

This will show you:
- ✅ Which queries work
- ❌ Which queries fail and why
- The exact error messages

### Step 2: Update `useDashboardStats` Hook

Replace the dummy stats with real queries:

```typescript
const fetchStats = async () => {
  try {
    setLoading(true);
    const token = storage.getAccessToken();
    if (!token) throw new Error('No token');

    // Get businesses first to know which businessId to use
    const businessesResponse = await graphqlRequest<{ businesses: Array<{ id: string }> }>(
      `query { businesses { id } }`,
      {},
      token
    );

    const businessId = businessesResponse.data?.businesses?.[0]?.id;
    if (!businessId) throw new Error('No business found');

    // Now fetch stats using businessId
    const statsResponse = await graphqlRequest<any>(
      `query {
        jobCardStatistics(businessId: "${businessId}")
        clientStats(businessId: "${businessId}") {
          totalClients
          activeClients
        }
      }`,
      {},
      token
    );

    // Process response...
    setStats(statsResponse.data);
  } catch (err) {
    console.error('Stats error:', err);
    setStats(DEFAULT_STATS);
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Check Browser DevTools

Open F12 and check:

1. **Network Tab:**
   - Look for GraphQL POST requests
   - Check response status (200 vs 400/401)
   - Read error messages

2. **Console Tab:**
   - Look for "GraphQL Errors" logs
   - Check exact error messages
   - See request/response debug info

---

## Quick Checklist

- [ ] Run `bash diagnose-graphql-errors.sh` to identify problems
- [ ] Check browser DevTools Network tab for error responses
- [ ] Verify token is being sent in Authorization header
- [ ] Confirm backend fields match your queries
- [ ] Test queries in GraphQL Playground (if backend exposes it)
- [ ] Review error messages for specific field/syntax issues
- [ ] Update queries to match backend schema exactly

---

## Testing Queries Directly

### Option 1: Use cURL

```bash
# Get token first (from browser localStorage)
export TOKEN="your_token_here"

# Test a simple query
curl -X POST http://192.168.1.214:4006/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"query { me { id email } }"}'
```

### Option 2: Use GraphQL Playground

If your backend exposes GraphQL Playground:
- Visit: `http://192.168.1.214:4006`
- Copy your token from browser
- Click "HTTP Headers" and add: `{ "Authorization": "Bearer YOUR_TOKEN" }`
- Test queries interactively

---

## Debugging in Your Frontend

Add this to any component to debug GraphQL requests:

```typescript
import { graphqlRequest } from "@/lib/graphql-client";

// This automatically logs all requests/responses
const response = await graphqlRequest(query, variables, token);

// Check browser console for debug output:
// GraphQL Request Debug: { hasToken, tokenPreview, query, variables }
// GraphQL Response Debug: { status, ok, hasErrors }
// GraphQL Errors: { errors array with details }
```

The debug logs show in your browser console (F12).

---

## Next Steps

1. **Run the diagnostic script:**
   ```bash
   bash diagnose-graphql-errors.sh
   ```

2. **Share the output** - it will show exactly which queries are failing

3. **Fix queries based on results:**
   - If field doesn't exist → use different field
   - If unauthorized → make sure token is provided
   - If parameter required → add the parameter

4. **Update hook functions** to use working queries

5. **Verify on dashboard** - cards should now show real data

---

## Common Solutions

| Problem | Solution |
|---------|----------|
| "Unauthorized" | Add token: `graphqlRequest(q, v, token)` |
| "Cannot query field X" | Check backend schema, use correct field |
| "Variable required" | Provide in variables: `{ varName: value }` |
| "400 Bad Request" | Check syntax, validate query in playground |
| Shows 0 on dashboard | Hook returning default stats, fetch real data |
| All pages show errors | Backend not running or token expired |

---

## Need More Help?

1. Check the DEBUG logs in browser console (F12 → Console tab)
2. Look at Network tab (F12 → Network) for exact error responses
3. Run diagnostic script to see all queries status
4. Check if token is valid (not expired)
