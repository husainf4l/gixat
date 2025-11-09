# Business Model - Data Structure

## Overview
This application implements a comprehensive multi-tenant business system with role-based access control (RBAC).

## Entities

### 1. User Entity
**File:** `src/user/user.entity.ts`

Users represent accounts in the system with three types:
- `BUSINESS` - Business owners/operators
- `CLIENT` - Regular customers
- `SYSTEM` - System administrators

**Fields:**
- `id`: Primary key
- `email`: Unique email address
- `name`: User's full name
- `type`: UserType enum (business/client/system)
- `password`: Encrypted password (nullable)
- `isActive`: Soft delete flag
- `createdAt`, `updatedAt`: Timestamps

**Relations:**
- `userBusinesses`: One-to-many with UserBusiness (user can be in multiple businesses)

---

### 2. Business Entity
**File:** `src/business/entities/business.entity.ts`

Represents a business/company in the system.

**Fields:**
- `id`: Primary key
- `name`: Business name
- `description`: Business description
- `logo`: Logo URL
- `phone`, `email`, `address`, `website`: Contact information
- `ownerId`: Foreign key to User (business owner)
- `isActive`: Soft delete flag
- `createdAt`, `updatedAt`: Timestamps

**Relations:**
- `owner`: Many-to-one with User
- `userBusinesses`: One-to-many with UserBusiness (multiple users can access this business)

---

### 3. Role Entity
**File:** `src/business/entities/role.entity.ts`

Roles are permission groups scoped to a specific business. Each business can create custom roles.

**Fields:**
- `id`: Primary key
- `name`: Role name (e.g., "Manager", "Sales Rep", "Viewer")
- `description`: Role description
- `businessId`: Foreign key to Business
- `isActive`: Soft delete flag
- `isDefault`: Flag for default role assignment
- `createdAt`, `updatedAt`: Timestamps

**Relations:**
- `business`: Many-to-one with Business
- `permissions`: Many-to-many with Permission

**Best Practice:** Each business has isolated roles, preventing cross-business permission issues.

---

### 4. Permission Entity
**File:** `src/business/entities/permission.entity.ts`

Granular permissions based on resource-action pairs.

**Fields:**
- `id`: Primary key
- `name`: Human-readable name
- `description`: Permission description
- `resource`: PermissionResource enum (users, roles, products, orders, etc.)
- `action`: PermissionAction enum (create, read, update, delete, manage)
- `createdAt`, `updatedAt`: Timestamps

**Unique Index:** `resource` + `action` combination

**Examples:**
- `users:create` - Can create users
- `products:read` - Can view products
- `orders:manage` - Full control over orders

---

### 5. UserBusiness Entity (Junction Table)
**File:** `src/business/entities/user-business.entity.ts`

Links users to businesses with assigned roles. Supports multi-tenancy.

**Fields:**
- `id`: Primary key
- `userId`: Foreign key to User
- `businessId`: Foreign key to Business
- `isActive`: Soft delete flag
- `createdAt`: Timestamp

**Relations:**
- `user`: Many-to-one with User
- `business`: Many-to-one with Business
- `roles`: Many-to-many with Role

**Unique Index:** `userId` + `businessId` (user can only join a business once)

**Best Practice:** This allows:
- One user to work for multiple businesses
- Each user to have different roles in different businesses
- Easy permission checking: `user -> business -> roles -> permissions`

---

## Database Relationships Diagram

\`\`\`
User (1) ──── (N) UserBusiness (N) ──── (1) Business
                      │
                      │ (N)
                      │
                      ▼
                    Role (N) ──── (N) Permission
                      │
                      └──── (1) Business
\`\`\`

---

## Key Design Patterns

### 1. Multi-Tenancy
Each Business is isolated. Roles and user-business relationships are scoped per business.

### 2. RBAC (Role-Based Access Control)
- **Permissions** are atomic (resource:action pairs)
- **Roles** are collections of permissions
- **Users** get permissions through roles within a business context

### 3. Soft Deletes
`isActive` flags prevent data loss while maintaining referential integrity.

### 4. Flexibility
- System can create global permissions
- Each business creates custom roles combining permissions
- Users can have different roles in different businesses

---

## GraphQL Queries

### Get all businesses
\`\`\`graphql
query {
  businesses {
    id
    name
    owner {
      name
      email
    }
  }
}
\`\`\`

### Get roles for a business
\`\`\`graphql
query {
  rolesByBusiness(businessId: 1) {
    id
    name
    permissions {
      name
      resource
      action
    }
  }
}
\`\`\`

### Get all permissions
\`\`\`graphql
query {
  permissions {
    id
    name
    resource
    action
  }
}
\`\`\`

---

## Usage Flow

1. **User Registration**: Create user with type (business/client/system)
2. **Business Creation**: Business user creates a business (becomes owner)
3. **Role Setup**: Business owner creates roles and assigns permissions
4. **Team Management**: Owner invites users and assigns roles via UserBusiness
5. **Permission Check**: When user performs action, check: User → UserBusiness → Roles → Permissions

---

## Best Practices Implemented

✅ **Normalized data structure** - No redundancy  
✅ **Scalable RBAC** - Easy to add new permissions/resources  
✅ **Multi-tenant isolation** - Business data is separated  
✅ **Audit trails** - CreatedAt/UpdatedAt timestamps  
✅ **Soft deletes** - Data preservation with isActive flags  
✅ **Type safety** - Enums for UserType, PermissionAction, PermissionResource  
✅ **Unique constraints** - Prevent duplicate entries  
✅ **GraphQL integration** - Type-safe API layer  

---

## Future Enhancements

- Add permission inheritance/hierarchy
- Implement row-level security policies
- Add permission caching for performance
- Create permission decorator for route guards
- Add audit logs for permission changes
