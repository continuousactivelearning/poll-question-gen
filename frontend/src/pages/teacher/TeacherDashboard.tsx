import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "@tanstack/react-router";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  // Dummy data for illustration
  const overview = {
    totalPolls: 12,
    totalResponses: 340,
    participationRate: 85,
    attended: 34,
    notAttended: 6,
  };

  const recentPolls = [
    { name: "Math Quiz", created: "2024-06-01", attended: 28, notAttended: 2 },
    { name: "Science Poll", created: "2024-05-30", attended: 25, notAttended: 5 },
  ];

  const pollResults = [
    { option: "A", votes: 20 },
    { option: "B", votes: 10 },
    { option: "C", votes: 5 },
  ];

  const faqs = [
    { q: "How do I create a poll?", a: "Click the 'Create Poll' button and fill in the details." },
    { q: "How to use AI to generate polls?", a: "Click 'AI Create Poll' and follow the prompts." },
  ];

  // Pie chart data for participation
  const pieData = [
    { name: "Attended", value: overview.attended },
    { name: "Not Attended", value: overview.notAttended },
  ];
  const COLORS = ["#34d399", "#f87171"];

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Teacher Dashboard
        </h2>
        <div className="flex gap-3">
          <Button
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            onClick={() => navigate({ to: "/teacher/pollroom" })}
          >
            + Create Room
          </Button>
        </div>
      </div>

      {/* First Row: Total Polls and Total Responses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-center h-32">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-left text-base">Total Polls</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4 pt-2">
            <span className="text-3xl font-bold text-purple-600">{overview.totalPolls}</span>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center h-32">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-left text-base">Total Responses</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4 pt-2">
            <span className="text-3xl font-bold text-blue-600">{overview.totalResponses}</span>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Recent Polls (left, big) and Participation/Poll Results (right, stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Polls & Activity */}
        <Card className="h-full min-h-[340px]">
          <CardHeader>
            <CardTitle>Recent Polls & Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poll Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Attended</TableHead>
                  <TableHead>Not Attended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPolls.map((poll, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{poll.name}</TableCell>
                    <TableCell>{poll.created}</TableCell>
                    <TableCell>{poll.attended}</TableCell>
                    <TableCell>{poll.notAttended}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right: Participation Rate and Poll Results (stacked) */}
        <div className="flex flex-col gap-6 h-full">
          {/* Participation Rate */}
          <Card className="flex-1 flex flex-col justify-center h-64">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-left text-base">Participation Rate</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-4 pt-2">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                {overview.participationRate}%
              </div>
            </CardContent>
          </Card>
          {/* Poll Results (Live) */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Poll Results (Live)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={pollResults}>
                  <XAxis dataKey="option" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Third Row: Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">[Summary content goes here]</div>
        </CardContent>
      </Card>

      {/* Fourth Row: FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {faqs.map((faq, idx) => (
              <li key={idx}>
                <div className="font-semibold text-purple-700">{faq.q}</div>
                <div className="text-gray-600">{faq.a}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}