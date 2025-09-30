
# Gixat — Product Requirements Document (PRD)
**Module Focus:** Repair Sessions & Core Garage Management
**Version:** v2.0 (2025‑09‑30) — Enhanced with Django Implementation Details
**Owner:** Husain (Product Lead)
**Timezone:** Asia/Amman (UTC+03)
**Primary Languages:** English, Arabic (RTL support)
**Currency:** JOD by default; multi‑currency capable
**Technology Stack:** Django 5.2.6, PostgreSQL, Tailwind CSS, Django REST Framework (planned)

---

## 1) Executive Summary
Gixat is a modern garage/workshop management system designed for auto repair shops. It streamlines day‑to‑day operations (check‑in, diagnostics, repair sessions, inventory, invoicing, scheduling, and client updates) while providing KPIs and analytics for owners. The MVP prioritizes **Repair Sessions**, **Work Orders**, **Inventory**, **Billing**, and a **Garage Staff Dashboard**. Target platforms: **Web Admin (Django Templates + Tailwind CSS)** and **Mobile App (Flutter)**. Backend: **Django** with **PostgreSQL**.

**Current Implementation Status (v2.0):**
- ✅ Django backend with PostgreSQL database
- ✅ Multi-tenant organization architecture
- ✅ Complete repair session management system
- ✅ Comprehensive inventory and parts tracking
- ✅ Client and vehicle management
- ✅ User authentication and role-based access
- ✅ Real-time dashboard with KPIs
- ✅ Invoice generation and reporting
- ✅ Mobile-responsive UI with Tailwind CSS

---

## 2) Goals & Non‑Goals
### Goals
1. Reduce repair turnaround time by 20–30% via guided workflows.
2. Increase transparency to clients (status updates, photo/video evidence, digital approvals).
3. Keep real‑time visibility for managers: job load, overdue risks, inventory shortages, revenue.
4. Make parts usage traceable to each job for accurate cost & profitability.
5. **Achieved:** Complete digital transformation of garage operations with real-time tracking.

### Non‑Goals (v1)
- Advanced accounting (IFRS) beyond basic invoices & payments (future Ovovex/ERP integration).
- Complex HR (payroll/attendance); only mechanic assignment & basic productivity.
- Multi‑branch consolidated analytics (Phase 2+).

---

## 3) Users & Personas
- **Service Advisor / Front Desk**: Creates requests, opens sessions, gets approvals, issues invoices, closes jobs.
- **Mechanic / Technician**: Views assigned tasks, adds notes, logs time, attaches media, confirms parts used.
- **Parts Manager / Storekeeper**: Manages stock, reservations, purchases, and stock audits.
- **Garage Manager / Owner**: Monitors KPIs, sets prices, approves discounts, views productivity & profit.
- **Client (External)**: Receives quotes/approvals, job updates, invoices, and feedback requests (via web link/SMS/WhatsApp).

**User Journey Examples:**
- **Mechanic Daily Flow:** Login → View assigned jobs → Start session → Log time → Add parts used → Upload photos → Complete tasks → Mark session ready
- **Manager Daily Flow:** Dashboard KPIs → Review overdue jobs → Approve high-value quotes → Monitor inventory alerts → Generate reports
- **Client Journey:** Book appointment → Receive status updates → Approve additional work → Receive invoice → Provide feedback

---

## 4) Success Metrics (KPIs)
- Avg. **Time to Diagnose** (check‑in → diagnosis).
- Avg. **Repair Duration** (start → completion).
- **On‑time Delivery Rate**.
- **First‑time Fix Rate** (no return within X days).
- **Parts Stockout Events** (weekly).
- **Revenue Today/Month**, **Gross Margin** (parts vs labor).
- **Customer Satisfaction** (1–5 rating).
- **Digital Adoption Rate** (percentage of paperless operations).
- **Average Session Value** and **Profit Margins per Service Type**.

---

## 5) High‑Level Scope / Modules
1. **Dashboard (Garage Staff)** — Real-time KPIs and quick actions
2. **Repair Sessions** (core workflow) — Complete session lifecycle management
3. **Work Orders / Requests** (Kanban) — Request intake and workflow management
4. **Inspections** (templates, findings, media) — Vehicle inspection system
5. **Inventory** (stock, reservations, reorders) — Parts and inventory management
6. **Billing & Payments** (quotes, invoices, discounts, taxes, receipts) — Financial operations
7. **Scheduling** (appointments, bays, mechanics) — Resource allocation
8. **Notifications** (client & internal) — Communication system
9. **Reports & Analytics** — Business intelligence and reporting
10. **Admin & Settings** (roles, prices, taxes, templates, locales) — System configuration

---

## 6) Detailed Functional Requirements

