# Gixat User Manual
**Version 2.0 - September 30, 2025**

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Clients & Vehicles](#managing-clients--vehicles)
5. [Repair Sessions](#repair-sessions)
6. [Inventory Management](#inventory-management)
7. [Inspections](#inspections)
8. [Reports & Analytics](#reports--analytics)
9. [Settings & Configuration](#settings--configuration)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First-Time Login
1. Navigate to your Gixat URL (provided by your administrator)
2. Click "Login" in the top right corner
3. Enter your username and password
4. If this is your first login, you'll be prompted to change your password

### Password Requirements
Your password must meet the following criteria:
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one lowercase letter  
- Contains at least one number
- Contains at least one special character (!@#$%^&*(),.?":{}|<>)
- Cannot contain common patterns like "123", "abc", "qwerty"
- Cannot contain your personal information

### Navigation
The main navigation menu is located on the left side of the screen:
- **Dashboard**: Overview of your garage operations
- **Repair Sessions**: Manage all repair and maintenance work
- **Inventory**: Track parts and supplies
- **Clients & Vehicles**: Manage customer information
- **Inspections**: Vehicle examination records
- **Reports**: Analytics and performance metrics
- **Settings**: System configuration and preferences

---

## User Roles & Permissions

### Administrator
**Full system access including:**
- All CRUD operations on sessions, clients, inventory
- User management and role assignment
- System settings and configuration
- Financial reports and analytics
- Organization settings

### Manager
**Supervisory access including:**
- Create and manage repair sessions
- View and edit client information
- Inventory management (with approval limits)
- Team performance reports
- Most system settings

### Technician
**Operational access including:**
- View assigned repair sessions
- Update job progress and status
- Add notes and photos to jobs
- View inventory (read-only)
- Create inspection records
- Time tracking for jobs

### Receptionist
**Customer-facing access including:**
- Create new client requests
- Schedule appointments
- Add new clients and vehicles
- View session status (read-only)
- Basic inventory viewing

---

## Dashboard Overview

The dashboard provides a real-time overview of your garage operations.

### Key Performance Indicators (KPIs)
- **Cars in Garage**: Currently active vehicles
- **Active Sessions**: Jobs currently in progress
- **Pending Requests**: Scheduled but not started jobs
- **Revenue Today/Month**: Financial performance metrics

### Active Sessions Table
Shows current work with:
- Client name and vehicle information
- Job type and assigned technician
- Current status and time in garage
- Quick action buttons for common tasks

### Recent Activity
- Latest session updates
- New client requests
- Inventory alerts
- System notifications

### Quick Actions
Floating action buttons provide quick access to:
- New Client Request
- Add Vehicle
- Add Inventory Item
- New Inspection

---

## Managing Clients & Vehicles

### Adding a New Client

1. Click "New Client Request" or navigate to Clients section
2. Fill in client information:
   - **First Name** and **Last Name** (required)
   - **Phone Number** (required)
   - **Email Address** (optional but recommended)
   - **Address** (optional)
3. Click "Save" to create the client

### Adding a Vehicle

1. From the client detail page, click "Add Vehicle"
2. Enter vehicle information:
   - **Make** and **Model** (required)
   - **Year** (required)
   - **License Plate** (required, must be unique)
   - **VIN** (optional but recommended)
   - **Color**, **Engine Number**, **Fuel Type**
   - **Current Mileage**
3. Upload a vehicle photo if available
4. Click "Save" to add the vehicle

### Searching Clients/Vehicles
- Use the search bar to find clients by name, phone, or email
- Search vehicles by make, model, license plate, or VIN
- Use filters to narrow results by criteria

---

## Repair Sessions

### Creating a New Session

1. Click "New Client Request" from dashboard or sessions page
2. **Select or Create Client**:
   - Choose existing client from dropdown, OR
   - Enter new client information
3. **Select or Create Vehicle**:
   - Choose existing vehicle from dropdown, OR
   - Enter new vehicle details
4. **Session Details**:
   - **Job Type**: Select type of work (maintenance, repair, inspection)
   - **Description**: Describe the work to be performed
   - **Scheduled Date**: When work should start
   - **Estimated Cost**: Expected total cost
   - **Assigned Technician**: Select technician for the job
5. Click "Create Session" to save

### Session Workflow

**Session Statuses:**
- **Scheduled**: Work is planned but not started
- **In Progress**: Work is currently being performed
- **Completed**: All work finished and ready for pickup
- **Cancelled**: Session was cancelled

**Updating Session Status:**
1. Navigate to the session detail page
2. Click the appropriate status button:
   - "Start Session" to begin work
   - "Complete Session" when finished
   - "Cancel Session" if needed
3. Add notes about the status change
4. Click "Update Status"

### Job Cards

Each session can have multiple job cards (individual tasks):

**Creating Job Cards:**
1. From session detail page, click "Add Job Card"
2. Enter job details:
   - **Title**: Brief description
   - **Description**: Detailed task description
   - **Priority**: Low, Medium, High, or Urgent
   - **Estimated Hours**: Expected time to complete
   - **Assigned Technician**: Who will perform the work
3. Click "Save Job Card"

**Updating Job Progress:**
1. Open the job card
2. Update fields as work progresses:
   - **Status**: Pending → In Progress → Completed
   - **Actual Hours**: Time actually spent
   - **Notes**: Progress updates and findings
3. Add photos or documents as needed
4. Click "Update Job Card"

### Adding Parts to Sessions

1. From session detail page, click "Add Parts"
2. Search for parts by name or part number
3. Enter quantity needed
4. Parts will be automatically reserved from inventory
5. When job is completed, parts will be marked as consumed

---

## Inventory Management

### Adding Inventory Items

1. Navigate to Inventory section
2. Click "Add Inventory Item"
3. Enter item details:
   - **Part Number**: Unique identifier (required)
   - **Name**: Item name (required)
   - **Category**: Group classification
   - **Quantity**: Current stock amount
   - **Minimum Quantity**: Low stock threshold
   - **Unit Price**: Cost per item
   - **Supplier**: Vendor information
   - **Location**: Storage location/bin

### Managing Stock Levels

**Stock Operations:**
- **Receive**: Add new inventory when delivered
- **Adjust**: Correct quantity discrepancies
- **Transfer**: Move items between locations
- **Reserve**: Allocate to specific sessions

**Low Stock Alerts:**
- Items below minimum quantity appear in red
- Dashboard shows low stock notifications
- Consider reordering when inventory is low

### Inventory Reports

View inventory analytics:
- **Stock Levels**: Current quantities by category
- **Usage Patterns**: Most frequently used parts
- **Value Reports**: Total inventory value
- **Reorder Suggestions**: Items needing restocking

---

## Inspections

### Creating Vehicle Inspections

1. Click "New Inspection" from dashboard or inspections page
2. Select vehicle for inspection
3. Schedule inspection date and time
4. Assign inspector (technician)
5. Click "Create Inspection"

### Conducting Inspections

1. Open the inspection record
2. Click "Start Inspection"
3. For each vehicle component:
   - Select condition (Excellent, Good, Fair, Poor, Critical)
   - Add notes about findings
   - Mark if repairs are needed
   - Estimate repair costs if applicable
4. Add overall condition summary
5. Include recommendations for client
6. Upload photos of any issues found
7. Click "Complete Inspection"

### Inspection Components

Standard inspection items include:
- **Engine**: Oil, belts, hoses, fluids
- **Brakes**: Pads, rotors, fluid, lines
- **Tires**: Tread depth, wear patterns, pressure
- **Electrical**: Battery, alternator, lights
- **Body**: Exterior condition, paint, dents
- **Interior**: Seats, controls, safety equipment

### Client Approval Process

1. After inspection completion, generate client report
2. Send report to client via email or print
3. Client can approve recommended work
4. Approved items can be converted to repair sessions

---

## Reports & Analytics

### Accessing Reports

Navigate to Reports section to view various analytics:

### Dashboard Reports
- **Revenue Tracking**: Daily, weekly, monthly income
- **Session Analytics**: Completion rates, average duration
- **Technician Performance**: Jobs completed, efficiency metrics
- **Inventory Analytics**: Usage patterns, stock levels

### Generating Custom Reports

1. Select report type from dropdown
2. Choose date range
3. Apply filters (technician, client, service type)
4. Click "Generate Report"
5. Export options: PDF, Excel, CSV

### Key Metrics to Monitor

- **Average Repair Time**: How long jobs typically take
- **On-Time Completion Rate**: Sessions finished by scheduled date
- **Revenue per Session**: Average job value
- **Inventory Turnover**: How quickly parts are used
- **Client Satisfaction**: Based on feedback scores
- **Technician Utilization**: Work distribution across team

---

## Settings & Configuration

### User Profile Settings

Access via Settings menu:
- **Personal Information**: Name, email, phone
- **Password Change**: Update login credentials
- **Notification Preferences**: Email and SMS settings
- **Language and Timezone**: Regional preferences

### Organization Settings (Admin Only)

- **Business Information**: Name, address, contact details
- **System Preferences**: Currency, timezone, date formats
- **User Management**: Add/remove users, assign roles
- **Backup Settings**: Automated backup preferences
- **Email Configuration**: SMTP settings for notifications

### Security Settings

- **Session Timeout**: Automatic logout timing
- **Password Policies**: Complexity requirements
- **Two-Factor Authentication**: Enhanced security options
- **Audit Logging**: Track system changes

---

## Troubleshooting

### Common Issues

**Cannot Login:**
- Verify username and password are correct
- Check if account is active
- Try password reset if needed
- Contact administrator if issue persists

**Slow Performance:**
- Check internet connection
- Clear browser cache and cookies
- Try different browser
- Contact support if problem continues

**Missing Data:**
- Verify you have correct permissions
- Check if filters are applied
- Ensure you're viewing correct date range
- Contact administrator if data is missing

**Email Notifications Not Working:**
- Check email settings in profile
- Verify email address is correct
- Check spam/junk folder
- Contact administrator for system email configuration

### Getting Help

**In-App Support:**
- Click "?" icon for contextual help
- Check tooltips on form fields
- Review error messages for guidance

**Contact Support:**
- Email: support@gixat.com
- Phone: [Your support number]
- Help desk: [Your help desk URL]

### Best Practices

**Data Entry:**
- Always fill in required fields completely
- Use consistent naming conventions
- Add detailed notes for future reference
- Upload photos when helpful
- Double-check important information

**Session Management:**
- Update session status promptly
- Communicate with clients about delays
- Document all work performed
- Add parts used to track inventory
- Complete jobs in a timely manner

**Inventory Management:**
- Perform regular stock counts
- Update quantities when receiving shipments
- Set appropriate minimum stock levels
- Review usage patterns regularly
- Maintain supplier contact information

---

## Keyboard Shortcuts

- **Ctrl + N**: New Client Request
- **Ctrl + S**: Save current form
- **Ctrl + F**: Search/Find
- **Ctrl + R**: Refresh page
- **Esc**: Close modal dialogs
- **Tab**: Navigate between form fields

---

## Browser Compatibility

Gixat works best with modern browsers:
- **Chrome** 90+ (Recommended)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

**Mobile Browsers:**
- Chrome Mobile
- Safari Mobile
- Samsung Internet

---

*For technical support or additional training, please contact your system administrator or Gixat support team.*

**Document Version**: 2.0  
**Last Updated**: September 30, 2025  
**Next Review**: December 30, 2025