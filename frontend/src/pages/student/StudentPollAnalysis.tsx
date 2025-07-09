import { useParams } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Timer, BarChart2, Award } from "lucide-react";

// Mock poll analysis data for three polls
const mockAnalyses: Record<string, any> = {
    "1": {
        title: "Math Quiz",
        date: "2024-06-01",
        timeTaken: "3m 42s",
        ranking: 5,
        totalParticipants: 32,
        questions: [
            { question: "What is 2 + 2?", studentAnswer: "4", correctAnswer: "4", isCorrect: true },
            { question: "What is the square root of 16?", studentAnswer: "5", correctAnswer: "4", isCorrect: false },
            { question: "What is 10 / 2?", studentAnswer: "5", correctAnswer: "5", isCorrect: true },
            { question: "What is 7 x 3?", studentAnswer: "21", correctAnswer: "21", isCorrect: true },
            { question: "What is 15 - 6?", studentAnswer: "8", correctAnswer: "9", isCorrect: false },
            { question: "What is 9 + 1?", studentAnswer: "10", correctAnswer: "10", isCorrect: true },
            { question: "What is 5^2?", studentAnswer: "25", correctAnswer: "25", isCorrect: true },
            { question: "What is 100 / 4?", studentAnswer: "25", correctAnswer: "25", isCorrect: true },
            { question: "What is 8 x 7?", studentAnswer: "54", correctAnswer: "56", isCorrect: false },
            { question: "What is 3 + 6?", studentAnswer: "9", correctAnswer: "9", isCorrect: true },
        ],
    },
    "2": {
        title: "Science Poll",
        date: "2024-06-05",
        timeTaken: "4m 10s",
        ranking: 3,
        totalParticipants: 28,
        questions: [
            { question: "What planet is known as the Red Planet?", studentAnswer: "Mars", correctAnswer: "Mars", isCorrect: true },
            { question: "What gas do plants absorb from the atmosphere?", studentAnswer: "Oxygen", correctAnswer: "Carbon Dioxide", isCorrect: false },
            { question: "What is H2O commonly known as?", studentAnswer: "Water", correctAnswer: "Water", isCorrect: true },
            { question: "What force keeps us on the ground?", studentAnswer: "Gravity", correctAnswer: "Gravity", isCorrect: true },
            { question: "What is the boiling point of water?", studentAnswer: "100°C", correctAnswer: "100°C", isCorrect: true },
            { question: "What is the chemical symbol for gold?", studentAnswer: "Au", correctAnswer: "Au", isCorrect: true },
            { question: "What organ pumps blood?", studentAnswer: "Heart", correctAnswer: "Heart", isCorrect: true },
            { question: "What is the largest planet?", studentAnswer: "Jupiter", correctAnswer: "Jupiter", isCorrect: true },
            { question: "What is the speed of light?", studentAnswer: "300,000 km/s", correctAnswer: "300,000 km/s", isCorrect: true },
            { question: "What is the main gas in air?", studentAnswer: "Oxygen", correctAnswer: "Nitrogen", isCorrect: false },
        ],
    },
    "3": {
        title: "History Quiz",
        date: "2024-06-10",
        timeTaken: "2m 55s",
        ranking: 8,
        totalParticipants: 30,
        questions: [
            { question: "Who was the first President of the United States?", studentAnswer: "George Washington", correctAnswer: "George Washington", isCorrect: true },
            { question: "In which year did World War II end?", studentAnswer: "1945", correctAnswer: "1945", isCorrect: true },
            { question: "Which ancient civilization built the pyramids?", studentAnswer: "Romans", correctAnswer: "Egyptians", isCorrect: false },
            { question: "Who wrote the Declaration of Independence?", studentAnswer: "Thomas Jefferson", correctAnswer: "Thomas Jefferson", isCorrect: true },
            { question: "What year did the Berlin Wall fall?", studentAnswer: "1989", correctAnswer: "1989", isCorrect: true },
            { question: "Who was known as the Maid of Orléans?", studentAnswer: "Joan of Arc", correctAnswer: "Joan of Arc", isCorrect: true },
            { question: "Who discovered America?", studentAnswer: "Columbus", correctAnswer: "Columbus", isCorrect: true },
            { question: "Who was the first man on the moon?", studentAnswer: "Neil Armstrong", correctAnswer: "Neil Armstrong", isCorrect: true },
            { question: "Who was the British PM during WWII?", studentAnswer: "Churchill", correctAnswer: "Churchill", isCorrect: true },
            { question: "Who was the last emperor of Rome?", studentAnswer: "Augustus", correctAnswer: "Romulus Augustulus", isCorrect: false },
        ],
    },
};

export default function PollAnalysisPage() {
    const { pollId } = useParams({ strict: false }) as { pollId?: string };
    // Get the correct analysis by pollId, fallback to Math Quiz
    const analysis = mockAnalyses[pollId ?? "1"] ?? mockAnalyses["1"];
    const totalCorrect = analysis.questions.filter((q: any) => q.isCorrect).length;
    const totalWrong = analysis.questions.length - totalCorrect;

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="h-6 w-6 text-purple-600" />
                        {analysis.title}
                    </CardTitle>
                    <div className="text-sm text-gray-500 mt-1">Attended on {analysis.date}</div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1"><Timer className="h-4 w-4" /> Time Taken: {analysis.timeTaken}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1"><Award className="h-4 w-4" /> Ranking: {analysis.ranking} / {analysis.totalParticipants}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Correct: {totalCorrect}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1"><XCircle className="h-4 w-4 text-red-500" /> Wrong: {totalWrong}</Badge>
                </CardContent>
            </Card>
            <Card>
                {/* Summary Bar */}
                <div className="flex items-center justify-center gap-6 mb-6">
                    {analysis.questions.map((q: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center">
                            <span className="text-xs font-semibold text-gray-500 mb-1">Q{idx + 1}</span>
                            {q.isCorrect ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                                <span className="inline-block h-6 w-6 rounded-full bg-red-500" />
                            )}
                        </div>
                    ))}
                </div>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Questions & Answers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {analysis.questions.map((q: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-lg border flex flex-col gap-1 bg-white dark:bg-slate-900">
                            <div className="font-medium text-gray-800 dark:text-gray-100">Q{idx + 1}: {q.question}</div>
                            <div className="text-sm">
                                <div>Your Answer: <span className={q.isCorrect ? "text-green-600" : "text-red-600"}>{q.studentAnswer}</span></div>
                                <div>Correct Answer: <span className="text-blue-600">{q.correctAnswer}</span></div>
                                <div className="mt-1">
                                    {q.isCorrect ? (
                                        <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Correct</Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="h-4 w-4" /> Wrong</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
} 