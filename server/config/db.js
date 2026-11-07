const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[Database] Connecting to MONGODB_URI...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      isMongoConnected = true;
      console.log(`[Database] Successfully connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] MONGODB_URI unreachable (${err.message}).`);
    }
  }

  // Try local MongoDB on default port
  try {
    console.log(`[Database] Checking local MongoDB at mongodb://127.0.0.1:27017/hyperlocal_connect...`);
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/hyperlocal_connect', {
      serverSelectionTimeoutMS: 1500,
    });
    isMongoConnected = true;
    console.log(`[Database] Successfully connected to local MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(`[Database] Local MongoDB not running (${err.message}).`);
  }

  // If local MongoDB is not running, seamlessly switch to high-performance in-memory repository
  isMongoConnected = false;
  console.log(`[Database] Active mode: IN-MEMORY DEVELOPMENT STORE (Zero external dependencies, instant startup, pre-loaded with Hyderabad demo data!)`);
  return null;
};

const getIsMongoConnected = () => isMongoConnected;

const closeDB = async () => {
  if (isMongoConnected) {
    await mongoose.disconnect();
  }
};

module.exports = { connectDB, getIsMongoConnected, closeDB };
