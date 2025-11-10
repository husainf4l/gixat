# ROOT CAUSE: "TECHNICIAN NOT AUTHORIZED FOR THIS BUSINESS" ERROR

## THE REAL PROBLEM

Your mutation in the request uses fields that **don't exist** in the actual GraphQL schema:

```graphql
❌ WRONG (Your mutation):
mutation CreateJobCard {
  createJobCard(input: {
    repairSessionId: 1
    assignedTechnicianId: 2          ← User 2 doesn't have businessId set
    estimatedHours: 8
    plannedStartDate: "2025-11-10T09:00:00.000Z"
    plannedEndDate: "2025-11-10T17:00:00.000Z"
    priority: HIGH                   ← Field doesn't exist in schema!
    notes: "Customer reported..."    ← Field doesn't exist in schema!
  }) { ... }
}
```

```graphql
✅ CORRECT (What backend actually expects):
mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) {
  createJobCard(input: $input, businessId: $businessId) { ... }
}

Variables:
{
  "input": {
    "title": "string",                    ← REQUIRED
    "description": "string",              ← optional
    "plannedStartDate": "2025-11-10...",  ← REQUIRED ISO 8601
    "plannedEndDate": "2025-11-10...",    ← REQUIRED ISO 8601
    "estimatedHours": 8,                  ← REQUIRED
    "workInstructions": "string",         ← optional
    "repairSessionId": "1",               ← REQUIRED
    "assignedTechnicianId": "5"           ← REQUIRED (must belong to business!)
  },
  "businessId": "2"                       ← REQUIRED as separate parameter
}
```

---

## SCHEMA VALIDATION

### CreateJobCardInput Fields (8 total)
| Field | Required | Type | Valid Values |
|-------|----------|------|--------------|
| `title` | ✅ YES | String | Any text |
| `description` | NO | String | Any text |
| `plannedStartDate` | ✅ YES | String | ISO 8601 datetime |
| `plannedEndDate` | ✅ YES | String | ISO 8601 datetime |
| `estimatedHours` | ✅ YES | Float | > 0 |
| `workInstructions` | NO | String | Any text |
| `repairSessionId` | ✅ YES | ID | Must exist in database |
| `assignedTechnicianId` | ✅ YES | ID | User with matching businessId |

### Fields That DON'T Exist
- ❌ `priority` → NOT in schema
- ❌ `notes` → NOT in schema
- ❌ `createdAt` → Return field only, not input
- ❌ `status` → Backend-set field only

---

## THE AUTHORIZATION ERROR EXPLAINED

### What "Technician not authorized for this business" Means

Backend validation logic:
```
1. Parse input.assignedTechnicianId (e.g., "2")
2. Fetch User with ID 2
3. Check: Does User.businessId == mutation.businessId?
4. IF NO → Error: "Technician not authorized for this business"
5. IF YES → Create job card
```

### Why You're Getting This Error

**Your test data:**
- Business 2: name = "shadikamalllll"
- User 2: businessId = null (NOT assigned to any business)
- User 5: businessId = "2" (assigned to business 2) ✓

**Your mutation is sending:**
- assignedTechnicianId: 2
- businessId: 2 (or 1, depends on form)

**Backend validation:**
```
User 2.businessId (null) ≠ mutation.businessId (2)
                ↓
ERROR: "Technician not authorized for this business"
```

---

## CORRECT FIX: Use User 5 (Not User 2)

```graphql
✅ CORRECT MUTATION:
mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!) {
  createJobCard(input: $input, businessId: $businessId) {
    id
    jobNumber
    title
    status
  }
}

Variables:
{
  "input": {
    "title": "Test Job Card",
    "description": "Testing",
    "plannedStartDate": "2025-11-10T09:00:00.000Z",
    "plannedEndDate": "2025-11-10T17:00:00.000Z",
    "estimatedHours": 8,
    "workInstructions": "Check engine",
    "repairSessionId": "1",
    "assignedTechnicianId": "5"  ← CORRECT: User 5 belongs to business 2
  },
  "businessId": "2"
}
```

---

## THE FRONTEND FIX (Already Implemented!)

Your frontend form (`JobCardReportForm.tsx`) is **already correct**:

```typescript
// Line 28-33: Auto-selects first available employee
useEffect(() => {
  if (employees.length > 0 && !formData.assignedTechnicianId) {
    setFormData(prev => ({
      ...prev,
      assignedTechnicianId: employees[0].id,  ← Will be "5" for business 2
    }));
  }
}, [employees]);
```

