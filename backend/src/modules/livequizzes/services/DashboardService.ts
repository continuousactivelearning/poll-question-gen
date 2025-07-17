import { injectable } from 'inversify';
import { Room } from '../../../shared/database/models/Room.js';

@injectable()
export class DashboardService {
    async getStudentDashboardData(studentId: string) {
        const rooms = await Room.find({ 'polls.answers.userId': studentId }).lean();

        let totalPolls = 0;
        let takenPolls = 0;
        let totalScore = 0;

        let pollResults: any[] = [];
        let pollDetails: any[] = [];
        let activePolls: any[] = [];
        let upcomingPolls: any[] = [];  // leave empty if you don’t have upcoming logic
        let scoreProgression: any[] = [];
        let roomWiseScores: any[] = [];

        for (const room of rooms) {
            let roomScore = 0;
            let attendedPolls = 0;

            for (const poll of room.polls ?? []) {
                totalPolls++;

                const answer = poll.answers?.find((a: any) => a.userId === studentId);
                if (answer) {
                    takenPolls++;
                    attendedPolls++;

                    const score = answer.answerIndex === poll.correctOptionIndex ? 20 : 0;
                    roomScore += score;
                    totalScore += score;

                    // Add to pollResults
                    pollResults.push({
                        name: poll.question || 'Untitled Poll',
                        score,
                        date: poll.createdAt || new Date()
                    });

                    // For score progression chart
                    scoreProgression.push({
                        poll: poll.question || 'Poll',
                        score
                    });
                }

                // Always add poll details
                pollDetails.push({
                    title: poll.question || 'Untitled Poll',
                    type: 'MCQ',           // fixed value, since no type field
                    timer: poll.timer?.toString() || 'N/A'
                });

                // Active polls: based on room.status
                if (room.status === 'active') {
                    activePolls.push({
                        name: poll.question || 'Active Poll',
                        status: 'Ongoing'
                    });
                }

                // (optional) upcoming polls: you could add logic if you store startTime
            }

            // Add room-wise score if student attended at least one poll
            if (attendedPolls > 0) {
                const avgScore = roomScore / attendedPolls;
                roomWiseScores.push({
                    roomName: room.name,
                    roomCode: room.roomCode,
                    totalPolls: room.polls.length,
                    attendedPolls,
                    taken: attendedPolls,
                    score: roomScore,
                    avgScore,
                    averageScore: avgScore.toFixed(1),
                    status: room.status,
                    createdAt: room.createdAt
                });
            }
        }

        const avgScore = takenPolls > 0 ? (totalScore / takenPolls).toFixed(1) : '0';
        const participationRate = totalPolls > 0 ? `${Math.round((takenPolls / totalPolls) * 100)}%` : '0%';

        return {
            pollStats: {
                total: totalPolls,
                taken: takenPolls,
                absent: totalPolls - takenPolls
            },
            pollResults,
            pollDetails,
            activePolls,
            upcomingPolls,
            scoreProgression,
            performanceSummary: {
                avgScore,
                participationRate,
                bestSubject: 'N/A'
            },
            roomWiseScores
        };
    }

    async getTeacherDashboardData(teacherId: string) {
        const rooms = await Room.find({ teacherId }).lean();

        let totalPolls = 0;
        let totalResponses = 0;
        let activeRooms: any[] = [];
        let recentRooms: any[] = [];
        let responsesPerRoom: { roomName: string, totalResponses: number }[] = [];

        for (const room of rooms) {
            const pollCount = room.polls?.length || 0;
            const responseCount = room.polls?.reduce((sum, poll) => sum + (poll.answers?.length || 0), 0) || 0;
            totalPolls += pollCount;
            totalResponses += responseCount;

            const roomData = {
                roomName: room.name,
                roomCode: room.roomCode,
                createdAt: room.createdAt,
                status: room.status,
                totalPolls: pollCount,
                totalResponses: responseCount,
            };

            if (room.status === 'active') {
                activeRooms.push(roomData);
            }

            recentRooms.push(roomData);

            responsesPerRoom.push({
                roomName: room.name,
                totalResponses: responseCount
            });
        }

        // Sort recentRooms and activeRooms by createdAt descending
        recentRooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        activeRooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        responsesPerRoom.sort((a, b) => b.totalResponses - a.totalResponses); // Optional: Sort descending

        const participationRate = totalPolls > 0 ? `${Math.round((totalResponses / totalPolls) * 100)}%` : '0%';

        return {
            summary: {
                totalAssessmentRooms: rooms.length,
                totalPolls,
                totalResponses,
                participationRate
            },
            activeRooms,
            recentRooms,
            responsesPerRoom,
            faqs: [
                { question: "How to create a room?", answer: "Click on 'Create Room' button from the dashboard." },
                { question: "How are scores calculated?", answer: "Each correct answer gives 20 points." }
            ]
        };
    }
}
