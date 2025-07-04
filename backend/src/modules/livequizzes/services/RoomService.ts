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

    return this.mapRoom(newRoom);
  }

  async getRoomByCode(code: string): Promise<RoomType | null> {
    const room = await Room.findOne({ roomCode: code });
    return room ? this.mapRoom(room) : null;
  }

  async isRoomValid(code: string): Promise<boolean> {
    const room = await Room.findOne({ roomCode: code });
    return !!room && room.status === 'active';
  }

  async isRoomEnded(code: string): Promise<boolean> {
    const room = await Room.findOne({ roomCode: code });
    return room ? room.status === 'ended' : false;
  }

  async endRoom(code: string): Promise<boolean> {
    const room = await Room.findOne({ roomCode: code });
    if (!room) return false;
    room.status = 'ended';
    await room.save();
    return true;
  }

  async getAllRooms(): Promise<RoomType[]> {
    const rooms = await Room.find();
    return rooms.map(this.mapRoom);
  }

  async getActiveRooms(): Promise<RoomType[]> {
    const rooms = await Room.find({ status: 'active' });
    return rooms.map(this.mapRoom);
  }

  async getEndedRooms(): Promise<RoomType[]> {
    const rooms = await Room.find({ status: 'ended' });
    return rooms.map(this.mapRoom);
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
