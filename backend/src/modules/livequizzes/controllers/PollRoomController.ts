import {
  JsonController,
  Post,
  Get,
  Body,
  Param,
  Authorized,
} from 'routing-controllers';
import { inject, injectable } from 'inversify';
import { RoomService } from '../services/RoomService.js';
import { PollService } from '../services/PollService.js';
import { LIVE_QUIZ_TYPES } from '../types.js';

@injectable()
@JsonController('/livequizzes/rooms')
export class PollRoomController {
  constructor(
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
