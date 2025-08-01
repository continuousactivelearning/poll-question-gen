import {env} from '#root/utils/env.js';

// src/constants/AppModule.ts (or a shared constants directory)

export enum AppModule {
  All = 'all',
  Auth = 'auth',
  Quizzes = 'livequizzes',
  genai = 'genai',
}

export const appConfig = {
  isProduction: env('NODE_ENV') === 'production',
  isStaging: env('NODE_ENV') === 'staging',
  isDevelopment: env('NODE_ENV') === 'development',
  port: Number(env('PORT')) || Number(env('APP_PORT')) || 8080,
  url: env('APP_URL') || 'http://localhost:8080',
  origins: env('APP_ORIGINS')?.split(',') || ['http://localhost:3000'],
  module: env('APP_MODULE') || 'all',
  // Only for development
  firebase: {
    clientEmail: env('FIREBASE_CLIENT_EMAIL') || undefined,
    privateKey: env('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n') || undefined,
    projectId: env('FIREBASE_PROJECT_ID') || undefined,
    apiKey: env('FIREBASE_API_KEY') || undefined,
  },
  sentry: {
    dsn: env('SENTRY_DSN') || undefined,
    environment: env('NODE_ENV') || 'development',
    sendDefaultPii: true,
  },
};
