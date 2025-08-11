import { ContainerModule } from 'inversify';
import { VideoService } from './services/VideoService.js';
import { AudioService } from './services/AudioService.js';
import { AIContentService } from './services/AIContentService.js';
import { CleanupService } from './services/CleanupService.js';
import { OllamaService } from './services/OllamaService.js';
import { OllamaController } from './controllers/OllamaController.js';
import { GENAI_TYPES } from './types.js';

export const genaiContainerModule = new ContainerModule(options => {
  // Controllers
  options.bind(OllamaController).toSelf().inSingletonScope();
  
  // Services
  options.bind(VideoService).toSelf().inSingletonScope();
  options.bind(AudioService).toSelf().inSingletonScope();
  options.bind(AIContentService).toSelf().inSingletonScope();
  options.bind(CleanupService).toSelf().inSingletonScope();
  options.bind(OllamaService).toSelf().inSingletonScope();
  options.bind(GENAI_TYPES.OllamaService).to(OllamaService).inSingletonScope();
});
