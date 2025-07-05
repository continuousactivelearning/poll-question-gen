import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/lib/hooks/use-auth";
import { User as UserIcon, AtSign, BadgeCheck, Bell, Settings, BarChart2, History, Activity, LogOut, Edit2, Save } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Side illustration image (place in public folder and reference here)
const illustrationUrl = "/student-raise-hand.png"; // Place your image in /public and use this path

const pollHistoryData = [
  { id: 1, title: "Math Quiz 1", date: "2024-05-01", score: 8, total: 10 },
  { id: 2, title: "Science Poll", date: "2024-05-03", score: 7, total: 10 },
  { id: 3, title: "History Quiz", date: "2024-05-10", score: 9, total: 10 },
];

const activeRooms = [
  { id: 1, title: "Weekly Science Room", status: "Ongoing" },
  { id: 2, title: "Math Challenge Room", status: "Ongoing" },
];

const upcomingPolls = [
  { id: 1, title: "English Quiz", date: "2024-06-01" },
  { id: 2, title: "Physics Poll", date: "2024-06-05" },
];

const notifications = [
  { id: 1, message: "New poll available: English Quiz", time: "2h ago" },
  { id: 2, message: "Your streak is now 6 days!", time: "1d ago" },
];

const analyticsData = [
  { month: "Jan", polls: 3 },
  { month: "Feb", polls: 5 },
  { month: "Mar", polls: 2 },
  { month: "Apr", polls: 4 },
];

// The StudentProfile component displays the current user's main info in a minimal, clean card.
export default function StudentProfile() {
  // 1. Get the current user from the auth store using the custom useAuth hook
  const { user } = useAuth();
  const [openNotif, setOpenNotif] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  // Debug message to confirm rendering
  // Remove or comment out after confirming
  const debug = true;

  // 2. If user is not logged in, show a fallback (shouldn't happen if route is protected)
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

  // 3. Render the profile card with avatar, name, email, and role
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
      {/* Header Section */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-200/80 dark:border-gray-700/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-primary tracking-tight">EduPoll</span>
          <Badge variant="secondary" className="ml-2">Student</Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{user.name || "Unnamed User"}</span>
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
              <AvatarFallback className="rounded-full bg-blue-100 dark:bg-blue-900">
                <UserIcon className="h-14 w-14 text-blue-500 dark:text-blue-300" />
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
                    title="Edit your name"
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={savingName}>
                    {savingName ? <Save className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                  </Button>
                </>
              ) : (
                <>
                  <span>{nameValue || "Unnamed User"}</span>
                  <Button size="icon" variant="ghost" onClick={() => setEditName(true)}>
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mt-1">
              <AtSign className="h-5 w-5 text-blue-400" />
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
              <Badge variant="outline" className="text-sm">Polls Joined: {pollHistoryData.length}</Badge>
              <Badge variant="outline" className="text-sm">Active Streak: 6d</Badge>
              <Badge variant="outline" className="text-sm">Rank: Top 10%</Badge>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dashboard Sections */}
      <section className="px-4 pb-10 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="flex gap-2 mb-4 flex-wrap">
            <TabsTrigger value="history" className="flex items-center gap-1"><History className="h-4 w-4" /> Poll History</TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-1"><Activity className="h-4 w-4" /> Active Rooms</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-1"><BarChart2 className="h-4 w-4" /> Upcoming Polls</TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1"><BarChart2 className="h-4 w-4" /> Performance</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1"><BarChart2 className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            {/* Poll Participation History Table */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Poll Participation History</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-2">Title</th>
                      <th>Date</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pollHistoryData.map((poll) => (
                      <tr key={poll.id} className="hover:bg-muted/40 transition">
                        <td className="py-2 font-medium">{poll.title}</td>
                        <td>{poll.date}</td>
                        <td>{poll.score} / {poll.total}</td>
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
                      <span className="font-medium text-foreground">{room.title}</span>
                      <Badge variant="secondary">{room.status}</Badge>
                      <Button size="sm" variant="default">Join</Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upcoming">
            {/* Upcoming Polls */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Upcoming Polls</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {upcomingPolls.map((poll) => (
                    <li key={poll.id} className="flex items-center justify-between bg-muted/60 rounded-lg px-3 py-2">
                      <span className="font-medium text-foreground">{poll.title}</span>
                      <span className="text-xs text-muted-foreground">{poll.date}</span>
                      <Button size="sm" variant="outline">View</Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance">
            {/* Performance Metrics */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-sm">Poll Success Rate</span>
                    <Progress value={80} className="mt-1" />
                  </div>
                  <div>
                    <span className="text-sm">Participation Consistency</span>
                    <Progress value={60} className="mt-1" />
                  </div>
                  <div>
                    <span className="text-sm">Average Score</span>
                    <Progress value={90} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            {/* Engagement Analytics */}
            <Card className="mb-4">
              <CardHeader><CardTitle>Engagement Analytics</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56 flex items-center justify-center">
                  <ChartContainer config={{ polls: { color: '#6366f1', label: 'Polls' } }}>
                    <BarChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="polls" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Debug message */}
      {debug && (
        <div className="fixed top-2 left-2 z-50 bg-yellow-200 text-yellow-900 px-3 py-1 rounded shadow">StudentProfile rendered</div>
      )}
    </div>
  );
}