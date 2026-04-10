require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Test MongoDB Atlas connection
async function testConnection() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('MONGODB_URI not found in environment variables');
      return;
    }

    console.log('Testing MongoDB connection...');
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('Connected to MongoDB Atlas successfully!');
    
    // Test database operations
    const db = client.db('dagent');
    await db.admin().ping();
    console.log('Database ping successful!');
    
    await client.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

testConnection();
