# Excel Analyzer Backend API

A Node.js Express backend with MongoDB for the Excel Analyzer application.

## Features

- User authentication (register/login) with JWT tokens
- Secure password hashing with bcrypt
- Excel data storage and retrieval
- Data analytics calculation
- RESTful API endpoints
- Input validation and error handling
- CORS configuration for frontend integration

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/excel-analyzer
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/verify` - Verify JWT token (protected)

### Data Management
- `POST /api/data/save-excel` - Save Excel data (protected)
- `GET /api/data/excel-history` - Get user's Excel data history (protected)
- `GET /api/data/excel/:id` - Get specific Excel data (protected)
- `GET /api/data/latest-excel` - Get latest Excel data for reports (protected)
- `DELETE /api/data/excel/:id` - Delete Excel data (protected)

### Health Check
- `GET /api/health` - API health check

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `NODE_ENV` - Environment (development/production)

## Database Schema

### User Model
- `username` - Unique username (3-30 characters)
- `password` - Hashed password (min 6 characters)
- `createdAt` - Account creation timestamp
- `lastLogin` - Last login timestamp

### ExcelData Model
- `userId` - Reference to User
- `filename` - Generated filename
- `originalName` - Original file name
- `data` - Processed Excel data (labels and values)
- `chartData` - Chart configuration data
- `analytics` - Calculated statistics (total, average, min, max, count)
- `uploadedAt` - Upload timestamp

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- File upload restrictions (Excel files only, 10MB limit)
- Protected routes with authentication middleware

## Development

Run in development mode with auto-restart:
```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update `MONGODB_URI` to your production database
3. Change `JWT_SECRET` to a secure random string
4. Configure CORS origins for your production frontend domain
5. Start the server:
```bash
npm start
```

## Testing the API

You can test the API endpoints using tools like Postman or curl. The server includes a health check endpoint at `/api/health` to verify it's running correctly.

Example registration request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","confirmPassword":"password123"}'
```