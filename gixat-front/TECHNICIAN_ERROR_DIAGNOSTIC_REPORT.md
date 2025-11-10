# TECHNICIAN AUTHORIZATION ERROR - FULL DIAGNOSTIC REPORT
**Date:** November 10, 2025  
**Error Location:** Job Card Creation Form (`/src/components/repair-session/JobCardReportForm.tsx`)  
**Severity:** ⛔ BLOCKING - User cannot create job cards

---

## 1. ERROR DETAILS

### Error Message
```
"Technician not authorized for this business"
```

### GraphQL Error Response
```json
{
  "message": "Technician not authorized for this business",
  "locations": [
    {
      "line": 3,
      "column": 5
    }
  ],
  "path": [
    "createJobCard"
  ]
}
```

### Console Logs (User's Browser)
```
GraphQL Errors: Array [ {…} ]
- Full Error: { message: "Technician not authorized for this business", ... }
- Message: "Technician not authorized for this business"
- Path: Array [ "createJobCard" ]
JobCardReportForm - Response: Object { data: null, errors: (1) […] }
JobCardReportForm - GraphQL Error: Technician not authorized for this business
```

---

## 2. ROOT CAUSE ANALYSIS

### 2.1 What the Error Means
The backend validation logic checks: **"Does the provided `assignedTechnicianId` belong to this `businessId`?"**

When the check fails, the backend rejects the entire mutation with this specific error.

### 2.2 Why It's Occurring

**Backend Validation Logic (Inferred):**
```
IF technician.businessId ≠ mutation.businessId
  THEN error: "Technician not authorized for this business"
END IF
```

**The Technician Data Issue:**
```
Backend Query Results:
├─ Business ID 1 ("4wk")
│  └─ Users with businessId="1": NONE
│
└─ Business ID 2 ("shadikamalllll")
   └─ Users with businessId="2": 
      └─ User ID 5 (shadi_f4r@yahoo.com) ✓ VALID

System Users (8 total):
├─ ID 1: businessId = null
├─ ID 2: businessId = null
├─ ID 3: businessId = null
├─ ID 4: businessId = null
├─ ID 5: businessId = "2" ← ONLY VALID TECHNICIAN IN SYSTEM
├─ ID 6: businessId = null
├─ ID 7: businessId = null
└─ ID 8: businessId = null
```

**Scenario 1: You're submitting for Business ID 1**
- Problem: No users assigned to business ID 1
- Frontend tries to auto-select first employee: Gets empty list
- Form shows: "❌ No technicians available - Add employees to this business first"
- If user somehow bypasses this and submits with an invalid tech ID → Backend error

**Scenario 2: You're submitting for Business ID 2**
- Problem: Only user ID 5 is assigned to this business
- Frontend auto-selects: User ID 5 ✓
- Expected: Mutation should succeed
- If it still fails: The token doesn't belong to this business or the technician validation has stricter logic

### 2.3 Frontend Code Path (What's Being Sent)

**Job Card Form Submission Flow:**
```
1. User clicks "Save Job Card"
2. Form collects data:
   {
     title: "Engine Service",
     description: "Full engine tune-up",
     plannedStartDate: "2025-11-10T10:30:00.000Z",
     plannedEndDate: "2025-11-10T14:30:00.000Z",
     estimatedHours: 4,
     workInstructions: "Check oil, spark plugs, filters",
     assignedTechnicianId: "5"  ← AUTO-SELECTED FROM DROPDOWN
   }

3. Send GraphQL mutation:
   mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) {
     createJobCard(input: $input, businessId: $businessId) {
       id jobNumber title status ...
     }
   }

4. Variables sent:
   {
     "input": { /* all fields above */ },
     "businessId": "2"  ← OR "1"
   }

5. Backend processes:
   - Validates: User ID 5 belongs to Business ID 2?
   - If NO → Error: "Technician not authorized for this business"
   - If YES → Create job card ✓
```

---

