import { useState, useEffect } from "react";
import { ChevronDown, Check } from 'lucide-react';
import { useParams, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Wand2, Edit3, X, Loader2, LogOut, AlertTriangle, Users, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api/api";
import { useAuthStore } from '@/lib/store/auth-store';
import { useTranscriber } from "@/hooks/useTranscriber";
import { AudioManager } from "@/whisper/components/AudioManager";
import Transcript from "@/whisper/components/Transcript";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Room code copied to clipboard!");
  }).catch(() => {
    toast.error("Failed to copy room code");
  });
};

type User = {
  id: string;
  name: string;
};

type PollResults = Record<string, Record<string, { count: number; users: User[] }>>;

type GeneratedQuestion = {
  question: string;
  options: string[];
  correctOptionIndex: number;
};

export default function TeacherPollRoom() {
  const params = useParams({ from: '/teacher/pollroom/$code' });
  const navigate = useNavigate();
  const roomCode = params.code;
  const { user } = useAuthStore();
  // Existing state
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [pollResults, setPollResults] = useState<PollResults>({});

  // End room state
  const [isEndingRoom, setIsEndingRoom] = useState(false);
  const [showEndRoomConfirm, setShowEndRoomConfirm] = useState(false);

  // GenAI feature state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionSpec, setQuestionSpec] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek-r1:70b");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  // New state for member names toggle
  const [showMemberNames, setShowMemberNames] = useState<Record<string, boolean>>({});

  const [isGenerateClicked, setIsGenerateClicked] = useState(false);
  const [audioManagerKey, setAudioManagerKey] = useState(0);

  // Whisper transcription state and Whisper service for speech-to-text
  const transcriber = useTranscriber();
  const [transcript, setTranscript] = useState<string | null>(null);

  if (!roomCode) return <div>Loading...</div>;

  const toggleMemberNames = (pollQuestion: string) => {
    setShowMemberNames(prev => ({
      ...prev,
      [pollQuestion]: prev[pollQuestion] === undefined ? false : !prev[pollQuestion]
    }));
  };

  const endRoom = async () => {
    setIsEndingRoom(true);
    try {
      await api.post(`/livequizzes/rooms/${roomCode}/end`, {
        teacherId: user?.userId,
      });

      toast.success("Room ended successfully");
      navigate({ to: '/teacher/pollroom' });
    } catch (error: any) {
      console.error('Error ending room:', error);
      toast.error(error.response?.data?.message || "Failed to end room");
    } finally {
      setIsEndingRoom(false);
      setShowEndRoomConfirm(false);
    }
  };

  const createPoll = async () => {
    try {
      await api.post(`/livequizzes/rooms/${roomCode}/polls`, {
        question,
        options: options.filter(opt => opt.trim()),
        creatorId: user?.userId,
        timer: Number(timer),
        correctOptionIndex
      });
      toast.success("Poll created!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectOptionIndex(0);
      setShowPreview(false);
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

  useEffect(() => {
    setIsTranscribing(!!transcriber.output?.isBusy);
  }, [transcriber.output?.isBusy]);

  useEffect(() => {
    const text = transcriber.output?.text;
    const isComplete = !transcriber.output?.isBusy;
    if (text && isComplete) {
      setTranscript(text);
      console.log("Transcribed successfully", text);
      toast.success("Transcribed successfully");
    }
  }, [transcriber.output]);

  useEffect(() => {
    const text = transcriber.output?.text;
    const isComplete = !transcriber.output?.isBusy;

    if (isGenerateClicked && text && isComplete) {
      setTranscript(text);
      toast.success("Transcribed successfully");
      setIsGenerating(true);
      generateQuestions();
      setIsGenerateClicked(false);
    }
  }, [transcriber.output?.isBusy, transcriber.output?.text, isGenerateClicked]);

  interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (model: string) => void;
    className?: string;
  }

  const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const models = [
      { value: "gemma3", label: "Gemma 3" },
      { value: "gpt-4", label: "GPT-4" },
      { value: "claude-3", label: "Claude 3" },
      { value: "deepseek-r1:70b", label: "DeepSeek R1 (70B)" }
    ];

    const selectedModelLabel = models.find(model => model.value === selectedModel)?.label || "Select Model";

    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800/50 dark:border-gray-600 dark:text-white text-xs sm:text-base bg-white dark:bg-gray-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          aria-label="AI Model"
        >
          <span className="text-left truncate">{selectedModelLabel}</span>
          <ChevronDown
            size={16}
            className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {models.map((model) => (
                <button
                  key={model.value}
                  type="button"
                  onClick={() => {
                    onModelChange(model.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-xs sm:text-base flex items-center justify-between"
                >
                  <span>{model.label}</span>
                  {selectedModel === model.value && (
                    <Check size={16} className="text-purple-600 dark:text-purple-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const generateQuestions = async () => {
    if (transcriber.output?.isBusy) {
      return;
    }

    if (!transcript && !transcriber.output?.text) {
      toast.error("Please provide YouTube URL, upload file, or record audio");
      return;
    }

    const textToUse = transcript || transcriber.output?.text;
    if (!textToUse) {
      toast.error("No transcript available to generate questions from");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('transcript', textToUse);
      if (questionSpec) formData.append('questionSpec', questionSpec);
      formData.append('model', selectedModel);

      const response = await api.post(`/livequizzes/rooms/${roomCode}/generate-questions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const rawQuestions = response.data.questions || [];

      const cleanQuestions = rawQuestions
        .filter((q: any) => typeof q.questionText === 'string' && q.questionText.trim() !== '')
        .map((q: any): GeneratedQuestion => ({
          question: q.questionText,
          options: Array.isArray(q.options) ? q.options.map((opt: any) => opt.text ?? '') : [],
          correctOptionIndex: Array.isArray(q.options) ? q.options.findIndex((opt: any) => opt.correct) : 0,
        }));

      console.log("Generated questions:", cleanQuestions);
      setGeneratedQuestions(cleanQuestions);
      setShowPreview(true);
      toast.success(`Generated ${cleanQuestions.length} questions successfully!`);
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast.error(error.response?.data?.message || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateClick = () => {
    setIsGenerateClicked(true);

    if (!transcriber.output?.isBusy) {
      if (transcriber.output?.text) {
        setTranscript(transcriber.output.text);
      }
      generateQuestions();
      setIsGenerateClicked(false);
    }
  };

  const deleteGeneratedQuestion = (index: number) => {
    const updated = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updated);
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
    } else if (editingQuestionIndex !== null && editingQuestionIndex > index) {
      setEditingQuestionIndex(editingQuestionIndex - 1);
    }
    if (updated.length === 0) {
      setShowPreview(false);
    }
    toast.success("Question deleted");
  };

  const selectGeneratedQuestion = (questionData: GeneratedQuestion) => {
    setQuestion(questionData.question);
    setOptions([...questionData.options, ...Array(4 - questionData.options.length).fill("")]);
    setCorrectOptionIndex(questionData.correctOptionIndex);
  };

  const editGeneratedQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...generatedQuestions];
    if (field === 'question') {
      updated[index].question = value as string;
    } else if (field === 'correctOptionIndex') {
      updated[index].correctOptionIndex = value as number;
    } else if (field.startsWith('option-')) {
      const optionIndex = parseInt(field.split('-')[1]);
      updated[index].options[optionIndex] = value as string;
    }
    setGeneratedQuestions(updated);
  };

  const clearGenAIData = () => {
    setGeneratedQuestions([]);
    setShowPreview(false);
    setQuestionSpec("");
    setTranscript(null);
    setAudioManagerKey(Date.now());
    transcriber.onInputChange();
    setEditingQuestionIndex(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="mb-6">
          <div className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 shadow-sm p-4 flex items-center justify-between z-50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Room Code: <span className="font-mono bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-red-400 dark:to-blue-400">
                {roomCode}
              </span>
            </h2>

            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
              <Button
                onClick={() => {
                  copyToClipboard(roomCode);
                  // toast({
                  //   title: "Copied!",
                  //   description: "Room code copied to clipboard.",
                  //   duration: 2000,
                  // });
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-xs sm:text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span className="xs:inline">Copy Code</span>
              </Button>
              <Button
                onClick={() => setShowEndRoomConfirm(true)}
                variant="destructive"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                disabled={isEndingRoom}
              >
                <LogOut size={16} />
                <span className="xs:inline">End Room</span>
              </Button>
            </div>
          </div>
        </div>

        {/* End Room Confirmation Modal */}
        {showEndRoomConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md mx-4 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={20} />
                  End Room Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to end this room? This action cannot be undone.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• All students will be disconnected</li>
                  <li>• Active polls will be stopped</li>
                  <li>• Room will be permanently closed</li>
                </ul>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowEndRoomConfirm(false)}
                    variant="outline"
                    disabled={isEndingRoom}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={endRoom}
                    variant="destructive"
                    disabled={isEndingRoom}
                    className="flex items-center gap-2"
                  >
                    {isEndingRoom ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Ending Room...
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        End Room
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content - Two Cards Side by Side */}
        <div className="pt-11 min-h-screen grid grid-cols-1 md:grid-cols-2 gap-1 ">
          <div className="flex-1 p-6 border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 shadow">            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create Poll</h2>
          </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">

                {/* Manual Entry Tab */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Show generated questions if any */}
                  {generatedQuestions.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">
                        Generated Questions (from AI)
                      </h4>
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {generatedQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 flex flex-col gap-1"
                          >
                            <span className="font-medium text-xs sm:text-base">{q.question}</span>
                            <div className="flex flex-wrap gap-1">
                              {q.options.map((opt, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded text-xs ${q.correctOptionIndex === i
                                    ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 font-semibold'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-1 w-fit border-purple-400 text-purple-600 dark:text-purple-300 text-xs"
                              onClick={() => selectGeneratedQuestion(q)}
                            >
                              Use This Question
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Input
                      placeholder="Poll question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="dark:bg-gray-800/50 text-xs sm:text-base"
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
                          className="h-4 w-4 sm:h-5 sm:w-5 accent-purple-600 dark:accent-purple-400"
                        />
                        <Input
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...options];
                            copy[i] = e.target.value;
                            setOptions(copy);
                          }}
                          className="dark:bg-gray-800/50 text-xs sm:text-base"
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
                      className="dark:bg-gray-800/50 text-xs sm:text-base"
                    />
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-4">
                    <Button
                      onClick={createPoll}
                      disabled={!question || options.filter(opt => opt.trim()).length < 2}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 flex-1 text-xs sm:text-base"
                    >
                      Create Poll
                    </Button>
                    <Button
                      variant="outline"
                      onClick={fetchResults}
                      className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/30 text-xs sm:text-base"
                    >
                      Fetch Results
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GenAI Tab */}
          <div className="flex-1 p-6 border-r border-r-slate-200 dark:border-r-gray-700 bg-white/90 dark:bg-gray-900/90 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gen AI</h2>
            <Button
              onClick={clearGenAIData}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 text-xs sm:text-base"
            >
              Clear
            </Button>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                {!showPreview ? (
                  <>
                    <AudioManager
                      key={audioManagerKey}
                      transcriber={transcriber}
                    />
                    <div className="space-y-2">
                      <Transcript transcribedData={transcriber.output} />
                    </div>

                    {/* Optional Configuration */}
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Optional Settings</h4>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Question Specification (optional)
                        </label>
                        <Input
                          placeholder="e.g., Focus on key concepts, multiple choice only"
                          value={questionSpec}
                          onChange={(e) => setQuestionSpec(e.target.value)}
                          className="dark:bg-gray-800/50 text-xs sm:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          AI Model
                        </label>
                        <ModelSelector
                          selectedModel={selectedModel}
                          onModelChange={setSelectedModel}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-4">
                      <Button
                        onClick={handleGenerateClick}
                        disabled={isGenerating || (isGenerateClicked && transcriber.output?.isBusy)}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 flex-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
                      >
                        {isGenerateClicked && transcriber.output?.isBusy ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Transcribing...
                          </>
                        ) : isGenerating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 size={16} />
                            Generate Questions
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Generated Questions Preview */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Generated Questions Preview ({generatedQuestions.length})
                      </h3>
                      <Button
                        onClick={() => setShowPreview(false)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs sm:text-sm"
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                      {generatedQuestions.map((questionData, index) => (
                        <Card key={index} className="bg-white/80 dark:bg-gray-800/80 border border-slate-200/70 dark:border-gray-700/70">
                          <CardContent className="p-3 sm:p-4">
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-start gap-1 sm:gap-2">
                                <Button
                                  onClick={() => setEditingQuestionIndex(editingQuestionIndex === index ? null : index)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-xs sm:text-sm"
                                >
                                  <Edit3 size={14} />
                                </Button>
                                <Button
                                  onClick={() => deleteGeneratedQuestion(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm"
                                  title="Delete question"
                                >
                                  <X size={14} />
                                </Button>
                                {editingQuestionIndex === index ? (
                                  <Input
                                    value={questionData.question}
                                    onChange={(e) => editGeneratedQuestion(index, 'question', e.target.value)}
                                    className="flex-1 dark:bg-gray-700/50 text-xs sm:text-base"
                                  />
                                ) : (
                                  <p className="flex-1 font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-base">
                                    {questionData.question}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-1 sm:space-y-2">
                                {(questionData.options ?? []).map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-1 sm:gap-2">
                                    <Input
                                      type="radio"
                                      name={`correct-${index}`}
                                      checked={questionData.correctOptionIndex === optionIndex}
                                      onChange={() => editGeneratedQuestion(index, 'correctOptionIndex', optionIndex)}
                                      className="h-3 w-3 sm:h-4 sm:w-4 accent-purple-600 dark:accent-purple-400"
                                    />
                                    {editingQuestionIndex === index ? (
                                      <Input
                                        value={option}
                                        onChange={(e) => editGeneratedQuestion(index, `option-${optionIndex}`, e.target.value)}
                                        className="flex-1 dark:bg-gray-700/50 text-xs sm:text-base"
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                    ) : (
                                      <span className={`flex-1 text-xs sm:text-base ${questionData.correctOptionIndex === optionIndex
                                        ? 'text-green-600 dark:text-green-400 font-medium'
                                        : 'text-gray-700 dark:text-gray-300'
                                        } ${!option.trim() ? 'italic text-gray-400 dark:text-gray-500' : ''}`}>
                                        {option.trim() || `Option ${optionIndex + 1} (empty)`}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <Button
                                onClick={() => selectGeneratedQuestion(questionData)}
                                variant="outline"
                                size="sm"
                                className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/30 text-xs sm:text-base"
                              >
                                Use This Question
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Right Card - Poll Results */}
      <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Poll Results</CardTitle>
            {Object.keys(pollResults).length > 0 && (
              <Button
                onClick={fetchResults}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/30 text-xs sm:text-sm"
              >
                Refresh Results
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(pollResults).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No poll results yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create and start a poll to see responses from students
              </p>
              <Button
                onClick={fetchResults}
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/30"
              >
                Check for Results
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {Object.entries(pollResults ?? {})
                  .sort(() => {
                    return 0;
                  })
                  .reverse() 
                  .map(([pollQuestion, options]) => {                
                    const totalVotes = Object.values(options ?? {}).reduce((sum, data) => sum + data.count, 0);
                const isShowingNames = showMemberNames[pollQuestion] !== false;

                return (
                  <Card
                    key={pollQuestion}
                    className="bg-white/80 dark:bg-gray-800/80 border border-slate-200/70 dark:border-gray-700/70"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm sm:text-base text-gray-800 dark:text-gray-200 line-clamp-2">
                          {pollQuestion}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {totalVotes} votes
                          </span>
                          <Button
                            onClick={() => toggleMemberNames(pollQuestion)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                            title={isShowingNames ? "Hide member names" : "Show member names"}
                          >
                            {isShowingNames ? <Eye size={16} /> : <EyeOff size={16} />}                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {Object.entries(options ?? {}).map(([opt, data]) => {
                          const percentage = totalVotes > 0 ? ((data.count / totalVotes) * 100).toFixed(1) : '0';

                          return (
                            <div key={opt} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="font-medium text-purple-600 dark:text-purple-400 text-xs sm:text-sm flex-shrink-0">
                                    {opt}:
                                  </span>
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-0">
                                    <div
                                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  <span className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
                                    {data.count}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    ({percentage}%)
                                  </span>
                                </div>
                              </div>

                              {/* Member names - shown/hidden based on toggle */}
                              {isShowingNames && data.users.length > 0 && (
                                <div className="ml-4 pl-2 border-l-2 border-purple-200 dark:border-purple-700">
                                  <div className="flex flex-wrap gap-1">
                                    {data.users.map((user, userIndex) => (
                                      <span
                                        key={userIndex}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                                      >
                                        <Users size={10} className="mr-1" />
                                        {user.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Show count when names are hidden */}
                              {!isShowingNames && data.users.length > 0 && (
                                <div className="ml-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Users size={12} />
                                  <span>{data.users.length} member{data.users.length !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}