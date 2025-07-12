import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { ClipboardList, Users, TrendingUp, Clock, Calendar, HelpCircle, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TeacherDashboard() {
  const [isDark] = useState(false);

  // Dashboard statistics
  const stats = {
    totalAssessments: 12,
    totalResponses: 340,
    participationRate: 80,
    liveParticipation: {
      attended: 34,
      notAttended: 6,
      rate: 85
    }
  };

  // Recent assessment data
  const recentAssessments = [
    { name: "Algebra Midterm", created: "2024-06-01", participants: 28, absent: 2 },
    { name: "Chemistry Quiz", created: "2024-05-30", participants: 25, absent: 5 },
  ];

  const assessmentResults = [
    { option: "A", responses: 20 },
    { option: "B", responses: 10 },
    { option: "C", responses: 5 },
    { option: "D", responses: 8 },
    { option: "E", responses: 12 },
  ];

  const activeAssessments = [
    { title: "Algebra Midterm", status: "Ongoing" },
  ];

  const upcomingAssessments = [
    { name: "English Literature", time: "Tomorrow 10:00 AM" },
    { name: "History Exam", time: "Friday 2:00 PM" },
  ];

  const faqs = [
    { 
      question: "How do I create an assessment?", 
      answer: "Navigate to 'Create Assessment' and follow the step-by-step process." 
    },
    { 
      question: "Can I reuse previous assessments?", 
      answer: "Yes, all your assessments are saved in your library for future use." 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">Educator Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your teaching analytics and assessments
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.location.href = '/teacher/pollroom'}
        >
          Create New Assessment
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card */}
        <Card className="md:col-span-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-8">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Welcome Back, Educator</h2>
              <p className="mb-4 opacity-90">
                Track, analyze, and enhance student learning outcomes
              </p>
              <Button 
                variant="secondary" 
                className="bg-white text-blue-800 hover:bg-white/90"
              >
                Quick Start Guide
              </Button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center">
                <ClipboardList className="w-20 h-20 text-white/80" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Assessments</span>
              </div>
              <span className="font-bold text-lg text-blue-600">{stats.totalAssessments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Responses</span>
              </div>
              <span className="font-bold text-lg text-blue-600">{stats.totalResponses}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Participation Rate</span>
              </div>
              <span className="font-bold text-lg text-blue-600">{stats.participationRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Recent Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <ClipboardList className="h-5 w-5" />
              Recent Assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAssessments.map((assessment, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-blue-50 dark:bg-slate-700 border border-blue-100 dark:border-slate-600">
                <div className="font-semibold">{assessment.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(assessment.created).toLocaleDateString()}
                </div>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-600 dark:text-green-400">
                    {assessment.participants} participants
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {assessment.absent} absent
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Active Assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAssessments.map((assessment, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-slate-700 border border-green-100 dark:border-slate-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <div>
                  <div className="font-semibold">{assessment.title}</div>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 mt-1">
                    {assessment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Calendar className="h-5 w-5" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAssessments.map((assessment, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-slate-700 border border-blue-100 dark:border-slate-600">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <div>
                  <div className="font-semibold">{assessment.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{assessment.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Clock className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              View Student Progress
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Schedule Assessment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Generate Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Participation Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Participation Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Participated", value: stats.liveParticipation.attended },
                      { name: "Absent", value: stats.liveParticipation.notAttended },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Participated</div>
                  <div className="text-xl font-bold text-blue-600">
                    {stats.liveParticipation.attended}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Absent</div>
                  <div className="text-xl font-bold text-red-500">
                    {stats.liveParticipation.notAttended}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Rate</div>
                  <div className="text-xl font-bold text-green-600">
                    {stats.liveParticipation.rate}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Recent Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assessmentResults}>
                <XAxis 
                  dataKey="option" 
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis 
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <Tooltip />
                <Bar 
                  dataKey="responses" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Support Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                Your assessments show a {stats.participationRate}% average participation rate. 
                The most recent assessment had {stats.liveParticipation.rate}% participation. 
                Continue engaging students with interactive content to maintain these strong results.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <HelpCircle className="h-5 w-5" />
              Educator Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg border border-blue-100 dark:border-slate-600">
                <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {faq.question}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}