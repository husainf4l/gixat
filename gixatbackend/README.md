<p align="center">
  <h1 align="center">Gixat Backend</h1>
  <p align="center">Smart Garage Management Software</p>
</p>

## Description

Gixat is a comprehensive garage management software designed to help auto repair shops and garages manage their operations efficiently. Built on the [Nest](https://github.com/nestjs/nest) framework, this backend provides robust APIs to power the Gixat platform.

### Key Features

- 🔧 **Service Management** - Track repairs and maintenance jobs
- 👥 **Customer Management** - Store and manage customer information
- 📅 **Appointment Scheduling** - Book and manage customer appointments
- 📊 **Inventory Tracking** - Monitor parts and supplies
- 💰 **Invoicing & Payments** - Generate invoices and process payments
- 📱 **Mobile Accessibility** - Access your garage management system anywhere

## Project setup

```bash
# Install dependencies
$ npm install

# Set up environment variables
$ cp .env.example .env
# Edit .env with your specific configuration
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

Once the application is running, you can access the API documentation at:

```
http://localhost:3000/api/docs
```

## Deployment

For production deployment, follow these steps:

1. Build the application: `npm run build`
2. Set up proper environment variables in your production environment
3. Run the application: `npm run start:prod`

## Technology Stack

- **Framework**: NestJS
- **Database**: MongoDB/PostgreSQL
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

## Support and Feedback

For support or feedback, please contact our team or open an issue on the project repository.

## License

Gixat is proprietary software. All rights reserved.
