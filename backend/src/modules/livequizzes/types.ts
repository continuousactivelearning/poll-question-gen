const TYPES = {
  // Controllers
  PollRoomController: Symbol.for('PollRoomController'),

  // Services
  PollService: Symbol.for('PollService'),
  RoomService: Symbol.for('RoomService'),

  // ✅ Add GenAI / media services
  VideoService: Symbol.for('VideoService'),
  AudioService: Symbol.for('AudioService'),
  TranscriptionService: Symbol.for('TranscriptionService'),
  AIContentService: Symbol.for('AIContentService'),
  CleanupService: Symbol.for('CleanupService'),

  // Socket.IO
  PollSocket: Symbol.for('PollSocket'),
};

export { TYPES as LIVE_QUIZ_TYPES };
