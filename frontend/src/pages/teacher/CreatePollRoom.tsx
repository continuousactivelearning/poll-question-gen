import { useState } from "react";
import { useNavigate } from '@tanstack/react-router';
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export default function CreatePollRoom() {
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const res = await api.post("/livequizzes/rooms/", {
        name: roomName,
        teacherId: "teacher-123"
      });
      toast.success("Room created!");
      navigate({ to: `/teacher/pollroom/${res.data.roomCode}` });
    } catch {
      toast.error("Failed to create room");
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 p-6">
      <CardHeader><CardTitle>Create New Room</CardTitle></CardHeader>
      <CardContent>
        <Input
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="mb-3"
        />
        <Button className="w-full" onClick={createRoom}>Create Room</Button>
      </CardContent>
    </Card>
  );
}
