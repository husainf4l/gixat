# Gixat - Top 20 Priority Todo List

**Generated:** December 6, 2025  
**Based on:** Application research, best practices audit, UX analysis, and status reports

---

## 🔴 Critical Priority (Production Readiness)

### 1. **Implement Structured Logging (Serilog)**
**Priority:** 🔴 Critical  
**Effort:** 4-6 hours  
**Impact:** High - Essential for production debugging and monitoring

**Tasks:**
- Install Serilog packages (Serilog.AspNetCore, Serilog.Sinks.File, Serilog.Sinks.Console)
- Configure structured logging in `Program.cs`
- Add `ILogger<T>` to all service classes
- Log key operations (create, update, delete) with context
- Log errors and exceptions with stack traces
- Configure log levels per environment

**Why:** Currently only console logging exists. Production needs structured, persistent logging for debugging and audit trails.

---


### 3. **Add Configuration Options Pattern**
**Priority:** 🔴 Critical  
**Effort:** 3-4 hours  
**Impact:** High - Code quality and maintainability

**Tasks:**
- Create `AwsOptions` class in `Shared/Options/`
- Create `SmtpOptions` class
- Create `AdminOptions` class
- Create `GoogleAuthOptions` class
- Refactor `Program.cs` to use Options pattern
- Add configuration validation
- Remove manual configuration mapping

**Why:** Current direct configuration access in `Program.cs` is an anti-pattern. Options pattern provides type safety and validation.

---

### 4. **Fix Nullable Reference Warning**
**Priority:** 🔴 Critical  
**Effort:** 30 minutes  
**Impact:** Medium - Code quality

**Tasks:**
- Fix nullable reference in `Pages/Appointments/Create.cshtml.cs:126`
- Add null checks or use null-forgiving operator appropriately
- Verify no runtime null reference exceptions

**Why:** Compiler warning indicates potential null reference issue. Should be fixed before production.

---

### 5. **Enhance Global Exception Middleware**
**Priority:** 🔴 Critical  
**Effort:** 2-3 hours  
**Impact:** High - Production error handling

**Tasks:**
- Add detailed error logging
- Create user-friendly error pages
- Add error ID for tracking
- Implement error notification system
- Add different error handling per environment
- Log request context (user, IP, route)

**Why:** Better error handling is essential for production. Current middleware is basic.

---

## 🟡 High Priority (Code Quality & Best Practices)

### 6. **Add Logging to All Services**
**Priority:** 🟡 High  
**Effort:** 3-4 hours  
**Impact:** High - Debugging and monitoring

**Tasks:**
- Inject `ILogger<T>` in all service constructors
- Add debug logs for key operations
- Add information logs for business events
- Add warning logs for edge cases
- Add error logs for exceptions

**Affected Services:**
- `ClientService`, `ClientVehicleService`
- `CompanyService`, `BranchService`
- `SessionService`, `JobCardService`, `InspectionService`
- `AppointmentService`
- `InvoiceService`
- `InventoryService`
- `CompanyUserService`

**Why:** Missing logging makes debugging difficult. All services need logging for production.

---

### 7. **Create Shared Helper Services**
**Priority:** 🟡 High  
**Effort:** 3-4 hours  
**Impact:** Medium - Code deduplication

**Tasks:**
- Create `Shared/Helpers/CompanyContextHelper.cs` for `GetCurrentCompanyId()`
- Create `Shared/Services/NumberGeneratorService.cs` for sequence generation
- Refactor all services to use shared helpers
- Remove duplicated code across modules

**Why:** Code duplication exists across modules. Shared helpers reduce maintenance burden.

---

### 8. **Add CancellationToken Support**
**Priority:** 🟡 High  
**Effort:** 4-5 hours  
**Impact:** Medium - Graceful cancellation

**Tasks:**
- Add `CancellationToken` parameter to all async service methods
- Pass cancellation tokens through EF Core queries
- Update all service interfaces
- Update all service implementations
- Update all page models

**Why:** Missing cancellation token support prevents graceful cancellation of long-running operations.

---

### 9. **Create Custom Domain Exceptions**
**Priority:** 🟡 High  
**Effort:** 2-3 hours  
**Impact:** Medium - Better error handling

