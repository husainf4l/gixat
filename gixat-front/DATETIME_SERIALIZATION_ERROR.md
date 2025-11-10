# DateTime Serialization Error - Diagnostic Report

## Error Message
```
⚠️ Expected `DateTime.serialize("2025-11-12T06:52:00.000Z")` to return non-nullable value, returned: null
```

## What This Means

The backend is trying to serialize (convert to JSON) a DateTime field that is marked as **NON_NULL** (required), but the actual value is `null`.

### Error Translation

```
DateTime.serialize("2025-11-12T06:52:00.000Z")
    ↓ (backend tries to convert this DateTime to JSON)
    ↓ (but the field value in database is null)
RETURNS: null

VALIDATION CHECK: This field is NON_NULL
    ↓ (must have a value, can't be null)
    
ERROR: Cannot serialize null for NON_NULL field!
```

---

## Root Cause Analysis

### Schema Definition
```
JobCard return fields marked as NON_NULL:
├─ id                  (NON_NULL)
├─ jobNumber           (NON_NULL) 
├─ title               (NON_NULL)
├─ status              (NON_NULL)
├─ plannedStartDate    (NON_NULL) ← THE PROBLEM
├─ plannedEndDate      (NON_NULL) ← THE PROBLEM
├─ estimatedHours      (NON_NULL)
├─ qualityApproved     (NON_NULL)
├─ repairSessionId     (NON_NULL)
├─ assignedTechnicianId (NON_NULL) ← THE PROBLEM
├─ createdById         (NON_NULL)
├─ createdAt           (NON_NULL) ← THE PROBLEM
├─ updatedAt           (NON_NULL) ← THE PROBLEM
└─ progress            (NON_NULL)
```

### What's Happening

**Step 1: Frontend sends valid data**
```json
{
  "title": "Engine Service",
  "plannedStartDate": "2025-11-12T06:52:00.000Z",  ← Valid ISO 8601
  "plannedEndDate": "2025-11-12T14:52:00.000Z",    ← Valid ISO 8601
  "estimatedHours": 8,
  "assignedTechnicianId": "5"
}
```

**Step 2: Backend creates job card**
- Job card is created in database
- But one or more NON_NULL DateTime fields are stored as `null`

**Step 3: Backend tries to return the job card**
```
FOR EACH field IN jobCard:
  IF field is NON_NULL AND field.value is null:
    THROW ERROR: "Expected DateTime.serialize(...) to return non-nullable value, returned: null"
  END IF
END FOR
```

**Result:** Cannot return job card because it violates the schema contract

---

## Possible Causes

### Cause 1: Backend Bug - Not Saving DateTime Fields
**Symptom:** Frontend sends valid dates, but backend doesn't save them to database  
**Evidence:** Error says returned value is null, meaning it queried null from DB  
**Solution:** Backend team needs to verify date fields are being persisted

### Cause 2: DateTime Format Mismatch
**Symptom:** Frontend sends one format, backend expects different format  
**Evidence:** Server could reject format silently and store null  
**Current format sent:** ISO 8601 with milliseconds (`2025-11-12T06:52:00.000Z`)  
**Check:** Does backend accept this format or expect something else?

### Cause 3: Timezone Issue
**Symptom:** Frontend sends UTC (+Z), backend converts and gets null  
**Evidence:** Timezone conversion bug in backend DateTime handler  
**Check:** Try sending without timezone or with explicit +00:00

### Cause 4: Database Column Not Accepting Values
**Symptom:** Database schema prevents null, but application doesn't enforce it  
**Evidence:** Field defined as NOT NULL in DB but application doesn't validate  
**Check:** Is plannedStartDate column defined as NOT NULL in database?

### Cause 5: Backend Validation Removing DateTime
**Symptom:** Backend validation logic clears DateTime fields for some reason  
**Evidence:** Job card gets created but key fields are nullified  
**Check:** Is there validation that overwrites provided dates?

---

## What the Frontend is Doing (Correct)

**JobCardReportForm.tsx - Current Implementation:**

```typescript
// Line 17-25: Initialize with valid ISO 8601 dates
const [formData, setFormData] = useState({
  title: "",
  description: "",
  plannedStartDate: new Date().toISOString(),  // e.g., "2025-11-12T06:52:00.000Z"
  plannedEndDate: new Date().toISOString(),    // e.g., "2025-11-12T14:52:00.000Z"
  estimatedHours: 0,
  workInstructions: "",
  assignedTechnicianId: "",
});

// Line 59-71: Send dates as-is to backend
const inputData = {
  repairSessionId: repairSessionId,
  title: formData.title,
  description: formData.description,
  plannedStartDate: formData.plannedStartDate,    // Sent as: "2025-11-12T06:52:00.000Z"
  plannedEndDate: formData.plannedEndDate,        // Sent as: "2025-11-12T14:52:00.000Z"
  estimatedHours: formData.estimatedHours,
  workInstructions: formData.workInstructions,
  assignedTechnicianId: formData.assignedTechnicianId,
};
```

