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
            upcomingPolls, // empty array if you don’t have upcoming logic
            scoreProgression,
            performanceSummary: {
                avgScore,
                participationRate,
                bestSubject: 'N/A'  // fixed string, since no subject
            },
            roomWiseScores
        };
    }
}