## 3. SCHEMA VERIFICATION

### CreateJobCardInput (GraphQL Schema)
```
Field                    | Required | Type  | Notes
─────────────────────────┼──────────┼───────┼──────────────────────────
title                    | YES      | ID    | NON_NULL
description              | NO       | String|
plannedStartDate         | YES      | String| ISO 8601 format
plannedEndDate           | YES      | String| ISO 8601 format
estimatedHours           | YES      | Float | NON_NULL
workInstructions         | NO       | String|
repairSessionId          | YES      | ID    | NON_NULL
assignedTechnicianId     | YES      | ID    | NON_NULL ← REQUIRED BY SCHEMA
```

**Key Finding:** `assignedTechnicianId` is **NON_NULL** - the schema requires it. No way to make it optional without backend change.

---

## 4. ENVIRONMENTAL DATA SNAPSHOT

### Available Businesses
```json
[
  {
    "id": "2",
    "name": "shadikamalllll"
  },
  {
    "id": "1",
    "name": "4wk"
  }
]
```

### Available Users (with businessId)
```json
[
  {
    "id": "1",
    "email": "testuser@example.com",
    "name": "Test User",
    "type": "CLIENT",
    "businessId": null  ← NOT ASSIGNED
  },
  {
    "id": "2",
    "email": "husain.f4l@gmail.com",
    "name": "husian",
    "type": "BUSINESS",
    "businessId": null  ← NOT ASSIGNED
  },
  {
    "id": "5",
    "email": "shadi_f4r@yahoo.com",
    "name": "shadikamalllll",
    "type": "BUSINESS",
    "businessId": "2"  ← VALID FOR BUSINESS 2 ✓
  }
  // ... (5 more users with businessId: null)
]
```

### Frontend State (at error time)
```javascript
formData = {
  title: "...",
  description: "...",
  plannedStartDate: "2025-11-10T...",
  plannedEndDate: "2025-11-10T...",
  estimatedHours: 4,
  workInstructions: "...",
  assignedTechnicianId: "5"  // Auto-selected by useEffect
}

businessId = "2"  // Passed as prop from parent

// Mutation variables:
{
  input: formData,
  businessId: "2"
}
```

---

## 5. POSSIBLE FAILURE SCENARIOS

### Scenario A: Token/Auth Issue
**Symptom:** Works with user ID 5 in one context, fails in another  
**Cause:** Bearer token belongs to a different user or business  
**Check:** Verify `storage.getAccessToken()` returns a token for a user with admin or business owner privileges

### Scenario B: Strict Technician Validation
**Symptom:** User ID 5 is assigned to business 2, but still gets "not authorized"  
**Cause:** Backend checks additional conditions (technician must have TECHNICIAN role, must be active, etc.)  
**Evidence:** Only user 5 has businessId, yet still fails

### Scenario C: Wrong Business ID Being Sent
**Symptom:** Form sends businessId "1" but has no users assigned  
**Cause:** Parent component passes wrong businessId prop  
**Check:** Browser console should log businessId and assignedTechnicianId before mutation

### Scenario D: Auto-Select Timing Issue
**Symptom:** Form submits before useEffect runs, so assignedTechnicianId still empty  
**Cause:** Race condition - user clicks submit before employees load  
**Fix:** Disable submit button until employees load

---

## 6. FRONTEND CODE ANALYSIS

### Current Implementation (/src/components/repair-session/JobCardReportForm.tsx)
```typescript
// Line 27-34: Auto-populate technician
useEffect(() => {
  if (employees.length > 0 && !formData.assignedTechnicianId) {
    setFormData(prev => ({
      ...prev,
      assignedTechnicianId: employees[0].id,  // Auto-select first
    }));
  }
}, [employees]);
```

**Issue:** If `employees` list is empty, `assignedTechnicianId` remains empty string  
**Result:** Form will have `assignedTechnicianId: ""` in the mutation → GraphQL validation error (NOT the "not authorized" error, but a different one)

