import { useState } from "react";
import { useNavigate } from '@tanstack/react-router';
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, Plus, Sparkles, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

const AuroraText = ({
  children,
  colors = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
}: {
  children: React.ReactNode;
  colors?: string[];
}) => (
  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-pulse dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400">
    {children}
  </span>
);

export default function CreatePollRoom() {
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.post("/livequizzes/rooms/", {
        name: roomName,
        teacherId: "teacher-123"
      });
      toast.success("Room created successfully!");
      navigate({ to: `/teacher/pollroom/${res.data.roomCode}` });
    } catch (error) {
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createRoom();
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      {/* Enhanced floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse dark:from-purple-500/10 dark:to-blue-500/10"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000 dark:from-blue-500/10 dark:to-cyan-500/10"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-20 animate-pulse dark:from-purple-400 dark:to-blue-400 dark:opacity-25"></div>
              <div className="relative h-16 w-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg dark:from-purple-400 dark:to-blue-400">
                <Plus className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">
              <AuroraText>Create New Room</AuroraText>
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-md mx-auto">
            Set up a new interactive polling room for your students to join and participate in real-time
          </p>
        </div>

        {/* Enhanced Card */}
        <Card className="relative overflow-hidden bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl shadow-slate-500/10 dark:bg-gray-900/95 dark:border-gray-700/80 dark:shadow-gray-900/20">
          {/* Card background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-cyan-50/50 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-cyan-900/20" />
          
          <CardHeader className="relative z-10 pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800 dark:text-gray-200">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md dark:from-purple-400 dark:to-blue-400">
                <Users className="h-5 w-5 text-white" />
              </div>
              Room Configuration
            </CardTitle>
            <p className="text-slate-600 dark:text-gray-400 ml-13">
              Give your room a memorable name that students can easily identify
            </p>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6">
            {/* Enhanced Input Section */}
            <div className="space-y-3">
              <label htmlFor="roomName" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Room Name
              </label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-20 group-focus-within:opacity-30 transition-opacity duration-300 dark:from-purple-400 dark:to-blue-400 dark:opacity-25 dark:group-focus-within:opacity-40"></div>
                <Input
                  id="roomName"
                  placeholder="e.g., Mathematics Quiz Session, Science Lab Discussion..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="relative h-14 text-lg bg-white/90 backdrop-blur-sm border-2 border-slate-200/60 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 placeholder:text-slate-400 dark:bg-gray-800/90 dark:border-gray-600/60 dark:focus:border-purple-400 dark:placeholder:text-gray-500"
                  disabled={isCreating}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Choose a descriptive name to help students identify your room
              </p>
            </div>

            {/* Enhanced Create Button */}
            <Button
              onClick={createRoom}
              disabled={isCreating || !roomName.trim()}
              className="relative w-full h-14 text-lg font-semibold overflow-hidden group bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 dark:from-purple-400 dark:to-blue-400 dark:hover:from-purple-500 dark:hover:to-blue-500 dark:shadow-purple-400/25 dark:hover:shadow-purple-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Create Room
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </Button>

            {/* Additional Info Section */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-blue-200/60 dark:border-blue-800/60">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 dark:from-blue-400 dark:to-cyan-400">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    What happens next?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                    Once created, you'll get a unique room code that students can use to join your polling session. 
                    You can then create polls, manage participants, and view real-time results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}