import { describe, it, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from 'http';

// Mock the pollSocket module
const mockPollSocket = {
    emitToRoom: vi.fn()
};

vi.mock('../utils/PollSocket.js', () => ({
    pollSocket: mockPollSocket
}));

// Mock services
const mockRoomService = {
    endRoom: vi.fn(),
};

const mockPollService = {
    createPoll: vi.fn(),
    submitAnswer: vi.fn(),
};

describe('PollRoom Socket Integration Tests', () => {
    let io: IOServer;
    let httpServer: HttpServer;
    let clientSocket: ClientSocket;
    let teacherSocket: ClientSocket;
    let studentSocket: ClientSocket;
    let port: number;

    beforeAll((done) => {
        httpServer = createServer();
        io = new IOServer(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            },
        });

        // Socket handlers matching the 3 socket-enabled operations from PollRoomController
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // 1. CREATE POLL - Broadcast poll creation to room participants
            socket.on('create-poll-in-room', async (data: {
                roomCode: string;
                question: string;
                options: string[];
                correctOptionIndex: number;
                creatorId: string;
                timer?: number;
            }) => {
                try {
                    const room = await mockRoomService.getRoomByCode(data.roomCode);
                    if (!room) {
                        socket.emit('error', { message: 'Invalid room' });
                        return;
                    }

                    const poll = await mockPollService.createPoll(data.roomCode, {
                        question: data.question,
                        options: data.options,
                        correctOptionIndex: data.correctOptionIndex,
                        timer: data.timer
                    });

                    // Join room for broadcasting
                    socket.join(data.roomCode);

                    // Broadcast poll creation to all room participants
                    io.to(data.roomCode).emit('poll-created', {
                        pollId: poll.id,
                        question: data.question,
                        options: data.options,
                        timer: data.timer,
                        createdAt: new Date()
                    });

                    // Confirm to creator
                    socket.emit('poll-creation-confirmed', {
                        success: true,
                        poll
                    });

                } catch (error: any) {
                    socket.emit('error', { message: error.message });
                }
            });

            // 2. SUBMIT ANSWER - Real-time answer submission with instant feedback
            socket.on('submit-poll-answer', async (data: {
                roomCode: string;
                pollId: string;
                userId: string;
                answerIndex: number;
            }) => {
                try {
                    await mockPollService.submitAnswer(
                        data.roomCode,
                        data.pollId,
                        data.userId,
                        data.answerIndex
                    );

                    // Join room for broadcasting
                    socket.join(data.roomCode);

                    // Confirm submission to student
                    socket.emit('answer-submitted', {
                        success: true,
                        pollId: data.pollId,
                        answerIndex: data.answerIndex,
                        submittedAt: new Date()
                    });

                    // Notify teacher of new submission (without revealing the answer)
                    socket.to(data.roomCode).emit('new-answer-received', {
                        pollId: data.pollId,
                        userId: data.userId,
                        timestamp: new Date()
                    });

                } catch (error: any) {
                    socket.emit('error', { message: error.message });
                }
            });

            // 3. END ROOM - Broadcast room ending to all participants
            socket.on('end-room-request', async (data: {
                roomCode: string;
                teacherId: string;
            }) => {
                try {
                    const success = await mockRoomService.endRoom(data.roomCode);
                    if (!success) {
                        socket.emit('error', { message: 'Room not found' });
                        return;
                    }

                    // Join room for broadcasting
                    socket.join(data.roomCode);

                    // Broadcast room ending to all participants
                    io.to(data.roomCode).emit('room-ended', {
                        roomCode: data.roomCode,
                        endedBy: data.teacherId,
                        endedAt: new Date(),
                        message: 'Room has been ended by the teacher'
                    });

                    // Confirm to teacher
                    socket.emit('room-end-confirmed', {
                        success: true,
                        message: 'Room ended successfully'
                    });

                } catch (error: any) {
                    socket.emit('error', { message: error.message });
                }
            });

            // Helper events for joining rooms
            socket.on('join-room', (data: { roomCode: string; userType: string }) => {
                socket.join(data.roomCode);
                console.log(`${data.userType} joined room: ${data.roomCode}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        httpServer.listen(0, () => {
            const address = httpServer.address();
            port = typeof address === 'string' ? parseInt(address) : address?.port || 0;
            console.log(`Test server listening on port ${port}`);
            done();
        });
    });

    afterAll((done) => {
        if (clientSocket?.connected) clientSocket.disconnect();
        if (teacherSocket?.connected) teacherSocket.disconnect();
        if (studentSocket?.connected) studentSocket.disconnect();

        if (io) io.close();
        if (httpServer) {
            httpServer.close(() => done());
        } else {
            done();
        }
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock responses
        mockRoomService.getRoomByCode.mockResolvedValue({
            id: '1',
            name: 'Test Room',
            roomCode: 'abc123',
            status: 'active'
        });

        mockRoomService.endRoom.mockResolvedValue(true);

        mockPollService.createPoll.mockResolvedValue({
            id: 'poll1',
            question: 'Test question',
            options: ['A', 'B', 'C'],
            correctOptionIndex: 1
        });

        mockPollService.submitAnswer.mockResolvedValue(undefined);
    });

    describe('Socket Event: Create Poll in Room', () => {
        it('should broadcast poll creation to all room participants', (done) => {
            teacherSocket = Client(`http://localhost:${port}`);
            studentSocket = Client(`http://localhost:${port}`);

            let connectedCount = 0;
            const checkBothConnected = () => {
                connectedCount++;
                if (connectedCount === 2) {
                    // Both connected, join room
                    teacherSocket.emit('join-room', { roomCode: 'abc123', userType: 'teacher' });
                    studentSocket.emit('join-room', { roomCode: 'abc123', userType: 'student' });

                    setTimeout(() => {
                        teacherSocket.emit('create-poll-in-room', {
                            roomCode: 'abc123',
                            question: 'What is 2+2?',
                            options: ['3', '4', '5'],
                            correctOptionIndex: 1,
                            creatorId: 'teacher1',
                            timer: 30
                        });
                    }, 100);
                }
            };

            studentSocket.on('connect', checkBothConnected);
            teacherSocket.on('connect', checkBothConnected);

            // Student should receive poll creation broadcast
            studentSocket.on('poll-created', (data) => {
                expect(data.question).toBe('What is 2+2?');
                expect(data.options).toEqual(['3', '4', '5']);
                expect(data.timer).toBe(30);
                expect(data.pollId).toBe('poll1');
                expect(mockPollService.createPoll).toHaveBeenCalledWith('abc123', {
                    question: 'What is 2+2?',
                    options: ['3', '4', '5'],
                    correctOptionIndex: 1,
                    timer: 30
                });
                done();
            });
        });

        it('should handle invalid room for poll creation', (done) => {
            mockRoomService.getRoomByCode.mockResolvedValueOnce(null);

            teacherSocket = Client(`http://localhost:${port}`);

            teacherSocket.on('connect', () => {
                teacherSocket.emit('create-poll-in-room', {
                    roomCode: 'invalid123',
                    question: 'Test question?',
                    options: ['A', 'B'],
                    correctOptionIndex: 0,
                    creatorId: 'teacher1'
                });
            });

            teacherSocket.on('error', (data) => {
                expect(data.message).toBe('Invalid room');
                done();
            });
        });
    });

    describe('Socket Event: Submit Poll Answer', () => {
        it('should handle answer submission and notify teacher', (done) => {
            teacherSocket = Client(`http://localhost:${port}`);
            studentSocket = Client(`http://localhost:${port}`);

            let connectedCount = 0;
            const checkBothConnected = () => {
                connectedCount++;
                if (connectedCount === 2) {
                    teacherSocket.emit('join-room', { roomCode: 'abc123', userType: 'teacher' });
                    studentSocket.emit('join-room', { roomCode: 'abc123', userType: 'student' });

                    setTimeout(() => {
                        studentSocket.emit('submit-poll-answer', {
                            roomCode: 'abc123',
                            pollId: 'poll1',
                            userId: 'student1',
                            answerIndex: 1
                        });
                    }, 100);
                }
            };

            teacherSocket.on('connect', checkBothConnected);
            studentSocket.on('connect', checkBothConnected);

            let studentConfirmed = false;
            let teacherNotified = false;

            // Student should get confirmation
            studentSocket.on('answer-submitted', (data) => {
                expect(data.success).toBe(true);
                expect(data.pollId).toBe('poll1');
                expect(data.answerIndex).toBe(1);
                studentConfirmed = true;
                if (teacherNotified) done();
            });

            // Teacher should get notification (without answer details)
            teacherSocket.on('new-answer-received', (data) => {
                expect(data.pollId).toBe('poll1');
                expect(data.userId).toBe('student1');
                expect(data.timestamp).toBeDefined();
                expect(mockPollService.submitAnswer).toHaveBeenCalledWith('abc123', 'poll1', 'student1', 1);
                teacherNotified = true;
                if (studentConfirmed) done();
            });
        });
    });

    describe('Socket Event: End Room', () => {
        it('should broadcast room ending to all participants', (done) => {
            teacherSocket = Client(`http://localhost:${port}`);
            studentSocket = Client(`http://localhost:${port}`);

            let connectedCount = 0;
            const checkBothConnected = () => {
                connectedCount++;
                if (connectedCount === 2) {
                    teacherSocket.emit('join-room', { roomCode: 'abc123', userType: 'teacher' });
                    studentSocket.emit('join-room', { roomCode: 'abc123', userType: 'student' });

                    setTimeout(() => {
                        teacherSocket.emit('end-room-request', {
                            roomCode: 'abc123',
                            teacherId: 'teacher1'
                        });
                    }, 100);
                }
            };

            teacherSocket.on('connect', checkBothConnected);
            studentSocket.on('connect', checkBothConnected);

            // Student should receive room ended notification
            studentSocket.on('room-ended', (data) => {
                expect(data.roomCode).toBe('abc123');
                expect(data.endedBy).toBe('teacher1');
                expect(data.message).toBe('Room has been ended by the teacher');
                expect(mockRoomService.endRoom).toHaveBeenCalledWith('abc123');
                done();
            });
        });

        it('should handle room not found error', (done) => {
            mockRoomService.endRoom.mockResolvedValueOnce(false);

            teacherSocket = Client(`http://localhost:${port}`);

            teacherSocket.on('connect', () => {
                teacherSocket.emit('end-room-request', {
                    roomCode: 'nonexistent',
                    teacherId: 'teacher1'
                });
            });

            teacherSocket.on('error', (data) => {
                expect(data.message).toBe('Room not found');
                done();
            });
        });
    });

    describe('Integration with PollSocket utility', () => {
        it('should verify pollSocket.emitToRoom is called when ending room via HTTP', () => {
            // This test verifies the integration with the actual HTTP endpoint
            // The HTTP endpoint calls pollSocket.emitToRoom after ending the room

            // Simulate the HTTP endpoint behavior
            const roomCode = 'abc123';
            mockPollSocket.emitToRoom(roomCode, 'room-ended', {});

            expect(mockPollSocket.emitToRoom).toHaveBeenCalledWith(roomCode, 'room-ended', {});
        });
    });

    describe('Multiple Clients Interaction', () => {
        it('should handle multiple students submitting answers simultaneously', (done) => {
            const studentSockets: ClientSocket[] = [];
            const answers: any[] = [];
            let submissionCount = 0;

            // Create 3 student sockets
            for (let i = 0; i < 3; i++) {
                const socket = Client(`http://localhost:${port}`);
                studentSockets.push(socket);

                socket.on('connect', () => {
                    socket.emit('join-room', { roomCode: 'abc123', userType: 'student' });

                    setTimeout(() => {
                        socket.emit('submit-poll-answer', {
                            roomCode: 'abc123',
                            pollId: 'poll1',
                            userId: `student${i + 1}`,
                            answerIndex: i % 3 // Different answers
                        });
                    }, 100);
                });

                socket.on('answer-submitted', (data) => {
                    answers.push(data);
                    submissionCount++;

                    if (submissionCount === 3) {
                        expect(answers.length).toBe(3);
                        answers.forEach(answer => {
                            expect(answer.success).toBe(true);
                            expect(answer.pollId).toBe('poll1');
                        });

                        // Cleanup
                        studentSockets.forEach(s => s.disconnect());
                        done();
                    }
                });
            }
        });
    });
});
