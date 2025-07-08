// src/pages/teacher/manageroom.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock4, BarChart3, AlertCircle, Loader2, Play, Square, MoreVertical, Eye } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = import.meta.env.VITE_API_URL;

interface Room {
    roomCode: string;
    name: string;
    createdAt: string;
    status: 'active' | 'ended';
    teacherId: string;
    polls: {
        _id: string;
        question: string;
        options: string[];
        correctOptionIndex: number;
        answers: { userId: string; answerIndex: number }[];
    }[];
}

export default function ManageRoom() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isDark] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [endingRoom, setEndingRoom] = useState<string | null>(null);

    useEffect(() => {
        const fetchRooms = async () => {
            if (!user?.uid) {
                setError("User not authenticated");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_URL}/livequizzes/rooms/teacher/${user.uid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        //'Authorization': `Bearer ${user?.token}`
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch rooms: ${response.status}`);
                }

                const data = await response.json();

                // Sort rooms: active first, then ended
                const sortedRooms = data.sort((a: Room, b: Room) => {
                    // Active rooms come first
                    if (a.status === 'active' && b.status === 'ended') return -1;
                    if (a.status === 'ended' && b.status === 'active') return 1;

                    // If both have the same status, sort by creation date (newest first)
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setRooms(sortedRooms);
            } catch (err) {
                console.error('Error fetching rooms:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [user?.uid]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateParticipants = (room: Room) => {
        // Calculate unique participants across all polls in the room
        const uniqueParticipants = new Set();
        room.polls.forEach(poll => {
            poll.answers.forEach(answer => {
                uniqueParticipants.add(answer.userId);
            });
        });
        return uniqueParticipants.size;
    };

    const calculateDuration = (room: Room) => {
        // This is a placeholder calculation since we don't have duration data
        // You might want to store actual session duration in your backend
        const pollCount = room.polls.length;
        const estimatedDuration = pollCount * 2; // Estimate 2 minutes per poll
        return `~${estimatedDuration} mins`;
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-600 dark:text-gray-400';
    };

    const handleEndRoom = async (roomCode: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setEndingRoom(roomCode);
        
        try {
            const response = await fetch(`${API_URL}/livequizzes/rooms/${roomCode}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to end room');
            }
            
            // Update the room status locally
            setRooms(prevRooms => 
                prevRooms.map(room => 
                    room.roomCode === roomCode 
                        ? { ...room, status: 'ended' as const }
                        : room
                )
            );
        } catch (err) {
            console.error('Error ending room:', err);
            // You might want to show an error toast here
        } finally {
            setEndingRoom(null);
        }
    };

    const handleReturnToRoom = (roomCode: string, event: React.MouseEvent) => {
        event.stopPropagation();
        navigate({ to: `/teacher/pollroom/${roomCode}` });
    };

    const handleViewAnalysis = (roomCode: string, event: React.MouseEvent) => {
        event.stopPropagation();
        navigate({ to: `/teacher/manage-rooms/pollanalysis/${roomCode}` });
    };

    if (loading) {
        return (
            <div className={`${isDark ? 'dark' : ''} transition-colors duration-300`}>
                <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                        Manage Rooms
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading rooms...</span>
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
                        Manage Rooms
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
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                    Manage Rooms
                </div>

                {rooms.length === 0 ? (
                    <div className="text-center py-12">
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                            No rooms found. Create your first room to get started!
                        </p>
                        <Button
                            onClick={() => navigate({ to: '/teacher/pollroom' })}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Create Room
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <Card
                                key={room.roomCode}
                                onClick={() => room.status === 'ended' ? navigate({ to: `/teacher/manage-rooms/pollanalysis/${room.roomCode}` }) : undefined}
                                className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl dark:shadow-xl transition-shadow ${
                                    room.status === 'ended' ? 'cursor-pointer' : ''
                                }`}
                            >
                                <CardHeader>
                                    <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        {room.name}
                                        <span className={`ml-auto text-xs px-2 py-1 rounded-full ${getStatusColor(room.status)}`}>
                                            {room.status}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        Created: {formatDate(room.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-emerald-500" />
                                        Participants: {calculateParticipants(room)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-indigo-500" />
                                        Polls: {room.polls.length}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock4 className="h-4 w-4 text-orange-500" />
                                        Duration: {calculateDuration(room)}
                                    </div>
                                    <div className="pt-2">
                                        {room.status === 'active' ? (
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={(e) => handleReturnToRoom(room.roomCode, e)}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold animate-pulse shadow-lg shadow-green-500/50"
                                                >
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Return to Room
                                                </Button>
                                                <Button
                                                    onClick={(e) => handleEndRoom(room.roomCode, e)}
                                                    disabled={endingRoom === room.roomCode}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3"
                                                >
                                                    End Room
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="px-3 border-gray-300 hover:bg-gray-50"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={(e) => handleViewAnalysis(room.roomCode, e)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Analysis
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ) : (
                                            <Button 
                                                onClick={(e) => handleViewAnalysis(room.roomCode, e)}
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                                            >
                                                View Analysis
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}