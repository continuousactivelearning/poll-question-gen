// src/pages/student/mypoll.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, BarChart3, AlertCircle, Loader2, Eye, CheckCircle, XCircle, Trophy, Target } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL;

interface StudentPollAnswer {
    pollId: string;
    answerIndex: number;
    isCorrect: boolean;
    submittedAt: string;
}

interface Poll {
    _id: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
}

interface AttendedRoom {
    roomCode: string;
    roomName: string;
    teacherName: string;
    attendedAt: string;
    status: 'active' | 'ended';
    polls: Poll[];
    studentAnswers: StudentPollAnswer[];
    totalPolls: number;
    correctAnswers: number;
    participantCount: number;
}

export default function MyPoll() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isDark] = useState(false);
    const [attendedRooms, setAttendedRooms] = useState<AttendedRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttendedRooms = async () => {
            if (!user?.uid) {
                setError("User not authenticated");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_URL}/livequizzes/student/${user.uid}/attended-rooms`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        //'Authorization': `Bearer ${user?.token}`
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch attended rooms: ${response.status}`);
                }

                const data = await response.json();

                // Sort rooms by attendance date (newest first)
                const sortedRooms = data.sort((a: AttendedRoom, b: AttendedRoom) => {
                    return new Date(b.attendedAt).getTime() - new Date(a.attendedAt).getTime();
                });

                setAttendedRooms(sortedRooms);
            } catch (err) {
                console.error('Error fetching attended rooms:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch attended rooms');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendedRooms();
    }, [user?.uid]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateScorePercentage = (correct: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 dark:text-green-400';
        if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBadgeColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const handleViewDetails = (roomCode: string, event: React.MouseEvent) => {
        event.stopPropagation();
        navigate({ to: `/student/mypoll/details/${roomCode}` });
    };

    const handleRejoinRoom = (roomCode: string, event: React.MouseEvent) => {
        event.stopPropagation();
        navigate({ to: `/student/join/${roomCode}` });
    };

    if (loading) {
        return (
            <div className={`${isDark ? 'dark' : ''} transition-colors duration-300`}>
                <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                        My Polls
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading your polls...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${isDark ? 'dark' : ''} transition-colors duration-300`}>
                <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                        My Polls
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg text-red-600 dark:text-red-400 mb-4">{error}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isDark ? 'dark' : ''} transition-colors duration-300`}>
            <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
                <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        My Polls
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {attendedRooms.length} room{attendedRooms.length !== 1 ? 's' : ''} attended
                    </div>
                </div>

                {attendedRooms.length === 0 ? (
                    <div className="text-center py-12">
                        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                            No polls attended yet. Join a room to start participating!
                        </p>
                        <Button
                            onClick={() => navigate({ to: '/student/pollroom' })}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Join Room
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {attendedRooms.map((room) => {
                            const scorePercentage = calculateScorePercentage(room.correctAnswers, room.totalPolls);

                            return (
                                <Card
                                    key={room.roomCode}
                                    onClick={() => handleViewDetails(room.roomCode, { stopPropagation: () => { } } as React.MouseEvent)}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl dark:shadow-xl transition-shadow cursor-pointer"
                                >
                                    <CardHeader>
                                        <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="truncate">{room.roomName}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                                    by {room.teacherName}
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(room.status)}>
                                                {room.status}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            Attended: {formatDate(room.attendedAt)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-emerald-500" />
                                            Participants: {room.participantCount}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-indigo-500" />
                                            Questions: {room.totalPolls}
                                        </div>

                                        {/* Score Display */}
                                        <div className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4 text-orange-500" />
                                            <span>Score: </span>
                                            <span className={`font-semibold ${getScoreColor(scorePercentage)}`}>
                                                {room.correctAnswers}/{room.totalPolls} ({scorePercentage}%)
                                            </span>
                                        </div>

                                        {/* Performance Badge */}
                                        <div className="flex items-center gap-2">
                                            <Badge className={getScoreBadgeColor(scorePercentage)}>
                                                {scorePercentage >= 80 ? 'Excellent' :
                                                    scorePercentage >= 60 ? 'Good' : 'Needs Improvement'}
                                            </Badge>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                <span>{room.correctAnswers} correct</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <XCircle className="h-3 w-3 text-red-500" />
                                                <span>{room.totalPolls - room.correctAnswers} incorrect</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={(e) => handleViewDetails(room.roomCode, e)}
                                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Button>
                                                {room.status === 'active' && (
                                                    <Button
                                                        onClick={(e) => handleRejoinRoom(room.roomCode, e)}
                                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 animate-pulse"
                                                    >
                                                        Rejoin
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}