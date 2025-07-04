import express from "express";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { appConfig, dbConfig } from './config/config';

dotenv.config(); // Load from .env

const app = express();

app.use(express.json());

// MongoDB Connection
mongoose.connect(`${dbConfig.url}/${dbConfig.dbName}`)
  .then(() => console.log(`✅ MongoDB connected to ${dbConfig.dbName}`))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Test Route
app.get('/', (req, res) => {
  res.json({ message: '🎯 Backend & DB are working!' });
});

app.listen(appConfig.port, () =>
  console.log(`🚀 Server running at http://localhost:${appConfig.port}`)
);