### Mutation Data Sent
```typescript
// Line 59-72: Input construction
const inputData = {
  repairSessionId: repairSessionId,
  title: formData.title,
  description: formData.description,
  plannedStartDate: formData.plannedStartDate,
  plannedEndDate: formData.plannedEndDate,
  estimatedHours: formData.estimatedHours,
  workInstructions: formData.workInstructions,
  assignedTechnicianId: formData.assignedTechnicianId,  // ALWAYS SENT
};
```

**Status:** ✓ Correctly sends assignedTechnicianId  
**Status:** ✓ Always includes it (required by schema)

### Dropdown Rendering
```typescript
// Line 205-223: UI rendering
{employees.length > 0 ? (
  <select>
    <option value="">-- Select a technician --</option>
    {employees.map((employee) => (
      <option key={employee.id} value={employee.id}>
        {employee.name} ({employee.email}) - {employee.type}
      </option>
    ))}
  </select>
) : (
  <div>❌ No technicians available - Add employees to this business first</div>
)}
```

**Status:** ✓ Shows correct UI state  
**Issue:** Users can still manually select `""` from dropdown if they override auto-selection

---

## 7. BACKEND MUTATION SIGNATURE

```graphql
mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) {
  createJobCard(input: $input, businessId: $businessId) {
    id
    jobNumber
    title
    status
    ...25 other fields
  }
}
```

**Backend Validation (Inferred):**
```
VALIDATE $input.assignedTechnicianId:
  ├─ Field exists? (required by schema) ✓
  ├─ Field is non-empty? (must be valid ID)
  ├─ Fetch Technician(id = $input.assignedTechnicianId):
  │  └─ Found? → Continue
  │  └─ Not found? → Error: "Technician not found"
  │
  └─ Validate Technician.businessId == $businessId:
     ├─ Match? → Allow mutation ✓
     └─ Mismatch? → Error: "Technician not authorized for this business" ← YOU ARE HERE
```

---

## 8. RECOMMENDED DIAGNOSTICS (What to Check Next)

### 8.1 Verify What's Actually Being Sent
**Action:** Open browser DevTools → Network tab → Find GraphQL request  
**Look for:**
```json
{
  "query": "mutation CreateJobCard(...)",
  "variables": {
    "input": {
      "assignedTechnicianId": "5"  ← What value is here?
    },
    "businessId": "2"  ← What value is here?
  }
}
```

### 8.2 Check Browser Console for Form Logs
**Action:** Open browser console → Look for logs from JobCardReportForm  
**Expected:**
```
JobCardReportForm - Sending data:
{
  "assignedTechnicianId": "5",
  "businessId": "2",
  ...
}
```

### 8.3 Verify Token Belongs to Correct Business
**Action:** Decode JWT token in storage  
**Check:**
```json
{
  "userId": "5",
  "businessId": "2",  ← Does this match the mutation's businessId?
  "exp": 1234567890,
  ...
}
```

### 8.4 Test Direct Backend Mutation (curl)
```bash
curl -X POST https://www.gixat.com/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) { createJobCard(input: $input, businessId: $businessId) { id } }",
    "variables": {
      "input": {
        "title": "Test",
        "description": "",
        "plannedStartDate": "2025-11-10T10:00:00Z",
        "plannedEndDate": "2025-11-10T14:00:00Z",
        "estimatedHours": 4,
        "workInstructions": "",
        "repairSessionId": "YOUR_REPAIR_SESSION_ID",
        "assignedTechnicianId": "5"
      },
      "businessId": "2"
    }
  }'
```

---

## 9. SOLUTIONS MATRIX

### Solution 1: Assign More Users to Businesses (Data Fix)
**Status:** ⏳ Requires backend/admin action  
**How:** Backend admin or API call to assign users 1, 2, 3, 4, 6, 7, 8 to business IDs 1 or 2  
**Benefit:** Multiple technicians available in dropdown, user choice  
**Timeline:** 5-10 minutes

