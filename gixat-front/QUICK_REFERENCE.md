# Quick Reference Card

## UPDATE MUTATIONS AVAILABLE ✅

### UpdateJobCard
```typescript
// Parameters
{
  jobCardId: string,
  businessId: string,
  input: {
    completionNotes?: string,
    qualityCheckNotes?: string,
    qualityApproved?: boolean,
    // ... other optional fields
  }
}

// Import
import { UPDATE_JOB_CARD_MUTATION } from "@/lib/dashboard.queries";

// Usage
await client.mutate({
  mutation: UPDATE_JOB_CARD_MUTATION,
  variables: {
    jobCardId: "jc-123",
    businessId: "biz-456",
    input: {
      completionNotes: "Work completed",
      qualityCheckNotes: "Passed QA",
      qualityApproved: true
    }
  }
});
```

### UpdateInspection
```typescript
// Parameters
{
  inspectionId: string,
  businessId: string,
  input: {
    findings?: string,
    recommendations?: string,
    passed?: boolean,
    mileageAtInspection?: number,
    technicalNotes?: string
  }
}

// Import
import { UPDATE_INSPECTION_MUTATION } from "@/lib/dashboard.queries";

// Usage
await client.mutate({
  mutation: UPDATE_INSPECTION_MUTATION,
  variables: {
    inspectionId: "insp-789",
    businessId: "biz-456",
    input: {
      findings: "Engine wear found",
      recommendations: "Full service needed",
      passed: false,
      technicalNotes: "Compression low"
    }
  }
});
```

## ✅ Verified on Backend

```
https://www.gixat.com/api/graphql

Query used:
{ __type(name: "Mutation") { fields { name } } }

Result:
✓ updateJobCard
✓ updateInspection
```

## Build Status
```bash
npm run build
✓ Compiled successfully in 4.0s
✓ Generating static pages (37/37)
✓ 0 errors
```

## Files in Your Project
- `/src/lib/dashboard.queries.ts` - Line 966, 1016
- Properly documented with JSDoc comments
- All fields typed correctly
- Ready to use

---

**Generated**: November 10, 2025  
**Status**: ✅ PRODUCTION READY

