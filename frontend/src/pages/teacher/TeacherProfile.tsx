import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/store/auth-store";
import { User as UserIcon, AtSign, BadgeCheck, Bell, Settings, BarChart2, History, Activity, LogOut, Edit2, Save } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const roomHistoryData = [
  { id: 1, name: "Algebra Room", code: "ALG123", created: "2024-05-01", polls: 5 },
  { id: 2, name: "Physics Room", code: "PHY456", created: "2024-05-10", polls: 3 },
  { id: 3, name: "English Room", code: "ENG789", created: "2024-05-15", polls: 4 },
];

const activeRooms = [
  { id: 1, name: "Algebra Room", code: "ALG123", status: "Active", students: 18 },
  { id: 2, name: "English Room", code: "ENG789", status: "Active", students: 12 },
];

const notifications = [
  { id: 1, message: "Room PHY456 closed.", time: "2h ago" },
  { id: 2, message: "18 students joined Algebra Room.", time: "1d ago" },
];

const analyticsData = [
  { month: "Jan", polls: 6 },
  { month: "Feb", polls: 8 },
  { month: "Mar", polls: 5 },
  { month: "Apr", polls: 7 },
];

export default function TeacherProfile() {
  const { user } = useAuthStore();
  const [openNotif, setOpenNotif] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">No user info found. Please log in.</span>
      </div>
    );
  }

  // Simulate save (replace with real API call)
  const handleSaveName = async () => {
    setSavingName(true);
    setTimeout(() => {
      setEditName(false);
      setSavingName(false);
      // TODO: Call API to update name
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
      {/* Header Section */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-primary tracking-tight">EduPoll</span>
          <Badge variant="secondary" className="ml-2">Teacher</Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{user.name || "Unnamed Teacher"}</span>
          {/* Notification Center */}
          <Sheet open={openNotif} onOpenChange={setOpenNotif}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 animate-pulse-gentle">{notifications.length}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <h2 className="text-lg font-bold mb-4">Notifications</h2>
              <ul className="space-y-3">
                {notifications.map(n => (
                  <li key={n.id} className="bg-muted/60 rounded-lg px-3 py-2 flex flex-col">
                    <span className="text-sm text-foreground">{n.message}</span>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
          {/* Settings Panel */}
          <Sheet open={openSettings} onOpenChange={setOpenSettings}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <h2 className="text-lg font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium mb-1">Account</span>
                  <Button variant="outline" className="w-full flex gap-2"><LogOut className="h-4 w-4" /> Logout</Button>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-1">Theme</span>
                  <Button variant="outline" className="w-full">Toggle Dark/Light</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content Grid - Centered and Enlarged Profile Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
        <Card className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-slate-200/80 dark:border-gray-700/80 mb-8 student-card-hover animate-fade-in p-8 flex flex-col items-center">
          <CardHeader className="flex flex-col items-center gap-2 pb-2 w-full">
            <Avatar className="h-28 w-28 mb-2 ring-4 ring-primary/30">
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
              <AvatarFallback className="rounded-full bg-purple-100 dark:bg-purple-900">
                <UserIcon className="h-14 w-14 text-purple-500 dark:text-purple-300" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {editName ? (
                <>
                  <input
                    className="text-2xl font-bold bg-transparent border-b border-primary focus:outline-none px-2 py-1 w-48 text-center"
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    disabled={savingName}
                    placeholder="Enter your name"
                    title="Teacher name"
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={savingName}>
                    {savingName ? <Save className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                  </Button>
                </>
              ) : (
                <>
                  <span>{nameValue || "Unnamed Teacher"}</span>
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
                <span>UID:</span>
                <span className="font-mono">{user.uid}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center w-full">
            {/* Key statistics */}
            <div className="flex gap-4 mt-2">
              <Badge variant="outline" className="text-sm">Rooms Created: {roomHistoryData.length}</Badge>
              <Badge variant="outline" className="text-sm">Active Rooms: {activeRooms.length}</Badge>
              <Badge variant="outline" className="text-sm">Polls Managed: {roomHistoryData.reduce((acc, r) => acc + r.polls, 0)}</Badge>
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
                    {roomHistoryData.map((room) => (
                      <tr key={room.id} className="hover:bg-muted/40 transition">
                        <td className="py-2 font-medium">{room.name}</td>
                        <td>{room.code}</td>
                        <td>{room.created}</td>
                        <td>{room.polls}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="active">
            {/* Active Rooms */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Active Rooms</CardTitle></CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            {/* Analytics */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Engagement Analytics</CardTitle></CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
} 