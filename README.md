# PaaS_AWS-Education-Web-Backend

Education Web Backend API built with Express.js and MongoDB, designed to work with AWS Cognito for authentication.

## Features

- Express.js-based REST API
- MongoDB (DocumentDB) integration
- JWT authentication with AWS Cognito
- User profile management
- Swagger API documentation

## Prerequisites

- Node.js (v16 or higher)
- MongoDB or AWS DocumentDB
- AWS Cognito User Pool configured in your frontend

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/PhamTatThanh-VNU/PaaS_AWS-Education-Web-Backend.git
cd PaaS_AWS-Education-Web-Backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   
   Create a `.env` file in the root directory and add the following:

```
PORT=3000
NODE_ENV=development
AWS_REGION=ap-southeast-1
COGNITO_USER_POOL_ID=your-cognito-user-pool-id
COGNITO_APP_CLIENT_ID=your-cognito-app-client-id
```

4. Start the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## API Documentation

Once the server is running, Swagger documentation is available at:

```
http://localhost:3000/api-docs
```

## API Endpoints

### User Management

- `POST /api/users/profile` - Create or update user profile (requires JWT token)
- `GET /api/users/profile` - Get current user's profile (requires JWT token)
- `GET /api/users/{userId}` - Get a user by ID (requires JWT token)
- `PUT /api/users/{userId}` - Update a user (requires JWT token)

## Authentication

This API uses JWT tokens from AWS Cognito. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database

The application connects to MongoDB/DocumentDB using the configuration in `mongodb.js`.
