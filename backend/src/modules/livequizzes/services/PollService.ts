import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import { Room } from '../../../shared/database/models/Room.js';
import { pollSocket } from '../utils/PollSocket.js';

@injectable()
export class PollService {
  private pollSocket = pollSocket;
  async createPoll(roomCode: string, data: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    timer?: number;
  }) {
    const pollId = crypto.randomUUID();

    const poll = {
      _id: pollId,
      question: data.question,
      options: data.options,
      correctOptionIndex: data.correctOptionIndex,
      timer: data.timer ?? 30,
      createdAt: new Date(),
      answers: []
    };

    await Room.updateOne(
      { roomCode },
      { $push: { polls: poll } }
    );

    pollSocket.emitToRoom(roomCode, 'new-poll', poll);
    return poll;
  }

  async submitAnswer(roomCode: string, pollId: string, userId: string, answerIndex: number) {
    await Room.updateOne(
      { roomCode, "polls._id": pollId },
      { $push: { "polls.$.answers": { userId, answerIndex, answeredAt: new Date() } } }
    );
  }

  async getPollResults(roomCode: string) {
    const room = await Room.findOne({ roomCode });
    if (!room) return null;

    const results: Record<string, Record<string, { count: number; users: string[] }>> = {};

    for (const poll of room.polls) {
      const counts = Array(poll.options.length).fill(0);
      const users = poll.options.map(() => [] as string[]);

      for (const ans of poll.answers) {
        if (ans.answerIndex >= 0 && ans.answerIndex < poll.options.length) {
          counts[ans.answerIndex]++;
          users[ans.answerIndex].push(ans.userId);
        }
      }

      const pollResult = poll.options.reduce((acc, opt, i) => {
        acc[opt] = { count: counts[i], users: users[i] };
        return acc;
      }, {} as Record<string, { count: number; users: string[] }>);

      results[poll.question] = pollResult;
    }

    return results;
  }
}
