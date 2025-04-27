# Postman Example: Creating a Client

## Request Details

- **Method**: POST
- **URL**: `http://localhost:3000/clients`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer your_jwt_token_here
  ```

## Request Body

```json
{
  "name": "John Doe",
  "mobileNumber": "+1234567890",
  "carModel": "Toyota Camry",
  "plateNumber": "ABC123",
  "color": "Blue",
  "mileage": 45000,
  "year": 2020
}
```

## Response (Success - 201 Created)

```json
{
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "mobileNumber": "+1234567890",
    "carModel": "Toyota Camry",
    "lastVisit": null,
    "createdAt": "2025-04-27T10:30:45.123Z",
    "updatedAt": "2025-04-27T10:30:45.123Z"
  },
  "vehicle": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "plateNumber": "ABC123",
    "color": "Blue",
    "mileage": 45000,
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "AVAILABLE",
    "createdAt": "2025-04-27T10:30:45.123Z",
    "updatedAt": "2025-04-27T10:30:45.123Z"
  }
}
```

## Notes

- The carModel field in the client will contain the general vehicle description
- The car details (make, model, year, etc.) are stored in the related Vehicle record
- You need to implement logic in your service to:
  1. Create the Client record
  2. Parse carModel to extract make and model (or accept these as separate fields)
  3. Create the Vehicle record with a relationship to the Client

## Possible Implementation in ClientsService

```typescript
async create(createClientDto: CreateClientDto) {
  // Extract car information
  const { name, mobileNumber, carModel, plateNumber, color, mileage, year } = createClientDto;

  // Create the client
  const client = await this.prisma.client.create({
    data: {
      name,
      mobileNumber,
      carModel,
    },
  });

  // Create the vehicle linked to the client
  const vehicle = await this.prisma.vehicle.create({
    data: {
      make: carModel.split(' ')[0], // This is a simplistic approach; better parsing may be needed
      model: carModel.split(' ').slice(1).join(' '), // This is a simplistic approach
      year: year || new Date().getFullYear(),
      plateNumber,
      color,
      mileage,
      clientId: client.id,
    },
  });

  return { client, vehicle };
}
```