### 6.1 Dashboard (Garage Staff)
- **KPI tiles**: Cars in Garage, Pending Requests, Inspections in Progress, Jobs in Progress, Inventory Alerts, Revenue Today/This Month
- **Active Cars Table**: client, vehicle, job type, assigned mechanic, status, time in garage, quick actions (view/update/add inspection/photos)
- **Work Orders Kanban**: New → Approved/Assigned → In Progress → Completed → Delivered
- **Recent Inspections** list with summaries & media previews
- **Inventory snapshot**: low stock, recently used parts, upcoming shortages
- **Real‑time alerts**: new request, waiting approval, job overdue, stock low
- **Quick actions (floating)**: New Request, New Inspection, Add Vehicle, Add Inventory Item

**Technical Implementation:**
- Real-time updates using Django signals and WebSocket support (future)
- Responsive grid layout with Tailwind CSS
- AJAX-powered quick actions without page reload
- Role-based widget visibility

### 6.2 Repair Sessions (Core)
**Entities:** Session, JobCard, PartsUsed, TimeLogs, Media (photo/video), Approvals, InvoiceLink.

**Create Session (from Request or directly):**
- Auto Session ID (format: SES20250930-001), client, vehicle (make/model/year/plate/VIN), job type (enum), priority, assigned mechanic(s), bay, start time, ETA, customer complaints/symptoms
- Comprehensive 7-step creation form with dynamic job cards and parts selection

**Timeline & Statuses:**
- Status enum: `scheduled`, `in_progress`, `completed`, `cancelled`, `on_hold`
- Auto‑events: check‑in, diagnosis, repair start, parts ordered/received, QA, completion, delivery
- Visual progress timeline with status indicators

**Tasks & Labor:**
- JobCard system with status tracking, priority levels, estimated/actual hours
- Mechanic assignment and time logging
- Labor cost calculation with configurable rates
- Notes, photos, and voice recording capabilities

**Parts & Inventory:**
- Dynamic parts addition with inventory checking
- Stock reservation and consumption tracking
- Low stock alerts and reorder triggers
- Cost calculation and supplier tracking

**Client Approvals:**
- Digital approval system with secure links
- SMS/Email notifications with approval workflow
- Signature capture and timestamp recording

**Quality Check & Closure:**
- QC checklist integration
- Automatic invoice generation
- Warranty documentation
- Delivery confirmation

**SLAs & Overdue:**
- Configurable SLA rules with automated alerts
- Overdue notifications and escalation

**Auditing:**
- Complete audit trail of all changes
- User attribution and timestamp tracking

### 6.3 Work Orders / Requests
- **Intake form**: client info, vehicle, complaint, preferred time, photos
- **Kanban workflow**: drag & drop status management
- **Request conversion**: approved requests become repair sessions
- **Conflict detection**: double-booking warnings for mechanics/bays

### 6.4 Inspections
- **Template‑based checklists**: engine, brakes, tires, fluids, body
- **Findings**: severity levels (`OK`, `ADVISORY`, `CRITICAL`), notes, media
- **Auto‑recommendations**: generate tasks and quotes from findings
- **Client reports**: shareable inspection reports with visuals

### 6.5 Inventory
- **Items**: SKU, name, brand, vehicle‑fitment, min/max levels, bin location, unit, cost, price, barcodes
- **Stock operations**: receive, adjust, transfer, reserve to session, consume on completion, return
- **Purchase orders**: supplier management, lead time tracking, cost management
- **Alerts**: low stock warnings, upcoming shortages based on pipeline

### 6.6 Billing & Payments
- **Quote → Invoice → Receipt** workflows
- **Tax calculation**: configurable rates and rules
- **Discounts**: role-based approval thresholds
- **Multi-currency**: display and calculation support
- **Payment tracking**: methods, partial payments, history

### 6.7 Scheduling
- **Calendar views**: day/week/month with drag-and-drop
- **Resource allocation**: mechanics and bays management
- **Conflict prevention**: automated scheduling validation
- **Appointment management**: from intake to completion

### 6.8 Notifications
- **Channels**: in‑app, email, SMS, WhatsApp (Twilio/Meta later)
- **Triggers**: request received, approval pending, parts arrival, overdue session, job ready, invoice due
- **Templates**: multilingual support (EN/AR) with variable substitution
- **Delivery tracking**: sent, delivered, read status

### 6.9 Reports & Analytics
- **Throughput metrics**: cars/week & month; turnaround time; on‑time rate
- **Service breakdown**: revenue by service type and count
- **Parts analytics**: usage patterns, stockout events, supplier performance
- **Mechanic productivity**: jobs completed, avg. duration, rework rate
- **Financial reports**: daily/monthly revenue, gross margin analysis
- **Export capabilities**: CSV, Excel, PDF formats

### 6.10 Admin & Settings
- **Roles & Permissions**: Owner/Manager, Service Advisor, Mechanic, Inventory, Accountant
- **Business rules**: price books, tax rates, SLA targets, templates
- **Localization**: EN/AR support, number/date formats, currency
- **System configuration**: backup schedules, retention policies

