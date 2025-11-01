require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { connectDB } = require('./config/database');
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const {
  apiLimiter,
  authLimiter,
  mongoSanitizeMiddleware,
  xssProtection,
  securityHeaders,
  requestLogger
} = require('./middleware/security');

// Route imports
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3000', 
          'http://localhost:3001', 
          'http://localhost:5173',
          'http://localhost:5174',
          'https://localhost:3000'
        ];
    
    // In production, allow Netlify subdomains
    if (process.env.NODE_ENV === 'production') {
      if (origin && (origin.includes('.netlify.app') || origin.includes('.netlify.com'))) {
        return callback(null, true);
      }
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitizeMiddleware);
app.use(xssProtection);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/*/auth/login', authLimiter);
app.use('/api/*/auth/register', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API versioning
const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = process.env.API_PREFIX || '/api';

// Routes
app.use(`${API_PREFIX}/${API_VERSION}/auth`, authRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/tasks`, taskRoutes);

// Swagger documentation
app.use(`${API_PREFIX}/${API_VERSION}/docs`, swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// API info endpoint
app.get(`${API_PREFIX}/${API_VERSION}`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Scalable REST API with Authentication & Role-Based Access Control',
    version: API_VERSION,
    documentation: `${req.protocol}://${req.get('host')}${API_PREFIX}/${API_VERSION}/docs`,
    endpoints: {
      auth: `${req.protocol}://${req.get('host')}${API_PREFIX}/${API_VERSION}/auth`,
      tasks: `${req.protocol}://${req.get('host')}${API_PREFIX}/${API_VERSION}/tasks`,
      health: `${req.protocol}://${req.get('host')}/health`
    }
  });
});

// 404 handler for API routes
app.use(`${API_PREFIX}/*`, notFound);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Scalable REST API',
    version: API_VERSION,
    api: `${req.protocol}://${req.get('host')}${API_PREFIX}/${API_VERSION}`,
    documentation: `${req.protocol}://${req.get('host')}${API_PREFIX}/${API_VERSION}/docs`,
    health: `${req.protocol}://${req.get('host')}/health`
  });
});

// Global error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  console.log('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}/docs`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;