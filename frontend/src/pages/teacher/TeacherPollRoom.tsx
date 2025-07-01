import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Create a pre-configured axios instance
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type PollResults = Record<string, Record<string, { count: number; users: string[] }>>;

export default function TeacherPollRoom() {
const params = useParams({ from: '/teacher/pollroom/$code' });
const roomCode = params.code;

  if (!roomCode) return <div>Loading...</div>;
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [pollResults, setPollResults] = useState<PollResults>({});
  const [timer, setTimer] = useState<number>(30); // default timer value

  const createPoll = async () => {
    try {
      await api.post(`/livequizzes/rooms/${roomCode}/polls`, {
        question,
        options: options.filter(o => o.trim()),
        creatorId: "teacher-123", // replace with real ID
        timer: Number(timer) // send timer to backend
      });
      toast.success("Poll created!");
      setQuestion("");
      setOptions(["", "", "", ""]);
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
        <CardTitle>Room Code: {roomCode}</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mb-3"
        />
        {options.map((opt, i) => (
          <Input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => {
              const copy = [...options];
              copy[i] = e.target.value;
              setOptions(copy);
            }}
            className="mb-2"
          />
        ))}
        <Input
          type="number"
          placeholder="Timer (seconds)"
          value={timer}
          min={5}
          onChange={(e) => setTimer(Number(e.target.value))}
          className="mb-3"
        />
        <Button className="w-full mt-2 mb-4" onClick={createPoll}>
          Create Poll
        </Button>

        <Button variant="secondary" className="w-full mb-4" onClick={fetchResults}>
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
