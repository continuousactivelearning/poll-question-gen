import { Server } from 'socket.io';
import { RoomService } from '../services/RoomService.js';  // adjust the path as needed

class PollSocket {
  private io: Server | null = null;

  constructor(private readonly roomService: RoomService) { }

  init(server: import('http').Server) {
    this.io = new Server(server, {
      cors: { origin: 'http://localhost:5173' },
    });

    this.io.on('connection', socket => {
      console.log('Client connected', socket.id);

      socket.on('join-room', async (roomCode: string) => {
        try {
          const isActive = await this.roomService.isRoomValid(roomCode);

          if (isActive) {
            socket.join(roomCode);
            console.log(`Socket ${socket.id} joined active room: ${roomCode}`);
          } else {
            console.log(`Join failed: room ended or invalid: ${roomCode}`);
            socket.emit('room-ended');  // immediately tell the client
          }
        } catch (err) {
          console.error('Error checking room status:', err);
          socket.emit('error', 'Unexpected server error');
        }
      });
    });
  }

  emitToRoom(roomCode: string, event: string, data: any) {
    if (this.io) {
      this.io.to(roomCode).emit(event, data);
    } else {
      console.warn('Socket.IO not initialized');
    }
  }
}

export const pollSocket = new PollSocket(new RoomService());