**Tasks:**
- Create `Shared/Exceptions/EntityNotFoundException.cs`
- Create `Shared/Exceptions/BusinessRuleViolationException.cs`
- Create `Shared/Exceptions/ValidationException.cs`
- Replace generic exceptions with domain exceptions
- Update exception handling middleware

**Why:** Generic exceptions make error handling harder. Domain-specific exceptions provide better context.

---

### 10. **Clean Up Dead Code**
**Priority:** 🟡 High  
**Effort:** 1-2 hours  
**Impact:** Low - Code hygiene

**Tasks:**
- Delete `Shared/Class1.cs` (boilerplate)
- Remove unused `IModule` interface (if not needed)
- Remove unused `IRepository` interface (if not needed)
- Review and remove other unused code

**Why:** Dead code adds confusion and maintenance overhead.

---

## 🟢 Medium Priority (UX & Features)

### 11. **Implement Client Search Autocomplete**
**Priority:** 🟢 Medium  
**Effort:** 4-5 hours  
**Impact:** High - User experience

**Tasks:**
- Install `Tom Select` or `Choices.js` library
- Create `GET /Clients/Search?term=...` API endpoint
- Create `_ClientSearch.cshtml` partial component
- Update `Pages/Sessions/Create.cshtml` to use autocomplete
- Add client summary card after selection
- Update other pages that need client search

**Why:** Current dropdown becomes unmanageable with many clients. Autocomplete improves UX significantly.

---

### 12. **Implement Phone Number Validation with Country Codes**
**Priority:** 🟢 Medium  
**Effort:** 3-4 hours  
**Impact:** Medium - Data quality

**Tasks:**
- Install `intl-tel-input` library
- Update client forms with country code selector
- Add phone number validation on backend
- Normalize phone numbers to E.164 format
- Update `PhoneNumberService` to use libphonenumber-csharp
- Add validation feedback in UI

**Why:** Phone numbers are critical for notifications. Proper validation ensures data quality.

---

### 13. **Create Professional Email Templates**
**Priority:** 🟢 Medium  
**Effort:** 3-4 hours  
**Impact:** Medium - Professional appearance

**Tasks:**
- Create HTML email templates for:
  - User invitations
  - Appointment confirmations
  - Invoice notifications
  - Session completion notifications
- Add template engine (RazorEngine or similar)
- Update `EmailService` to use templates
- Test email rendering across clients

**Why:** Current emails are likely plain text. Professional HTML templates improve brand image.

---

### 14. **Implement Reports Module**
**Priority:** 🟢 Medium  
**Effort:** 8-12 hours  
**Impact:** High - Business value

**Tasks:**
- Create `Modules/Reports/` module structure
- Create reports service and interfaces
- Implement analytics dashboard:
  - Revenue reports (daily, weekly, monthly)
  - Service statistics
  - Client analytics
  - Technician performance
  - Inventory reports
- Create report pages with charts/graphs
- Add export functionality (PDF, Excel)

**Why:** Reports module is placeholder. Analytics are essential for business decision-making.

---

### 15. **Add Automated Email Notifications**
**Priority:** 🟢 Medium  
**Effort:** 4-6 hours  
**Impact:** Medium - Customer communication

**Tasks:**
- Create notification service
- Add email notifications for:
  - Appointment confirmations/reminders
  - Invoice sent/overdue
  - Session status updates
  - Job card approval requests
- Add notification preferences per client
- Schedule reminder emails (24h before appointment)

**Why:** Automated notifications improve customer communication and reduce manual work.

---

## 🔵 Low Priority (Enhancements & Polish)

### 16. **Standardize Module Folder Structure**
**Priority:** 🔵 Low  
**Effort:** 2-3 hours  
**Impact:** Low - Consistency

**Tasks:**
- Ensure all modules have consistent structure:
  - `Entities/`
  - `Interfaces/`
  - `Services/`
  - `DTOs/`
  - `GraphQL/` (where applicable)
- Add missing folders to modules that need them
- Document module structure standards

**Why:** Inconsistent folder structure makes navigation harder. Standardization improves maintainability.

---

### 17. **Create Constants Classes**
**Priority:** 🔵 Low  
**Effort:** 1-2 hours  
**Impact:** Low - Code quality