---

## 7) Technical Architecture

### 7.1 Backend (Django Implementation)
**Framework:** Django 5.2.6 with Django REST Framework
**Database:** PostgreSQL with JSONField support for flexible data
**Authentication:** Django Auth with custom user profiles and roles
**File Storage:** Local file system with future S3 integration
**Caching:** Redis for session and template caching
**Background Tasks:** Django-Q2 for async operations

### 7.2 Data Model (Enhanced ERD)
```sql
-- Core Entities
Client(id, organization_id, first_name, last_name, email, phone, address, created_at)
Vehicle(id, organization_id, client_id, make, model, year, license_plate, vin, mileage, photo)
Session(id, organization_id, car_id, technician_id, session_number, status, scheduled_date, expected_end_date, actual_start_time, actual_end_time, description, job_type, estimated_cost, actual_cost)

-- Work Management
JobCard(id, session_id, job_number, title, description, priority, status, assigned_technician_id, estimated_hours, actual_hours, parts_cost, labor_cost, started_at, completed_at, notes)
TimeLog(id, job_card_id, user_id, start_time, end_time, duration, notes)

-- Inventory & Parts
Inventory(id, organization_id, part_number, name, description, category, quantity, min_quantity, unit_price, supplier, location)
PartsUsed(id, session_id, inventory_id, quantity, unit_cost, reserved_at, consumed_at)

-- Financial
Invoice(id, session_id, invoice_number, subtotal, tax_amount, discount_amount, total_amount, status, issued_date, due_date)
Payment(id, invoice_id, amount, method, reference, payment_date)

-- Media & Documentation
MediaFile(id, entity_type, entity_id, file, file_type, uploaded_by_id, uploaded_at, caption)

-- System
Organization(id, name, address, phone, email, timezone, currency, auto_backup)
UserProfile(id, user_id, organization_id, role, phone, employee_id)
Notification(id, organization_id, user_id, title, message, notification_type, is_read, created_at)
```

### 7.3 API Design (Django REST Framework)
**Authentication Endpoints:**
- `POST /api/auth/login/` - User authentication
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Current user profile

**Core Business Endpoints:**
- `GET/POST /api/sessions/` - Session CRUD operations
- `GET/POST /api/sessions/{id}/job-cards/` - Job card management
- `GET/POST /api/inventory/` - Inventory management
- `GET/POST /api/invoices/` - Invoice operations
- `GET/POST /api/clients/` - Client management

**Real-time Features:**
- WebSocket support for live updates (future implementation)
- Server-sent events for notifications
- AJAX-powered dashboard updates

---

## 8) Security & Compliance

### 8.1 Authentication & Authorization
- **JWT tokens** with configurable expiration
- **Role-based access control** (RBAC) with granular permissions
- **Organization-level data isolation** (multi-tenancy)
- **Password policies** with complexity requirements
- **Session management** with automatic logout on inactivity

### 8.2 Data Protection
- **Encryption at rest** for sensitive data (future)
- **TLS 1.3** for all data in transit
- **GDPR compliance** for data retention and deletion
- **Audit logging** for all data modifications
- **Backup encryption** and secure storage

### 8.3 File Security
- **File type validation** and virus scanning
- **Secure upload** with size limits and type restrictions
- **Private file access** via signed URLs
- **Automatic cleanup** of temporary files

---

## 9) Performance & Scalability

### 9.1 Database Optimization
- **Indexing strategy** for common query patterns
- **Query optimization** with select_related and prefetch_related
- **Database connection pooling** with PgBouncer
- **Read replicas** for reporting queries (future)

### 9.2 Caching Strategy
- **Redis caching** for frequently accessed data
- **Template fragment caching** for dashboard components
- **API response caching** with appropriate TTL
- **Session storage** in Redis for scalability

### 9.3 Background Processing
- **Django-Q2** for async task processing
- **Email sending** via background queues
- **Report generation** as background tasks
- **File processing** (resize, compression) asynchronously

---

## 10) Deployment & Infrastructure

### 10.1 Production Environment
- **Docker containerization** for consistent deployment
- **Nginx reverse proxy** with SSL termination
- **Gunicorn WSGI server** for Django application
- **PostgreSQL** with automated backups
- **Redis** for caching and sessions

### 10.2 Monitoring & Logging
- **Application monitoring** with Django Silk or Scout APM
- **Error tracking** with Sentry integration
- **Performance monitoring** with custom metrics
- **Log aggregation** with ELK stack (future)

### 10.3 Backup & Recovery
- **Automated database backups** daily with retention policy
- **File system backups** for uploaded media
- **Point-in-time recovery** capabilities
- **Disaster recovery** procedures documented

---

