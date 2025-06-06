# Excel Analyzer Backend API

A Node.js Express backend with MongoDB Atlas for the Excel Analyzer application.

## Features

- User authentication (register/login) with JWT tokens
- Secure password hashing with bcrypt
- Excel data storage and retrieval with MongoDB Atlas
- Data analytics calculation
- RESTful API endpoints
- Input validation and error handling
- CORS configuration for frontend integration

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)
- npm or yarn

## MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose "Shared" (free tier)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Create a Database User:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add your specific IP addresses
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Clusters" and click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database-name>` with your preferred database name (e.g., "excel-analyzer")

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your MongoDB Atlas configuration:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/excel-analyzer?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
NODE_ENV=development
```

**Important:** Replace the following in your MONGODB_URI:
- `your-username` - Your MongoDB Atlas database username
- `your-password` - Your MongoDB Atlas database password
- `your-cluster` - Your cluster name from Atlas
- `excel-analyzer` - Your preferred database name

4. Start the development server:
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
- `GET /api/health` - API health check (includes database connection status)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token signing (make it long and random)
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
- Secure MongoDB Atlas connection with authentication

## Development

Run in development mode with auto-restart:
```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update `MONGODB_URI` to your production MongoDB Atlas cluster
3. Change `JWT_SECRET` to a secure random string (at least 32 characters)
4. Configure CORS origins for your production frontend domain
5. Update MongoDB Atlas network access to allow your production server IPs
6. Start the server:
```bash
npm start
```

## Troubleshooting

### Connection Issues
- Verify your MongoDB Atlas connection string is correct
- Check that your IP address is whitelisted in Network Access
- Ensure your database user has the correct permissions
- Verify your username and password are correct in the connection string

### Common Errors
- `MongoServerSelectionError`: Usually indicates network access issues or incorrect connection string
- `Authentication failed`: Check your database username and password
- `Timeout`: May indicate network connectivity issues or IP not whitelisted

## Testing the API

You can test the API endpoints using tools like Postman or curl. The server includes a health check endpoint at `/api/health` to verify it's running correctly and connected to MongoDB Atlas.

Example registration request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","confirmPassword":"password123"}'
```

Example health check:
```bash
curl http://localhost:5000/api/health
```

## MongoDB Atlas Benefits

- **Free Tier**: 512 MB storage, shared RAM and vCPU
- **Automatic Backups**: Point-in-time recovery
- **Global Clusters**: Deploy across multiple regions
- **Built-in Security**: Encryption at rest and in transit
- **Monitoring**: Real-time performance metrics
- **Scalability**: Easy to upgrade as your app grows