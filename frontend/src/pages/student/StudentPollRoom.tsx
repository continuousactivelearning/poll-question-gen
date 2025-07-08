import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import io from "socket.io-client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Zap, Users, Menu, Info, History, LogOut, Clock, CheckCircle, Circle, Trophy } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

const Socket_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_API_URL;

const socket = io(Socket_URL);
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

type Poll = {
  _id: string;
  question: string;
  options: string[];
  roomCode: string;
  creatorId: string;
  createdAt: Date;
  timer: number;
};

type RoomDetails = {
  roomCode: string;
  creatorId: string;
  createdAt: string;
};

export default function StudentPollRoom() {
  const params = useParams({ from: '/student/pollroom/$code' });
  const roomCode = params.code;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [joinedRoom, setJoinedRoom] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [answeredPolls, setAnsweredPolls] = useState<Record<string, number>>({});
  const [activeMenu, setActiveMenu] = useState<"room" | "previous" | null>(null);
  const [pollTimers, setPollTimers] = useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    socket.emit("join-room", roomCode);
    setJoinedRoom(true);
    loadRoomDetails(roomCode);
    const savedAnswers = localStorage.getItem(`answeredPolls_${roomCode}`);
    if (savedAnswers) setAnsweredPolls(JSON.parse(savedAnswers));
    localStorage.setItem("activeRoomCode", roomCode);
    localStorage.setItem("joinedRoom", "true");
    toast.success("Joined room!");

    socket.on('room-ended', () => {
      toast.error('Room has ended');
      navigate({ to: '/student/home' });
    });
    return () => {
      socket.off('room-ended');
    };
  }, [roomCode]);

  useEffect(() => {
    socket.on("new-poll", (poll: Poll) => {
      setPolls(prev => [...prev, poll]);
      toast("New poll received!");
    });
    return () => { socket.off("new-poll"); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPollTimers(prev => {
        const updated: Record<string, number> = {};
        polls.forEach(p => {
          const current = prev[p._id] ?? p.timer;
          updated[p._id] = current > 0 ? current - 1 : 0;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [polls]);

  useEffect(() => {
    Object.entries(pollTimers).forEach(([pollId, time]) => {
      if (time === 0) {
        setPolls(prev => prev.filter(p => p._id !== pollId));
      }
    });
  }, [pollTimers]);

  useEffect(() => {
    if (roomCode) {
      localStorage.setItem(`answeredPolls_${roomCode}`, JSON.stringify(answeredPolls));
    }
  }, [answeredPolls, roomCode]);

  const loadRoomDetails = async (code: string) => {
    try {
      const res = await api.get(`/livequizzes/rooms/${code}`);
      if (res.data) setRoomDetails(res.data);
    } catch (e) {
      console.error("Failed to load room details:", e);
    }
  };

  const submitAnswer = async (pollId: string, answerIndex: number) => {
    setIsAnimating(true);
    try {
      await api.post(`/livequizzes/rooms/${roomCode}/polls/answer`, {
        pollId, userId: user?.uid, answerIndex
      });
      setTimeout(() => {
        setAnsweredPolls(prev => ({ ...prev, [pollId]: answerIndex }));
        setIsAnimating(false);
        toast.success("Vote submitted!");
      }, 300);
    } catch {
      setIsAnimating(false);
      toast.error("Failed to submit vote");
    }
  };

  const exitRoom = () => {
    socket.emit("leave-room", roomCode);
    setJoinedRoom(false);
    setPolls([]);
    setAnsweredPolls({});
    setRoomDetails(null);
    localStorage.removeItem("activeRoomCode");
    localStorage.removeItem("joinedRoom");
    setActiveMenu(null);
    toast.info("Left the room.");
    navigate({ to: `/student/pollroom` });
  };

  const getTimerColor = (timeLeft: number) => {
    if (timeLeft > 20) return "text-emerald-500";
    if (timeLeft > 10) return "text-amber-500";
    return "text-red-500";
  };

  const getTimerBg = (timeLeft: number) => {
    if (timeLeft > 20) return "bg-emerald-500/20";
    if (timeLeft > 10) return "bg-amber-500/20";
    return "bg-red-500/20";
  };

  const activePolls = polls.filter(p => answeredPolls[p._id] === undefined);

  if (!roomCode) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-purple-900/20">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-200/50 dark:border-purple-700/50 mb-4">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              Live Poll Session
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Room: {roomCode}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join the conversation and make your voice heard!
          </p>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10">
              <CardHeader className="pb-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-800 dark:text-gray-100">
                        Active Polls
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {activePolls.length} poll{activePolls.length !== 1 ? 's' : ''} waiting for your response
                      </p>
                    </div>
                  </div>
                  
                  {joinedRoom && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
                        >
                          <Menu className="w-5 h-5 mr-2" />
                          Menu
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => setActiveMenu(activeMenu === "room" ? null : "room")}
                          className="flex items-center gap-3 p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <Info className="w-4 h-4 text-purple-600" />
                          Room Info
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setActiveMenu(activeMenu === "previous" ? null : "previous")}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <History className="w-4 h-4 text-blue-600" />
                          Previous Polls
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={exitRoom} 
                          className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="w-4 h-4" />
                          Leave Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {activePolls.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                      <Clock className="w-12 h-12 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Waiting for new polls...
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Stay tuned! New polls will appear here automatically.
                    </p>
                  </div>
                ) : (
                  activePolls.map((poll) => (
                    <div 
                      key={poll._id} 
                      className="group relative p-6 bg-gradient-to-r from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
                    >
                      {/* Timer Bar */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
                        <div 
                          className={`h-full ${getTimerBg(pollTimers[poll._id] ?? poll.timer)} transition-all duration-1000`}
                          style={{
                            width: `${((pollTimers[poll._id] ?? poll.timer) / poll.timer) * 100}%`
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 pr-4">
                          {poll.question}
                        </h3>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getTimerBg(pollTimers[poll._id] ?? poll.timer)}`}>
                          <Clock className={`w-4 h-4 ${getTimerColor(pollTimers[poll._id] ?? poll.timer)}`} />
                          <span className={`text-sm font-medium ${getTimerColor(pollTimers[poll._id] ?? poll.timer)}`}>
                            {pollTimers[poll._id] ?? poll.timer}s
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {poll.options.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedOptions[poll._id] === index ? "default" : "outline"}
                            size="lg"
                            className={`
                              relative overflow-hidden p-4 h-auto text-left justify-start transition-all duration-300
                              ${selectedOptions[poll._id] === index 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 scale-105' 
                                : 'bg-white/80 dark:bg-gray-700/80 border-purple-200/50 dark:border-purple-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 hover:scale-102'
                              }
                            `}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [poll._id]: index }))}
                            disabled={(pollTimers[poll._id] ?? poll.timer) === 0 || answeredPolls[poll._id] !== undefined}
                          >
                            <div className="flex items-center gap-3">
                              {selectedOptions[poll._id] === index ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                              <span className="font-medium">{option}</span>
                            </div>
                          </Button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        {answeredPolls[poll._id] !== undefined ? (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Vote submitted successfully!</span>
                          </div>
                        ) : (
                          <Button
                            size="lg"
                            className={`
                              bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold px-8 py-3 
                              hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 hover:scale-105
                              ${isAnimating ? 'animate-pulse' : ''}
                            `}
                            onClick={() => {
                              if (selectedOptions[poll._id] !== null && selectedOptions[poll._id] !== undefined) {
                                submitAnswer(poll._id, selectedOptions[poll._id]!);
                              } else {
                                toast.warning("Please select an option first");
                              }
                            }}
                            disabled={(pollTimers[poll._id] ?? poll.timer) === 0 || answeredPolls[poll._id] !== undefined}
                          >
                            <Trophy className="w-5 h-5 mr-2" />
                            Submit Vote
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          {activeMenu && (
            <div className="w-80 animate-in slide-in-from-right duration-300">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    {activeMenu === "room" ? (
                      <>
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <Info className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-gray-800 dark:text-gray-100">
                          Room Details
                        </CardTitle>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
                          <History className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-gray-800 dark:text-gray-100">
                          Previous Polls
                        </CardTitle>
                      </>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {activeMenu === "room" && roomDetails && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Code:</span>
                            <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                              {roomDetails.roomCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Host:</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              {roomDetails.creatorId}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created:</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {new Date(roomDetails.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeMenu === "previous" && (
                    <div className="space-y-3">
                      {Object.keys(answeredPolls).length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                            <History className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400">
                            No previous polls yet
                          </p>
                        </div>
                      ) : (
                        polls.filter(p => answeredPolls[p._id] !== undefined).map((poll) => (
                          <div 
                            key={poll._id} 
                            className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50"
                          >
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                                  {poll.question}
                                </p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                                  Your answer: {poll.options[answeredPolls[poll._id]]}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}