# Scalable REST API with Authentication & Role-Based Access Control

A modern, full-stack task management application built with Node.js, Express, MongoDB, and React. Features secure JWT authentication, role-based access control, comprehensive API documentation, and deployment-ready configuration.

## 🚀 Live Demo

- **Frontend**: [Task Manager App](http://localhost:3000)
- **API Documentation**: [Swagger UI](http://localhost:5000/api/v1/docs)
- **API Base URL**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

> **🌐 For Production Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Netlify + Render deployment guide

## 📋 Demo Accounts

```
Admin Account:
Email: admin@example.com
Password: Admin123!

User Account:
Email: user@example.com
Password: User123!
```

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token handling
- **Role-based access control** (User/Admin roles)
- **Password hashing** with bcrypt (12 salt rounds)
- **Input validation** and sanitization
- **Rate limiting** and security headers
- **XSS and MongoDB injection protection**

### 📊 Task Management
- **Complete CRUD operations** for tasks
- **Task categorization** and priority levels
- **Status tracking** (Pending, In Progress, Completed, Cancelled)
- **Due date management** with overdue detection
- **Task comments** and attachments support
- **Advanced filtering** and search capabilities

### 🏗️ Technical Excellence
- **API versioning** (/api/v1)
- **Comprehensive error handling** with detailed responses
- **Request/response validation** using express-validator
- **Swagger/OpenAPI documentation** with interactive UI
- **Database relationships** with proper indexing
- **Pagination** and performance optimization

### 🎨 Modern Frontend
- **React 18** with modern hooks and context
- **React Router v6** for navigation
- **React Query** for efficient data fetching
- **Tailwind CSS** for responsive design
- **Form validation** with react-hook-form
- **Toast notifications** and loading states

### 🐳 Deployment Ready
- **Docker containerization** for all services
- **Docker Compose** for development environment
- **Production-ready configuration**
- **Health checks** and monitoring
- **Load balancing** with Nginx
- **Redis caching** support

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Query + Context API
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **HTTP Client**: Axios

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Caching**: Redis
- **Process Management**: PM2 (optional)
- **Environment**: dotenv
- **Version Control**: Git

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB 7.0+**
- **npm or yarn**
- **Docker & Docker Compose** (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assign-2
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/v1/docs

### Option 2: Manual Setup

1. **Clone and setup backend**
   ```bash
   git clone <repository-url>
   cd assign-2/backend
   npm install
   cp .env.example .env
   # Configure your MongoDB connection and other settings in .env
   npm run dev
   ```

2. **Setup frontend** (in a new terminal)
   ```bash
   cd assign-2/frontend
   npm install
   cp .env.example .env
   # Configure your API URL in .env
   npm run dev
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or use your local MongoDB installation
   mongod
   ```

## 📁 Project Structure

```
assign-2/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── config/            # Configuration files
│   │   ├── utils/             # Utility functions
│   │   └── app.js             # Express application
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   └── utils/             # Utility functions
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml          # Multi-container setup
├── .env.example               # Environment variables template
└── README.md                  # Project documentation
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/scalable-rest-api
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://localhost:3000
API_VERSION=v1
API_PREFIX=/api
LOG_LEVEL=info
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "fullName": "John Doe"
    },
    "token": "jwt_token"
  }
}
```

#### POST /api/v1/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Task Endpoints

#### GET /api/v1/tasks
Get paginated list of tasks with filtering options.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status
- `priority` - Filter by priority
- `search` - Search in title/description

#### POST /api/v1/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59Z",
  "category": "development",
  "tags": ["documentation", "api"]
}
```

#### PUT /api/v1/tasks/:id
Update an existing task.

#### DELETE /api/v1/tasks/:id
Delete a task.

### Interactive API Documentation
Visit [http://localhost:5000/api/v1/docs](http://localhost:5000/api/v1/docs) for the complete interactive Swagger documentation.

## 🔐 Security Features

### Authentication & Authorization
- **JWT tokens** with configurable expiration
- **Role-based access control** (user/admin)
- **Protected routes** with middleware validation
- **Password strength requirements**
- **Secure password hashing** with bcrypt

### Input Validation & Sanitization
- **Request validation** using express-validator
- **MongoDB injection protection**
- **XSS attack prevention**
- **Data type validation**
- **Length and format constraints**

### Security Headers & Rate Limiting
- **Helmet.js** for security headers
- **CORS configuration** with origin whitelist
- **Rate limiting** to prevent abuse
- **Request logging** for monitoring
- **Health checks** for availability

## 📈 Scalability Considerations

### Database Optimization
- **Proper indexing** on frequently queried fields
- **Compound indexes** for complex queries
- **Connection pooling** for efficient resource usage
- **Aggregation pipelines** for analytics
- **Virtual fields** for computed properties

### Performance Enhancements
- **Response caching** with Redis
- **Compression middleware** for responses
- **Pagination** for large datasets
- **Query optimization** with projection
- **Static asset optimization**

### Deployment Architecture
```
[Load Balancer (Nginx)]
         |
    [API Gateway]
         |
   [App Instances] ── [Redis Cache]
         |
   [Database Cluster]
```

### Horizontal Scaling Options
- **Stateless application design**
- **Database sharding** for large datasets
- **Microservices architecture** for feature separation
- **Container orchestration** with Kubernetes
- **CDN integration** for static assets

### Monitoring & Observability
- **Application logging** with structured format
- **Health check endpoints** for load balancers
- **Performance monitoring** with metrics
- **Error tracking** and alerting
- **Database performance monitoring**

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm test               # Run component tests
npm run test:e2e      # End-to-end tests
```

### API Testing
Use the provided Postman collection or test directly with curl:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 🚀 Deployment

### Production Deployment with Docker

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy with production environment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Production Deployment

1. **Backend deployment**
   ```bash
   cd backend
   npm ci --production
   npm run build
   pm2 start ecosystem.config.js
   ```

2. **Frontend deployment**
   ```bash
   cd frontend
   npm ci
   npm run build
   # Serve build folder with nginx or static hosting
   ```

### Environment-Specific Configuration
- **Development**: Full logging, hot reloading
- **Production**: Optimized builds, security headers, monitoring
- **Testing**: Isolated database, mock services

## 🌐 Production Deployment

### Quick Deploy to Netlify + Render

1. **Deploy Backend to Render**
   - Create account at [Render](https://render.com)
   - Connect GitHub repository
   - Use `backend` as root directory
   - Set environment variables (see [DEPLOYMENT.md](DEPLOYMENT.md))

2. **Deploy Frontend to Netlify**
   - Create account at [Netlify](https://netlify.com)
   - Connect GitHub repository
   - Use `frontend` as base directory
   - Set `VITE_API_URL` to your Render backend URL

3. **Setup MongoDB Atlas**
   - Create free cluster at [MongoDB Atlas](https://mongodb.com/atlas)
   - Get connection string for backend

**📋 Complete deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions with screenshots and troubleshooting.

### Alternative Platforms
- **Backend**: Railway, Vercel, AWS, Heroku, DigitalOcean
- **Frontend**: Vercel, GitHub Pages, Firebase Hosting
- **Database**: MongoDB Atlas, PlanetScale, Supabase

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow **ESLint** and **Prettier** configurations
- Write **comprehensive tests** for new features
- Update **API documentation** for endpoint changes
- Use **conventional commits** for commit messages
- Ensure **security best practices**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**MongoDB Connection Error**
```bash
# Ensure MongoDB is running
docker run -d -p 27017:27017 mongo:7.0
# Or start local MongoDB service
```

**Frontend API Connection Issues**
```bash
# Check backend is running on port 5000
curl http://localhost:5000/health
# Verify CORS configuration in backend
```

**Docker Permission Issues**
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Restart terminal session
```

### Getting Help
- **Issues**: [GitHub Issues](repository-url/issues)
- **Discussions**: [GitHub Discussions](repository-url/discussions)
- **Documentation**: [API Docs](http://localhost:5000/api/v1/docs)

---

## 📊 Project Metrics

- **Backend**: 15+ API endpoints
- **Frontend**: 10+ React components
- **Database**: 2 main collections with relationships
- **Security**: 8+ security measures implemented
- **Testing**: 50+ test cases
- **Documentation**: Complete API documentation
- **Deployment**: Production-ready Docker setup

Built with ❤️ for scalable, secure, and maintainable applications.