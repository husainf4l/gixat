# Gixat Garage Management System

## Overview
Gixat is a comprehensive garage management system designed to help auto repair businesses manage their clients, vehicles, and operations efficiently. The system provides a complete solution for tracking customers, their vehicles, and garage operations.

## 🚗 Core Entities

### **Client Entity**
Represents customers who bring their vehicles to the garage.

**Key Features:**
- Personal information (name, contact details, address)
- Relationship with Business (garage)
- One-to-many relationship with Cars
- Search functionality by name, email, or phone
- Client statistics and reporting

**Fields:**
- `firstName`, `lastName` - Client name
- `email` - Unique contact email
- `phone` - Contact number
- `address`, `city`, `state`, `zipCode` - Location details
- `dateOfBirth` - Optional birth date
- `notes` - Additional notes about the client
- `businessId` - Links to specific garage

### **Car Entity**
Represents vehicles owned by clients and serviced by the garage.

**Key Features:**
- Complete vehicle information (make, model, year, etc.)
- Insurance tracking with expiry notifications
- Vehicle status management (active, in service, etc.)
- Advanced search capabilities
- Comprehensive reporting and statistics

**Fields:**
- `make`, `model`, `year` - Vehicle identification
- `licensePlate` - Unique identifier per business
- `vin` - Vehicle identification number (optional)
- `color`, `fuelType`, `transmission` - Vehicle specifications
- `mileage`, `engineSize` - Technical details
- `insurance*` fields - Insurance tracking
- `status` - Current vehicle status
- `clientId`, `businessId` - Relationships

---

## 🔧 Enums and Types

### **CarMake Enum**
Comprehensive list of car manufacturers:
- Toyota, Honda, Ford, Chevrolet, BMW, Mercedes, Audi, etc.
- 30+ popular car brands supported
- Extensible with "OTHER" option

### **Vehicle Specifications**
- **FuelType**: Gasoline, Diesel, Hybrid, Electric, CNG, LPG
- **TransmissionType**: Manual, Automatic, CVT, Semi-Automatic
- **CarColor**: All standard colors plus "OTHER"
- **CarStatus**: Active, In Service, Inactive, Sold, Scrapped

---

## 📊 Business Logic Features

### **Client Management**
- ✅ Create/Read/Update/Delete clients
- ✅ Search clients by name, email, phone
- ✅ Client statistics (total clients, clients with cars, etc.)
- ✅ Business-scoped client isolation
- ✅ Soft delete functionality

### **Vehicle Management**
- ✅ Complete car lifecycle management
- ✅ Status tracking (active, in service, etc.)
- ✅ Insurance expiry notifications
- ✅ Advanced search (by make, model, license plate, owner)
- ✅ Vehicle statistics and reporting
- ✅ Unique constraints (license plate per business)

### **Reporting & Analytics**
- ✅ Client statistics dashboard
- ✅ Vehicle statistics by make, status
- ✅ Insurance expiry alerts
- ✅ Business performance metrics

---

## 🛡️ Security & Data Integrity

### **Business Isolation**
- All clients and cars are scoped to specific garages (businesses)
- Prevents cross-business data access
- Unique constraints per business (e.g., license plates)

### **Data Validation**
- Email format validation
- Required field enforcement
- Enum validation for standardized data
- Date validation for insurance/registration

### **Soft Deletes**
- `isActive` flag prevents data loss
- Maintains referential integrity
- Allows data recovery

---

## 🚀 GraphQL API

### **Client Operations**

#### Query Examples:
```graphql
# Get all clients for a garage
query {
  clientsByBusiness(businessId: 1) {
    id
    fullName
    email
    phone
    cars {
      id
      displayName
      status
    }
  }
}

# Search clients
query {
  searchClients(businessId: 1, searchTerm: "john") {
    id
    fullName
    email
    cars {
      licensePlate
    }
  }
}

# Client statistics
query {
  clientStats(businessId: 1) {
    totalClients
    clientsWithCars
    totalCars
  }
}
```

#### Mutation Examples:
```graphql
# Create a new client
mutation {
  createClient(input: {
    firstName: "John"
    lastName: "Doe"
    email: "john@example.com"
    phone: "+1234567890"
    address: "123 Main St"
    city: "New York"
    businessId: 1
  }) {
    id
    fullName
    email
  }
}

# Update client
mutation {
  updateClient(id: 1, input: {
    phone: "+1987654321"
    notes: "VIP customer"
  }) {
    id
    fullName
    phone
  }
}
```

### **Car Operations**

#### Query Examples:
```graphql
# Get cars with expiring insurance
query {
  carsWithExpiringInsurance(businessId: 1, days: 30) {
    id
    displayName
    insuranceExpiryDate
    client {
      fullName
      phone
    }
  }
}

# Car statistics
query {
  carStats(businessId: 1) {
    totalCars
    activeCars
    inServiceCars
    carsByMake {
      make
      count
    }
    carsByStatus {
      status
      count
    }
  }
}

# Search cars
query {
  searchCars(businessId: 1, searchTerm: "toyota") {
    id
    displayName
    status
    client {
      fullName
    }
  }
}
```

#### Mutation Examples:
```graphql
# Add a new car
mutation {
  createCar(input: {
    make: TOYOTA
    model: "Camry"
    year: 2020
    licensePlate: "ABC123"
    color: WHITE
    fuelType: GASOLINE
    transmission: AUTOMATIC
    clientId: 1
    businessId: 1
  }) {
    id
    displayName
    status
  }
}

# Update car status
mutation {
  updateCarStatus(id: 1, status: IN_SERVICE) {
    id
    status
    displayName
  }
}
```

---

## 📁 File Structure

```
src/garage/
├── entities/
│   ├── client.entity.ts          # Client database model
│   └── car.entity.ts             # Car database model
├── enums/
│   └── car.enum.ts               # Car-related enums
├── dto/
│   └── garage.input.ts           # GraphQL input types
├── services/
│   ├── client.service.ts         # Client business logic
│   └── car.service.ts            # Car business logic
├── resolvers/
│   ├── client.resolver.ts        # Client GraphQL API
│   └── car.resolver.ts           # Car GraphQL API
└── garage.module.ts              # Module configuration
```

---

## 🎯 Use Cases

### **For Garage Owners:**
- Track all customer vehicles in one place
- Get notified about expiring insurance
- Generate reports on customer base and vehicles
- Search customers and vehicles quickly
- Manage vehicle status during service

### **For Garage Staff:**
- Quick lookup of customer information
- Vehicle history and specifications
- Insurance details for service authorization
- Status updates during repairs

### **For Analytics:**
- Customer growth tracking
- Popular vehicle makes/models
- Service volume analysis
- Insurance expiry management

---

## 🔮 Future Enhancements

### **Service Management** (Next Phase)
- Service appointments and scheduling
- Work orders and job tracking
- Parts inventory management
- Invoice generation

### **Advanced Features**
- Vehicle maintenance history
- Service reminders
- Customer notifications
- Photo attachments for vehicles
- Integration with payment systems

---

## 💼 Business Value

✅ **Centralized customer management**  
✅ **Complete vehicle tracking**  
✅ **Insurance compliance monitoring**  
✅ **Business analytics and reporting**  
✅ **Scalable multi-garage support**  
✅ **Secure data isolation**  

The Gixat system provides a solid foundation for garage operations with room to grow into a comprehensive automotive service management platform! 🚗⚡