# GraphQL Schema Reference
**Current Backend Schema Snapshot**  
**Date**: November 10, 2025

---

## Complete Input/Output Field Mapping

### CreateJobCardInput
**Location**: GraphQL Input Type  
**Used By**: `createJobCard` mutation  
**Total Fields**: 8  

```
┌─ REQUIRED FIELDS (Must provide) ──────────────────────┐
│                                                        │
│ 1. title: String!                                      │
│    Purpose: Job title                                  │
│    Example: "Engine Service"                          │
│    Validation: Non-empty string                       │
│                                                        │
│ 2. plannedStartDate: String!                           │
│    Purpose: When job should start                      │
│    Format: ISO 8601 DateTime                          │
│    Example: "2025-11-12T05:23:00.000Z"                │
│    Validation: Valid DateTime                         │
│                                                        │
│ 3. plannedEndDate: String!                             │
│    Purpose: When job should end                        │
│    Format: ISO 8601 DateTime                          │
│    Example: "2025-11-21T05:23:00.000Z"                │
│    Validation: Must be after startDate                │
│                                                        │
│ 4. estimatedHours: Float!                              │
│    Purpose: Hours needed for job                       │
│    Example: 50.5                                      │
│    Validation: Positive number                        │
│                                                        │
│ 5. repairSessionId: ID!                                │
│    Purpose: Which repair session                       │
│    Example: "session-123abc"                          │
│    Validation: Valid session ID                       │
│                                                        │
│ 6. assignedTechnicianId: ID!                           │
│    Purpose: Tech assigned to job                       │
│    Example: "tech-456def"                             │
│    Validation: Valid technician ID                    │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ OPTIONAL FIELDS (Can omit) ──────────────────────────┐
│                                                        │
│ 7. description: String                                 │
│    Purpose: Additional job details                     │
│    Example: "Oil change and filter replacement"       │
│                                                        │
│ 8. workInstructions: String                            │
│    Purpose: Special instructions for technician       │
│    Example: "See section 3.2 of service manual"       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### JobCard Return Type
**Location**: GraphQL Type  
**Returned By**: `createJobCard` mutation  
**Total Fields**: 25  

```
┌─ ID FIELDS ────────────────────────────────────────────┐
│ id: ID!                                                 │
│ jobNumber: String                                       │
└────────────────────────────────────────────────────────┘

┌─ CORE FIELDS (From Input) ─────────────────────────────┐
│ title: String!                                          │
│ description: String                                     │
│ workInstructions: String                                │
│ repairSessionId: ID!                                    │
│ assignedTechnicianId: ID!                               │
└────────────────────────────────────────────────────────┘

┌─ PLANNED TIMING ────────────────────────────────────────┐
│ plannedStartDate: DateTime!                             │
│ plannedEndDate: DateTime!                               │
│ estimatedHours: Float!                                  │
└────────────────────────────────────────────────────────┘

┌─ ACTUAL TIMING (Set by Backend) ────────────────────────┐
│ actualStartDate: DateTime                               │
│ actualEndDate: DateTime                                 │
│ actualHours: Float (calculated)                         │
└────────────────────────────────────────────────────────┘

┌─ COMPLETION TRACKING (⚠️ NO UPDATE MUTATION YET) ───────┐
│ completionNotes: String                                 │
│ qualityCheckNotes: String                               │
│ qualityApproved: Boolean                                │
│ qualityApprovedAt: DateTime                             │
│ qualityApprovedById: ID                                 │
└────────────────────────────────────────────────────────┘

┌─ STATUS & TRACKING ─────────────────────────────────────┐
│ status: String                                          │
│ progress: Float (0-100)                                 │
│ isOverdue: Boolean                                      │
│ daysRemaining: Int                                      │
└────────────────────────────────────────────────────────┘

┌─ AUDIT FIELDS ──────────────────────────────────────────┐
│ createdById: ID!                                        │
│ createdAt: DateTime!                                    │
│ updatedAt: DateTime!                                    │
└────────────────────────────────────────────────────────┘
```

---

### CreateInspectionInput
**Location**: GraphQL Input Type  
**Used By**: `createInspection` mutation  
**Total Fields**: 9  

```
┌─ REQUIRED FIELDS ──────────────────────────────────────┐
│                                                        │
│ 1. type: String!                                        │
│    Purpose: Inspection type                            │
│    Examples: "initial", "final", "quality"            │
│                                                        │
│ 2. title: String!                                       │
│    Purpose: Inspection title                           │
│    Example: "Pre-service Inspection"                  │
│                                                        │
│ 3. findings: String!                                    │
│    Purpose: What was found                             │
│    Example: "Brake pads worn, needs replacement"      │
│                                                        │
│ 4. passed: Boolean!                                     │
│    Purpose: Pass/fail result                           │
│    Example: true or false                              │
│                                                        │
│ 5. repairSessionId: ID!                                 │
│    Purpose: Which repair session                       │
│    Example: "session-123abc"                           │
│                                                        │
│ 6. inspectorId: ID!                                     │
│    Purpose: Who performed inspection                   │
│    Example: "tech-456def"                              │
│                                                        │
└────────────────────────────────────────────────────────┘

