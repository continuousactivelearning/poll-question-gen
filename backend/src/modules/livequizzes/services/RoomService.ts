import { injectable } from 'inversify';
import { Room } from '../DBSchemas/Room.js';
import type { Room as RoomType, Poll, PollAnswer } from '../interfaces/PollRoom.js';

@injectable()
export class RoomService {
  async createRoom(name: string, teacherId: string): Promise<RoomType> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newRoom = await new Room({
      roomCode: code,
      name,
      teacherId,
      createdAt: new Date(),
      status: 'active',
      polls: []
    }).save();

    return newRoom.toObject();  // return plain object
  }

  async getRoomByCode(code: string): Promise<RoomType | null> {
    return await Room.findOne({ roomCode: code }).lean();
  }

  async getRoomsByTeacher(teacherId: string, status?: 'active' | 'ended'): Promise<RoomType[]> {
    const query: any = { teacherId };
    if (status) {
      query.status = status;
    }
    return await Room.find(query).sort({ createdAt: -1 }).lean();
  }

  async getRoomsByTeacherAndStatus(teacherId: string, status: 'active' | 'ended'): Promise<RoomType[]> {
    return await Room.find({ teacherId, status }).lean();
  }

  async isRoomValid(code: string): Promise<boolean> {
    const room = await Room.findOne({ roomCode: code }).lean();
    console.log('[isRoomValid] Fetched room:', room);
    return !!room && room.status.toLowerCase() === 'active';
  }

  async isRoomEnded(code: string): Promise<boolean> {
    const room = await Room.findOne({ roomCode: code }).lean();
    return room ? room.status === 'ended' : false;
  }

  async endRoom(code: string): Promise<boolean> {
    const updated = await Room.findOneAndUpdate({ roomCode: code }, { status: 'ended' }, { new: true }).lean();
    return !!updated;
  }

  async canJoinRoom(code: string): Promise<boolean> {
    const room = await Room.findOne({ roomCode: code }).lean();
    return !!room && room.status === 'active';
  }

  async getAllRooms(): Promise<RoomType[]> {
    return await Room.find().lean();
  }

  async getActiveRooms(): Promise<RoomType[]> {
    return await Room.find({ status: 'active' }).lean();
  }

  async getEndedRooms(): Promise<RoomType[]> {
    return await Room.find({ status: 'ended' }).lean();
  }
  /**
   * Map Mongoose Room Document to plain RoomType matching interface
   */
  private mapRoom(roomDoc: any): RoomType {
    return {
      roomCode: roomDoc.roomCode,
      name: roomDoc.name,
      teacherId: roomDoc.teacherId,
      createdAt: roomDoc.createdAt,
      status: roomDoc.status,
      polls: (roomDoc.polls || []).map((p: any): Poll => ({
        _id: p._id.toString(),  // convert ObjectId to string if needed
        question: p.question,
        options: p.options,
        correctOptionIndex: p.correctOptionIndex,
        timer: p.timer,
        createdAt: p.createdAt,
        answers: (p.answers || []).map((a: any): PollAnswer => ({
          userId: a.userId,
          answerIndex: a.answerIndex,
          answeredAt: a.answeredAt
        }))
      }))
    };
  }
}
