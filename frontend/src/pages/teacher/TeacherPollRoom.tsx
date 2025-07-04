import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

type PollResults = Record<string, Record<string, { count: number; users: string[] }>>;

export default function TeacherPollRoom() {
  const params = useParams({ from: '/teacher/pollroom/$code' });
  const roomCode = params.code;

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [pollResults, setPollResults] = useState<PollResults>({});

  if (!roomCode) return <div>Loading...</div>;

  const createPoll = async () => {
    try {
      await api.post(`/livequizzes/rooms/${roomCode}/polls`, {
        question,
        options: options.filter(opt => opt.trim()),
        creatorId: "teacher-123", // replace with real ID
        timer: Number(timer),
        correctOptionIndex
      });
      toast.success("Poll created!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectOptionIndex(0);
    } catch {
      toast.error("Failed to create poll");
    }
  };

  const fetchResults = async () => {
    try {
      const res = await api.get(`/livequizzes/rooms/${roomCode}/polls/results`);
      setPollResults(res.data);
    } catch {
      toast.error("Failed to fetch results");
    }
  };

  return (
    <main className="relative flex-1 p-6 lg:p-8">
      <div className="relative z-10 max-w-2xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80">
          <CardHeader>
            <CardTitle className="text-2xl">
              Room Code: <span className="font-mono bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
                {roomCode}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Input
                placeholder="Poll question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="dark:bg-gray-800/50"
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
                Select correct option
              </legend>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    type="radio"
                    name="correctOption"
                    checked={correctOptionIndex === i}
                    onChange={() => setCorrectOptionIndex(i)}
                    className="h-5 w-5 accent-purple-600 dark:accent-purple-400"
                  />
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[i] = e.target.value;
                      setOptions(copy);
                    }}
                    className="dark:bg-gray-800/50"
                  />
                </div>
              ))}
            </fieldset>

            <div>
              <Input
                type="number"
                placeholder="Timer (seconds)"
                value={timer}
                min={5}
                onChange={(e) => setTimer(Number(e.target.value))}
                className="dark:bg-gray-800/50"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={createPoll}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 flex-1"
              >
                Create Poll
              </Button>
              <Button 
                variant="outline"
                onClick={fetchResults}
                className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/30"
              >
                Fetch Results
              </Button>
            </div>

            {Object.keys(pollResults).length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Poll Results
                </h3>
                {Object.entries(pollResults).map(([pollQuestion, options]) => (
                  <Card 
                    key={pollQuestion} 
                    className="bg-white/80 dark:bg-gray-800/80 border border-slate-200/70 dark:border-gray-700/70"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-800 dark:text-gray-200">
                        {pollQuestion}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Object.entries(options).map(([opt, data]) => (
                          <li key={opt} className="flex items-baseline">
                            <span className="font-medium text-purple-600 dark:text-purple-400 mr-2">
                              {opt}:
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 mr-2">
                              {data.count} votes
                            </span>
                            {data.users.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({data.users.join(", ")})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}