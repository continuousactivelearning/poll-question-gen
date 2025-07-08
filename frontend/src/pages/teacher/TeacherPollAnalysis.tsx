import { useRef, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock4, Users, Crown, Medal, Search } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const dummy = {
  id: "math-101",
  name: "Math Quiz Room",
  createdAt: "2024-06-15",
  duration: "15 mins",
  participants: [
    { name: "Alice", score: 95, correct: 20, wrong: 1, timeTaken: "7 min" },
    { name: "Bob", score: 90, correct: 19, wrong: 2, timeTaken: "8 min" },
    { name: "Charlie", score: 88, correct: 18, wrong: 3, timeTaken: "9 min" },
    { name: "Diana", score: 82, correct: 16, wrong: 4, timeTaken: "10 min" },
    { name: "Ethan", score: 78, correct: 15, wrong: 5, timeTaken: "11 min" },
    { name: "Fiona", score: 70, correct: 14, wrong: 6, timeTaken: "12 min" },
    { name: "George", score: 65, correct: 13, wrong: 7, timeTaken: "10 min" },
    { name: "Hannah", score: 92, correct: 19, wrong: 1, timeTaken: "6 min" },
    { name: "Ian", score: 86, correct: 17, wrong: 3, timeTaken: "9 min" },
    { name: "Jenny", score: 74, correct: 14, wrong: 5, timeTaken: "11 min" },
    { name: "Kevin", score: 81, correct: 16, wrong: 4, timeTaken: "8 min" },
    { name: "Luna", score: 89, correct: 18, wrong: 2, timeTaken: "7 min" },
    { name: "Mike", score: 77, correct: 15, wrong: 5, timeTaken: "10 min" },
    { name: "Nina", score: 68, correct: 13, wrong: 6, timeTaken: "12 min" },
    { name: "Oscar", score: 73, correct: 14, wrong: 5, timeTaken: "11 min" },
    { name: "Paula", score: 84, correct: 17, wrong: 3, timeTaken: "9 min" },
    { name: "Quincy", score: 79, correct: 16, wrong: 4, timeTaken: "10 min" },
    { name: "Rita", score: 87, correct: 18, wrong: 2, timeTaken: "8 min" },
    { name: "Steve", score: 69, correct: 13, wrong: 7, timeTaken: "12 min" },
    { name: "Tina", score: 91, correct: 19, wrong: 2, timeTaken: "7 min" },
  ],
  questions: [
    { text: "Q1", correctCount: 18 },
    { text: "Q2", correctCount: 12 },
    { text: "Q3", correctCount: 15 },
    { text: "Q4", correctCount: 9 },
    { text: "Q5", correctCount: 20 },
  ],
};

const scoreRanges = [
  { label: "90–100", min: 90, max: 100, color: "#10b981" },
  { label: "80–89", min: 80, max: 89, color: "#6366f1" },
  { label: "70–79", min: 70, max: 79, color: "#f59e0b" },
  { label: "60–69", min: 60, max: 69, color: "#ef4444" },
];

