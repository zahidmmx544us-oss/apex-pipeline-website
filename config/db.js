const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogdb';
    console.log(`[Database] Connecting to MongoDB: ${connUri}...`);
    
    // Attempt connection with 4-second timeout to avoid long hangs if service is offline
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 4000
    });
    
    isConnected = true;
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] MongoDB connection notice: ${error.message}`);
    console.log('[Database] Running in Fallback Mode (In-Memory Database active).');
    return false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
