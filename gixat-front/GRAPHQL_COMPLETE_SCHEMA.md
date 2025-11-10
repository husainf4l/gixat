# Complete GraphQL Schema - GIXAT Repair Management

## Job Card Management

### JobCard Type (Fields)
```
id, jobNumber, title, description, status
plannedStartDate, plannedEndDate, actualStartDate, actualEndDate
estimatedHours, actualHours
workInstructions, completionNotes, qualityCheckNotes
qualityApproved, qualityApprovedAt, qualityApprovedById
assignedTechnicianId, createdById, repairSessionId
progress, isOverdue, daysRemaining
createdAt, updatedAt
```

### CreateJobCard Mutation
**Input Fields:**
- `title` (required, String)
- `description` (optional, String)
- `plannedStartDate` (required, String/DateTime)
- `plannedEndDate` (required, String/DateTime)
- `estimatedHours` (required, Float)
- `workInstructions` (optional, String)
- `assignedTechnicianId` (required, ID) - *Note: Made optional in form to avoid auth errors*
- `repairSessionId` (required, ID)

**Special Parameters:**
- `businessId` (required, ID) - *Passed separately, not in input object*

---

## Job Task Management

### JobTask Type (Fields)
```
id, title, description, division
status, orderIndex, estimatedHours, actualHours
startedAt, completedAt, workNotes, issues
requiresApproval, isApproved
jobCardId, assignedTechnicianId, approvedById
duration, isOverdue
createdAt, updatedAt
```

### CreateJobTask Mutation
**Input Fields:**
- `title` (required, String)
- `description` (optional, String)
- `division` (required, WorkDivision enum)
- `orderIndex` (required, Int) - Order of task in job card
- `estimatedHours` (required, Float)
- `requiresApproval` (required, Boolean)
- `jobCardId` (required, ID)
- `assignedTechnicianId` (required, ID) - *Could be made optional*

**Special Parameters:**
- `businessId` (optional based on pattern)

### UpdateJobTaskStatus Mutation
**Parameters:**
- `taskId` (ID)
- `input` (UpdateJobTaskStatusInput) - Contains status and notes
- `businessId` (required, ID)

---

## Part Management

### Part Type (Fields)
```
id, name, partNumber, description, brand
quantity, unitPrice, totalPrice, supplier, supplierPartNumber
status, orderedDate, expectedDeliveryDate, actualDeliveryDate
installedDate, warrantyPeriod, warrantyExpiryDate
notes, jobTaskId
isDelayed, deliveryStatus
createdAt, updatedAt
```

### CreatePart Mutation
**Input Fields:**
- `name` (required, String)
- `partNumber` (required, String)
- `description` (optional, String)
- `brand` (optional, String)
- `quantity` (required, Int)
- `unitPrice` (required, Float)
- `supplier` (optional, String)
- `expectedDeliveryDate` (optional, String/DateTime)
- `warrantyPeriod` (optional, String)
- `jobTaskId` (required, ID)

**Special Parameters:**
- `businessId` (optional based on pattern)

### UpdatePartStatus Mutation
**Parameters:**
- `partId` (ID)
- `input` (UpdatePartStatusInput) - Contains status, delivery info
- `businessId` (required, ID)

---

## Inspection Management

### Inspection Type (Fields)
```
id, type, title, findings, recommendations
mileageAtInspection, technicalNotes, passed
requiresFollowUp, inspectionDate, summary
inspectorId, repairSessionId
createdAt, updatedAt
```

### CreateInspection Mutation
**Input Fields:**
- `type` (required, InspectionType enum: INITIAL, PROGRESS, FINAL, QUALITY)
- `title` (required, String)
- `findings` (optional, String)
- `passed` (required, Boolean)
- `recommendations` (optional, String)
- `mileageAtInspection` (optional, Int)
- `technicalNotes` (optional, String)
- `repairSessionId` (required, ID)
- `inspectorId` (required, ID) - *Made optional in form*

**Special Parameters:**
- `businessId` (required, ID) - *Passed separately*

### UpdateInspection Mutation
**Parameters:**
- `id` (ID) - Inspection ID
- `businessId` (required, ID)
- `findings` (String) - Updated findings
- `recommendations` (String) - Updated recommendations
- `passed` (Boolean) - Updated pass status

### AddInspectionMedia Mutation
**Parameters:**
- `inspectionId` (ID)
- `base64File` (String) - File content in base64
- `filename` (String)
- `mimetype` (String)
- `businessId` (required, ID)

---

## Offer Management

### CreateOffer Mutation
**Input Fields:** (To be queried)

### AddOfferItem Mutation
**Parameters:**
- `offerId` (ID)
- `input` (AddOfferItemInput)
- `businessId` (required, ID)

### ApproveOffer Mutation
**Parameters:**
- `id` (ID) - Offer ID
- `businessId` (required, ID)

### RejectOffer Mutation
**Parameters:**
- `id` (ID) - Offer ID
- `businessId` (required, ID)
- `reason` (String) - Rejection reason

---

## Key Patterns

### businessId Parameter
- **ALWAYS required as separate parameter** in mutations
- Not passed inside input object
- Example: `mutation CreateJobCard($input: CreateJobCardInput!, $businessId: ID!)`

### Optional vs Required Fields
- Most "technician" and "inspector" IDs should be optional to avoid authorization errors
- Only include these in payload if they have values

### Status Enumerations
- **JobStatus**: PENDING, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
- **InspectionType**: INITIAL, PROGRESS, FINAL, QUALITY
- **WorkDivision**: (to be determined - used in JobTask)

---

## Next Steps for Implementation

1. **Add Job Task management to repair session page**
   - Tab or section to create/view job tasks
   - Link to job card

2. **Add Part management**
   - Allow parts to be added to job tasks
   - Track delivery status

3. **Add Inspection Media support**
   - Allow photos/documents to be attached to inspections

4. **Add Offer workflow**
   - Create offers from job cards
   - Add items to offers
   - Approve/reject offers

5. **Add status update workflows**
   - Update job task status
   - Update part delivery status
   - Update inspection findings

