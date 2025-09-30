# Gixat Database Schema Documentation

## Overview
Gixat uses a PostgreSQL database with a multi-tenant architecture. Each organization has its own isolated data, while sharing the same database structure.

## Core Tables

### Organization (gixat_organization)
**Purpose**: Represents garage businesses using the system

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| name | CharField(200) | Organization name |
| address | TextField | Physical address |
| phone | CharField(20) | Contact phone |
| email | EmailField | Contact email |
| registration_number | CharField(50) | Unique business registration |
| timezone | CharField(50) | Organization timezone (default: UTC) |
| currency | CharField(10) | Currency code (default: USD) |
| auto_backup | BooleanField | Auto backup enabled flag |
| created_at | DateTimeField | Record creation timestamp |
| updated_at | DateTimeField | Last update timestamp |
| is_active | BooleanField | Active status flag |

**Indexes**:
- `idx_organization_registration_number` on `registration_number`

---

### UserProfile (gixat_userprofile)
**Purpose**: Extends Django User model with organization and role information

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| user_id | OneToOneField | Django User reference |
| organization_id | ForeignKey | Organization reference |
| role | CharField(20) | User role (admin, manager, technician, receptionist) |
| phone | CharField(20) | User phone number |
| employee_id | CharField(50) | Internal employee identifier |
| hire_date | DateField | Employment start date |
| email_notifications | BooleanField | Email notification preference |
| sms_notifications | BooleanField | SMS notification preference |
| is_active | BooleanField | Active status flag |

**Relationships**:
- One-to-one with Django User
- Many-to-one with Organization

---

### Client (gixat_client)
**Purpose**: Customer information management

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| organization_id | ForeignKey | Organization reference |
| first_name | CharField(100) | Client first name |
| last_name | CharField(100) | Client last name |
| email | EmailField | Client email address |
| phone | CharField(20) | Client phone number |
| address | TextField | Client address |
| date_of_birth | DateField | Client birth date |
| created_at | DateTimeField | Record creation timestamp |
| updated_at | DateTimeField | Last update timestamp |
| is_active | BooleanField | Active status flag |

**Properties**:
- `full_name`: Returns concatenated first and last name

**Indexes**:
- `idx_client_organization_name` on `organization_id, first_name, last_name`
- `idx_client_phone` on `phone`
- `idx_client_email` on `email`

---

### Car (gixat_car)
**Purpose**: Vehicle information and maintenance history

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| organization_id | ForeignKey | Organization reference |
| client_id | ForeignKey | Client/owner reference |
| make | CharField(50) | Vehicle manufacturer |
| model | CharField(50) | Vehicle model |
| year | PositiveIntegerField | Manufacturing year |
| color | CharField(30) | Vehicle color |
| license_plate | CharField(20) | Unique license plate |
| vin | CharField(17) | Vehicle identification number |
| engine_number | CharField(50) | Engine serial number |
| fuel_type | CharField(20) | Fuel type (petrol, diesel, electric, hybrid) |
| mileage | PositiveIntegerField | Current mileage in kilometers |
| photo | ImageField | Vehicle photo |
| created_at | DateTimeField | Record creation timestamp |
| updated_at | DateTimeField | Last update timestamp |
| is_active | BooleanField | Active status flag |

**Constraints**:
- `license_plate` must be unique
- `vin` must be unique (when provided)

**Indexes**:
- `idx_car_license_plate` on `license_plate`
- `idx_car_organization_client` on `organization_id, client_id`
- `idx_car_make_model` on `make, model, year`

---

### Session (gixat_session)
**Purpose**: Repair/maintenance session management

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| organization_id | ForeignKey | Organization reference |
| car_id | ForeignKey | Vehicle reference |
| technician_id | ForeignKey | Assigned technician (UserProfile) |
| session_number | CharField(50) | Auto-generated unique session ID |
| scheduled_date | DateTimeField | Planned start date/time |
| expected_end_date | DateTimeField | Expected completion date/time |
| actual_start_time | DateTimeField | Actual work start time |
| actual_end_time | DateTimeField | Actual completion time |
| status | CharField(20) | Current status (scheduled, in_progress, completed, cancelled) |
| description | TextField | Initial work description |
| notes | TextField | Session notes and updates |
| estimated_cost | DecimalField(10,2) | Estimated total cost |
| actual_cost | DecimalField(10,2) | Final actual cost |
| job_type | CharField(50) | Type of work (maintenance, repair, inspection) |
| created_at | DateTimeField | Record creation timestamp |
| updated_at | DateTimeField | Last update timestamp |

**Properties**:
- `duration`: Calculated time between start and end

**Session Number Format**: `SES{YYYYMMDD}-{001}`

**Indexes**:
- `idx_session_organization_status` on `organization_id, status`
- `idx_session_technician_status` on `technician_id, status`
- `idx_session_scheduled_date` on `scheduled_date`
- `idx_session_created_at` on `created_at`

---

### JobCard (gixat_jobcard)
**Purpose**: Individual tasks within a repair session

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| session_id | ForeignKey | Parent session reference |
| job_number | CharField(50) | Unique job identifier |
| title | CharField(200) | Job title/summary |
| description | TextField | Detailed job description |
| priority | CharField(20) | Priority level (low, medium, high, urgent) |
| status | CharField(20) | Job status (pending, in_progress, completed, on_hold) |
| assigned_technician_id | ForeignKey | Assigned technician |
| estimated_hours | DecimalField(5,2) | Estimated work hours |
| actual_hours | DecimalField(5,2) | Actual work hours |
| parts_cost | DecimalField(10,2) | Total parts cost |
| labor_cost | DecimalField(10,2) | Labor cost |
| started_at | DateTimeField | Job start timestamp |
| completed_at | DateTimeField | Job completion timestamp |
| notes | TextField | Job-specific notes |
| created_at | DateTimeField | Record creation timestamp |
| updated_at | DateTimeField | Last update timestamp |

