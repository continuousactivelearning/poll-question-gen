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
    <Card className="max-w-xl mx-auto mt-10 p-6">
      <CardHeader>
        <CardTitle className="text-lg">Room Code: <span className="font-mono">{roomCode}</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <fieldset className="space-y-2">
          <legend className="text-sm text-gray-600 mb-1">Select correct option</legend>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                type="radio"
                name="correctOption"
                checked={correctOptionIndex === i}
                onChange={() => setCorrectOptionIndex(i)}
                className="accent-purple-600"
              />
              <Input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const copy = [...options];
                  copy[i] = e.target.value;
                  setOptions(copy);
                }}
              />
            </div>
          ))}
        </fieldset>

        <Input
          type="number"
          placeholder="Timer (seconds)"
          value={timer}
          min={5}
          onChange={(e) => setTimer(Number(e.target.value))}
        />

        <Button className="w-full" onClick={createPoll}>
          Create Poll
        </Button>

        <Button variant="secondary" className="w-full" onClick={fetchResults}>
          Fetch Poll Results
        </Button>

        {Object.keys(pollResults).length > 0 && (
          <div className="space-y-4">
            {Object.entries(pollResults).map(([pollQuestion, options]) => (
              <div key={pollQuestion} className="p-3 border rounded-md">
                <div className="font-medium">{pollQuestion}</div>
                <ul className="ml-4 list-disc">
                  {Object.entries(options).map(([opt, data]) => (
                    <li key={opt}>
                      <span className="font-semibold">{opt}</span>: {data.count} votes
                      {data.users.length > 0 && (
                        <span className="text-xs ml-2 text-gray-500">({data.users.join(", ")})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
