# Gixat Frontend - Backend Integration Guide

## Overview
This document describes the backend integration that has been implemented in the Gixat frontend application. The app now fetches real data from the GraphQL backend instead of using hardcoded values.

## Backend Connection Details

### GraphQL Endpoint
- **URL**: `http://192.168.1.214:4006/api/graphql`
- **Auth**: Bearer Token (JWT)
- **Verified**: ✅ Tested and working

### Authentication
- Token is stored in localStorage after login
- Automatically injected into all GraphQL requests via `graphql-client.ts`
- User authentication determined by `user.type`: `BUSINESS` or `CLIENT`

## Architecture

### Key Files

#### 1. `/src/lib/graphql-client.ts`
Handles all GraphQL requests with:
- Bearer token injection
- Error handling with detailed logging
- Debug console output for development

#### 2. `/src/lib/dashboard.queries.ts`
Comprehensive GraphQL query definitions including:
- `GET_DASHBOARD_STATISTICS` - Fetches all business metrics
- `GET_CLIENT_STATS_QUERY` - Client statistics
- `GET_CLIENT_CARS_QUERY` - Client's vehicles
- `GET_CLIENT_APPOINTMENTS_QUERY` - Client appointments
- And 25+ more queries for various dashboard features

#### 3. `/src/lib/hooks/useDashboardStats.ts`
Custom hook for business/owner dashboard:
- Fetches real data from backend
- Returns: `stats`, `loading`, `error`, `refetch`
- Provides fallback values while loading

#### 4. `/src/lib/hooks/useClientDashboardStats.ts`
Custom hook for client dashboard:
- Fetches client-specific data
- Calculates derived stats (pending appointments, etc.)
- Handles API errors gracefully

### Dashboard Pages

#### Business Dashboard (`/src/app/dashboard/page.tsx`)
**Displays:**
- Total Clients (from `clientStats.totalClients`)
- Active Clients (from `clientStats.activeClients`)
- Total Vehicles (from `carStats.totalCars`)
- Total Appointments (from `appointmentStats.total`)
- Pending Appointments (from `appointmentStats.pending`)
- Revenue (placeholder - TODO)

**Updates:**
- Now uses real backend data instead of hardcoded values
- Shows loading state (`...`) while fetching
- Displays error indicator if connection fails

#### Client Dashboard (`/src/app/user-dashboard/page.tsx`)
**Displays:**
- My Vehicles (total count)
- Appointments (total count)
- Pending Appointments
- Service History (placeholder - TODO)
- Reminders (placeholder - TODO)

**Updates:**
- Fetches real cars and appointments from backend
- Calculates pending appointments count
- Shows loading state during data fetch

## Data Flow

```
1. User logs in → Token stored in localStorage
2. Dashboard mounts → useEffect triggers stats hook
3. Hook calls graphqlRequest with GET_DASHBOARD_STATISTICS
4. Backend returns data → State updated
5. Component re-renders with real data
6. Error states handled gracefully with fallback values
```

## Backend Queries Tested

### Available Queries (Verified Working)
- ✅ `me` - Get current user info
- ✅ `businesses` - Get user's businesses
- ✅ `myGarages` - Get garages for business
- ✅ `clientStats` - Client statistics (returns object)
- ✅ `carStats` - Car statistics
- ✅ `appointmentStatistics` - Appointment metrics
- ✅ `jobCardStatistics` - Returns JSON string (needs parsing)

### Query Parameters
Most queries require `businessId` parameter. Current implementation uses:
```typescript
businessId: "1" // Hardcoded for logged-in user (single business)
```

In production, this should be extracted from user data or passed dynamically.

## Important Notes

### Statistics Query Quirk
Some backend statistics queries return **JSON strings** instead of objects:
- `jobCardStatistics` → String scalar
- Must be parsed with `JSON.parse()` if needed
- Other stats (clientStats, carStats) return proper objects

### Data Types
All backend data types are properly typed in the hooks:

```typescript
interface DashboardStats {
  totalGarages: number;
  totalEmployees: number;
  totalWorkOrders: number;
  totalRevenue: string;
  clientStats: {
    totalClients: number;
    activeClients: number;
    clientsWithCars: number;
    totalCars: number;
  };
  // ... more fields
}
```

## Error Handling

### What Happens on Error:
1. Error is caught and logged to console
2. Component shows error indicator
3. Fallback/default values displayed
4. User can retry with `refetch()` function

### Common Issues:
- **No Bearer token** → User redirected to login
- **Backend offline** → Error message displayed
- **Invalid businessId** → Returns empty/null values

## TODO / Future Enhancements

1. **Financial Data** - `GET_BUSINESS_FINANCIAL_QUERY` not yet implemented
2. **Service History** - Client dashboard needs service history query
3. **Reminders** - Reminder count calculation needed
4. **Caching** - Implement query result caching to reduce API calls
5. **Real-time Updates** - Consider WebSocket subscriptions for live data
6. **Pagination** - Large datasets need pagination support
7. **Error Boundaries** - Add React Error Boundaries for fallback UI
8. **Loading Skeletons** - Replace "..." with skeleton loaders

## Testing the Integration

### Test with curl (Manual)
```bash
curl -X POST "http://192.168.1.214:4006/api/graphql" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id email type } }"}'
```

### In Browser Console
```javascript
// Access the hook state
console.log(stats); // Current statistics
console.log(loading); // Loading state
console.log(error); // Any error message
```

## Code Examples

### Using the Dashboard Stats Hook
```typescript
const { stats, loading, error, refetch } = useDashboardStats();

return (
  <div>
    {loading ? <p>Loading...</p> : <p>{stats?.clientStats.totalClients}</p>}
    <button onClick={refetch}>Refresh</button>
  </div>
);
```

### Making Custom Queries
```typescript
import { graphqlRequest } from '@/lib/graphql-client';
import { GET_CLIENTS_LIST } from '@/lib/dashboard.queries';

const data = await graphqlRequest(GET_CLIENTS_LIST, { businessId: '1' });
```

## Environment Configuration

### next.config.ts
Rewrites GraphQL requests to backend:
```typescript
rewrites: async () => [
  {
    source: '/api/graphql',
    destination: 'http://192.168.1.214:4006/api/graphql',
  },
],
```

This allows frontend to call `/api/graphql` (same origin) instead of cross-origin request.

## Related Files
- `/src/lib/storage.ts` - Token management
- `/src/lib/auth.mutations.ts` - Login/auth queries
- `/src/components/DashboardLayout.tsx` - Shared dashboard layout
- `/src/components/Sidebar.tsx` - Navigation with role-based menu

---

**Last Updated**: 2025-01-22
**Backend Status**: ✅ Connected and Verified
**Data Integration**: ✅ Implemented for Dashboard Statistics
