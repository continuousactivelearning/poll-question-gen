import { injectable } from 'inversify';
import { Room } from '../interfaces/Room.js';

const rooms: Room[] = [];

@injectable()
export class RoomService {
  createRoom(name: string, teacherId: string): Room {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: Room = {
      code,
      name,
      teacherId,
      createdAt: new Date(),
      status: 'active',
    };
    rooms.push(room);
    return room;
  }

  getRoomByCode(code: string): Room | undefined {
    return rooms.find((r) => r.code === code);
  }

  isRoomValid(code: string): boolean {
    const room = this.getRoomByCode(code);
    return !!room && room.status === 'active';
  }

  isRoomEnded(roomCode: string): boolean {
    const room = this.getRoomByCode(roomCode);
    return room ? room.status === 'ended' : false;
  }

  endRoom(code: string): boolean {
    const room = this.getRoomByCode(code);
    if (!room) return false;
    room.status = 'ended';
    return true;
  }

  getAllRooms(): Room[] {
    return rooms;
  }

  getActiveRooms(): Room[] {
    return rooms.filter((r) => r.status === 'active');
  }

  getEndedRooms(): Room[] {
    return rooms.filter((r) => r.status === 'ended');
    }
  }
