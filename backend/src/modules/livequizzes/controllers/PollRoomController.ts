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
import { inject, injectable } from 'inversify';
import { RoomService } from '../services/RoomService.js';
import { PollService } from '../services/PollService.js';
import { LIVE_QUIZ_TYPES } from '../types.js';
// Importing necessary services for GenAI functionality
import { TranscriptionService } from '#root/modules/genai/services/TranscriptionService.js';
import { AIContentService } from '#root/modules/genai/services/AIContentService.js';
import { VideoService } from '#root/modules/genai/services/VideoService.js';
import { AudioService } from '#root/modules/genai/services/AudioService.js';
import { CleanupService } from '#root/modules/genai/services/CleanupService.js';
// Extend express Request to include multer fields
import type { File as MulterFile } from 'multer';

declare module 'express-serve-static-core' {
  interface Request {
    file?: MulterFile;
    files?: MulterFile[];
  }
}
const upload = multer({ dest: 'uploads/' });

@injectable()
@JsonController('/livequizzes/rooms')
export class PollRoomController {
  constructor(
    @inject(LIVE_QUIZ_TYPES.VideoService) private videoService: VideoService,
    @inject(LIVE_QUIZ_TYPES.AudioService) private audioService: AudioService,
    @inject(LIVE_QUIZ_TYPES.TranscriptionService) private transcriptionService: TranscriptionService,
    @inject(LIVE_QUIZ_TYPES.AIContentService) private aiContentService: AIContentService,
    @inject(LIVE_QUIZ_TYPES.CleanupService) private cleanupService: CleanupService,
    @inject(LIVE_QUIZ_TYPES.RoomService) private roomService: RoomService,
    @inject(LIVE_QUIZ_TYPES.PollService) private pollService: PollService
  ) { }

  @Authorized()
  @Post('/')
  createRoom(@Body() body: { name: string; teacherId: string }) {
    const room = this.roomService.createRoom(body.name, body.teacherId);
    return {
      ...room,
      inviteLink: `http://localhost:5137/join/${room.code}`
    };
  }

  // @Authorized()
  @Get('/:code')
  getRoom(@Param('code') code: string) {
    const room = this.roomService.getRoomByCode(code);
    if (!room) throw new Error('Room not found');
    return room;
  }

  // 🔹 Create Poll in Room
  // @Authorized()
  @Post('/:code/polls')
  createPollInRoom(
    @Param('code') roomCode: string,
    @Body() body: { question: string; options: string[]; creatorId: string }
  ) {
    const room = this.roomService.getRoomByCode(roomCode);
    if (!room) throw new Error('Invalid room');
    return this.pollService.createPoll({ ...body, roomCode });
  }

  @Post('/:code/generate-questions')
  @HttpCode(200)
  async generateQuestionsFromTranscript(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const tempPaths: string[] = [];

    // Handle file upload (using multer)
    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      let { youtubeUrl, questionSpec, model } = req.body;

      let transcript = '';

      // 📌 If file uploaded
      if (req.file) {
        const filePath = req.file.path;
        tempPaths.push(filePath);

        let audioPath = filePath;
        if (req.file.mimetype.startsWith('video/')) {
          audioPath = await this.audioService.extractAudio(filePath);
          tempPaths.push(audioPath);
        }

        transcript = await this.transcriptionService.transcribe(audioPath);
      }

      // 📌 Or if YouTube URL provided
      else if (youtubeUrl) {
        const videoPath = await this.videoService.downloadVideo(youtubeUrl);
        tempPaths.push(videoPath);

        const audioPath = await this.audioService.extractAudio(videoPath);
        tempPaths.push(audioPath);

        transcript = await this.transcriptionService.transcribe(audioPath);
      } else {
        return res.status(400).json({
          message: 'Please upload a file or provide a youtubeUrl.',
        });
      }
      console.log('Transcription completed successfully:', transcript);

      // 📌 Segment transcript (using AI)
      const segments = await this.aiContentService.segmentTranscript(
        transcript,
        model
      );
      console.log('Transcript segmented successfully:', segments);

      // 📌 Generate questions from segments
      const generatedQuestions = await this.aiContentService.generateQuestions({
        segments,
        globalQuestionSpecification: questionSpec ? [questionSpec] : [{}],
        model,
      });
      console.log('Questions generated successfully:', generatedQuestions);

      return res.json({
        message: 'Questions generated successfully from transcript.',
        transcriptPreview: transcript.substring(0, 200) + '...',
        segmentsCount: segments.length,
        totalQuestions: generatedQuestions.length,
        questions: generatedQuestions,
      });
    } catch (err: any) {
      console.error('Error generating questions from transcript:', err);
      return res
        .status(err.status || 500)
        .json({ message: err.message || 'Internal Server Error' });
    } finally {
      // cleanup temp files
      await this.cleanupService.cleanup(tempPaths);
    }
  }


  // 🔹 Submit Poll Answer
  // @Authorized()
  @Post('/:code/polls/answer')
  submitPollAnswer(
    @Param('code') roomCode: string,
    @Body() body: { pollId: string; userId: string; answerIndex: number }
  ) {
    this.pollService.submitAnswer(body.pollId, body.userId, body.answerIndex);
    return { success: true };
  }

  // Fetch Results for All Polls in Room
  // @Authorized()
  @Get('/:code/polls/results')
  getResultsForRoom(@Param('code') code: string) {
    return this.pollService.getPollResults(code);
  }

  //@Authorized()
  @Post('/:code/end')
  endRoom(@Param('code') code: string) {
    const success = this.roomService.endRoom(code);
    if (!success) throw new Error('Room not found');
    return { success: true, message: 'Room ended successfully' };
  }
}
