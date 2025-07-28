import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import {
  getMetadataArgsStorage,
  RoutingControllersOptions,
} from 'routing-controllers';
import {
  getMetadataStorage,
  MetadataStorage
} from 'class-validator';
import { routingControllersToSpec } from 'routing-controllers-openapi';

import { appConfig } from '../../config/app.js'; // adjust path as needed
import { metadata } from 'reflect-metadata/no-conflict';
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata.js';
//import { defaultMetadataStorage } from 'class-transformer';

const getOpenApiServers = () => {
  const servers = [];

  const isDev = appConfig.isDevelopment;
  const isStaging = appConfig.isStaging;
  const isProd = appConfig.isProduction;

  const appUrl = appConfig.url || 'https://poll-question-gen-376e6.web.app';
  const parsedUrl = new URL(appUrl);

  if (isDev) {
    // Localhost server
    servers.push({
      url: 'http://{host}:{port}',
      description: 'Local Development Server',
      variables: {
        host: {
          default: 'localhost',
          description: 'Localhost for API server',
        },
        port: {
          default: String(appConfig.port),
          description: 'Port for the API server',
        },
      },
    });

    // Configured dev/staging server
    servers.push({
      url: `https://${parsedUrl.hostname}`,
      description: 'Dev Server (Remote)',
    });
  }

  if (isStaging) {
    servers.push({
      url: `https://${parsedUrl.hostname}`,
      description: 'Staging Server',
    });
  }

  if (isProd) {
    servers.push({
      url: `https://${parsedUrl.hostname}`,
      description: 'Production Server',
    });
    servers.push({
      url: appUrl,
      description: 'Production API Server',
    });
  }

  return servers;
};

export function filterMetadataByModulePrefix(modulePrefix: string) {
  const storage = getMetadataArgsStorage();
  const normalizedPrefix = `/${modulePrefix.toLowerCase()}`;

  // Filter controllers by prefix
  storage.controllers = storage.controllers.filter(
    ctrl =>
      typeof ctrl.route === 'string' &&
      ctrl.route.toLowerCase().startsWith(normalizedPrefix),
  );

  // Collect valid targets (class references)
  const validTargets = new Set(storage.controllers.map(c => c.target));

  // Filter all associated metadata by controller target
  storage.actions = storage.actions.filter(a => validTargets.has(a.target));
}

function getSchemasForValidators(validators: Function[]) {
  const validatorSet = new Set(validators);
  let storage: MetadataStorage = getMetadataStorage();

  const filteredValidationMetadatas: Map<Function, ValidationMetadata[]> = new Map();
  const originalValidationMetadatas = (storage as unknown as any).validationMetadatas as Map<Function, ValidationMetadata[]>;

  for (const [key, value] of originalValidationMetadatas) {
    // Filter validation metadata based on the provided validators
    if (validatorSet.has(key)) {
      filteredValidationMetadatas.set(key, value);
    }
  }

  // Temporarily replace the validation metadata storage
  (storage as any).validationMetadatas = filteredValidationMetadatas;

  // Generate schemas from the filtered validation metadata
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
    classValidatorMetadataStorage: storage,
  });

  // Restore original metadata
  (storage as any).validationMetadatas = originalValidationMetadatas;

  return schemas;
}


export function generateOpenAPISpec(
  routingControllersOptions: RoutingControllersOptions,
  validators: Function[] = [],
) {

  // Get metadata storage
  const storage = getMetadataArgsStorage();

  if (appConfig.module !== 'all') {
    filterMetadataByModulePrefix(appConfig.module);
  }

  let schemas: Record<string, any> = {};
  if (validators.length === 0 || appConfig.module === 'all') {
    // If no specific validators are provided, use all class-validator schemas
    schemas = validationMetadatasToSchemas({
      refPointerPrefix: '#/components/schemas/',
      //classTransformerMetadataStorage: defaultMetadataStorage
    });
  } else {
    // If specific validators are provided, filter schemas based on them
    schemas = getSchemasForValidators(validators);
  }
  console.log('Controllers passed to OpenAPI:', routingControllersOptions.controllers.length);

  // Create OpenAPI specification
  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    info: {
      title: 'PQG Documentation',
      version: '1.0.0',
      description: 'API documentation for the PQG platform',
      contact: {
        name: 'PQG Team',
        email: 'charankarnati180604@gmail.com',
      },
    },
    tags:[
        {
          name: 'Live Rooms',
          description: 'Operations related to Room management',
        }
      ],
      'x-tagGroups': [
        {
          name: 'Authentication',
          tags: ['Authentication'],
        },
        {
          name: 'LivePollRooms',
          tags: ['Rooms', 'Dashboards'],
        },
        {
          name: 'Users',
          tags: ['Users']
        },
        {
          name: 'Data Models',
          tags: ['Models'],
        },
      ],
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: getOpenApiServers(),
    security: [
      {
        bearerAuth: [],
      },
    ],
  });

  return spec;
}