## 11) Testing Strategy

### 11.1 Unit Testing
- **Model tests** for business logic validation
- **View tests** for request/response handling
- **Form tests** for data validation
- **Utility function tests** for helper methods

### 11.2 Integration Testing
- **API endpoint testing** with full request/response cycles
- **Database integration** tests for data persistence
- **External service** integration testing
- **Email and notification** delivery testing

### 11.3 End-to-End Testing
- **User workflow testing** with Selenium or Playwright
- **Critical path testing** for core business processes
- **Performance testing** for load handling
- **Cross-browser compatibility** testing

### 11.4 Quality Assurance
- **Code coverage** target: 80% minimum
- **Automated CI/CD** pipeline with GitHub Actions
- **Security scanning** with Bandit and Safety
- **Performance benchmarking** for key operations

---

## 12) User Stories & Acceptance Criteria

### 12.1 Repair Session Management
**User Story:** As a service advisor, I want to create a comprehensive repair session so that I can track all aspects of the repair process.

**Acceptance Criteria:**
- ✅ Can select existing or create new client
- ✅ Can select existing or create new vehicle
- ✅ Can assign mechanic and set job type
- ✅ Can add multiple job cards with priorities
- ✅ Can add parts with inventory checking
- ✅ Can set timeline expectations
- ✅ Can upload initial photos/videos
- ✅ Session gets unique auto-generated number
- ✅ All data is validated before saving

**User Story:** As a mechanic, I want to update job progress so that the client and management can track work completion.

**Acceptance Criteria:**
- ✅ Can start/stop time tracking on tasks
- ✅ Can update task status (pending → in_progress → completed)
- ✅ Can add notes and observations
- ✅ Can upload before/after photos
- ✅ Can mark parts as used from inventory
- ✅ Can request client approval for additional work
- ✅ Timeline automatically updates with progress

### 12.2 Inventory Management
**User Story:** As an inventory manager, I want to track parts usage so that I can maintain optimal stock levels.

**Acceptance Criteria:**
- ✅ Parts automatically reserved when added to session
- ✅ Low stock alerts generated when threshold reached
- ✅ Parts consumption tracked per session
- ✅ Cost calculation includes parts markup
- ✅ Supplier information tracked for reordering
- ✅ Inventory reports show usage patterns

### 12.3 Client Communication
**User Story:** As a client, I want to receive updates about my vehicle repair so that I stay informed throughout the process.

**Acceptance Criteria:**
- ✅ Receive SMS/email when session created
- ✅ Get approval requests for additional work
- ✅ Can view progress timeline online
- ✅ Receive invoice with detailed breakdown
- ✅ Can provide feedback after completion
- ✅ All communications include session details

---

## 13) Integration Points

### 13.1 Payment Processing
- **HyperPay integration** for card payments (Jordan/KSA region)
- **Bank transfer** tracking with reference numbers
- **Cash payment** logging with receipt generation
- **Partial payment** support for large jobs

### 13.2 Communication
- **Twilio SMS** for notifications and approvals
- **WhatsApp Business** for rich media communication
- **Email templates** with HTML and Arabic support
- **Push notifications** for mobile app users

### 13.3 External Systems
- **VIN decoding** API for vehicle information
- **Recall checking** integration for safety alerts
- **Accounting software** export (QuickBooks, Ovovex)
- **CRM integration** for customer history

---

## 14) Risk Assessment & Mitigation

### 14.1 Technical Risks
- **Data Loss:** Automated backups with offsite storage
- **Performance Issues:** Database optimization and caching
- **Security Breaches:** Regular security audits and updates
- **Downtime:** Redundant infrastructure and monitoring

### 14.2 Business Risks
- **User Adoption:** Comprehensive training and support
- **Data Accuracy:** Validation rules and audit trails
- **Compliance:** Regular legal review and updates
- **Competition:** Continuous feature development

### 14.3 Operational Risks
- **Staff Training:** Detailed documentation and onboarding
- **Process Changes:** Phased rollout with feedback loops
- **Vendor Dependencies:** Multiple supplier options
- **Scalability:** Cloud-native architecture design

---

## 15) Success Metrics & Measurement

### 15.1 Quantitative Metrics
- **System Adoption:** 95% of operations digitized within 3 months
- **Time Savings:** 30% reduction in administrative time
- **Error Reduction:** 80% decrease in billing errors
- **Customer Satisfaction:** Average rating of 4.5/5
- **Revenue Impact:** 15% increase in average transaction value

### 15.2 Qualitative Metrics
- **User Feedback:** Regular surveys and improvement tracking
- **Process Efficiency:** Workflow optimization based on usage patterns
- **Support Tickets:** Reduction in support requests over time
- **Feature Utilization:** Most-used features drive development priorities

---

## 16) Roadmap & Milestones

