import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { useState } from "react";
import { BookOpen, TrendingUp, Calendar, Trophy, Clock, Activity, CheckCircle } from "lucide-react";

export default function StudentDashboard() {
  const [isDark] = useState(false);

  // Dummy data
  const pollStats = { total: 20, taken: 15, absent: 5 };
  const pollResults = [
    { name: "Math Poll", subject: "Algebra", score: 15, date: "12 Aug 2024" },
    { name: "Science Poll", subject: "Physics", score: 12, date: "15 Sep 2024" },
  ];

  const tasks = [
    { name: "Discussion Algorithm", time: "08:00 - 12:00 PM", color: "red" },
    { name: "Fundamental Math", time: "12:00 - 15:00 PM", color: "yellow" },
    { name: "DNA Modifications in Humans", time: "Ongoing", color: "blue" },
  ];

  const projectColors = isDark ? ["#3b82f6", "#f59e0b"] : ["#6366f1", "#f59e42"];

  // Poll details data
  const pollDetails = [
    { title: "DNA Modifications in Humans", type: "Word Cloud", timer: "01:30" },
    { title: "Discussion Algorithm", type: "MCQ", timer: "00:45" },
    { title: "Fundamental Math", type: "MCQ", timer: "00:30" },
  ];

  const themeClasses = isDark ? 'dark' : '';

  return (
    <div className={`${themeClasses} transition-colors duration-300`}>
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        {/* Top Row: Welcome Banner and Poll Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Banner */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 dark:from-blue-600 dark:via-purple-600 dark:to-cyan-500 text-white relative overflow-hidden shadow-lg dark:shadow-2xl border-0">
            <CardContent className="flex flex-row items-center justify-between p-8 h-64">
              {/* Left: Text (50%) */}
              <div className="w-1/2 flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-2 drop-shadow-sm">Welcome Back! <span className="capitalize">Diane</span></h2>
                <p className="mb-4 text-lg font-semibold opacity-90 drop-shadow-sm">
                  Your Study, Your Say—Live!
                </p>
                <Button
                  className="bg-white/95 hover:bg-white text-blue-600 font-bold shadow-md w-fit transition-all duration-200 hover:scale-105"
                >
                  Join Poll Room
                </Button>
              </div>
              {/* Right: Image placeholder */}
              <div className="w-1/2 flex items-center justify-center">
                <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                  {/* Add your image here */}
                  <img
                    src="/student-illustration.png"
                    alt="Welcome"
                    className="w-40 h-40 object-cover rounded-full shadow-lg"
                    style={{ objectFit: "cover" }}
                  />
                  {/* Optionally, keep the icon as a fallback */}
                  {/* <BarChart3 className="w-24 h-24 text-white/80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" /> */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Poll Stats Summary */}
          <Card className="flex flex-col justify-between p-6 shadow-lg dark:shadow-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Total Polls</span>
                </div>
                <span className="text-blue-500 dark:text-blue-400 font-bold text-lg">{pollStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Polls Taken</span>
                </div>
                <span className="text-green-500 dark:text-green-400 font-bold text-lg">{pollStats.taken}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-500 dark:text-red-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Polls Absent</span>
                </div>
                <span className="text-red-500 dark:text-red-400 font-bold text-lg">{pollStats.absent}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Row: Poll Results, Poll Details, Active Polls, Upcoming Polls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* My Poll Results */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                My Poll Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pollResults.map((poll, idx) => (
                <div key={poll.name} className="flex items-center gap-4 p-3 rounded-lg bg-blue-50 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors">
                  <ResponsiveContainer width={48} height={48}>
                    <PieChart>
                      <Pie
                        data={[{ value: poll.score }, { value: 20 - poll.score }]}
                        dataKey="value"
                        innerRadius={16}
                        outerRadius={24}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill={projectColors[idx % projectColors.length]} />
                        <Cell fill={isDark ? "#374151" : "#e5e7eb"} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div>
                    <div className="font-bold text-lg text-blue-800 dark:text-blue-300">{poll.score}</div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{poll.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{poll.subject}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">Date: {poll.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Poll Details */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Poll Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pollDetails.map((poll, idx) => (
                <div key={poll.title} className="p-3 rounded-lg bg-purple-50 dark:bg-slate-700/50 border border-purple-100 dark:border-slate-600 hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="font-semibold text-lg text-purple-800 dark:text-purple-300">{poll.title}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-400 mt-1">
                    Type: <span className="font-semibold text-purple-600 dark:text-purple-400">{poll.type}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-400 mt-1">
                    Timer: <span className="font-semibold text-blue-600 dark:text-blue-400">{poll.timer}</span>
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
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-slate-700/50 border border-cyan-100 dark:border-slate-600">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <div>
                  <div className="font-semibold text-cyan-800 dark:text-cyan-300">DNA Modifications in Humans</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Ongoing</div>
                </div>
              </div>
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
              {tasks.map((task, idx) => (
                <div key={task.name} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-slate-700/50 border border-amber-100 dark:border-slate-600">
                  <span className={`w-2 h-2 rounded-full ${
                    task.color === "red" ? "bg-red-500" : 
                    task.color === "yellow" ? "bg-amber-500" : 
                    "bg-blue-500"
                  }`}></span>
                  <div>
                    <div className="font-semibold text-amber-800 dark:text-amber-300">{task.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{task.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Score Progression and Engagement Heatmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Progression */}
          <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[
                  { poll: 'Poll 1', score: 12 },
                  { poll: 'Poll 2', score: 15 },
                  { poll: 'Poll 3', score: 10 },
                  { poll: 'Poll 4', score: 18 },
                  { poll: 'Poll 5', score: 14 },
                  { poll: 'Poll 6', score: 17 },
                  { poll: 'Poll 7', score: 13 },
                ]}>
                  <XAxis 
                    dataKey="poll" 
                    tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }}
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
                    dataKey="score" 
                    fill={isDark ? "#3b82f6" : "#6366f1"} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Heatmap */}
          <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Engagement Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-full flex flex-col justify-center items-center">
                <table className="w-full h-full border-separate border-spacing-2 table-fixed">
                  <thead>
                    <tr>
                      <th className="py-2 px-1 text-xs font-semibold text-left text-gray-700 dark:text-gray-300">Time/Day</th>
                      <th className="py-2 px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Mon</th>
                      <th className="py-2 px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Tue</th>
                      <th className="py-2 px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Wed</th>
                      <th className="py-2 px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Thu</th>
                      <th className="py-2 px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Fri</th>
                      <th className="py-2 px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Sat</th>
                      <th className="py-2 px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Sun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((period, i) => (
                      <tr key={period} className="h-16">
                        <td className="py-1 px-1 text-xs font-semibold w-24 min-w-[4.5rem] text-gray-700 dark:text-gray-300">{period}</td>
                        {[0,1,2,3,4,5,6].map((d) => {
                          // Dummy engagement: more active on Wed/Fri Afternoon/Evening, Sat Evening, Sun Night
                          const active = (
                            (d === 2 && (i === 1 || i === 2)) ||
                            (d === 4 && (i === 1 || i === 2)) ||
                            (d === 5 && i === 2) ||
                            (d === 6 && i === 3)
                          );
                          return (
                            <td
                              key={d}
                              className={`transition-colors w-[3rem] h-12 md:w-[4rem] md:h-16 rounded ${
                                active 
                                  ? 'bg-blue-500 dark:bg-blue-400' 
                                  : 'bg-blue-100 dark:bg-slate-600'
                              }`}
                            />
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-100 dark:bg-slate-600"></div>
                    <span>Low Activity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500 dark:bg-blue-400"></div>
                    <span>High Activity</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm font-semibold text-green-800 dark:text-green-300">Average Score</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">14.1</div>
                <div className="text-xs text-green-600 dark:text-green-400">+2.3 from last week</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">Participation Rate</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">75%</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">15 out of 20 polls</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm font-semibold text-purple-800 dark:text-purple-300">Best Subject</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">Physics</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Average: 16.2</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}