// src/modules/livequizzes/index.ts
import { livequizzesContainerModule } from './container.js';
import { sharedContainerModule } from '#root/container.js';
import { Container, ContainerModule } from 'inversify';
import { useContainer, RoutingControllersOptions } from 'routing-controllers';
import { InversifyAdapter } from '#root/inversify-adapter.js';

import { PollRoomController } from './controllers/PollRoomController.js';

import { CreatePollValidator } from './validators/CreatePollValidator.js';
import { CreateRoomValidator } from './validators/CreateRoomValidator.js';
import { DashboardController } from './controllers/DashboardController.js';

export const livequizzesContainerModules: ContainerModule[] = [
  livequizzesContainerModule,
  sharedContainerModule,
];

export const livequizzesModuleControllers: Function[] = [
  PollRoomController,
  DashboardController,
];

export async function setupLivequizzesContainer(container: Container): Promise<void> {
  await container.load(...livequizzesContainerModules);
  const inversifyAdapter = new InversifyAdapter(container);
  useContainer(inversifyAdapter);
}


export const livequizzesModuleOptions: RoutingControllersOptions = {
  controllers: livequizzesModuleControllers,
  middlewares: [],
  defaultErrorHandler: true,
  authorizationChecker: async () => true,
  validation: true,
};

export const livequizzesModuleValidators: Function[] = [
  CreatePollValidator,
  CreateRoomValidator,
];
