# CipherStudio Backend Server

Backend API server for CipherStudio - A web-based IDE application.

## Features

- User authentication (Register/Login) with JWT
- Project management (Create, Read, Update, Delete)
- File and folder management with hierarchical structure
- AWS S3 integration for file storage
- MongoDB for data persistence
- RESTful API architecture

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **AWS S3** - File storage
- **express-validator** - Input validation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - Set MongoDB connection string
   - Set JWT secret key
   - Set AWS credentials and S3 bucket name

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

## Running the Server

Development mode with nodemon:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register new user | No |
| POST | `/api/users/login` | Login user | No |
| GET | `/api/users/profile` | Get user profile | Yes |

### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/projects` | Create new project | Yes |
| GET | `/api/projects` | Get all user projects | Yes |
| GET | `/api/projects/:id` | Get project by ID | Yes |
| PUT | `/api/projects/:id` | Update project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |

### Files

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/files` | Create file/folder | Yes |
| GET | `/api/files/:id` | Get file/folder by ID | Yes |
| GET | `/api/files/project/:projectId` | Get all files in project | Yes |
| PUT | `/api/files/:id` | Update file/folder | Yes |
| DELETE | `/api/files/:id` | Delete file/folder | Yes |

## API Request/Response Examples

### Register User

**Request:**
```json
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Project

**Request:**
```json
POST /api/projects
Authorization: Bearer <token>

{
  "name": "my-awesome-app",
  "description": "A cool React application",
  "template": "react"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "my-awesome-app",
    "description": "A cool React application",
    "template": "react",
    "createdAt": "2025-10-22T10:30:00.000Z",
    "lastModified": "2025-10-22T10:30:00.000Z"
  }
}
```

### Create File

**Request:**
```json
POST /api/files
Authorization: Bearer <token>

{
  "projectId": "507f1f77bcf86cd799439012",
  "parentId": "507f1f77bcf86cd799439013",
  "name": "App.js",
  "type": "file",
  "content": "import React from 'react';\n\nexport default function App() {\n  return <div>Hello World</div>;\n}",
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "projectId": "507f1f77bcf86cd799439012",
    "parentId": "507f1f77bcf86cd799439013",
    "name": "App.js",
    "type": "file",
    "s3Key": "projects/507f1f77bcf86cd799439012/507f1f77bcf86cd799439013/1729593000000-App.js",
    "language": "javascript",
    "createdAt": "2025-10-22T10:35:00.000Z"
  }
}
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  description: String,
  template: String (enum: ['react', 'vanilla', 'vue', 'angular', 'node']),
  lastModified: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Files Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  parentId: ObjectId (ref: File) | null,
  name: String,
  type: String (enum: ['file', 'folder']),
  s3Key: String | null,
  content: String,
  language: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Folder Structure

```
server/
├── config/
│   ├── database.js      # MongoDB connection
│   └── s3.js           # AWS S3 configuration
├── controllers/
│   ├── userController.js
│   ├── projectController.js
│   └── fileController.js
├── middleware/
│   ├── auth.js         # Authentication middleware
│   ├── errorHandler.js # Error handling
│   └── validator.js    # Input validation
├── models/
│   ├── User.js
│   ├── Project.js
│   └── File.js
├── routes/
│   ├── userRoutes.js
│   ├── projectRoutes.js
│   └── fileRoutes.js
├── utils/
│   └── generateToken.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Stack trace (development only)"
}
```

## AWS S3 Configuration

1. Create an S3 bucket in AWS
2. Set up IAM user with S3 access permissions
3. Add credentials to `.env` file
4. Files are stored with the following key pattern:
   ```
   projects/{projectId}/{parentId}/{timestamp}-{filename}
   ```

## MongoDB Setup

### Local MongoDB
```bash
# Start MongoDB service
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/cipherstudio
```

### MongoDB Atlas (Cloud)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cipherstudio?retryWrites=true&w=majority
   ```

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes with middleware
- Input validation and sanitization
- CORS enabled
- Environment variables for sensitive data

## Development

The server uses nodemon for automatic restart during development:

```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use strong JWT secret
3. Configure MongoDB Atlas for production
4. Set up AWS S3 bucket with proper permissions
5. Enable HTTPS
6. Use process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name cipherstudio-api
   ```

## License

ISC
