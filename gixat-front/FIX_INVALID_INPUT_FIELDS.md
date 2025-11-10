# FIXED: Invalid Input Fields Error

## Problem
When creating a job card, the form was sending fields that are NOT valid input fields for the GraphQL mutation:

```
Variable "$input" got invalid value { ... completionNotes: "..." ... };
Field "completionNotes" is not defined by type "CreateJobCardInput".
```

## Root Cause
We added `completionNotes` and `qualityCheckNotes` fields to the form, but these are **return fields only**, not input fields. They can only be set by the backend AFTER the job card is created, not during creation.

## What Are Valid Input Fields?

**CreateJobCardInput** accepts ONLY these fields:

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `title` | String | ✅ Yes | Job card title |
| `description` | String | ❌ No | Additional description |
| `plannedStartDate` | DateTime | ✅ Yes | When work should start |
| `plannedEndDate` | DateTime | ✅ Yes | When work should end |
| `estimatedHours` | Float | ✅ Yes | Estimated hours needed |
| `workInstructions` | String | ❌ No | Instructions for technician |
| `repairSessionId` | ID | ✅ Yes | Associated repair session |
| `assignedTechnicianId` | ID | ✅ Yes* | Assigned technician (*made optional) |

## What Are Return-Only Fields?

These fields are set BY the backend, not accepted as input:

- `completionNotes` - Set when job is completed
- `qualityCheckNotes` - Set when quality check is done
- `actualStartDate` - Recorded when work actually starts
- `actualEndDate` - Recorded when work actually ends
- `actualHours` - Calculated from actual start/end times
- `status` - Managed by backend workflow
- `progress` - Calculated by backend
- `qualityApproved` - Set by quality check
- `isOverdue` - Calculated by backend

## Solution Implemented

### 1. Removed Invalid Fields from Form
**File**: `/src/components/repair-session/JobCardReportForm.tsx`

```typescript
// BEFORE (WRONG)
const [formData, setFormData] = useState({
  title: "",
  description: "",
  // ... other fields ...
  completionNotes: "",        // ❌ NOT valid input
  qualityCheckNotes: "",      // ❌ NOT valid input
});

// AFTER (CORRECT)
const [formData, setFormData] = useState({
  title: "",
  description: "",
  // ... other fields ...
  // completionNotes and qualityCheckNotes REMOVED
});
```

### 2. Removed Invalid Fields from Input Object
```typescript
// BEFORE (WRONG)
const inputData = {
  repairSessionId,
  title,
  // ... other fields ...
  completionNotes: "...",     // ❌ Will cause error
  qualityCheckNotes: "...",   // ❌ Will cause error
};

// AFTER (CORRECT)
const inputData = {
  repairSessionId,
  title,
  // ... only valid fields ...
  // completionNotes and qualityCheckNotes NOT included
};
```

### 3. Removed UI Fields
Removed the form textarea inputs for completion and quality check notes since these can't be edited during creation.

## Valid Fields to Send to Backend

```javascript
{
  repairSessionId: "session-123",
  title: "Engine Service",
  description: "Brake pad replacement and alignment",
  plannedStartDate: "2025-11-12T05:23:00.000Z",
  plannedEndDate: "2025-11-21T05:23:00.000Z",
  estimatedHours: 50,
  workInstructions: "Brake pads worn out...",
  assignedTechnicianId: "1012102"  // Optional, can be empty
}
```

## Build Status

✅ **Compiled Successfully** - 0 errors
✅ **All Types Valid** - No TypeScript errors
✅ **Ready to Deploy** - No breaking changes

## How to Fix Similar Issues

When you get an error like:
```
Field "fieldName" is not defined by type "CreateXxxInput"
```

**This means**: That field is NOT accepted as input. It's likely a return-only field.

**What to do**:
1. Remove the field from the form
2. Remove it from the input object
3. Remove the form UI element for that field

## Testing

The form will now work correctly:
1. User fills in: title, description, dates, hours, instructions, technician ID
2. Form sends ONLY these valid fields to backend
3. Backend returns the full job card with all fields (including completion notes)
4. Backend manages completion/quality fields through other mutations

## Related Mutations

If you need to update these fields later:
- Use `UPDATE_INSPECTION_MUTATION` for inspection findings
- Use `UPDATE_JOB_TASK_STATUS_MUTATION` for task notes
- These separate mutations handle the return-only fields

## Files Changed

1. `/src/components/repair-session/JobCardReportForm.tsx`
   - Removed invalid input fields from state
   - Removed invalid fields from input object
   - Removed UI form fields

2. `/src/lib/dashboard.queries.ts`
   - Updated mutation documentation
   - Clarified which fields are input vs return

## Key Takeaway

✅ **Input Fields** - What you SEND to backend when creating
❌ **Return Fields** - What backend RETURNS after creation

Don't mix them up! Only send valid input fields.

---

**Status**: ✅ FIXED
**Date**: November 10, 2025
**Build**: Passing with 0 errors

