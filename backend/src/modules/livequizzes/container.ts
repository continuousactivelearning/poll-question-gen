import { ContainerModule } from 'inversify';
import { PollRoomController } from './controllers/PollRoomController.js';
import { PollService } from './services/PollService.js';
import { RoomService } from './services/RoomService.js';
import { LIVE_QUIZ_TYPES } from './types.js';

export const livequizzesContainerModule = new ContainerModule((options) => {
  // Services
  options.bind(LIVE_QUIZ_TYPES.PollService).to(PollService).inSingletonScope();
  options.bind(LIVE_QUIZ_TYPES.RoomService).to(RoomService).inSingletonScope();

  // Controllers
  options.bind(PollRoomController).toSelf().inSingletonScope();
});
