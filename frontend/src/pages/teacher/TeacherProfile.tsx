import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { useAuthStore } from "@/lib/store/auth-store";
import { User, AtSign, BadgeCheck, BarChart2, History, Activity, Edit2, Save, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import axios from "axios";
import type { IUser } from "@/lib/store/auth-store";

// Type definitions
interface RoomHistory {
  id: number;
  name: string;
  code: string;
  created: string;
  polls: number;
}

interface ActiveRoom {
  id: number;
  name: string;
  code: string;
  status: string;
  students: number;
}

interface AnalyticsData {
  month: string;
  polls: number;
}


const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export const apiService = {
  async getUserProfile(firebaseUID: string): Promise<IUser> {
    const res = await api.get(`/users/firebase/${firebaseUID}/profile`);
    const data = res.data;
    return {
      uid: firebaseUID,
      userId: data.id ?? "",
      email: data.email ?? "",
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      role: data.role ?? null,
      avatar: data.avatar ?? null,
    };
  },  
  
  async updateUserProfile(userId: string, profileData: any) {
    const res = await api.put(`/users/${userId}/profile`, profileData);
    return res.data;
  },
  async getRoomHistory(userId: string) {
    return [
      { id: 1, name: "Algebra Room", code: "ALG123", created: "2024-05-01", polls: 5 },
    ];
  },
  async getActiveRooms(userId: string) {
    return [
      { id: 1, name: "Algebra Room", code: "ALG123", status: "Active", students: 18 },
    ];
  },
  async getAnalytics(userId: string) {
    return [
      { month: "Jan", polls: 6 },
      { month: "Feb", polls: 8 },
    ];
  }
};


export default function TeacherProfile() {
  const { user: authUser } = useAuthStore();   // <-- get auth user here
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Other state
  const [user, setUser] = useState<IUser | null>(null);
  const [roomHistory, setRoomHistory] = useState<RoomHistory[]>([]);
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  
  const [editName, setEditName] = useState(false);
  const [firstNameValue, setFirstNameValue] = useState("");
  const [lastNameValue, setLastNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Load user profile data
  useEffect(() => {
    const loadData = async () => {
      if (!authUser?.uid) {
        setError("No authentication info");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const profile = await apiService.getUserProfile(authUser.uid);
        setUser(profile);
        setFirstNameValue(profile.firstName || "");
        setLastNameValue(profile.lastName || "");

        // Fetch other data
        const [rooms, active, analytics] = await Promise.all([
          apiService.getRoomHistory(profile.userId as string),
          apiService.getActiveRooms(profile.userId as string),
          apiService.getAnalytics(profile.userId as string)
        ]);
        setRoomHistory(rooms);
        setActiveRooms(active);
        setAnalyticsData(analytics);
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
    console.log("Loaded user profile:", user);
  }, [authUser?.uid]);

  const handleSaveName = async () => {
    if (!user?.userId) return;
    setSavingName(true);
    try {
      const updated = await apiService.updateUserProfile(user.userId, {
        firstName: firstNameValue.trim(),
        lastName: lastNameValue.trim(),
      });
      setUser(updated);
      setEditName(false);
    } catch {
      setError("Failed to save name");
    } finally {
      setSavingName(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg">{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">No user data found</span>
      </div>
    );
  }

  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Unnamed Teacher";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
      {/* Main Content Grid - Centered and Enlarged Profile Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
        <Card className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-slate-200/80 dark:border-gray-700/80 mb-8 student-card-hover animate-fade-in p-8 flex flex-col items-center">
          <CardHeader className="flex flex-col items-center gap-2 pb-2 w-full">
            <Avatar className="h-28 w-28 mb-2 ring-4 ring-primary/30">
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className="rounded-full bg-purple-100 dark:bg-purple-900">
                <User className="h-14 w-14 text-purple-500 dark:text-purple-300" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {editName ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    <input
                      className="text-lg font-bold bg-transparent border-b border-primary focus:outline-none px-2 py-1 w-32 text-center"
                      value={firstNameValue}
                      onChange={e => setFirstNameValue(e.target.value)}
                      disabled={savingName}
                      placeholder="First name"
                      title="First name"
                    />
                    <input
                      className="text-lg font-bold bg-transparent border-b border-primary focus:outline-none px-2 py-1 w-32 text-center"
                      value={lastNameValue}
                      onChange={e => setLastNameValue(e.target.value)}
                      disabled={savingName}
                      placeholder="Last name"
                      title="Last name"
                    />
                  </div>
                  <Button size="sm" onClick={handleSaveName} disabled={savingName}>
                    {savingName ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <span>{displayName}</span>
                  <Button size="icon" variant="ghost" onClick={() => setEditName(true)}>
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mt-1">
              <AtSign className="h-5 w-5 text-purple-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <BadgeCheck className="h-5 w-5 text-green-400" />
              <span className="capitalize">{user.role}</span>
            </div>
            {user.uid && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>ID:</span>
                <span className="font-mono">{user.uid}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center w-full">
            {/* Key statistics */}
            <div className="flex gap-4 mt-2">
              <Badge variant="outline" className="text-sm">Rooms Created: {roomHistory.length}</Badge>
              <Badge variant="outline" className="text-sm">Active Rooms: {activeRooms.length}</Badge>
              <Badge variant="outline" className="text-sm">Polls Managed: {roomHistory.reduce((acc, r) => acc + r.polls, 0)}</Badge>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dashboard Sections */}
      <section className="px-4 pb-10 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="flex gap-2 mb-4 flex-wrap">
            <TabsTrigger value="history" className="flex items-center gap-1"><History className="h-4 w-4" /> Room History</TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-1"><Activity className="h-4 w-4" /> Active Rooms</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1"><BarChart2 className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            {/* Room History Table */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Room History</CardTitle></CardHeader>
              <CardContent>
                {roomHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No room history found</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b">
                        <th className="py-2">Room Name</th>
                        <th>Code</th>
                        <th>Created</th>
                        <th>Polls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomHistory.map((room) => (
                        <tr key={room.id} className="hover:bg-muted/40 transition">
                          <td className="py-2 font-medium">{room.name}</td>
                          <td>{room.code}</td>
                          <td>{room.created}</td>
                          <td>{room.polls}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="active">
            {/* Active Rooms */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Active Rooms</CardTitle></CardHeader>
              <CardContent>
                {activeRooms.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No active rooms</p>
                ) : (
                  <ul className="space-y-2">
                    {activeRooms.map((room) => (
                      <li key={room.id} className="flex items-center justify-between bg-muted/60 rounded-lg px-3 py-2">
                        <span className="font-medium text-foreground">{room.name}</span>
                        <span className="text-xs text-muted-foreground">Code: {room.code}</span>
                        <Badge variant="secondary">{room.status}</Badge>
                        <span className="text-xs text-muted-foreground">Students: {room.students}</span>
                        <Button size="sm" variant="default">Manage</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            {/* Analytics */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Engagement Analytics</CardTitle></CardHeader>
              <CardContent>
                {analyticsData.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No analytics data available</p>
                ) : (
                  <div className="h-56 flex items-center justify-center">
                    <ChartContainer config={{ polls: { color: '#a07cfe', label: 'Polls' } }}>
                      <BarChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="polls" fill="#a07cfe" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}