### Phase 1 (Current): Core MVP ✅
- Basic repair session management
- Inventory tracking
- Client and vehicle management
- Basic reporting and dashboard
- User authentication and roles

### Phase 2: Enhanced Features (Q1 2026)
- Mobile app development
- Advanced approval workflows
- Real-time notifications
- Integration with payment systems
- Enhanced reporting and analytics

### Phase 3: Enterprise Features (Q2 2026)
- Multi-branch support
- Advanced scheduling system
- CRM integration
- Advanced analytics and BI
- API for third-party integrations

### Phase 4: Scale & Optimization (Q3 2026)
- Performance optimization
- Advanced security features
- Global expansion preparation
- Advanced AI features (predictive maintenance)

---

## 17) Support & Documentation

### 17.1 User Documentation
- **User Manuals:** Step-by-step guides for each role
- **Video Tutorials:** Process walkthroughs and best practices
- **Quick Reference:** Common tasks and shortcuts
- **FAQ Database:** Common questions and solutions

### 17.2 Technical Documentation
- **API Documentation:** Complete endpoint reference
- **Database Schema:** Entity relationships and constraints
- **Deployment Guide:** Infrastructure setup and configuration
- **Troubleshooting:** Common issues and resolutions

### 17.3 Training Program
- **Role-based Training:** Specific training for each user type
- **Certification Program:** Advanced user certification
- **Ongoing Education:** Monthly feature updates and tips
- **Community Support:** User forum and knowledge base

---

## 18) Conclusion

Gixat represents a comprehensive solution for modern auto repair shop management, combining powerful functionality with user-friendly design. The Django-based implementation provides a solid foundation for scalability and feature expansion, while the focus on user experience ensures high adoption rates.

**Key Achievements (v2.0):**
- Complete repair session lifecycle management
- Real-time inventory tracking and alerts
- Comprehensive client communication system
- Role-based access control and security
- Mobile-responsive web interface
- Automated reporting and analytics
- Scalable multi-tenant architecture

**Future Vision:**
The platform is positioned for significant growth in the Middle East automotive service market, with potential expansion to other regions and integration with broader automotive ecosystem services.

---

**End of Enhanced PRD v2.0**

---

## 2) Goals & Non‑Goals
### Goals
1. Reduce repair turnaround time by 20–30% via guided workflows.
2. Increase transparency to clients (status updates, photo/video evidence, digital approvals).
3. Keep real‑time visibility for managers: job load, overdue risks, inventory shortages, revenue.
4. Make parts usage traceable to each job for accurate cost & profitability.

### Non‑Goals (v1)
- Advanced accounting (IFRS) beyond basic invoices & payments (future Ovovex/ERP integration).
- Complex HR (payroll/attendance); only mechanic assignment & basic productivity.
- Multi‑branch consolidated analytics (Phase 2+).

---

## 3) Users & Personas
- **Service Advisor / Front Desk**: Creates requests, opens sessions, gets approvals, issues invoices, closes jobs.
- **Mechanic / Technician**: Views assigned tasks, adds notes, logs time, attaches media, confirms parts used.
- **Parts Manager / Storekeeper**: Manages stock, reservations, purchases, and stock audits.
- **Garage Manager / Owner**: Monitors KPIs, sets prices, approves discounts, views productivity & profit.
- **Client (External)**: Receives quotes/approvals, job updates, invoices, and feedback requests (via web link/SMS/WhatsApp).

---

## 4) Success Metrics (KPIs)
- Avg. **Time to Diagnose** (check‑in → diagnosis).
- Avg. **Repair Duration** (start → completion).
- **On‑time Delivery Rate**.
- **First‑time Fix Rate** (no return within X days).
- **Parts Stockout Events** (weekly).
- **Revenue Today/Month**, **Gross Margin** (parts vs labor).
- **Customer Satisfaction** (1–5 rating).

---

## 5) High‑Level Scope / Modules
1. **Dashboard (Garage Staff)**
2. **Repair Sessions** (core workflow)
3. **Work Orders / Requests** (Kanban)
4. **Inspections** (templates, findings, media)
5. **Inventory** (stock, reservations, reorders)
6. **Billing & Payments** (quotes, invoices, discounts, taxes, receipts)
7. **Scheduling** (appointments, bays, mechanics)
8. **Notifications** (client & internal)
9. **Reports & Analytics**
10. **Admin & Settings** (roles, prices, taxes, templates, locales)

---

## 6) Detailed Functional Requirements

### 6.1 Dashboard (Garage Staff)
- KPI tiles: **Cars in Garage**, **Pending Requests**, **Inspections in Progress**, **Jobs in Progress**, **Inventory Alerts**, **Revenue Today/This Month**.
- Active Cars Table: client, vehicle, job type, assigned mechanic, status, time in garage, quick actions (view/update/add inspection/photos).
- Work Orders Kanban: New → Approved/Assigned → In Progress → Completed → Delivered.
- Recent Inspections list with summaries & media previews.
- Inventory snapshot: low stock, recently used parts, upcoming shortages.
- Real‑time alerts: new request, waiting approval, job overdue, stock low.
- Quick actions (floating): **New Request**, **New Inspection**, **Add Vehicle**, **Add Inventory Item**.

