# Auth Service

Enterprise-grade authentication microservice built with NestJS.

## Features

- ✅ JWT Authentication (Access & Refresh Tokens)
- ✅ User Registration & Login
- ✅ Role-Based Access Control (RBAC)
- ✅ Password Hashing (bcrypt)
- ✅ OAuth2 Support (Google & GitHub) - Coming soon
- ✅ Two-Factor Authentication (2FA) - Coming soon
- ✅ Prisma ORM with PostgreSQL

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database running
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update DATABASE_URL in .env file

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push
```

## Running the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The service will run on `http://localhost:3001`

## API Endpoints

### Public Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/health` - Health check

### Protected Endpoints (Requires JWT)

- `GET /auth/me` - Get current user profile

### Admin Only Endpoints

- `GET /auth/admin-only` - Demo admin endpoint

## Example Requests

### Register

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Profile (Protected)

```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Database Schema

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String?
  role          Role     @default(USER)
  isVerified    Boolean  @default(false)
  ...
}

enum Role {
  USER
  TRADER
  VIP_ANALYST
  ADMIN
}
```

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker

```bash
# Build image
docker build -t markethub-auth-service .

# Run container
docker run -p 3001:3001 markethub-auth-service
```

## License

MIT
