import {
  JsonController,
  Post,
  Get,
  Body,
  Param,
  Authorized,
  HttpCode,
  Req,
  Res,
} from 'routing-controllers';
import { Request, Response } from 'express';
import multer from 'multer';
import { pollSocket } from '../utils/PollSocket.js';
import { inject, injectable } from 'inversify';
import { RoomService } from '../services/RoomService.js';
import { PollService } from '../services/PollService.js';
import { LIVE_QUIZ_TYPES } from '../types.js';
//import { TranscriptionService } from '#root/modules/genai/services/TranscriptionService.js';
//import { AIContentService } from '#root/modules/genai/services/AIContentService.js';
//import { VideoService } from '#root/modules/genai/services/VideoService.js';
//import { AudioService } from '#root/modules/genai/services/AudioService.js';
//import { CleanupService } from '#root/modules/genai/services/CleanupService.js';
import {
  PythonMicroserviceClient, 
  QuestionSpec,
  GeneratedQuestion,
  QuestionGenerationResponse,
  CompleteProcessingResponse,
  TranscriptionResponse,
  SegmentationResponse,
  VideoDownloadResponse,
  AudioExtractionResponse } from '../services/PythonMicroServiceClint.js';
//import type { QuestionSpec } from '#root/modules/genai/services/AIContentService.js';
// import type { File as MulterFile } from 'multer';
import { OpenAPI } from 'routing-controllers-openapi';
import dotenv from 'dotenv';

dotenv.config();
const appOrigins = process.env.APP_ORIGINS;

declare module 'express-serve-static-core' {
  interface Request {
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
  }
}
const upload = multer({ dest: '../ai-content-service/uploads/' });

@injectable()
@OpenAPI({tags: ['Rooms'],})
@JsonController('/livequizzes/rooms')
export class PollRoomController {
  constructor(
    //@inject(LIVE_QUIZ_TYPES.VideoService) private videoService: VideoService,
    //@inject(LIVE_QUIZ_TYPES.AudioService) private audioService: AudioService,
    //@inject(LIVE_QUIZ_TYPES.TranscriptionService) private transcriptionService: TranscriptionService,
    //@inject(LIVE_QUIZ_TYPES.AIContentService) private aiContentService: AIContentService,
    //@inject(LIVE_QUIZ_TYPES.CleanupService) private cleanupService: CleanupService,
    @inject(LIVE_QUIZ_TYPES.RoomService) private roomService: RoomService,
    @inject(LIVE_QUIZ_TYPES.PollService) private pollService: PollService,
    @inject(LIVE_QUIZ_TYPES.PythonMicroserviceClient) private pythonClient: PythonMicroserviceClient,
  ) { }

  //@Authorized(['teacher'])
  @Post('/')
  async createRoom(@Body() body: { name: string; teacherId: string }) {
    const room = await this.roomService.createRoom(body.name, body.teacherId);
    return {
      ...room,
      inviteLink: `${appOrigins}/student/pollroom/${room.roomCode}`,
    };
  }

  //@Authorized()
  @Get('/:code')
  async getRoom(@Param('code') code: string) {
    const room = await this.roomService.getRoomByCode(code);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }
    if (room.status !== 'active') {
      return { success: false, message: 'Room is ended' };
    }
    return { success: true, room };  // return room data
  }  

  // 🔹 Create Poll in Room
  //@Authorized(['teacher','admin'])
  @Post('/:code/polls')
  async createPollInRoom(
    @Param('code') roomCode: string,
    @Body() body: { question: string; options: string[]; correctOptionIndex: number; creatorId: string; timer?: number }
  ) {
    const room = await this.roomService.getRoomByCode(roomCode);
    if (!room) throw new Error('Invalid room');
    return await this.pollService.createPoll(
      roomCode,
      {
        question: body.question,
        options: body.options,
        correctOptionIndex: body.correctOptionIndex,
        timer: body.timer
      }
    );

  }

  //@Authorized(['teacher'])
  @Get('/teacher/:teacherId')
  async getAllRoomsByTeacher(@Param('teacherId') teacherId: string) {
    return await this.roomService.getRoomsByTeacher(teacherId);
  }
  //@Authorized(['teacher'])
  @Get('/teacher/:teacherId/active')
  async getActiveRoomsByTeacher(@Param('teacherId') teacherId: string) {
    return await this.roomService.getRoomsByTeacherAndStatus(teacherId, 'active');
  }
  //@Authorized(['teacher'])
  @Get('/teacher/:teacherId/ended')
  async getEndedRoomsByTeacher(@Param('teacherId') teacherId: string) {
    return await this.roomService.getRoomsByTeacherAndStatus(teacherId, 'ended');
  }

  //@Authorized(['teacher'])
  @Get('/:roomId/analysis')
  async getPollAnalysis(@Param('roomId') roomId: string) {
    // Fetch from service
    const analysis = await this.roomService.getPollAnalysis(roomId);
    return { success: true, data: analysis };
  }

  //@Authorized()
  @Post('/:code/polls/answer')
  async submitPollAnswer(
    @Param('code') roomCode: string,
    @Body() body: { pollId: string; userId: string; answerIndex: number }
  ) {
    await this.pollService.submitAnswer(roomCode, body.pollId, body.userId, body.answerIndex);
    return { success: true };
  }

  // Fetch Results for All Polls in Room
  //@Authorized()
  @Get('/:code/polls/results')
  async getResultsForRoom(@Param('code') code: string) {
    return await this.pollService.getPollResults(code);
  }

  //@Authorized(['teacher'])
  @Post('/:code/end')
  async endRoom(@Param('code') code: string) {
    const success = await this.roomService.endRoom(code);
    if (!success) throw new Error('Room not found');
    // Emit to all clients in the room
    pollSocket.emitToRoom(code, 'room-ended', {});
    return { success: true, message: 'Room ended successfully' };
  }