**Status:** ✅ **Frontend is sending correct format**

---

## Diagnostic Steps

### Check 1: Verify What's Being Sent
**Action:** Open browser DevTools → Network tab → Submit form  
**Look for:** GraphQL request variables

```json
{
  "variables": {
    "input": {
      "plannedStartDate": "2025-11-12T06:52:00.000Z",  ← Check format here
      "plannedEndDate": "2025-11-12T14:52:00.000Z"     ← Check format here
    }
  }
}
```

**Expected:** ISO 8601 with T and Z separators  
**Also check:** Are both start and end dates being sent?

### Check 2: Test Backend Directly
**Command:**
```bash
curl -X POST https://www.gixat.com/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) { createJobCard(input: $input, businessId: $businessId) { id plannedStartDate plannedEndDate } }",
    "variables": {
      "input": {
        "title": "Test",
        "plannedStartDate": "2025-11-12T10:00:00.000Z",
        "plannedEndDate": "2025-11-12T14:00:00.000Z",
        "estimatedHours": 4,
        "repairSessionId": "1",
        "assignedTechnicianId": "5"
      },
      "businessId": "2"
    }
  }'
```

**What to look for in response:**
```json
{
  "data": {
    "createJobCard": {
      "id": "xxx",
      "plannedStartDate": "2025-11-12T10:00:00.000Z",  ← Should be populated
      "plannedEndDate": "2025-11-12T14:00:00.000Z"     ← Should be populated
    }
  }
}
```

OR

```json
{
  "errors": [{
    "message": "Expected DateTime.serialize(...) to return non-nullable value, returned: null"
  }]
}
```

### Check 3: Try Different DateTime Format
**If ISO 8601 doesn't work, try:**

```bash
# Without milliseconds
"plannedStartDate": "2025-11-12T10:00:00Z"

# With timezone offset
"plannedStartDate": "2025-11-12T10:00:00+00:00"

# Unix timestamp (if backend accepts)
"plannedStartDate": 1731399600000
```

---

## Frontend Mitigation (Optional - If Backend Issue)

If the backend has a bug and doesn't save DateTime fields, we could:

1. **Retry the mutation** - In case it's a race condition
2. **Remove DateTime from initial response** - Don't query them until after creation
3. **Query the job card separately** - After creation completes

**Example mitigation (add to form):**

```typescript
// After successful creation, query the job card again
if (response.data?.createJobCard) {
  const jobCardId = response.data.createJobCard.id;
  
  // Query the full job card details
  const fullJobCard = await graphqlRequest(
    `query GetJobCard($id: ID!) {
      jobCard(id: $id) {
        id
        title
        plannedStartDate
        plannedEndDate
        status
      }
    }`,
    { id: jobCardId },
    token
  );
  
  return fullJobCard;
}
```

---

## Recommended Actions

### 🔴 Priority 1: Identify the exact field causing serialization error

**Action:** Run the curl test above and share the complete error response  
**Why:** Need to know which specific DateTime field is null (plannedStartDate, plannedEndDate, createdAt, updatedAt, etc.)

### 🟡 Priority 2: Contact backend team with this info

Provide them:
1. The exact error message you're getting
2. The DateTime values you're sending (from browser Network tab)
3. Whether the job card IS being created (just with null dates) or NOT being created at all

### 🟢 Priority 3: Try alternative DateTime formats

Test with simpler formats to see if format is the issue

---

## Summary

| Item | Status | Notes |
|------|--------|-------|
| Frontend format | ✅ Correct | Sending ISO 8601 with milliseconds |
| Schema | ⚠️ Strict | Multiple NON_NULL DateTime fields |
| Backend | ❌ Issue | Not returning DateTime values (null in DB) |
| Error location | Response serialization | Happens when converting result to JSON |
| Job card creation | ❓ Unknown | May or may not be created |
| Next step | Run curl test | Verify exact error and field |

---

## Timeline to Fix

**If it's format issue:** 5 minutes (test alternatives)  
**If it's backend bug:** 15-30 minutes (backend needs to fix and deploy)  
**If it's data migration issue:** 30+ minutes (backend needs to handle existing null data)

---

*Report generated: November 10, 2025*