**Hook implementation** (`useEmployeesByBusiness.ts`):
```typescript
// Filters users by businessId
const filteredEmployees = employees.filter(emp => emp.businessId === businessId);
```

**Form submission:**
```typescript
const inputData = {
  repairSessionId: repairSessionId,
  title: formData.title,
  description: formData.description,
  plannedStartDate: formData.plannedStartDate,
  plannedEndDate: formData.plannedEndDate,
  estimatedHours: formData.estimatedHours,
  workInstructions: formData.workInstructions,
  assignedTechnicianId: formData.assignedTechnicianId,  ← Auto-filled with "5"
};
```

---

## WHY YOU MIGHT STILL BE GETTING THE ERROR

### Scenario 1: Wrong Business ID
**Problem:** Form is sending businessId="1" but trying to use technician ID 5 (which belongs to business 2)  
**Solution:** Verify parent component passes correct `businessId` prop

**Check in browser console:**
```javascript
// The form logs this before sending:
console.log("BusinessId:", businessId);  // Should be "2"
console.log("Technician ID:", formData.assignedTechnicianId);  // Should be "5"
```

### Scenario 2: No Employees for the Business
**Problem:** Form is for business 1, but no users assigned to business 1  
**Solution:** Either:
   - Assign users to business 1, OR
   - Use business 2 (which has user 5), OR
   - Contact backend to make `assignedTechnicianId` optional

**Check in form UI:**
```
If you see: "❌ No technicians available - Add employees to this business first"
Then: You need to add employees to this business
```

### Scenario 3: Token Authorization Issue
**Problem:** Bearer token doesn't have permissions to create job cards for this business  
**Solution:** Use a token for a business owner or admin user

**Check token:**
```bash
# Decode your JWT from storage:
echo "YOUR_TOKEN_HERE" | jq -R 'split(".")[1] | @base64d | fromjson'

# Look for:
{
  "userId": "5",
  "businessId": "2",
  "role": "OWNER" or "ADMIN"
}
```

### Scenario 4: Repair Session Doesn't Exist
**Problem:** repairSessionId doesn't exist in database  
**Solution:** Use valid repair session ID

**Check valid sessions:**
```bash
curl -X POST https://www.gixat.com/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ repairSessions(limit: 5) { id sessionNumber status } }"}' | jq '.'
```

---

## ACTION ITEMS (DO THIS NOW)

### ✅ Step 1: Frontend Code is Already Correct
No changes needed. The form already:
- Auto-selects first available employee ✓
- Sends only valid schema fields ✓
- Includes businessId separately ✓

### ⚠️ Step 2: Verify Three Things in Browser

**Open DevTools → Console, then check:**

```javascript
// 1. What businessId is being used?
businessId = "2" or "1"?

// 2. What technician is auto-selected?
assignedTechnicianId = "5" (good) or something else?

// 3. Does that technician belong to this business?
// User 5 belongs to business 2 ✓
// User 2 belongs to NO business ✗
```

**Open DevTools → Network tab, then look for GraphQL request:**

```json
{
  "variables": {
    "input": {
      "assignedTechnicianId": "5"  ← Should be 5, not 2
    },
    "businessId": "2"  ← Should be 2
  }
}
```

### 📋 Step 3: If Still Failing, Collect This Info

Tell me:
1. What's in the Network tab? (exact values being sent)
2. What does the form show for technician selection?
3. What's the exact error from backend?
4. Can you run: `echo $JWT_TOKEN` and share the decoded token?

---

## SUMMARY TABLE

| Item | Current State | Expected State | Fix |
|------|---------------|-----------------|-----|
| Schema fields | 8 fields used | 8 fields used | ✅ Correct |
| `assignedTechnicianId` required | Yes (NON_NULL) | Yes (NON_NULL) | ✅ Correct |
| User 5 → Business 2 | User 5 belongs to business 2 | User 5 belongs to business 2 | ✅ Correct |
| User 2 → Business? | User 2 has businessId=null | User 2 should have businessId | ❌ Data issue |
| Form auto-select | Selects first available | Selects first available | ✅ Correct |
| Form submission | Sends assignedTechnicianId | Sends assignedTechnicianId | ✅ Correct |
| Error message | "Technician not authorized..." | Should not appear | ⚠️ Depends on businessId |

---

## CONCLUSION

**Your frontend form implementation is CORRECT.** 

The error "Technician not authorized for this business" is occurring because:
- **Most likely:** You're submitting for a business that doesn't have valid employees
- **Or:** The wrong businessId is being sent to the backend
- **Or:** Your token doesn't have permission for that business

**Next: Check what businessId and assignedTechnicianId are actually being sent in the Network tab, then let me know.**

