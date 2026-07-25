const mongoose = require('mongoose');

const connectDB = async () => {
  const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/black-theory';
  
  try {
    const conn = await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 1500 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('Local MongoDB not running. Starting fast in-memory MongoDB server...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
      console.log(`Temp Database URI: ${memoryUri}`);
    } catch (fallbackError) {
      console.error(`In-memory MongoDB Server initialization failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