### 6.2 Repair Sessions (Core)
**Entities:** Session, Tasks, PartsUsed, TimeLogs, Media (photo/video), Approvals, InvoiceLink.

**Create Session (from Request or directly):**
- Auto Session ID, client, vehicle (make/model/year/plate/VIN), job type (enum), priority, assigned mechanic(s), bay, start time, ETA, customer complaints/symptoms.

**Timeline & Statuses:**
- Status enum: `NEW`, `DIAGNOSING`, `AWAITING_CLIENT_APPROVAL`, `AWAITING_PARTS`, `IN_PROGRESS`, `QA_CHECK`, `READY_FOR_PICKUP`, `COMPLETED`, `DELIVERED`, `ON_HOLD`, `CANCELLED`.
- Auto‑events: check‑in, diagnosis, repair start, parts ordered/received, QA, completion, delivery. Show as progress/timeline.

**Tasks & Labor:**
- Task list (templated by job type): each task has status, description, est. duration, **actual time logs**, assigned mechanic.
- Mechanic adds notes (voice‑to‑text option), photos/videos before/after, and tick‑off.
- Labor rate: hourly or fixed; compute labor cost per session.

**Parts & Inventory:**
- Add required parts (search by SKU/Name/Barcode). Reserve stock or mark as **missing** (trigger reorder).
- Track **PartsUsed** with quantity, unit price, source (stock vs purchase), supplier, warranty, return handling.
- Parts status: `RESERVED`, `PICKED`, `CONSUMED`, `RETURNED`.

**Client Approvals:**
- Generate quote for additional work (parts + labor). Send link via SMS/WhatsApp/email with **Approve / Decline** options and notes. Capture **digital signature** and timestamp.

**Quality Check & Closure:**
- QC checklist (test drive, leaks check, torque verification, error codes).
- Produce final invoice (see Billing). Attach warranty/guarantee docs.
- Delivery confirmation (signature or PIN). Option to schedule follow‑up service reminder.

**SLAs & Overdue:**
- Configurable SLA rules (diagnosis within X hours, repair within Y hours). Overdue flags + notifications.

**Auditing:**
- Immutable audit log of status changes, approvals, edits, parts movements, invoice changes (who/when/what).

### 6.3 Work Orders / Requests
- Intake form: client info, vehicle, complaint, preferred time, photos.
- Kanban workflow (drag & drop). Convert approved request → session.
- Auto collision of double‑booked bays/mechanics (warning).

### 6.4 Inspections
- Template‑based checklists (engine, brakes, tires, fluids, body).
- Findings: severity (`OK`, `ADVISORY`, `CRITICAL`), notes, media.
- Auto‑generate **recommendations** → create tasks/quote lines.
- Client‑facing report link with visuals and multilingual comments.

### 6.5 Inventory
- Items: SKU, name, brand, vehicle‑fitment, min/max levels, bin location, unit, cost, price, barcodes.
- Stock ops: receive, adjust, transfer, **reserve to session**, consume on completion, return.
- Purchase orders: supplier, lead time, cost, expected date, status; auto suggestions from low stock & reservations.
- Valuation methods (FIFO default). Batch/lot numbers optional.
- Alerts for low stock & incoming shortages based on appointment pipeline.

### 6.6 Billing & Payments
- Quote → Invoice → Receipt workflows.
- Taxes (configurable), discounts (role‑based approval threshold), surcharges.
- Payment methods: cash, card, bank transfer, **HyperPay** integration (future).
- Partial payments & deposits; statement history per client/vehicle.
- Multi‑currency display; base currency JOD.

### 6.7 Scheduling
- Calendar views (day/week). Mechanics & bays allocation, capacities and conflicts.
- Appointment creation from request/intake.

### 6.8 Notifications
- Channels: in‑app, email, SMS, WhatsApp (Twilio/Meta later).
- Triggers: request received, approval pending, parts arrival, overdue session, job ready, invoice due.
- Templates per language (EN/AR), variables (client name, session ID, amount, link).

### 6.9 Reports & Analytics
- Throughput: cars/week & month; turnaround time; on‑time rate.
- Services breakdown by revenue count/value.
- Parts usage & stockout report.
- Mechanic productivity: jobs completed, avg. duration, rework rate.
- Finance: daily/monthly revenue, gross margin (parts vs labor). Export to CSV.