**Tasks:**
- Create `Shared/Constants/Roles.cs` for role names
- Create `Shared/Constants/Prefixes.cs` for number prefixes
- Create `Shared/Constants/StatusMessages.cs` for status messages
- Replace hardcoded strings with constants

**Why:** Hardcoded values (magic strings) make code harder to maintain. Constants provide single source of truth.

---

### 18. **Add Integration Tests**
**Priority:** 🔵 Low  
**Effort:** 8-12 hours  
**Impact:** Medium - Code quality

**Tasks:**
- Set up test project structure
- Create test database setup/teardown
- Write integration tests for:
  - Service layer operations
  - API endpoints
  - Authentication flows
  - Business logic validation
- Add CI/CD test execution

**Why:** No test coverage exists. Integration tests ensure code quality and prevent regressions.

---

### 19. **Enhance Mobile Responsiveness**
**Priority:** 🔵 Low  
**Effort:** 4-6 hours  
**Impact:** Medium - User experience

**Tasks:**
- Review all pages for mobile responsiveness
- Improve touch targets (minimum 44x44px)
- Optimize forms for mobile input
- Test on various device sizes
- Add mobile-specific navigation
- Optimize images and assets

**Why:** Mobile usage is increasing. Better mobile experience improves user satisfaction.

---

### 20. **Add API Documentation (OpenAPI/Swagger)**
**Priority:** 🔵 Low  
**Effort:** 3-4 hours  
**Impact:** Low - Developer experience

**Tasks:**
- Install Swashbuckle.AspNetCore
- Configure OpenAPI/Swagger for REST endpoints
- Add GraphQL documentation
- Document authentication requirements
- Add example requests/responses
- Deploy documentation endpoint

**Why:** API documentation helps developers integrate with the system. Currently missing.

---

## 📊 Summary Statistics

| Priority | Count | Estimated Total Effort |
|----------|-------|----------------------|
| 🔴 Critical | 5 | 10-14 hours* |
| 🟡 High | 5 | 13-18 hours |
| 🟢 Medium | 5 | 22-31 hours |
| 🔵 Low | 5 | 18-27 hours |
| **Total** | **20** | **63-90 hours** |

*Assuming database connection string is ready. Add 2-3 hours if Neon setup is needed.

---

## 🎯 Recommended Execution Order

### Week 1 (Critical Items)
1. Fix Nullable Reference Warning (#4) - 30 min
2. Migrate to Cloud Database (#2) - 10-30 min (if connection string ready)
3. Add Configuration Options Pattern (#3) - 3-4 hours
4. Implement Structured Logging (#1) - 4-6 hours
5. Enhance Global Exception Middleware (#5) - 2-3 hours

**Week 1 Total: ~10-14 hours** (if database connection string is ready)

### Week 2 (Code Quality)
6. Add Logging to All Services (#6) - 3-4 hours
7. Create Shared Helper Services (#7) - 3-4 hours
8. Clean Up Dead Code (#10) - 1-2 hours
9. Add CancellationToken Support (#8) - 4-5 hours
10. Create Custom Domain Exceptions (#9) - 2-3 hours

**Week 2 Total: ~13-18 hours**

### Week 3-4 (UX & Features)
11. Implement Client Search Autocomplete (#11) - 4-5 hours
12. Implement Phone Number Validation (#12) - 3-4 hours
13. Create Professional Email Templates (#13) - 3-4 hours
14. Add Automated Email Notifications (#15) - 4-6 hours
15. Standardize Module Folder Structure (#16) - 2-3 hours

**Week 3-4 Total: ~16-22 hours**

### Week 5-6 (Enhancements)
16. Implement Reports Module (#14) - 8-12 hours
17. Create Constants Classes (#17) - 1-2 hours
18. Enhance Mobile Responsiveness (#19) - 4-6 hours
19. Add Integration Tests (#18) - 8-12 hours
20. Add API Documentation (#20) - 3-4 hours

**Week 5-6 Total: ~24-36 hours**

---

## 📝 Notes

- **Estimated times** are for experienced developers. Add 20-30% buffer for learning curve.
- **Priorities** can be adjusted based on business needs.
- Some items can be worked on in parallel (e.g., #11 and #12).
- Consider breaking large items (#14, #18) into smaller sub-tasks.
- Regular code reviews should be conducted as items are completed.

---

**Last Updated:** December 6, 2025

