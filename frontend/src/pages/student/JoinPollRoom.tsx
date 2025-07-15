// import { useState } from "react";
// import { Users, Check } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "@tanstack/react-router";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { toast } from "sonner";
// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: { "Content-Type": "application/json" },
// });

// export default function JoinPollRoom() {
//   const [roomCode, setRoomCode] = useState("");
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [roomError, setRoomError] = useState<string | null>(null);
//   const navigate = useNavigate();
  
//   const joinRoom = async () => {
//     setRoomError(null);
//     if (!name.trim()) {
//       setRoomError("Name is required.");
//       return;
//     }
//     try {
//       const res = await api.get(`/livequizzes/rooms/${roomCode}`);
//       if (res.data?.success && res.data.room?.roomCode) {
//         localStorage.setItem("activeRoomCode", roomCode);
//         localStorage.setItem("joinedRoom", "true");
//         toast.success("Joined room!");
//         navigate({ to: `/student/pollroom/${roomCode}` });
//       } else {
//         setRoomError("Invalid room code.");
//       }
//     } catch (error: any) {
//       setRoomError(error.response?.status === 404 ? "Room not found." : "Unexpected error.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
//       {/* Enhanced floating background elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse dark:from-purple-500/10 dark:to-blue-500/10"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000 dark:from-blue-500/10 dark:to-cyan-500/10"></div>
//       </div>

//       <div className="relative container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
//           {/* Enhanced Sidebar
//           <Card className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 h-fit dark:bg-gray-900/90 dark:border-gray-700/80 dark:shadow-gray-900/20">
//             <CardHeader className="pb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="relative group">
//                   <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 dark:from-purple-400 dark:to-indigo-500"></div>
//                   <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center dark:from-purple-400 dark:to-indigo-500">
//                     <Gauge className="text-white h-5 w-5" />
//                   </div>
//                 </div>
//                 <div>
//                   <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">Dashboard</CardTitle>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">Your learning hub</p>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <nav className="space-y-2">
//                 <a href="#" className="flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-semibold shadow-md shadow-purple-200/50 dark:from-purple-900/40 dark:to-indigo-900/40 dark:text-purple-300 dark:shadow-purple-900/20 transition-all duration-300">
//                   <Gauge className="mr-3 h-4 w-4" /> Dashboard
//                 </a>
//                 <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
//                   <Vote className="mr-3 h-4 w-4" /> My Polls
//                 </a>
//                 <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
//                   <Users className="mr-3 h-4 w-4" /> Classes
//                 </a>
//                 <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
//                   <BarChart3 className="mr-3 h-4 w-4" /> Analytics
//                 </a>
//                 <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
//                   <Settings className="mr-3 h-4 w-4" /> Settings
//                 </a>
//                 <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
//                   <HelpCircle className="mr-3 h-4 w-4" /> Help
//                 </a>
//               </nav>
//             </CardContent>
//           </Card>
//           */}

//           {/* Enhanced Main Content */}
//           <Card className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 dark:bg-gray-900/90 dark:border-gray-700/80 dark:shadow-gray-900/20">
//             <CardHeader className="pb-3">
//               <div className="flex items-center space-x-3">
//                 <div className="relative group">
//                   <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 dark:from-purple-400 dark:to-blue-400"></div>
//                   <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center dark:from-purple-400 dark:to-blue-400">
//                     <Users className="text-white h-5 w-5" />
//                   </div>
//                 </div>
//                 <div>
//                   <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
//                     Join Poll Room
//                   </CardTitle>
//                   <p className="text-gray-600 dark:text-gray-400 mt-1">Enter your details to join an active poll session</p>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     Room Code <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     id="roomCode"
//                     type="text"
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
//                     placeholder="Enter room code"
//                     value={roomCode}
//                     onChange={(e) => {
//                       setRoomCode(e.target.value);
//                       setRoomError(null);
//                     }}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     Your Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     id="name"
//                     type="text"
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
//                     placeholder="Enter your name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     Description (Optional)
//                   </label>
//                   <textarea
//                     id="description"
//                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm resize-none"
//                     placeholder="Brief description (optional)"
//                     rows={3}
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                   />
//                 </div>
                
//                 {roomError && (
//                   <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 backdrop-blur-sm">
//                     <p className="text-red-700 dark:text-red-400 text-sm font-medium">{roomError}</p>
//                   </div>
//                 )}

//                 <Button
//                   onClick={joinRoom}
//                   className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
//                 >
//                   <Check className="mr-2 h-4 w-4" /> Join Poll Room
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default function JoinPollRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roomError, setRoomError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const joinRoom = async () => {
    setRoomError(null);
    if (!name.trim()) {
      setRoomError("Name is required.");
      return;
    }
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

      <div className="relative container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Enhanced Sidebar
          <Card className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 h-fit dark:bg-gray-900/90 dark:border-gray-700/80 dark:shadow-gray-900/20">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 dark:from-purple-400 dark:to-indigo-500"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center dark:from-purple-400 dark:to-indigo-500">
                    <Gauge className="text-white h-5 w-5" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">Dashboard</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your learning hub</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                <a href="#" className="flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-semibold shadow-md shadow-purple-200/50 dark:from-purple-900/40 dark:to-indigo-900/40 dark:text-purple-300 dark:shadow-purple-900/20 transition-all duration-300">
                  <Gauge className="mr-3 h-4 w-4" /> Dashboard
                </a>
                <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
                  <Vote className="mr-3 h-4 w-4" /> My Polls
                </a>
                <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
                  <Users className="mr-3 h-4 w-4" /> Classes
                </a>
                <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
                  <BarChart3 className="mr-3 h-4 w-4" /> Analytics
                </a>
                <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
                  <Settings className="mr-3 h-4 w-4" /> Settings
                </a>
                <a href="#" className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 dark:text-gray-300 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white dark:hover:shadow-gray-900/20 transition-all duration-300">
                  <HelpCircle className="mr-3 h-4 w-4" /> Help
                </a>
              </nav>
            </CardContent>
          </Card>
          */}

          {/* Enhanced Main Content */}
          <Card className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 dark:bg-gray-900/90 dark:border-gray-700/80 dark:shadow-gray-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 dark:from-blue-400 dark:to-blue-500"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center dark:from-blue-400 dark:to-blue-500">
                    <Users className="text-white h-5 w-5" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Join Poll Room
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Enter your details to join an active poll session</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Room Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="roomCode"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
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
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm resize-none"
                    placeholder="Brief description (optional)"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                {roomError && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">{roomError}</p>
                  </div>
                )}

                <Button
                  onClick={joinRoom}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
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