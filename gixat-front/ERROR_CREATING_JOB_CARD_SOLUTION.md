# Error "⚠️ Error creating job card. Please try again." - Diagnostic Guide

## Quick Answer

The generic error message is now improved! It will display the **actual error** from the backend instead of just "Please try again."

## What Changed

### ✅ Better Error Messages
Both `JobCardReportForm` and `InspectionForm` now:
1. Display the actual GraphQL error message
2. Show network/HTTP errors clearly
3. Log everything to browser console for debugging

### ✅ Debug Logging Added
Console now shows:
```javascript
// Data being sent
"JobCardReportForm - Sending data:" → shows exact input

// Response received
"JobCardReportForm - Response:" → shows API response

// GraphQL errors
"JobCardReportForm - GraphQL Error:" → shows actual error message

// Network errors
"Error creating job card:" → shows HTTP/connection errors
```

## How to Find the Real Error

1. **Open Browser DevTools**: Press `F12`
2. **Go to Console tab**
3. **Submit the form**
4. **Look for**: `"JobCardReportForm - Sending data:"` and `"JobCardReportForm - Response:"`
5. **In the Response**, look for `"errors"` array

Example console output:
```
JobCardReportForm - Sending data: {
  title: "Engine Service",
  plannedStartDate: "2025-11-10T09:00:00.000Z",
  plannedEndDate: "2025-11-10T17:00:00.000Z",
  estimatedHours: 8,
  workInstructions: "",
  repairSessionId: "abc123",
  assignedTechnicianId: "tech456"
}

JobCardReportForm - Response: {
  errors: [{
    message: "Technician with ID tech456 not found"
  }]
}
```

## Possible Real Errors

| Error Message | Cause | Solution |
|---|---|---|
| "Unauthorized" | Token expired | Log out and back in |
| "Field X cannot be null" | X field is empty | Fill in all required fields |
| "Technician not found" | Invalid technician ID | Use a valid technician ID |
| "Repair session not found" | Invalid session ID | Go back to valid repair session |
| "Invalid date format" | Date parsing failed | Check date format in console |
| "Forbidden" | Don't have permission | Check user role/permissions |
| "Internal Server Error" | Backend issue | Contact support, check backend logs |

## Required Fields to Fill

All of these must be filled:
1. ✅ **Job Title** - Text field (e.g., "Engine Service")
2. ✅ **Start Date** - DateTime picker (automatically formatted)
3. ✅ **End Date** - DateTime picker (automatically formatted)
4. ✅ **Estimated Hours** - Number field (e.g., 8)
5. ✅ **Assigned Technician ID** - Text field (must exist in database)

Optional fields:
- Description
- Work Instructions

## Testing with Real Data

To test successfully:

1. **Get a valid Technician ID**
   - Ask your admin or check the Employees section
   - Format is usually like: "emp_xxx" or "tech_xxx"

2. **Fill all required fields**:
   ```
   Title: "Engine Oil Change"
   Start: 2025-11-10 09:00
   End: 2025-11-10 17:00
   Hours: 2
   Technician: (valid ID)
   ```

3. **Submit and check console**

4. **Read the actual error** if one appears

## Files Modified

```
✅ JobCardReportForm.tsx
   - Better error display
   - Console logging for debugging
   - Error details shown in UI

✅ InspectionForm.tsx
   - Same improvements as JobCardReportForm
   - Better error handling
   - Debug logging

✅ Build: Still successful (0 errors)
```

## Example Successful Submission

Console output:
```
JobCardReportForm - Sending data: {
  title: "Engine Diagnostic",
  description: "Full engine check",
  plannedStartDate: "2025-11-10T10:00:00.000Z",
  plannedEndDate: "2025-11-10T14:00:00.000Z",
  estimatedHours: 4,
  workInstructions: "Check all systems",
  assignedTechnicianId: "tech_123",
  repairSessionId: "session_456"
}

JobCardReportForm - Response: {
  data: {
    createJobCard: {
      id: "jc_789",
      jobNumber: "JC-2025-001",
      title: "Engine Diagnostic",
      status: "PENDING"
    }
  }
}
```

UI shows: ✅ Job card saved successfully!

## Example Error Submission

Console output:
```
JobCardReportForm - Sending data: {...}

JobCardReportForm - GraphQL Error: "Technician with ID invalid_tech not found"
```

UI shows: ⚠️ Technician with ID invalid_tech not found

## Troubleshooting Checklist

- [ ] All required fields are filled
- [ ] Browser console shows the exact error message
- [ ] Technician ID is valid (check with admin)
- [ ] Repair Session ID is correct (should auto-fill)
- [ ] You're logged in (check for token in console)
- [ ] Date format is correct (YYYY-MM-DD HH:MM)
- [ ] No typos in required fields

## Next Steps

1. **Check browser console** (F12) for the real error
2. **Share that error** message to get specific help
3. **Verify all required fields** are filled
4. **Check IDs** like Technician ID are valid

The error message will now be much more helpful!

---

**Status**: ✅ IMPROVED - Error messages now show actual backend errors instead of generic message
