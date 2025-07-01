import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import io from "socket.io-client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Socket URL and API URL from environment variables
const Socket_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_API_URL;

const socket = io(Socket_URL);
// const socket = io("http://localhost:3000"); // adjust if needed
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

type Poll = {
  id: string;
  question: string;
  options: string[];
  roomCode: string;
  creatorId: string;
  createdAt: Date;
  timer: number;
};

type RoomDetails = {
  code: string;
  creatorId: string;
  createdAt: string;
};

export default function StudentPollRoom() {
  const params = useParams({ from: '/student/pollroom/$code' });
  const roomCode = params.code;
  if (!roomCode) return <div>Loading...</div>;
  const navigate = useNavigate();
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [answeredPolls, setAnsweredPolls] = useState<Record<string, number>>({});
  const [activeMenu, setActiveMenu] = useState<"room" | "previous" | null>(null); // which side panel to show
  const [pollTimers, setPollTimers] = useState<Record<string, number>>({}); // poll.id -> seconds left
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});

  // Auto-join on mount
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
        const current = prev[p.id] ?? p.timer;
        updated[p.id] = current > 0 ? current - 1 : 0;
      });
      return updated;
    });
  }, 1000);
  return () => clearInterval(interval);
}, [polls]);

  // remove poll when timer hits 0
  useEffect(() => {
    Object.entries(pollTimers).forEach(([pollId, time]) => {
      if (time === 0) {
        setPolls(prev => prev.filter(p => p.id !== pollId));
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
    try {
      await api.post(`/livequizzes/rooms/${roomCode}/polls/answer`, {
        pollId, userId: "student-456", answerIndex
      });
      setAnsweredPolls(prev => ({ ...prev, [pollId]: answerIndex }));
      toast.success("Vote submitted!");
    } catch {
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

  return (
    <div className="max-w-6xl mx-auto mt-10 flex gap-4">
      <Card className="flex-1 p-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Poll Room_Room Code: {roomCode}</CardTitle>
          {joinedRoom && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">☰</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() =>
                  setActiveMenu(activeMenu === "room" ? null : "room")
                }>📄 Room Info</DropdownMenuItem>
                <DropdownMenuItem onClick={() =>
                  setActiveMenu(activeMenu === "previous" ? null : "previous")
                }>🗂 Previous Polls</DropdownMenuItem>
                <DropdownMenuItem onClick={exitRoom} className="text-red-600">
                  ❌ Leave Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent>
          <div className="font-semibold mb-2">Active Polls:</div>
          {polls.filter(p => answeredPolls[p.id] === undefined).length === 0 && (
            <div className="text-sm">Waiting for new polls...</div>
          )}
          {polls.filter(p => answeredPolls[p.id] === undefined).map((poll) => (
            <div key={poll.id} className="p-3 border rounded-md mb-3">
              <div className="font-medium">{poll.question}</div>
              <div className="text-xs text-gray-500 mb-2">Time left: {pollTimers[poll.id] ?? poll.timer}s</div>
              <div className="mt-2 space-y-2">
                {poll.options.map((opt, i) => (
                  <Button
                    key={i}
                    variant={selectedOptions[poll.id] === i ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedOptions(prev => ({ ...prev, [poll.id]: i }))}
                    disabled={(pollTimers[poll.id] ?? poll.timer) === 0 || answeredPolls[poll.id] !== undefined}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
              <div className="mt-2">
                {answeredPolls[poll.id] !== undefined ? (
                  <div className="text-green-600 text-xs">You have submitted this poll</div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (selectedOptions[poll.id] !== null && selectedOptions[poll.id] !== undefined) {
                        submitAnswer(poll.id, selectedOptions[poll.id]!);
                      } else {
                        toast.warning("Please select an option first");
                      }
                    }}
                    disabled={(pollTimers[poll.id] ?? poll.timer) === 0 || answeredPolls[poll.id] !== undefined}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {activeMenu && (
        <div className="w-64 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
          {activeMenu === "room" && roomDetails && (
            <>
              <div className="font-semibold mb-2">Room Details</div>
              <div className="text-xs">
                Code: {roomDetails.code}<br/>
                Creator: {roomDetails.creatorId}<br/>
                Created: {new Date(roomDetails.createdAt).toLocaleString()}
              </div>
            </>
          )}
          {activeMenu === "previous" && (
            <>
              <div className="font-semibold mb-2">Previous Polls</div>
              <div className="text-xs space-y-1">
                {Object.keys(answeredPolls).length === 0 ? (
                  <div>No previous polls</div>
                ) : polls.filter(p => answeredPolls[p.id] !== undefined).map((poll) => (
                  <div key={poll.id}>
                    ✔ {poll.question}: <span className="font-semibold">{poll.options[answeredPolls[poll.id]]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}