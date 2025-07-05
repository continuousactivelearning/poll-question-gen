import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { Sun, Moon, BarChart3, Users, TrendingUp, Clock, Calendar, HelpCircle } from "lucide-react";

export default function TeacherDashboard() {
  const [isDark, setIsDark] = useState(false);

  // Top stats (total)
  const overview = {
    totalPolls: 12,
    totalResponses: 340,
    totalParticipationRate: 80,
  };

  // Live stats for Participation & Results
  const liveParticipation = {
    attended: 34,
    notAttended: 6,
    participationRate: 85,
  };

  const recentPolls = [
    { name: "Math Quiz", created: "2024-06-01", attended: 28, notAttended: 2 },
    { name: "Science Poll", created: "2024-05-30", attended: 25, notAttended: 5 },
  ];

  const pollResults = [
    { option: "A", votes: 20 },
    { option: "B", votes: 10 },
    { option: "C", votes: 5 },
    { option: "D", votes: 8 },
    { option: "E", votes: 12 },
  ];

  const pollDetails = [
    { title: "Math Quiz", type: "MCQ", timer: "01:00" },
    { title: "Science Poll", type: "MCQ", timer: "00:45" },
  ];

  const activePolls = [
    { title: "Math Quiz", status: "Ongoing" },
  ];

  const upcomingPolls = [
    { name: "English Quiz", time: "Tomorrow 10:00 AM" },
    { name: "History Poll", time: "Friday 2:00 PM" },
  ];

  const faqs = [
    { q: "How do I create a poll?", a: "Click the 'Create Poll' button and fill in the details." },
    { q: "How to use AI to generate polls?", a: "Click 'AI Create Poll' and follow the prompts." },
  ];

  const themeClasses = isDark ? 'dark' : '';

  return (
    <div className={`${themeClasses} transition-colors duration-300`}>
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        {/* Top Row: Welcome Banner and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Banner */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 dark:from-purple-600 dark:via-blue-600 dark:to-cyan-500 text-white relative overflow-hidden shadow-lg dark:shadow-2xl border-0">
            <CardContent className="flex flex-row items-center justify-between p-8 h-64">
              {/* Left: Text (50%) */}
              <div className="w-1/2 flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-2 drop-shadow-sm">
                  Welcome Back! <span className="capitalize">Teacher</span>
                </h2>
                <p className="mb-4 text-lg font-semibold opacity-90 drop-shadow-sm">
                  Empower, Engage, Evaluate—Live!
                </p>
                <div className="flex gap-3">
                  <a href="/teacher/pollroom" className="no-underline">
                    <Button
                      className="bg-white/95 hover:bg-white text-purple-600 font-bold shadow-md w-fit transition-all duration-200 hover:scale-105"
                    >
                      + Create Poll Room
                    </Button>
                  </a>
                </div>
              </div>
              {/* Right: Image placeholder */}
              <div className="w-1/2 flex items-center justify-center">
                <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                  {/* Add your image here */}
                  <img
                    src="/teacher-illustration.png"
                    alt="Welcome Teacher"
                    className="w-40 h-40 object-cover rounded-full shadow-lg"
                    style={{ objectFit: "cover" }}
                  />
                  {/* Optionally, keep the icon as a fallback */}
                  {/* <BarChart3 className="w-24 h-24 text-white/80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" /> */}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats Summary */}
          <Card className="flex flex-col justify-between p-6 shadow-lg dark:shadow-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Total Polls</span>
                </div>
                <span className="text-purple-500 dark:text-purple-400 font-bold text-lg">{overview.totalPolls}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Total Responses</span>
                </div>
                <span className="text-blue-500 dark:text-blue-400 font-bold text-lg">{overview.totalResponses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Participation Rate</span>
                </div>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold text-lg">{overview.totalParticipationRate}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Row: My Polls, Poll Details, Active Polls, Upcoming Polls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* My Polls */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                My Polls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPolls.map((poll, idx) => (
                <div key={poll.name} className="p-3 rounded-lg bg-blue-50 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="font-semibold text-lg text-blue-800 dark:text-blue-300">{poll.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Created: {poll.created}</div>
                  <div className="flex gap-4 mt-2">
                    <div className="text-xs text-green-600 dark:text-green-400">✓ {poll.attended}</div>
                    <div className="text-xs text-red-500 dark:text-red-400">✗ {poll.notAttended}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Poll Details */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Poll Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pollDetails.map((poll, idx) => (
                <div key={poll.title} className="p-3 rounded-lg bg-purple-50 dark:bg-slate-700/50 border border-purple-100 dark:border-slate-600 hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="font-semibold text-lg text-purple-800 dark:text-purple-300">{poll.title}</div>
                  <div className="text-xs text-gray-700 dark:text-gray-400 mt-1">
                    Type: <span className="font-semibold text-purple-600 dark:text-purple-400">{poll.type}</span>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Timer: <span className="font-semibold">{poll.timer}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Polls */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                Active Polls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePolls.map((poll, idx) => (
                <div key={poll.title} className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-slate-700/50 border border-cyan-100 dark:border-slate-600">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                  <div>
                    <div className="font-semibold text-cyan-800 dark:text-cyan-300">{poll.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{poll.status}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Polls */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Polls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingPolls.map((poll, idx) => (
                <div key={poll.name} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-slate-700/50 border border-amber-100 dark:border-slate-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <div>
                    <div className="font-semibold text-amber-800 dark:text-amber-300">{poll.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{poll.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Participation Rate and Poll Results (Live) */}
        <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Participation & Results (Live)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 py-4">
              {/* Participation Rate (Live) */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="font-semibold mb-4 text-gray-700 dark:text-gray-300">Participation Rate (Live)</span>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Attended", value: liveParticipation.attended },
                        { name: "Not Attended", value: liveParticipation.notAttended },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      <Cell fill={isDark ? "#22c55e" : "#34d399"} />
                      <Cell fill={isDark ? "#ef4444" : "#f87171"} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Attended</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{liveParticipation.attended}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Not Attended</span>
                    <span className="text-lg font-bold text-red-500 dark:text-red-400">{liveParticipation.notAttended}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Rate</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{liveParticipation.participationRate}%</span>
                  </div>
                </div>
              </div>

              {/* Poll Results */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="font-semibold mb-4 text-gray-700 dark:text-gray-300">Poll Results</span>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pollResults} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <XAxis 
                      dataKey="option" 
                      tick={{ fontSize: 14, fill: isDark ? '#9ca3af' : '#6b7280' }} 
                      axisLine={{ stroke: isDark ? '#4b5563' : '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} 
                      axisLine={{ stroke: isDark ? '#4b5563' : '#d1d5db' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isDark ? '#f3f4f6' : '#1f2937'
                      }}
                    />
                    <Bar 
                      dataKey="votes" 
                      fill={isDark ? "#3b82f6" : "#6366f1"} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-700 dark:text-gray-300">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-gray-600 dark:text-gray-400">
                Your polls are performing well with an overall participation rate of {overview.totalParticipationRate}%. 
                Keep engaging your students with interactive content to maintain high participation levels.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="font-semibold text-purple-700 dark:text-purple-400 mb-2">{faq.q}</div>
                  <div className="text-gray-600 dark:text-gray-400">{faq.a}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}