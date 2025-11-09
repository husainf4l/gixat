# JWT Authentication - Best Practices Implementation

## Overview
This implementation follows JWT authentication best practices with secure token handling, proper password hashing, and comprehensive security features.

## 🔐 Security Features

### 1. **JWT Token Strategy**
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Separate Secrets**: Different secrets for access and refresh tokens
- **Token Rotation**: New access tokens generated via refresh endpoint

### 2. **Password Security**
- **bcryptjs**: Industry standard password hashing
- **Salt Rounds**: 12 rounds (high security)
- **Password Validation**: Minimum 8 characters required

### 3. **Input Validation**
- **class-validator**: Schema validation for inputs
- **Email Validation**: Proper email format checking
- **Type Safety**: TypeScript + GraphQL type safety

---

## 📁 File Structure

\`\`\`
src/auth/
├── dto/
│   ├── auth.input.ts          # GraphQL input types
│   └── auth.response.ts       # GraphQL response types
├── guards/
│   ├── jwt-auth.guard.ts      # JWT authentication guard
│   ├── local-auth.guard.ts    # Local authentication guard
│   └── roles.guard.ts         # Role-based authorization guard
├── strategies/
│   ├── jwt.strategy.ts        # JWT Passport strategy
│   └── local.strategy.ts      # Local Passport strategy
├── decorators/
│   ├── current-user.decorator.ts  # Get current user
│   └── roles.decorator.ts     # Role-based access decorator
├── interfaces/
│   └── jwt-payload.interface.ts   # JWT payload types
├── auth.service.ts            # Authentication business logic
├── auth.resolver.ts           # GraphQL resolvers
└── auth.module.ts             # Auth module configuration
\`\`\`

---

## 🚀 Usage Examples

### **Registration**
\`\`\`graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "securepassword123"
    name: "John Doe"
    type: CLIENT
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      type
    }
    expiresIn
  }
}
\`\`\`

### **Login**
\`\`\`graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "securepassword123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      type
    }
    expiresIn
  }
}
\`\`\`

### **Get Current User (Protected)**
\`\`\`graphql
# Headers: { "Authorization": "Bearer <accessToken>" }
query {
  me {
    id
    email
    name
    type
    isActive
  }
}
\`\`\`

### **Refresh Token**
\`\`\`graphql
mutation {
  refreshToken(refreshToken: "<refreshToken>") {
    accessToken
    expiresIn
  }
}
\`\`\`

---

## 🛡️ Guards & Decorators

### **Using JWT Guard**
\`\`\`typescript
@Query(() => [Business])
@UseGuards(JwtAuthGuard)
async myBusinesses(@CurrentUser() user: User): Promise<Business[]> {
  return this.businessService.findByOwnerId(user.id);
}
\`\`\`

### **Role-Based Access**
\`\`\`typescript
@Query(() => [User])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.SYSTEM, UserType.BUSINESS)
async getAllUsers(): Promise<User[]> {
  return this.userService.findAll();
}
\`\`\`

### **Getting Current User**
\`\`\`typescript
@Mutation(() => Business)
@UseGuards(JwtAuthGuard)
async createBusiness(
  @Args('input') input: CreateBusinessInput,
  @CurrentUser() user: User,
): Promise<Business> {
  return this.businessService.create({ ...input, ownerId: user.id });
}
\`\`\`

---

## 🔧 Environment Variables

Create a \`.env\` file:

\`\`\`env
# JWT Secrets (use strong, random strings in production)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-different-from-access

# Database (already configured)
DB_HOST=149.200.251.12
DB_PORT=5432
DB_USERNAME=husain
DB_PASSWORD=tt55oo77
DB_NAME=gixat
\`\`\`

---

## 🔒 Security Best Practices Implemented

### ✅ **Token Security**
- Short-lived access tokens (15 min)
- Separate refresh token mechanism
- Different secrets for access/refresh tokens
- Token payload contains minimal data (id, email, type)

### ✅ **Password Security**
- bcrypt with 12 salt rounds
- Password never stored in plain text
- Password excluded from GraphQL responses
- Minimum password length validation

### ✅ **Input Validation**
- Email format validation
- Password strength requirements
- Type-safe GraphQL schemas
- Enum validation for user types

### ✅ **Error Handling**
- Generic error messages (no information leakage)
- Proper HTTP status codes
- Consistent error responses

### ✅ **Authorization**
- Role-based access control
- User type checking (business/client/system)
- Guard composition for complex permissions

---

## 🔄 Token Lifecycle

1. **Login/Register** → Access + Refresh tokens issued
2. **API Calls** → Access token in Authorization header
3. **Token Expires** → Use refresh token to get new access token
4. **Refresh Expires** → User must login again

---

## 🛠️ Next Steps

### **Enhanced Security** (Optional)
- [ ] Add refresh token rotation
- [ ] Implement token blacklisting
- [ ] Add rate limiting
- [ ] Enable 2FA authentication
- [ ] Add account lockout after failed attempts

### **Business Logic Integration**
- [ ] Business-scoped permissions
- [ ] Role-based business access
- [ ] Permission checking middleware
- [ ] Audit logging for auth events

---

## 🎯 Testing

### **Test Login Flow**
1. Start your server: \`npm run start:dev\`
2. Open GraphiQL: \`http://localhost:3000/graphiql\`
3. Register a new user
4. Login with credentials
5. Use access token in headers for protected queries

### **Example Headers**
\`\`\`json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

This authentication system provides enterprise-grade security while maintaining simplicity and ease of use! 🚀