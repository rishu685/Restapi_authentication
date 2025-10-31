const mongoose = require('mongoose');
const morgan = require('morgan');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connectDB = async () => {
  try {
    // Check if we're using a real MongoDB URI
    const mongoURI = process.env.MONGODB_URI;
    
    if (mongoURI && !mongoURI.includes('localhost')) {
      // Use the provided MongoDB URI (Atlas or other cloud service)
      const conn = await mongoose.connect(mongoURI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
    
    // For local development, use MongoDB Memory Server
    if (process.env.NODE_ENV === 'development') {
      console.log('Starting MongoDB Memory Server for development...');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
      console.log(`Database: ${conn.connection.name}`);
      return conn;
    }
    
    // Fallback to local MongoDB
    const uri = mongoURI || 'mongodb://localhost:27017/scalable-rest-api';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.log('Failed to connect to database. Make sure MongoDB is running or check your connection string.');
    }
    process.exit(1);
  }
};

// Graceful shutdown
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
      console.log('MongoDB Memory Server stopped');
    }
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
};

process.on('SIGINT', closeDB);
process.on('SIGTERM', closeDB);

module.exports = { connectDB, closeDB };