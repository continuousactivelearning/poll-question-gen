import { useState } from "react";
import { FaPoll, FaTachometerAlt, FaUsers, FaChartBar, FaCog, FaQuestionCircle, FaCheck } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";
import { LineChart } from "lucide-react";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default function JoinPollRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState("public");
  const [roomError, setRoomError] = useState<string | null>(null);
  const navigate = useNavigate();

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Poppins', sans-serif",
        color: "",
      }}
    >
      <div className="container mx-auto mt-4 px-4 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <Card className="p-6 rounded-xl shadow" style={{ color: "#7b61ff", minHeight: "350px", border: "1px solid #e9eef6" }}>
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg font-semibold" style={{ background: "#e9eef6" }}>
                <FaTachometerAlt className="mr-3" /> Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white transition">
                <FaPoll className="mr-3" /> My Polls
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white transition">
                <FaUsers className="mr-3" /> Classes
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white transition">
                <FaChartBar className="mr-3" /> Analytics
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white transition">
                <FaCog className="mr-3" /> Settings
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white transition">
                <FaQuestionCircle className="mr-3" /> Help
              </a>
            </li>
          </ul>
        </Card>

        {/* Main Panel */}
        <Card className="p-6 rounded-xl shadow border" style={{ borderColor: "#e9eef6" }}>
          <CardHeader className="mb-4">
            <CardTitle className="text-2xl font-semibold" style={{ color: '#7b61ff' }}>
              Join Poll Room
            </CardTitle>
          </CardHeader>
          <CardContent>
              <form onSubmit={joinRoom} className="space-y-5">
                <div>
                  <label htmlFor="roomCode" className="block font-medium mb-2">Room Code <span className="text-red-500">*</span></label>
                  <input
                    id="roomCode"
                    type="text"
                    className="w-full px-4 py-3 border border-[#7b61ff] rounded-lg focus:ring-2 focus:ring-[#7b61ff] transition text-black placeholder-gray-400"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value);
                      setRoomError(null);
                    }}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block font-medium mb-2">Your Name <span className="text-red-500">*</span></label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-3 border border-[#7b61ff] rounded-lg focus:ring-2 focus:ring-[#7b61ff] transition text-black placeholder-gray-400"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block font-medium mb-2">Description (Optional)</label>
                  <textarea
                    id="description"
                    className="w-full px-4 py-3 border border-[#7b61ff] rounded-lg focus:ring-2 focus:ring-[#7b61ff] transition text-black placeholder-gray-400"
                    placeholder="Brief description (optional)"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="access" className="block font-medium mb-2">Access Type</label>
                  <select
                    id="access"
                    className="w-full px-4 py-3 border border-[#7b61ff] rounded-lg focus:ring-2 focus:ring-[#7b61ff] transition text-black"
                    value={access}
                    onChange={(e) => setAccess(e.target.value)}
                  >
                    <option value="public">Public - Anyone with link can join</option>
                    <option value="restricted">Restricted - Only students in my classes</option>
                    <option value="private">Private - Invite only</option>
                  </select>
                </div>
                {roomError && (
                  <div className="text-red-500 text-sm mt-2">{roomError}</div>
                )}
                <Button
                  type="submit"
                  className="w-full py-3 font-semibold rounded-lg shadow flex items-center justify-center"
                  style={{ background: "#ffa726", color: "#fff" }}
                >
                  <FaCheck className="mr-2" /> Join Poll Room
                </Button>
              </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
