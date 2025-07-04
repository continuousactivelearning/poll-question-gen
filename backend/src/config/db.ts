import { env } from '../utils/env.js';

export const dbConfig = {
  url: env('DB_URL'),
  dbName: env('DB_NAME') || 'pollDB',
};

export const appConfig = {
  port: parseInt(env('PORT') || '5000', 10),
  nodeEnv: env('NODE_ENV') || 'development',
};

export const authConfig = {
  jwtSecret: env('JWT_SECRET'),
};
