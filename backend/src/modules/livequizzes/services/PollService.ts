import { inject, injectable } from 'inversify';
import { Poll, PollAnswer } from '../interfaces/Poll.js';
import { pollSocket } from '../utils/PollSocket.js';
import { LIVE_QUIZ_TYPES } from '../types.js';
import { RoomService } from './RoomService.js';

const polls: Poll[] = [];
const pollAnswers: PollAnswer[] = [];
const pollTimers: Record<string, NodeJS.Timeout> = {};

@injectable()
export class PollService {
  constructor(
    @inject(LIVE_QUIZ_TYPES.RoomService)
    private roomService: RoomService
  ) { }

  createPoll(data: {
    question: string;
    options: string[];
    roomCode: string;
    creatorId: string;
    timer?: number;
  }): Poll {
    const poll: Poll = {
      id: crypto.randomUUID(),
      question: data.question,
      options: data.options,
      roomCode: data.roomCode,
      creatorId: data.creatorId,
      createdAt: new Date(),
      timer: data.timer ?? 30 // default to 30 seconds if not provided
    };
    polls.push(poll);
    pollSocket.emitToRoom(poll.roomCode, 'new-poll', poll);
    return poll;
  }

  startPollTimer(poll: Poll) {
    const timeout = setTimeout(() => {
      pollSocket.emitToRoom(poll.roomCode, 'poll-ended', { pollId: poll.id });
      console.log(`Poll timer ended for pollId: ${poll.id}`);
      // Optional: clean up timer
      delete pollTimers[poll.id];
    }, poll.timer * 1000);

    // Save timeout so it can be cleared if needed
    pollTimers[poll.id] = timeout;
  }

  submitAnswer(pollId: string, userId: string, answerIndex: number) {
    pollAnswers.push({ pollId, userId, answerIndex });
  }

  getPollResults(roomCode: string) {
    if (this.roomService.isRoomEnded(roomCode)) {
      return { message: "Room has ended. Showing final poll results." };
    }
    const roomPolls = polls.filter(p => p.roomCode === roomCode);
    const results: Record<string, Record<string, { count: number; users: string[] }>> = {};

    for (const poll of roomPolls) {
      if (!poll.question || !Array.isArray(poll.options)) continue;

      const counts: number[] = Array(poll.options.length).fill(0);
      const users: string[][] = poll.options.map(() => []);

      for (const ans of pollAnswers.filter(a => a.pollId === poll.id)) {
        const index = ans.answerIndex;
        if (typeof index === 'number' && index >= 0 && index < poll.options.length) {
          counts[index]++;
          users[index].push(ans.userId);
        }
      }

      const pollResult = poll.options.reduce((acc, opt, i) => {
        if (typeof opt === 'string') {
          acc[opt] = {
            count: counts[i],
            users: users[i],
          };
        }
        return acc;
      }, {} as Record<string, { count: number; users: string[] }>);

      // Use poll.id instead of poll.question if question might be empty
      results[poll.question || `Poll ${poll.id}`] = pollResult;
    }

    return results;
  }
}