export default function TeacherPollAnalysis() {
  const ref = useRef<HTMLDivElement>(null);
  const { roomId } = useParams({ from: "/teacher/manage-rooms/pollanalysis/$roomId" });

  const participants = dummy.participants.sort((a, b) => b.score - a.score);
  const top3 = participants.slice(0, 3);
  const others = participants.slice(3);
  const [search, setSearch] = useState("");

  const filteredParticipants = [...top3, ...others].filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCorrect = participants.reduce((s, p) => s + p.correct, 0);
  const totalWrong = participants.reduce((s, p) => s + p.wrong, 0);
  const pieData = [
    { name: "Correct", value: totalCorrect, color: "#34d399" },
    { name: "Wrong", value: totalWrong, color: "#f87171" },
  ];

  const scoreRangeData = scoreRanges.map((range) => ({
    name: range.label,
    count: participants.filter((p) => p.score >= range.min && p.score <= range.max).length,
    color: range.color,
  }));

  const downloadExcel = () => {
    const data = participants.map((p, index) => ({
      Rank: index + 1,
      Name: p.name,
      Score: p.score,
      Correct: p.correct,
      Wrong: p.wrong,
      "Time Taken": p.timeTaken,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analysis");
    const blob = new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]);
    saveAs(blob, "poll-analysis.xlsx");
  };

  return (
    <div
      className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      ref={ref}
    >
      {/* Room Details */}
      <Card className="shadow-lg border border-purple-300 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-600 dark:text-purple-300">Room: {dummy.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-8 flex-wrap text-gray-800 dark:text-gray-200">
          <div className="flex gap-2 items-center"><Calendar /> {dummy.createdAt}</div>
          <div className="flex gap-2 items-center"><Clock4 /> Duration: {dummy.duration}</div>
          <div className="flex gap-2 items-center"><Users /> Total Participants: {participants.length}</div>
        </CardContent>
      </Card>

       {/* Top Performers */}
<div className="grid md:grid-cols-3 gap-4">
  {top3.map((p, i) => {
    const Icon = i === 0 ? Crown : Medal;
    const badge = ["🥇", "🥈", "🥉"][i];
    const bgLight = ["bg-yellow-100", "bg-yellow-200", "bg-yellow-50"];
    const bgDark = ["dark:bg-yellow-900", "dark:bg-yellow-800", "dark:bg-yellow-700"];
    return (
      <Card
        key={p.name}
        className={`
          shadow-lg dark:shadow-yellow-800 border border-yellow-300 
          ${bgLight[i]} ${bgDark[i]} 
          text-gray-800 dark:text-yellow-100
        `}
      >
        <CardHeader className="flex gap-2 items-center">
          <Icon className="text-yellow-500" />
          <CardTitle className="text-yellow-700 dark:text-yellow-300">{badge} {p.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Score: {p.score}</p>
          <p>Correct/Wrong: {p.correct}/{p.wrong}</p>
          <p>Time: {p.timeTaken}</p>
        </CardContent>
      </Card>
    );
  })}
</div>


      {/* Participant List */}
      <Card className="shadow border border-indigo-300 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-700 dark:text-indigo-300">Participant Performance</CardTitle>
          <div className="mt-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white dark:bg-slate-700 dark:text-white"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto divide-y rounded scrollbar-thin scrollbar-thumb-purple-500">
          <div className="grid grid-cols-5 p-2 font-semibold text-purple-700 dark:text-purple-300 text-sm border-b">
            <span>Name</span>
            <span>Score</span>
            <span>Correct</span>
            <span>Wrong</span>
            <span>Time Taken</span>
          </div>
          {filteredParticipants.map((p, i) => (
            <div
              key={i}
              className={`grid grid-cols-5 items-center p-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition ${
                i === 0 ? "bg-yellow-50 dark:bg-yellow-900" : i === 1 ? "bg-slate-100 dark:bg-slate-800" : i === 2 ? "bg-orange-50 dark:bg-orange-900" : ""
              }`}
            >
              <span>{["🥇", "🥈", "🥉"][i] || ""} {p.name}</span>
              <span>{p.score}</span>
              <span>{p.correct}</span>
              <span>{p.wrong}</span>
              <span>{p.timeTaken}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="shadow border border-purple-300 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-green-600 dark:text-green-400">Overall Answer Accuracy</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChart width={300} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card className="shadow border border-green-300 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-emerald-700 dark:text-emerald-400">Score Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {scoreRangeData.map((r, i) => (
            <div key={i} className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
              <span>{r.name}</span>
              <div className="h-3 w-1/2 bg-gray-200 rounded">
                <div
                  className="h-3 rounded"
                  style={{ width: `${(r.count / participants.length) * 100}%`, backgroundColor: r.color }}
                />
              </div>
              <span>{r.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Question-Level Analysis */}
      <Card className="shadow border border-pink-300 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-pink-700 dark:text-pink-300">Question-Level Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dummy.questions.map((q, i) => (
            <div key={i} className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
              <span>{q.text}</span>
              <div className="h-2 w-1/2 bg-gray-200 rounded">
                <div
                  className="h-2 rounded bg-pink-500"
                  style={{ width: `${(q.correctCount / participants.length) * 100}%` }}
                />
              </div>
              <span>{q.correctCount} correct</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Download Button */}
      <div className="text-center mt-4">
        <button
          onClick={downloadExcel}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        >
          Download as Excel
        </button>
      </div>
    </div>
  );
}