**Indexes**:
- `idx_jobcard_session_status` on `session_id, status`
- `idx_jobcard_technician_status` on `assigned_technician_id, status`

---

### Inventory (gixat_inventory)
**Purpose**: Parts and supplies inventory management

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| organization_id | ForeignKey | Organization reference |
| part_number | CharField(50) | Unique part identifier |
| name | CharField(200) | Part/item name |
| description | TextField | Detailed description |
| category | CharField(100) | Item category |
| quantity | PositiveIntegerField | Current stock quantity |
| min_quantity | PositiveIntegerField | Minimum stock threshold |
| unit_price | DecimalField(10,2) | Unit price |
| supplier | CharField(200) | Supplier information |
| location | CharField(100) | Storage location/bin |
| created_at | DateTimeField | Record creation timestamp |
| updated_at | DateTimeField | Last update timestamp |

**Properties**:
- `is_low_stock`: Returns True if quantity <= min_quantity

**Indexes**:
- `idx_inventory_part_number` on `part_number`
- `idx_inventory_organization_category` on `organization_id, category`
- `idx_inventory_low_stock` on `organization_id, quantity, min_quantity`

---

### Inspection (gixat_inspection)
**Purpose**: Vehicle inspection management

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| organization_id | ForeignKey | Organization reference |
| car_id | ForeignKey | Vehicle reference |
| inspector_id | ForeignKey | Inspector (UserProfile) |
| inspection_number | CharField(50) | Auto-generated inspection ID |
| scheduled_date | DateTimeField | Planned inspection date |
| actual_start_time | DateTimeField | Actual start time |
| actual_end_time | DateTimeField | Actual completion time |
| status | CharField(20) | Status (scheduled, in_progress, completed, waiting_approval, approved, rejected) |
| overall_condition | TextField | General condition summary |
| recommendations | TextField | Recommended actions |
| estimated_cost | DecimalField(10,2) | Estimated repair cost |
| client_approved | BooleanField | Client approval status |
| client_notes | TextField | Client feedback/notes |
| created_at | DateTimeField | Record creation timestamp |
| updated_at | DateTimeField | Last update timestamp |

**Inspection Number Format**: `INS{YYYYMMDD}-{001}`

**Indexes**:
- `idx_inspection_organization_status` on `organization_id, status`
- `idx_inspection_scheduled_date` on `scheduled_date`

---

### InspectionItem (gixat_inspectionitem)
**Purpose**: Individual inspection findings for vehicle components

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| inspection_id | ForeignKey | Parent inspection reference |
| component | CharField(100) | Component name (brakes, engine, etc.) |
| condition | CharField(20) | Condition (excellent, good, fair, poor, critical) |
| notes | TextField | Detailed findings |
| needs_repair | BooleanField | Repair required flag |
| estimated_repair_cost | DecimalField(10,2) | Estimated repair cost |

---

### Notification (gixat_notification)
**Purpose**: System notifications and alerts

| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| organization_id | ForeignKey | Organization reference |
| user_id | ForeignKey | Target user |
| title | CharField(200) | Notification title |
| message | TextField | Notification content |
| notification_type | CharField(20) | Type (info, warning, error, success) |
| is_read | BooleanField | Read status |
| related_session_id | ForeignKey | Related session (optional) |
| related_inspection_id | ForeignKey | Related inspection (optional) |
| related_inventory_id | ForeignKey | Related inventory item (optional) |
| created_at | DateTimeField | Notification timestamp |

**Indexes**:
- `idx_notification_user_read` on `user_id, is_read`
- `idx_notification_created_at` on `created_at`

---

## Relationships Diagram

```
Organization (1) ──── (M) UserProfile
    │
    ├── (M) Client (1) ──── (M) Car
    │                         │
    ├── (M) Inventory         ├── (M) Session (1) ──── (M) JobCard
    │                         │                           │
    ├── (M) Notification      └── (M) Inspection (1) ──── (M) InspectionItem
    │
    └── (M) [All other entities are organization-scoped]
```

## Data Isolation

The multi-tenant architecture ensures data isolation through:
1. **Organization-scoped models**: All main entities include `organization_id`
2. **View-level filtering**: All queries filter by user's organization
3. **Permission checking**: Role-based access within organization boundaries

## Performance Optimizations

### Indexes
- Composite indexes for common query patterns
- Single-column indexes for frequent lookups
- Covering indexes for dashboard queries

### Query Optimization
- `select_related()` for foreign key relationships
- `prefetch_related()` for reverse foreign keys and many-to-many
- Optimized dashboard queries with aggregations
- Cached statistics for expensive calculations

### Caching Strategy
- Dashboard statistics cached for 5 minutes
- User permissions cached for 30 minutes
- Session data cached per request
- Query result caching for reports

## Backup and Maintenance

### Automated Backups
- Daily full database backups
- Transaction log backups every 15 minutes
- Retention: 30 days for full backups, 7 days for logs

### Maintenance Tasks
- Weekly `VACUUM ANALYZE` for query optimization
- Monthly index maintenance and statistics updates
- Quarterly performance analysis and index tuning

## Security Considerations

### Data Protection
- All sensitive fields encrypted at rest
- Connection encryption (TLS)
- Regular security audits
- GDPR compliance for data retention

### Access Control
- Organization-level data isolation
- Role-based permissions
- Audit logging for all data changes
- Session timeout and secure authentication

---

*Last updated: September 30, 2025*
*Version: 2.0*