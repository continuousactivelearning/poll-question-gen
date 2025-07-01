import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default function JoinPollRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState<string | null>(null);
  const navigate = useNavigate();

  const joinRoom = async () => {
    setRoomError(null);
    try {
      const res = await api.get(`/livequizzes/rooms/${roomCode}`);
      if (res.data?.code) {
        localStorage.setItem("activeRoomCode", roomCode);
        localStorage.setItem("joinedRoom", "true");
        toast.success("Joined room!");
        navigate({ to: `/student/pollroom/${roomCode}` });
      } else {
        setRoomError("Invalid room code.");
      }
    } catch (error: any) {
      setRoomError(error.response?.status === 404 ? "Room not found." : "Unexpected error.");
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 p-6">
      <CardHeader>
        <CardTitle>Join Poll Room</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => { setRoomCode(e.target.value); setRoomError(null); }}
          className="mb-3"
        />
        {roomError && <div className="text-red-500 text-sm mb-2">{roomError}</div>}
        <Button className="w-full" onClick={joinRoom}>Join Room</Button>
      </CardContent>
    </Card>
  );
}