┌─ OPTIONAL FIELDS ──────────────────────────────────────┐
│                                                        │
│ 7. recommendations: String                              │
│    Purpose: What to do next                            │
│    Example: "Replace brake pads, check alignment"     │
│                                                        │
│ 8. mileageAtInspection: Float                           │
│    Purpose: Odometer reading                           │
│    Example: 45250.5                                    │
│                                                        │
│ 9. technicalNotes: String                               │
│    Purpose: Technical details                          │
│    Example: "Pads 2mm thickness remaining"             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### Inspection Return Type
**Location**: GraphQL Type  
**Returned By**: `createInspection` mutation  
**Total Fields**: 15  

```
┌─ ID FIELDS ────────────────────────────────────────────┐
│ id: ID!                                                 │
│ summary: String (auto-generated)                        │
└────────────────────────────────────────────────────────┘

┌─ CORE FIELDS (From Input) ─────────────────────────────┐
│ type: String!                                           │
│ title: String!                                          │
│ findings: String!                                       │
│ recommendations: String                                 │
│ technicalNotes: String                                  │
│ passed: Boolean!                                        │
│ mileageAtInspection: Float                              │
└────────────────────────────────────────────────────────┘

┌─ RELATIONSHIPS ────────────────────────────────────────┐
│ repairSessionId: ID!                                    │
│ inspectorId: ID!                                        │
└────────────────────────────────────────────────────────┘

┌─ AUTO-SET BY BACKEND ──────────────────────────────────┐
│ requiresFollowUp: Boolean (auto-set)                    │
│ inspectionDate: DateTime! (set to now)                  │
└────────────────────────────────────────────────────────┘

┌─ AUDIT FIELDS ────────────────────────────────────────┐
│ createdAt: DateTime!                                    │
│ updatedAt: DateTime!                                    │
└────────────────────────────────────────────────────────┘
```

---

## Valid Status Values

### JobCard Status
Based on schema observation, likely values:
- `pending` - Initial state
- `in-progress` - Work started
- `completed` - Work finished
- `on-hold` - Paused
- `cancelled` - Cancelled

*❓ Backend should document valid values*

### Inspection Status
Not explicitly in schema, likely:
- `passed` - Passed inspection
- `failed` - Failed inspection
- `pending-followup` - Needs follow-up

*❓ Backend should document valid values*

---

## DateTime Format Requirements

### Frontend Implementation
```typescript
// ✅ CORRECT FORMAT
const date = new Date().toISOString();
// Output: "2025-11-10T10:45:23.456Z"

// ✅ CORRECT - Manual format
const date = "2025-11-12T05:23:00.000Z";

// ❌ WRONG - Missing milliseconds
const date = "2025-11-12T05:23:00Z";

// ❌ WRONG - Wrong format
const date = "11/12/2025 5:23 AM";

// ❌ WRONG - Missing timezone
const date = "2025-11-12T05:23:00";
```

### Exact Format
```
YYYY-MM-DDTHH:MM:SS.sssZ
└──┬──┘ └──┬──┘ └──┬──┘ └┬┘
   Date    Time  Milliseconds Timezone
```

---

## Business ID Parameter

### Required For
All create mutations require separate `businessId` parameter:

```typescript
// ✅ CORRECT
const variables = {
  businessId: "biz-123",        // ← Separate parameter
  input: {
    title: "...",
    // other fields
  }
};

// ❌ WRONG - Don't include in input
const variables = {
  input: {
    businessId: "biz-123",       // ❌ Wrong location
    title: "...",
  }
};

// ❌ WRONG - Don't forget it
const variables = {
  input: {
    title: "...",
  }
};
```

### Possible Values
- Numeric: `"123456"`
- UUID: `"550e8400-e29b-41d4-a716-446655440000"`
- Alphanumeric: `"biz_abc123xyz"`

*❓ Backend should document format*

---

## Mutation Response Format

### Success Response
```json
{
  "data": {
    "createJobCard": {
      "id": "jc-123",
      "jobNumber": "JC-2025-001234",
      "title": "Engine Service",
      // ... 23 more fields
    }
  },
  "errors": null
}
```

