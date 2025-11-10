# How to Debug "Error creating job card" Error

## ✅ What We've Fixed
1. DateTime formatting - now uses proper ISO format
2. Field validation - all required fields are present
3. businessId issue - removed unnecessary field
4. Error messages - now display actual GraphQL errors

## 🔍 How to Diagnose the Actual Error

### Step 1: Open Browser Developer Tools
1. Press `F12` to open Developer Tools
2. Go to the **Console** tab
3. Look for messages starting with:
   - `"JobCardReportForm - Sending data:"` - shows what's being sent
   - `"JobCardReportForm - Response:"` - shows the response
   - `"JobCardReportForm - GraphQL Error:"` - shows the actual error

### Step 2: Check What's Being Sent
In the Console, you'll see output like:
```javascript
JobCardReportForm - Sending data: {
  "title": "Engine Service",
  "description": "",
  "plannedStartDate": "2025-11-10T09:00:00.000Z",
  "plannedEndDate": "2025-11-10T17:00:00.000Z",
  "estimatedHours": 8,
  "workInstructions": "",
  "repairSessionId": "session-123",
  "assignedTechnicianId": "tech-456"
}
```

### Step 3: Check the Response
Look for:
```javascript
JobCardReportForm - Response: {
  "errors": [
    {
      "message": "Actual error message from backend"
    }
  ]
}
```

## Common Errors & Solutions

### Error 1: "Unauthorized"
**Cause**: Token is expired or invalid
**Solution**: Log out and log back in

### Error 2: "Field X cannot be null"
**Cause**: Required field is empty or null
**Solution**: Fill in all required fields (marked with *)
- Job Title
- Start Date
- End Date
- Estimated Hours
- Assigned Technician ID

### Error 3: "Invalid date format"
**Cause**: DateTime format is wrong
**Solution**: Use datetime-local input (should be formatted as YYYY-MM-DDTHH:MM)
- The form handles this automatically
- Check console to see what format is being sent

### Error 4: "Repair session not found"
**Cause**: Session ID doesn't exist or is invalid
**Solution**: Verify you're on a valid repair session detail page

### Error 5: "Technician not found"
**Cause**: Assigned Technician ID doesn't exist
**Solution**: Use a valid technician ID

## 📋 Checklist Before Submitting

- [ ] Job Title is filled (not empty)
- [ ] Start Date is selected
- [ ] End Date is selected
- [ ] Estimated Hours has a value (> 0)
- [ ] Assigned Technician ID is filled
- [ ] You are logged in (have a valid token)
- [ ] You're viewing an actual repair session

## 🛠️ If Error Still Occurs

1. **Open Console** (F12)
2. **Fill the form** with all required fields
3. **Submit** the form
4. **Copy** the console output
5. **Check** for these specific fields in the sent data:
   - `title`: Should not be empty
   - `plannedStartDate`: Should be ISO format (e.g., "2025-11-10T09:00:00.000Z")
   - `plannedEndDate`: Should be ISO format
   - `estimatedHours`: Should be a number > 0
   - `repairSessionId`: Should be a valid ID
   - `assignedTechnicianId`: Should be a valid ID

## 🐛 Debug Info Available

The forms now log:

**Before sending**:
```
JobCardReportForm - Sending data: [full data structure]
```

**After response**:
```
JobCardReportForm - Response: [full response]
```

**If GraphQL error**:
```
JobCardReportForm - GraphQL Error: [actual error message]
```

**If JavaScript error**:
```
Error creating job card: [Error message]
```

## Example: Successful Flow

1. Console shows: `"JobCardReportForm - Sending data: {...}"`
2. Console shows: `"JobCardReportForm - Response: {data: {createJobCard: {...}}}"`
3. Form displays: `"✅ Job card saved successfully!"`
4. Form resets and clears

## Example: Error Flow

1. Console shows: `"JobCardReportForm - Sending data: {...}"`
2. Console shows: `"JobCardReportForm - Response: {errors: [{message: "Field X cannot be null"}]}"`
3. Form displays: `"⚠️ Field X cannot be null"`

## Quick Fixes to Try

1. **Refresh the page** - Reload and try again
2. **Log out and back in** - Reset your authentication
3. **Check all required fields** - Make sure none are empty
4. **Use valid IDs** - Check that technician ID exists
5. **Check console** - Look for exact error message

## Still Having Issues?

Share the console output (F12 → Console tab) which shows:
- What data was sent
- What error was returned
- Any JavaScript errors

This will help identify the exact issue.