### 6.10 Admin & Settings
- Roles: **Owner/Manager**, **Service Advisor**, **Mechanic**, **Inventory**, **Accountant (limited)**.
- Permissions matrix (create/update/approve/discount caps).
- Price books, tax rates, SLA targets, inspection templates, QC checklists.
- Localization (EN/AR), number & date formats, currency.
- Data retention policies; backup schedules.

---

## 7) Data Model (ERD Sketch)
- `Client(id, name, phone, email, language, notes)`  
- `Vehicle(id, client_id, make, model, year, plate, vin, color, mileage)`  
- `Request(id, client_id, vehicle_id, complaint, preferred_time, media[])`  
- `Session(id, request_id?, client_id, vehicle_id, status, priority, bay, assigned_mechanic_id?, start_at, eta_at, closed_at, symptoms, audit[])`  
- `Task(id, session_id, title, description, status, est_minutes, actual_minutes, mechanic_id, started_at, completed_at)`  
- `TimeLog(id, task_id, mechanic_id, start, end, minutes)`  
- `Media(id, entity_type, entity_id, kind, url, caption, taken_at, by_user_id)`  
- `InventoryItem(id, sku, name, brand, fitment, unit, min_level, max_level, bin, barcode)`  
- `StockLedger(id, item_id, qty, unit_cost, type[RECEIVE|ADJUST|RESERVE|CONSUME|RETURN], ref_type, ref_id, created_at)`  
- `Supplier(id, name, phone, email, terms)`  
- `PurchaseOrder(id, supplier_id, status, expected_at, created_by, total_cost)`  
- `PurchaseOrderLine(id, po_id, item_id, qty, unit_cost)`  
- `PartsUsed(id, session_id, item_id, qty, unit_price, source[STOCK|PURCHASE], reserved_at, consumed_at)`  
- `Quote(id, session_id, subtotal_parts, subtotal_labor, tax, discount, total)`  
- `Invoice(id, session_id, number, issue_date, due_date, subtotal, tax, discount, total, status)`  
- `Payment(id, invoice_id, method, amount, currency, ref)`  
- `User(id, name, role, phone, email, locale, is_active)`  
- `Notification(id, user_id?, client_id?, channel, template_id, payload, status)`  
- `AuditLog(id, entity, entity_id, action, before, after, user_id, created_at)`

---

## 8) API (NestJS) – Representative Endpoints
**Auth & Users**
- `POST /auth/login`
- `GET /users/me`
- `GET /users?role=`

**Clients & Vehicles**
- `POST /clients`, `GET /clients/:id`, `GET /clients?search=`  
- `POST /vehicles`, `GET /vehicles/:id`, `GET /vehicles?plate=`

**Requests & Sessions**
- `POST /requests`, `GET /requests?status=`  
- `POST /sessions` (from request or manual)  
- `GET /sessions/:id` (includes tasks, parts, media, approvals)  
- `PATCH /sessions/:id/status`  
- `POST /sessions/:id/tasks` / `PATCH /tasks/:id`  
- `POST /sessions/:id/approvals` (generate client link)  
- `POST /sessions/:id/media` (upload)  
- `POST /sessions/:id/close`

**Inventory & Parts**
- `GET /inventory/items?search=`  
- `POST /inventory/items`  
- `POST /inventory/items/:id/reserve`  
- `POST /inventory/items/:id/consume`  
- `POST /purchase-orders` / `PATCH /purchase-orders/:id`

**Billing**
- `POST /quotes` / `GET /quotes/:id`  
- `POST /invoices` / `GET /invoices/:id` / `PATCH /invoices/:id`  
- `POST /payments`

**Notifications**
- `POST /notify` (internal trigger)  
- Webhook handlers for SMS/WhatsApp providers (future)

**Reports**
- `GET /reports/throughput?from=&to=`  
- `GET /reports/revenue?period=`  
- `GET /reports/parts-usage?from=&to=`

**Events (for n8n / Webhooks)**
- `event.session.created`  
- `event.session.status_changed`  
- `event.session.approval_requested`  
- `event.inventory.low_stock`  
- `event.invoice.created` / `event.payment.received`

---

## 9) Frontend Apps
### Web Admin (Next.js)
- Role‑based routes; sidebar: Dashboard, Sessions, Requests, Inspections, Inventory, Billing, Reports, Settings.
- Tables with filters, bulk actions, CSV export.
- Session detail page: timeline, tasks, parts, media, approvals, invoice, audit.

### Mobile (Flutter) – Staff App
- Mechanic view: My Jobs (today), task details, time logging, media capture, voice notes.
- Service Advisor view: intake form, scan VIN/plate, quick quotes, send approvals.
- Inventory quick actions: scan barcode, reserve/pick/consume.

**Design Notes:**
- Tailwind style system for web; platform‑native widgets for Flutter.
- RTL support and Arabic translations; numerals per locale.
- Dark/Light themes; large tap targets in mobile UIs.

---

