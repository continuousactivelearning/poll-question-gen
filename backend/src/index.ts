import express, { Express } from 'express';
import cors from 'cors';
import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { appConfig } from './config/app.js';
import { loggingHandler } from './shared/middleware/loggingHandler.js';
import { HttpErrorHandler } from './shared/index.js';
import { generateOpenAPISpec } from './shared/functions/generateOpenApiSpec.js';
import { apiReference } from '@scalar/express-api-reference';
import { loadAppModules } from './bootstrap/loadModules.js';
import { printStartupSummary } from './utils/logDetails.js';
import type { CorsOptions } from 'cors';
import { currentUserChecker } from './shared/functions/currentUserChecker.js';
import { pollSocket } from './modules/livequizzes/utils/PollSocket.js';
import { connectToDatabase } from './config/db.js';

const { controllers, validators } = await loadAppModules(appConfig.module.toLowerCase());

const corsOptions: CorsOptions = {
  origin: appConfig.origins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

const moduleOptions: RoutingControllersOptions = {
  controllers: controllers,
  middlewares: [HttpErrorHandler],
  routePrefix: '/api',
  authorizationChecker: async () => true,
  currentUserChecker: currentUserChecker,
  defaultErrorHandler: true,
  development: appConfig.isDevelopment,
  validation: true,
  cors: corsOptions,
};

//const app = express();
const app = createExpressServer({
  ...moduleOptions,
  middlewares: [loggingHandler, HttpErrorHandler], // Add your middleware here
});
//app.use(loggingHandler);
//const routingControllersApp = createExpressServer(moduleOptions);
//app.use(routingControllersApp);

const openApiSpec = await generateOpenAPISpec(moduleOptions, validators);
app.use(
  '/reference',
  apiReference({
    content: openApiSpec,
    theme: 'elysiajs',
  }),
);


async function startServer() {
  try {
    await connectToDatabase(); // Connect to MongoDB first
    // Start server
    //useExpressServer(app, moduleOptions);
    const server = app.listen(appConfig.port, () => {
      printStartupSummary();
    });

    pollSocket.init(server); // For live poll socket functionality
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();