import { useState } from "react";
import { Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api/api";

export default function JoinPollRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const joinRoom = async () => {
    setRoomError(null);
    try {
      const res = await api.get(`/livequizzes/rooms/${roomCode}`);
      if (res.data?.success && res.data.room?.roomCode) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Enhanced floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse dark:from-blue-500/10 dark:to-blue-600/10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000 dark:from-blue-500/10 dark:to-blue-600/10"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-8 max-w-md sm:max-w-lg mx-auto">
          {/* Enhanced Main Content */}
          <Card className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-slate-200/80 dark:bg-gray-900/90 dark:border-gray-700/80 dark:shadow-gray-900/20">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-3 text-center sm:text-left">
                <div className="relative group mx-auto sm:mx-0">
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 dark:from-blue-400 dark:to-blue-500"></div>
                  <div className="relative w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center dark:from-blue-400 dark:to-blue-500">
                    <Users className="text-white h-6 w-6 sm:h-5 sm:w-5" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Join Poll Room
                  </CardTitle>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Enter your details to join an active poll session</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Room Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="roomCode"
                    type="text"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value);
                      setRoomError(null);
                    }}
                    required
                  />
                </div>

                {roomError && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">{roomError}</p>
                  </div>
                )}

                <Button
                  onClick={joinRoom}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl text-sm sm:text-base"
                >
                  <Check className="mr-2 h-4 w-4" /> Join Poll Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}