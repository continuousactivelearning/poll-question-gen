import { env } from '../utils/env.js';
import mongoose from 'mongoose';

export const dbConfig = {
  url: env('DB_URL'),
  dbName: env('DB_NAME') || 'pollDB',
};

export async function connectToDatabase() {
  try {
    await mongoose.connect(dbConfig.url, {
      dbName: dbConfig.dbName,
    });
    console.log('✅ Connected to MongoDB:', dbConfig.dbName);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1); // exit process if DB connection fails
  }
}
