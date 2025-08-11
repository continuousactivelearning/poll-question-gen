const TYPES = {
  LLMController: Symbol.for('LLMController'),

  // Controllers
  GenAIVideoController: Symbol.for('GenAIVideoController'),
  OllamaController: Symbol.for('OllamaController'),
  
  // Services
  OllamaService: Symbol.for('OllamaService'),
  VideoService: Symbol.for('VideoService'),
  AudioService: Symbol.for('AudioService'),
  AIContentService: Symbol.for('AIContentService'),
  CleanupService: Symbol.for('CleanupService'),
};

export {TYPES as GENAI_TYPES};