/*  // 🔹 AI Question Generation from transcript or YouTube
  //@Authorized(['teacher'])
  @Post('/:code/generate-questions')
  @HttpCode(200)
  async generateQuestionsFromTranscript(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const tempPaths: string[] = [];

    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req, res, (err) => (err ? reject(err) : resolve()));
    });

    try {
      const { youtubeUrl, questionSpec, model } = req.body;
      let transcript = '';

      if (req.file) {
        const filePath = req.file.path;
        tempPaths.push(filePath);

        let audioPath = filePath;
        if (req.file.mimetype.startsWith('video/')) {
          audioPath = await this.audioService.extractAudio(filePath);
          tempPaths.push(audioPath);
        }

        transcript = await this.transcriptionService.transcribe(audioPath);
      } else if (youtubeUrl) {
        const videoPath = await this.videoService.downloadVideo(youtubeUrl);
        tempPaths.push(videoPath);

        const audioPath = await this.audioService.extractAudio(videoPath);
        tempPaths.push(audioPath);

        transcript = await this.transcriptionService.transcribe(audioPath);
      } else {
        return res.status(400).json({ message: 'Please upload a file or provide a youtubeUrl.' });
      }

      const SEGMENTATION_THRESHOLD = parseInt(process.env.TRANSCRIPT_SEGMENTATION_THRESHOLD || '6000', 10);
      const defaultModel = 'gemma3';
      const selectedModel = model?.trim() || defaultModel;
      let segments: Record<string, string>;
      if (transcript.length <= SEGMENTATION_THRESHOLD) {
        console.log('[generateQuestions] Small transcript detected. Using full transcript without segmentation.');
        segments = { full: transcript };
      } else {
        console.log('[generateQuestions] Transcript is long; running segmentation...');
        segments = await this.aiContentService.segmentTranscript(transcript, selectedModel);
      }
      // ✅ Safe default questionSpec
      let safeSpec: QuestionSpec[] = [{ SOL: 2 }]; // default
      if (questionSpec && typeof questionSpec === 'object' && !Array.isArray(questionSpec)) {
        safeSpec = [questionSpec];
      } else if (Array.isArray(questionSpec) && typeof questionSpec[0] === 'object') {
        safeSpec = questionSpec;
      } else {
        console.warn('Invalid questionSpec provided; using default [{ SOL: 2 }]');
      }
      console.log('Using questionSpec:', safeSpec);
      console.log('[generateQuestions] Transcript length:', transcript.length);
      console.log('[generateQuestions] Transcript preview:', segments);
      const generatedQuestions = await this.aiContentService.generateQuestions({
        segments,
        globalQuestionSpecification: safeSpec,
        model: selectedModel,
      });

      return res.json({
        message: 'Questions generated successfully from transcript.',
        transcriptPreview: transcript.substring(0, 200) + '...',
        segmentsCount: Object.keys(segments).length,
        totalQuestions: generatedQuestions.length,
        questions: generatedQuestions,
      });
    } catch (err: any) {
      console.error('Error generating questions:', err);
      return res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
    } finally {
      await this.cleanupService.cleanup(tempPaths);
    }
  }
}*/

  //@Authorized(['teacher'])
  @Post('/:code/generate-questions')
  @HttpCode(200)
  async generateQuestions(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const tempPaths: string[] = [];

    // Handle file upload
    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req, res, (err) => (err ? reject(err) : resolve()));
    });

    try {
      const {
        youtubeUrl,
        transcript: directTranscript,
        questionSpec,
        model = 'gemma3',
        language = 'English',
        desiredSegments = 3
      } = req.body;

      // Safe default questionSpec
      let safeSpec: QuestionSpec[] = [{ SOL: 2 }];
      if (questionSpec && typeof questionSpec === 'object' && !Array.isArray(questionSpec)) {
        safeSpec = [questionSpec];
      } else if (Array.isArray(questionSpec) && typeof questionSpec[0] === 'object') {
        safeSpec = questionSpec;
      } else {
        console.warn('Invalid questionSpec provided; using default [{ SOL: 2 }]');
      }

      let result: QuestionGenerationResponse;

      // Route 1: File Upload (Audio/Video)
      if (req.file) {
        console.log('[generateQuestions] Processing uploaded file:', req.file.originalname);

        const filePath = req.file.path;
        tempPaths.push(filePath);

        if (req.file.mimetype.startsWith('video/')) {
          // Extract audio from video
          const audioResult = await this.pythonClient.extractAudio(filePath);
          tempPaths.push(audioResult.audio_path);

          // Transcribe audio
          const transcriptResult = await this.pythonClient.transcribe(audioResult.audio_path, language);

          // Generate questions using transcript
          result = await this.generateQuestionsFromTranscript(
            transcriptResult.transcript,
            safeSpec,
            model,
            desiredSegments
          );
        } else if (req.file.mimetype.startsWith('audio/')) {
          // Direct audio transcription
          const transcriptResult = await this.pythonClient.transcribe(filePath, language);

          // Generate questions using transcript
          result = await this.generateQuestionsFromTranscript(
            transcriptResult.transcript,
            safeSpec,
            model,
            desiredSegments
          );
        } else {
          return res.status(400).json({
            message: 'Unsupported file type. Please upload audio or video files.'
          });
        }

      }
      // Route 2: YouTube URL
      else if (youtubeUrl) {
        console.log('[generateQuestions] Processing YouTube URL:', youtubeUrl);

        result = await this.pythonClient.processYouTubeVideo({
          youtubeUrl,
          language,
          model,
          desiredSegments,
          globalQuestionSpecification: safeSpec
        });

      }
      // Route 3: Direct Transcript
      else if (directTranscript) {
        console.log('[generateQuestions] Processing direct transcript, length:', directTranscript.length);

        result = await this.generateQuestionsFromTranscript(
          directTranscript,
          safeSpec,
          model,
          desiredSegments
        );

      }
      // No input provided
      else {
        return res.status(400).json({
          message: 'Please provide one of: file upload, youtubeUrl, or transcript text.'
        });
      }

      // Return unified response
      return res.json({
        success: true,
        message: 'Questions generated successfully.',
        data: {
          totalQuestions: result.questions.length,
          questions: result.questions,
          inputType: req.file ? 'file' : youtubeUrl ? 'youtube' : 'transcript',
          model: model,
          //segmentsProcessed: result.segments ? Object.keys(result.segments).length : undefined
        }
      });

    } catch (err: any) {
      console.error('Error generating questions:', err);
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    } finally {
      // Cleanup any temporary files
      if (tempPaths.length > 0) {
        await this.pythonClient.cleanup(tempPaths);
      }
    }
  }

  // Helper method for transcript-based question generation
  private async generateQuestionsFromTranscript(
    transcript: string,
    questionSpec: QuestionSpec[],
    model: string,
    desiredSegments: number
  ): Promise<QuestionGenerationResponse> {
    const SEGMENTATION_THRESHOLD = parseInt(
      process.env.TRANSCRIPT_SEGMENTATION_THRESHOLD || '6000',
      10
    );

    let segments: Record<string, string>;

    if (transcript.length <= SEGMENTATION_THRESHOLD) {
      console.log('[generateQuestions] Small transcript detected. Using full transcript without segmentation.');
      segments = { full: transcript };
    } else {
      console.log('[generateQuestions] Transcript is long; running segmentation...');
      const segmentResult = await this.pythonClient.segmentTranscript(
        transcript,
        model,
        desiredSegments
      );
      segments = segmentResult.segments;
    }

    // Generate questions from segments
    const result = await this.pythonClient.generateQuestions({
      segments,
      globalQuestionSpecification: questionSpec,
      model
    });

    return {
      ...result,
      segments // Include segments in response for debugging
    };
  }
}