### Error Response - Missing Required Field
```json
{
  "errors": [
    {
      "message": "Field 'title' of required type 'String!' was not provided.",
      "locations": [
        { "line": 2, "column": 3 }
      ]
    }
  ],
  "data": null
}
```

### Error Response - Invalid Input Field
```json
{
  "errors": [
    {
      "message": "Field 'completionNotes' is not defined by type 'CreateJobCardInput'",
      "locations": [
        { "line": 5, "column": 5 }
      ]
    }
  ],
  "data": null
}
```

### Error Response - Invalid Type
```json
{
  "errors": [
    {
      "message": "String cannot represent value: 123 (of type number)",
      "path": ["input", "title"],
      "locations": [
        { "line": 3, "column": 10 }
      ]
    }
  ],
  "data": null
}
```

---

## All Available Mutations

| Mutation | Input Fields | Status |
|----------|-------------|--------|
| createJobCard | 8 | ✅ Working |
| createInspection | 9 | ✅ Working |
| updateJobTaskStatus | ? | ⚠️ Untested |
| createAppointment | ? | ✅ Available |
| createBusiness | ? | ✅ Available |
| createClient | ? | ✅ Available |
| createCar | ? | ✅ Available |
| createRepairSession | ? | ✅ Available |
| createOffer | ? | ✅ Available |
| createPart | ? | ✅ Available |
| createNotification | ? | ✅ Available |
| **updateJobCard** | ? | ⚠️ **MISSING** |
| **updateInspection** | ? | ⚠️ **MISSING** |

---

## Field Nullability Summary

### JobCard
```
NOT NULL (always present):
- id, title, plannedStartDate, plannedEndDate
- estimatedHours, repairSessionId, assignedTechnicianId
- createdById, createdAt, updatedAt

NULLABLE (may be null):
- description, workInstructions
- actualStartDate, actualEndDate, actualHours
- completionNotes, qualityCheckNotes
- status, progress, isOverdue, daysRemaining
```

### Inspection
```
NOT NULL (always present):
- id, type, title, findings, passed
- inspectionDate, repairSessionId, inspectorId
- createdAt, updatedAt

NULLABLE (may be null):
- recommendations, technicalNotes, mileageAtInspection
- requiresFollowUp, summary
```

---

## Calculated Fields (Do Not Send)

These are calculated by backend - don't attempt to set them:

```
JobCard:
- jobNumber (auto-generated)
- actualHours (calculated from actual start/end)
- progress (calculated from hours)
- isOverdue (calculated from dates)
- daysRemaining (calculated from end date)
- createdAt, updatedAt (timestamps)

Inspection:
- inspectionDate (set to creation time)
- requiresFollowUp (auto-determined)
- summary (auto-generated)
- createdAt, updatedAt (timestamps)
```

---

## Permission Fields

Fields that indicate who performed actions:

```
JobCard:
- createdById: User who created
- qualityApprovedById: User who approved (if approved)

Inspection:
- inspectorId: User who performed inspection
```

*❓ Backend should document role requirements*

---

## Relationships

### JobCard → Inspection
```
One JobCard can have multiple Inspections
- inspectionId is part of repair session, not directly in JobCard
```

### JobCard → RepairSession
```
Many JobCards per RepairSession
- repairSessionId (ID!) identifies the session
- Must be valid existing session
```

### JobCard → Technician
```
JobCard assigned to one technician
- assignedTechnicianId (ID!) identifies tech
- Must be valid technician ID
```

---

## Known Issues & Gaps

| Issue | Impact | Workaround |
|-------|--------|-----------|
| No update JobCard mutation | Can't complete jobs | None |
| No update Inspection mutation | Can't modify inspections | None |
| JobCard vs JobTask confusion | Architecture unclear | None |
| Generic error messages | Poor debugging | None |
| No documented status values | Risk of invalid states | Trial and error |
| No documented permissions | Risk of 403 errors | Trial and error |

---

## Testing Checklist for Backend Team

- [ ] Verify all 8 input fields required for JobCard
- [ ] Verify all 9 input fields work for Inspection
- [ ] Implement UpdateJobCard mutation
- [ ] Implement UpdateInspection mutation
- [ ] Document valid status values
- [ ] Document permission requirements
- [ ] Verify DateTime timezone handling
- [ ] Verify calculated fields populate correctly
- [ ] Test null fields behavior
- [ ] Document JobCard vs JobTask distinction

---

## Reference Implementation (Frontend)

See `/src/lib/dashboard.queries.ts` for:
- CREATE_JOB_CARD_MUTATION - Complete working mutation
- CREATE_INSPECTION_MUTATION - Complete working mutation
- Full field documentation in mutation comments

---

**Report Generated**: November 10, 2025  
**Schema Verified**: https://www.gixat.com/api/graphql