**Backend mutation (if available):**
```graphql
mutation AssignUserToBusiness($userId: ID!, $businessId: ID!) {
  assignUserToBusiness(userId: $userId, businessId: $businessId) {
    id
    businessId
  }
}
```

### Solution 2: Make assignedTechnicianId Optional (Backend Change)
**Status:** ⏳ Requires backend schema change  
**How:** Remove NON_NULL constraint on `assignedTechnicianId` in CreateJobCardInput  
**Benefit:** Users can create job cards without pre-assigning technician; assign later  
**Timeline:** 15-30 minutes (backend change + deploy)

**Backend change (pseudocode):**
```javascript
// Before:
assignedTechnicianId: ID! ← Required

// After:
assignedTechnicianId: ID ← Optional (remove !)
```

### Solution 3: Default to Business Owner (Frontend + Backend)
**Status:** ✓ Can implement now (partial frontend fix)  
**How:** If no technician ID provided, default to business owner  
**Benefit:** Jobs always have someone assigned; works with current schema  
**Timeline:** 20-30 minutes

**Frontend change:**
```typescript
const inputData = {
  ...formData,
  // If no tech selected, use business owner or first available
  assignedTechnicianId: formData.assignedTechnicianId || businessOwnerId,
};
```

### Solution 4: Disable Submit Until Data Ready (Frontend UX Fix)
**Status:** ✓ Can implement now  
**How:** Disable submit button until employees load and auto-select happens  
**Benefit:** Prevents users from submitting before data is ready  
**Timeline:** 5-10 minutes

**Frontend change:**
```typescript
<button type="submit" disabled={loading || employeesLoading}>
  {loading ? "Saving..." : "💾 Save Job Card"}
</button>
```

---

## 10. IMMEDIATE ACTION ITEMS

**Priority 1 (Do Now):**
- [ ] Check browser Network tab to confirm `assignedTechnicianId: "5"` and `businessId: "2"` are being sent
- [ ] Verify token in storage belongs to user 5 or has admin/owner privileges
- [ ] Add disable state to submit button while employees loading

**Priority 2 (Next):**
- [ ] Contact backend team to provide list of which users should be technicians for which businesses
- [ ] Ask if `assignedTechnicianId` can be made optional

**Priority 3 (If above don't work):**
- [ ] Run direct curl test with your token to isolate frontend vs backend issue
- [ ] Check backend logs for more detailed error (authorization role, business validation logic)

---

## 11. SUPPORTING FILES

- **Form Component:** `/src/components/repair-session/JobCardReportForm.tsx`
- **Employee Hook:** `/src/lib/hooks/useEmployees.ts`
- **GraphQL Queries:** `/src/lib/dashboard.queries.ts` (CREATE_JOB_CARD_MUTATION)
- **GraphQL Client:** `/src/lib/graphql-client.ts` (token + error handling)
- **Storage:** `/src/lib/storage.ts` (token retrieval)

---

## 12. SUMMARY

| Item | Status | Impact |
|------|--------|--------|
| Frontend Code | ✓ Correct | Sends required fields properly |
| GraphQL Schema | ✓ Found | `assignedTechnicianId` is NON_NULL (required) |
| Test Data | ❌ Insufficient | Only 1 user assigned to business 2 |
| Backend Validation | ⚠️ Unknown | Likely checking `technician.businessId == mutation.businessId` |
| Token/Auth | ⚠️ Unknown | May not have permissions for this business |

**Root Cause:** Either (A) wrong businessId being sent, (B) token doesn't have permissions, or (C) technician ID doesn't match business ID.

**Next Step:** Check browser Network tab and token to verify (A) and (B). If both correct, contact backend team about (C).

---

*Report Generated: November 10, 2025*  
*Frontend Build Status: ✓ Passing (0 errors)*  
*Dev Server Status: Running on port 3001*
