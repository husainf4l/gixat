# GraphQL Quick Reference - GIXAT Frontend

## How to Use GraphQL Mutations in Components

### Pattern 1: Simple Mutation with businessId
```typescript
import { graphqlRequest } from "@/lib/graphql-client";
import { CREATE_INSPECTION_MUTATION } from "@/lib/dashboard.queries";

// In your component
const token = storage.getAccessToken();
const response = await graphqlRequest(
  CREATE_INSPECTION_MUTATION,
  {
    input: {
      type: "INITIAL",
      title: "Engine Inspection",
      findings: "...",
      passed: true,
      repairSessionId: "session-123",
    },
    businessId: "biz-123", // SEPARATE parameter
  },
  token
);

if (response.errors) {
  console.error("GraphQL Error:", response.errors[0]?.message);
}

if (response.data?.createInspection) {
  console.log("Success:", response.data.createInspection);
}
```

### Pattern 2: Optional Fields (Only Include if Present)
```typescript
const inputData = {
  title: "Job Card",
  description: "...",
  plannedStartDate: "2024-01-15T10:00:00Z",
  plannedEndDate: "2024-01-15T14:00:00Z",
  estimatedHours: 4,
  repairSessionId: "session-123",
  // Only include if they have values
  ...(technicianId ? { assignedTechnicianId: technicianId } : {}),
  ...(notes ? { completionNotes: notes } : {}),
};

const response = await graphqlRequest(
  CREATE_JOB_CARD_MUTATION,
  {
    input: inputData,
    businessId: businessId,
  },
  token
);
```

---

## All Available Mutations

### Job Card Mutations
| Mutation | Purpose | Requires businessId |
|----------|---------|-------------------|
| `CREATE_JOB_CARD_MUTATION` | Create new job card | YES (separate param) |
| `UPDATE_JOB_TASK_STATUS_MUTATION` | Update task progress | YES (separate param) |

### Inspection Mutations
| Mutation | Purpose | Requires businessId |
|----------|---------|-------------------|
| `CREATE_INSPECTION_MUTATION` | Create inspection | YES (separate param) |
| `UPDATE_INSPECTION_MUTATION` | Update inspection findings | YES (separate param) |
| `ADD_INSPECTION_MEDIA_MUTATION` | Add photos/docs | YES (separate param) |

### Job Task Mutations
| Mutation | Purpose | Requires businessId |
|----------|---------|-------------------|
| `CREATE_JOB_TASK_MUTATION` | Create task in job card | NO* |
| `UPDATE_JOB_TASK_STATUS_MUTATION` | Update task status | YES (separate param) |

### Part Mutations
| Mutation | Purpose | Requires businessId |
|----------|---------|-------------------|
| `CREATE_PART_MUTATION` | Create part for task | NO* |
| `UPDATE_PART_STATUS_MUTATION` | Update part delivery | YES (separate param) |

*Note: Check documentation or backend response for actual requirement

---

## Input Types Reference

### CreateJobCardInput
```typescript
{
  title: string,                    // REQUIRED
  description?: string,             // optional
  plannedStartDate: string,         // REQUIRED (ISO DateTime)
  plannedEndDate: string,           // REQUIRED (ISO DateTime)
  estimatedHours: number,           // REQUIRED (Float)
  workInstructions?: string,        // optional
  assignedTechnicianId?: string,    // optional (was required, made optional)
  repairSessionId: string,          // REQUIRED
  completionNotes?: string,         // optional
  qualityCheckNotes?: string,       // optional
}
```

### CreateInspectionInput
```typescript
{
  type: "INITIAL" | "PROGRESS" | "FINAL" | "QUALITY",  // REQUIRED
  title: string,                    // REQUIRED
  findings?: string,                // optional
  passed: boolean,                  // REQUIRED
  recommendations?: string,         // optional
  mileageAtInspection?: number,    // optional
  technicalNotes?: string,          // optional
  repairSessionId: string,          // REQUIRED
  inspectorId?: string,             // optional (was required, made optional)
}
```

### CreateJobTaskInput
```typescript
{
  title: string,                    // REQUIRED
  description?: string,             // optional
  division: string,                 // REQUIRED (WorkDivision enum)
  orderIndex: number,               // REQUIRED (Int) - Order in job card
  estimatedHours: number,           // REQUIRED (Float)
  requiresApproval: boolean,        // REQUIRED
  jobCardId: string,                // REQUIRED
  assignedTechnicianId: string,     // REQUIRED (consider making optional)
}
```

### CreatePartInput
```typescript
{
  name: string,                     // REQUIRED
  partNumber: string,               // REQUIRED
  description?: string,             // optional
  brand?: string,                   // optional
  quantity: number,                 // REQUIRED (Int)
  unitPrice: number,                // REQUIRED (Float)
  supplier?: string,                // optional
  expectedDeliveryDate?: string,    // optional (ISO DateTime)
  warrantyPeriod?: string,          // optional
  jobTaskId: string,                // REQUIRED
}
```

---

## Common Patterns & Best Practices

### 1. Always Check for Errors First
```typescript
if (response.errors) {
  const errorMsg = response.errors[0]?.message;
  if (errorMsg.includes("not authorized")) {
    // Technician/Inspector not in this business
  }
  setError(errorMsg);
  return;
}
```

### 2. Handle Optional Technician IDs
```typescript
// Good - Don't require technician ID
const inputData = {
  title: "Job Card",
  // ... other fields
  ...(formData.assignedTechnicianId ? { assignedTechnicianId: formData.assignedTechnicianId } : {}),
};
```

### 3. DateTime Handling
```typescript
// Correct format for GraphQL DateTime
const startDate = new Date().toISOString(); // "2024-01-15T10:30:00.000Z"

// Form input (datetime-local)
<input
  type="datetime-local"
  value={startDate.slice(0, 16)}
  onChange={(e) => {
    const dateTime = new Date(e.target.value).toISOString();
    setFormData(prev => ({ ...prev, plannedStartDate: dateTime }));
  }}
/>
```

### 4. businessId Always Separate
```typescript
// ❌ WRONG - businessId in input
const response = await graphqlRequest(CREATE_JOB_CARD_MUTATION, {
  input: {
    businessId: "biz-123",  // WRONG PLACE
    title: "...",
  },
}, token);

// ✅ CORRECT - businessId as separate parameter
const response = await graphqlRequest(CREATE_JOB_CARD_MUTATION, {
  input: {
    title: "...",
  },
  businessId: "biz-123",  // CORRECT - separate from input
}, token);
```

---

## Response Handling

### Successful Response
```typescript
{
  data: {
    createJobCard: {
      id: "job-123",
      jobNumber: "JC-2024-001",
      title: "Engine Service",
      status: "PENDING",
      // ... all fields
    }
  }
}
```

### Error Response
```typescript
{
  errors: [
    {
      message: "Technician not authorized for this business",
      path: ["createJobCard"],
      locations: [{ line: 1, column: 20 }]
    }
  ]
}
```

---

## Debugging Tips

1. **Check if businessId is in the request**
   - Use Network tab in DevTools
   - Look for `variables` section
   - Verify `businessId` is separate, not inside `input`

2. **Verify GraphQL is being called with token**
   - All mutations require authentication
   - Check `Authorization: Bearer <token>` header

3. **Common Errors & Solutions**
   - "Technician not authorized" → Make field optional
   - "Field required" → Add missing required field
   - "Unauthorized" → Token missing or expired

4. **Enable Debug Logging**
   - Check console for `GraphQL Request Debug` logs
   - Check console for `GraphQL Response Debug` logs

