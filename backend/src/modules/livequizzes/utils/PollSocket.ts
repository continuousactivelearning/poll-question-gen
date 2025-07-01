import { Server } from 'socket.io';

class PollSocket {
  private io: Server | null = null;

  init(server: import('http').Server) {
    this.io = new Server(server, { cors: { origin: 'http://localhost:5173' } });
    this.io.on('connection', socket => {
      console.log('Client connected', socket.id);
      socket.on('join-room', roomCode => {
        socket.join(roomCode);
        console.log(`Joined room: ${roomCode}`);
      });
    });
  }

  emitToRoom(roomCode: string, event: string, data: any) {
    if (this.io) {
      this.io.to(roomCode).emit(event, data);
    }
  }
}

export const pollSocket = new PollSocket();