## 10) States, Enums & Validation
- **Session.status**: `NEW`, `DIAGNOSING`, `AWAITING_CLIENT_APPROVAL`, `AWAITING_PARTS`, `IN_PROGRESS`, `QA_CHECK`, `READY_FOR_PICKUP`, `COMPLETED`, `DELIVERED`, `ON_HOLD`, `CANCELLED`
- **Task.status**: `PENDING`, `IN_PROGRESS`, `BLOCKED`, `DONE`
- **Inventory thresholds**: `min_level` must be ≥ 0; reorder alert when `qty_on_hand <= min_level`
- **Invoice.status**: `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `VOID`
- **Payment.method**: `CASH`, `CARD`, `BANK_TRANSFER`, `HYPERPAY` (future)

**Validation Examples:**
- No session closure if open tasks or unconsumed reserved parts exist.
- No consumption if item not reserved to that session (or force with manager override).

---

## 11) Security & Compliance
- JWT auth with role‑based access control (RBAC).  
- Field‑level permissions for discounts & approvals.  
- Audit logging for all critical operations.  
- File uploads to object storage (S3‑compatible), signed URLs.  
- Rate limiting on public approval links.  
- Backups: nightly DB backup + point‑in‑time recovery (WAL).  
- PII handling: minimal storage, encryption at rest & in transit (TLS).

---

## 12) Performance & Reliability
- Target p95 API latency < 300ms for core endpoints.
- Concurrency: 50 active staff users per branch (MVP).
- Queues for notifications & media processing (BullMQ/Redis).
- Graceful offline for mobile (local cache + sync on reconnect).

---

## 13) Integrations (Roadmap)
- **Payments:** HyperPay (Jordan KSA region).  
- **Messaging:** Twilio/WhatsApp Business, SMS gateway.  
- **VIN/Recall:** third‑party API to warn of recalls.  
- **Accounting:** export CSV or API hooks to Ovovex/ERP.  
- **BI:** optional export to external BI (Metabase/PowerBI).

---

## 14) Analytics & Telemetry
- Event tracking (page views, actions, approvals, payments).  
- Error logging (Sentry).  
- Funnel: request → session → approval → invoice → payment.  
- Cohorts: repeat clients, vehicle types, high‑value services.

---

## 15) Testing & Acceptance Criteria
**Examples (Repair Sessions):**
- Create session from request with tasks pre‑loaded from job template.  
- Reserve parts and prevent closure while reservations are open.  
- Send approval link and capture signature; invoice reflects approved lines only.  
- QA checklist must be completed before status `READY_FOR_PICKUP`.  
- Overdue flag raised when ETA exceeded; notification sent.  
- Audit log records every status change with actor & timestamp.

**Non‑Functional:**
- RTL layout validated on key pages.  
- Mobile photo capture ≤2s to upload on 4G networks.  
- All tables load with server‑side pagination and filters.

---

## 16) Rollout Plan & Milestones
**Milestone 1 — 0→30% (Core MVP)**  
- Auth/RBAC, Clients & Vehicles, Requests Kanban, Sessions (basic), Tasks, Parts reservation/consumption, Basic Inventory, Simple Invoices, Dashboard KPIs (basic).

**Milestone 2 — 30→60%**  
- Approvals & digital signatures, QC checklists, Scheduling (mechanics/bays), Notifications (in‑app/SMS), Reports (throughput, revenue), Mobile app (Mechanic jobs & media).

**Milestone 3 — 60→85%**  
- Purchases & suppliers, Low‑stock forecasting, Deposits/partial payments, Multi‑currency display, Advanced analytics, Audit & exports, Arabic translations.

**Milestone 4 — 85→100%**  
- Performance hardening, Full test coverage for critical flows, Backup/restore drills, UX polish, role fine‑tuning, launch docs and training.

---

## 17) Open Questions & Assumptions
- Do we require bay scheduling conflicts to block creation or just warn? (Assume warn v1)  
- Default warranty period for parts & labor? (Assume 90 days)  
- WhatsApp Business approval link—use short links? (Assume yes via link shortener)  
- Are deposits mandatory for high‑value jobs? (Optional with role control)  

---

## 18) Appendices
### A) Sample Inspection Template (Quick)
- **Engine:** leaks, belts, fluids, error codes.  
- **Brakes:** pad %, rotor condition, fluid.  
- **Tires:** tread depth (mm), wear pattern, pressure.  
- **Electrical:** battery health, alternator output.  
- **Body:** dents, paint chips, photos.

### B) Sample Client Approval Text (EN/AR)
- EN: “Please review and approve the additional work for Session {{id}} totaling {{amount}} JOD: {{link}}.”  
- AR: “يرجى مراجعة واعتماد الأعمال الإضافية للطلب رقم {{id}} بمبلغ {{amount}} دينار: {{link}}.”

---

**End of PRD v1.0**
