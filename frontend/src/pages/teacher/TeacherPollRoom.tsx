import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Mic, ChevronUp, MicOff, CheckCircle, Volume2, Filter, Upload, Trash2, Languages, Settings, ClipboardList, BarChart2, Clock } from 'lucide-react';
import { useParams, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Wand2, Edit3, X, Loader2, LogOut, AlertTriangle, Users, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api/api";
import { useAuthStore } from '@/lib/store/auth-store';
import { useTranscriber } from "@/hooks/useTranscriber";
import { AudioManager } from "@/whisper/components/AudioManager";
import AudioRecorder from "@/whisper/components/AudioRecorder";
import Modal from "@/whisper/components/modal/Modal";
import Transcript from "@/whisper/components/Transcript";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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
export type SupportedLanguage =
  | "en-IN"
  | "en-US"
  | "hi-IN"
  | "bn-IN"
  | "te-IN"
  | "mr-IN"
  | "ta-IN"
  | "gu-IN"
  | "kn-IN"
  | "ml-IN"
  | "pa-IN"
  | "ur-IN";

const supportedLanguages: { code: SupportedLanguage; label: string }[] = [
  { code: "en-IN", label: "English (India)" },
  { code: "en-US", label: "English (US)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "bn-IN", label: "Bengali" },
  { code: "te-IN", label: "Telugu" },
  { code: "mr-IN", label: "Marathi" },
  { code: "ta-IN", label: "Tamil" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "pa-IN", label: "Punjabi" },
  { code: "ur-IN", label: "Urdu" },
];

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
  const [questionCount, setQuestionCount] = useState<number>(2);

  // New state for member names toggle
  const [showMemberNames, setShowMemberNames] = useState<Record<string, boolean>>({});

  const [isGenerateClicked, setIsGenerateClicked] = useState(false);
  const [audioManagerKey, setAudioManagerKey] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("en-IN");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const recognitionRef = useRef<any>(null);
  const [showAudioOptions, setShowAudioOptions] = useState(false);
  const [useWhisper, setUseWhisper] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  // Whisper transcription state and Whisper service for speech-to-text
  const transcriber = useTranscriber();
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isLiveRecordingActive, setIsLiveRecordingActive] = useState(false);
  
  useEffect(() => {
    if (transcriber.output?.text) {
      setTranscript(transcriber.output.text);
      setIsProcessing(false);
    }
  }, [transcriber.output]);
  
  // Update processing state based on transcriber.isBusy
  useEffect(() => {
    setIsProcessing(transcriber.isBusy);
  }, [transcriber.isBusy]);


    useEffect(() => {
      if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              setLiveTranscript((prev) => prev + " " + result[0].transcript);
            } else {
              interim += result[0].transcript;
            }
          }
          setInterimTranscript(interim);
        };

        recognition.onend = () => {
          // setIsListening(false);
          // setIsRecording(false);
          const IS_FROM_ONEND = true;
          handleRecordingToggle(IS_FROM_ONEND);
        };
        recognition.onerror = (event: any) => console.error(event.error);

        recognitionRef.current = recognition;
      } else {
        toast.error("Web Speech API is not supported in this browser.");
      }
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [language]);

  const displayTranscript =
    liveTranscript + (interimTranscript ? " " + interimTranscript : "");

  const handleRecordingToggle = async (isFromOnEnd?: boolean) => {
    if (isRecording || isFromOnEnd) {
      setIsRecording(false);
      setIsListening(false);
      setIsLiveRecordingActive(false);

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      try {
        if (useWhisper) {
          setShowRecordModal(true);
        } else {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          audioContextRef.current = new AudioContext();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);

          updateAudioLevel();

          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.start();

          if (recognitionRef.current) {
            recognitionRef.current.start();
          }

          setIsRecording(true);
          setIsListening(true);
          setInterimTranscript("");
        }
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

    const updateAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);

      const frequencyBars = Array.from(dataArray.slice(0, 16)).map(
        (value) => value / 255
      );
      setFrequencyData(frequencyBars);
    }
  };

  const handleAudioFromRecording = async (data: Blob) => {
    if (!data) return;
    
    setAudioBlob(data);
  };
  
  const processAudioBlob = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    const blobUrl = URL.createObjectURL(audioBlob);
    const fileReader = new FileReader();
    
    fileReader.onloadend = async () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;
      if (!arrayBuffer) return;

      const audioCTX = new AudioContext({
        sampleRate: 16000, // Whisper default sample rate
      });

      const decoded = await audioCTX.decodeAudioData(arrayBuffer);
      transcriber.onInputChange();
      transcriber.start(decoded);
      
      setIsRecording(false);
      setIsListening(false);
      setShowRecordModal(false);
    };
    
    fileReader.readAsArrayBuffer(audioBlob);
  };

  // Handle live audio streaming for Whisper
  const handleLiveAudioStream = (audioBuffer: AudioBuffer) => {
    setIsLiveRecordingActive(true);
    transcriber.start(audioBuffer);
  };

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
    if (text && isComplete && !isLiveRecordingActive) {
      setTranscript(text);
      console.log("Transcribed successfully", text);
      toast.success("Transcribed successfully");
    }
    // In live mode, show partial transcripts as they come
    if (text && isLiveRecordingActive && transcriber.isLiveMode) {
      console.log("Live transcription update:", text);
    }
  }, [transcriber.output, isLiveRecordingActive, transcriber.isLiveMode]);

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
    
    if (transcriber.output?.isBusy || isRecording || isListening) {
      return;
    }
  
    if (!transcript && !transcriber.output?.text && !displayTranscript.trim()) {
      toast.error("Please provide YouTube URL, upload file, or record audio");
      return;
    }
    const textToUse = transcript || transcriber.output?.text || displayTranscript.trim();
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
      formData.append('questionCount', questionCount.toString()); // Question count

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

    if (!transcriber.output?.isBusy && (!isRecording || !isListening)) {
      if (transcriber.output?.text) {
        const finalText = transcriber.output?.text || transcript;
        setTranscript(finalText);
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
    setIsLiveRecordingActive(false); 
    setLiveTranscript('');
    setInterimTranscript('');
    setIsGenerateClicked(false);
    setIsRecording(false);
    setIsListening(false);
    setFrequencyData([]);
    setUseWhisper(false);
    setShowRecordModal(false);
    setAudioBlob(undefined);
    setIsProcessing(false);
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks().forEach((track) => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setAudioManagerKey(Date.now());
    toast.success("Cleared all data");
  };

  return (
    <main className=" bg-gradient-to-br md-px-12 px-2 md:pb-4 pb-2 from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">

      <div className="min-h-[80vh] bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 md:mb-2 mb-1">
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

          {/* GenAI Tab */}
          <div className="flex-1 h-[100vh] mt-14 py-6 px-1 md:p-6 border-r border-r-slate-200 dark:border-r-gray-700 bg-white/90 dark:bg-gray-900/90 shadow">
            <ScrollArea className="h-full pe-3">
           
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-4 sm:space-y-6">
                   {!showPreview ? (
                    <Card className="w-full bg-transparent border-none shadow-none">
                     <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Volume2 className="h-4 w-4 text-purple-500" />
                          Voice Recorder
                        </CardTitle>

                        <div className="flex items-center gap-2">
                          <Select
                            value={language}
                            onValueChange={(value) => setLanguage(value as SupportedLanguage)}
                            disabled={isRecording || isListening || showAudioOptions}
                          >
                            <SelectTrigger className="w-[90px] sm:w-[130px] md:w-[160px] h-9 border border-gray-300 dark:border-gray-700 rounded-md hover:border-purple-500 focus:border-purple-500 transition-colors flex items-center gap-2">
                              <Languages className="w-4 h-4 text-purple-500" />
                              <span className="hidden md:block text-sm text-gray-700 dark:text-gray-200">
                                <SelectValue placeholder="Language" />
                              </span>
                            </SelectTrigger>
                            <SelectContent className="border border-gray-200 dark:border-gray-700 rounded-md shadow-md bg-white/90 dark:bg-gray-900/90">
                              {supportedLanguages.map((lang) => (
                                <SelectItem
                                  key={lang.code}
                                  value={lang.code}
                                  className="hover:bg-purple-100 dark:hover:bg-purple-700 transition-colors"
                                >
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowAudioOptions(!showAudioOptions)}
                            className="h-9 flex items-center gap-2 text-sm font-medium text-muted-foreground border border-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 hover:bg-gray-50 transition-colors rounded-md"
                          >
                            <Upload className="h-4 w-4 text-purple-500" />
                            <span className="hidden sm:inline">Audio Upload</span>
                            {showAudioOptions ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            onClick={clearGenAIData}
                            variant="outline"
                            className="h-9 flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 rounded-md text-sm"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="hidden sm:inline">Clear</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>


                      <CardContent className="space-y-6">
                      
                        <div className="flex flex-col items-center justify-center gap-4 p-6 border rounded-lg bg-transparent">
                          <Button
                            onClick={() => handleRecordingToggle()}
                            size="lg"
                            variant={(isRecording && !useWhisper) ? "destructive" : "default"}
                            className={`h-20 w-20 md:w-25 md:h-25 rounded-full flex items-center justify-center 
                              bg-gradient-to-r from-purple-500 to-blue-500 text-white 
                              hover:from-purple-600 hover:to-blue-600 shadow-lg 
                              ${(isRecording && !useWhisper) && "animate-pulse"} transition-all`}
                          >
                            {(isRecording && !useWhisper) ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                          </Button>

                          <div className="flex items-end gap-1 h-8">
                            {isRecording && isListening && !useWhisper ? (
                              frequencyData.map((level, index) => (
                                <div
                                  key={index}
                                  className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-full w-2 transition-all duration-75"
                                  style={{
                                    height: `${Math.max(level * 80, 8)}%`, 
                                    opacity: 0.6 + level * 0.4,
                                  }}
                                />
                              ))
                            ) : isRecording && !useWhisper ? (
                              Array.from({ length: 20 }).map((_, index) => (
                                <div
                                  key={index}
                                  className="bg-gradient-to-t from-blue-400/40 to-purple-400/40 rounded-full w-2"
                                  style={{ height: "12%" }}
                                />
                              ))
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Tap mic to start recording</p>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="use-whisper" 
                                    checked={useWhisper}
                                    onCheckedChange={(checked) => setUseWhisper(checked === true)}
                                  />
                                  <label
                                    htmlFor="use-whisper"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Use Whisper AI
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {showAudioOptions && (
                        <div className="border border-border rounded-lg p-4 space-y-2 transition-transform duration-200 hover:scale-102">
                            <p className="text-xs text-muted-foreground mb-1">
                              Please clear the previous transcription before uploading a new audio file.
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              Upload an audio file instead of recording
                            </p>
                          <AudioManager 
                            key={audioManagerKey} 
                            transcriber={transcriber} 
                            enableLiveTranscription={useWhisper}
                            onLiveRecordingStart={() => setIsLiveRecordingActive(true)}
                            onLiveRecordingStop={() => setIsLiveRecordingActive(false)}
                          />
                        </div>
                        )}

                        <Transcript
                          transcribedData={transcriber.output}
                          liveTranscription={useWhisper ? (transcriber.output?.text || '') : displayTranscript}
                          isRecording={useWhisper ? isLiveRecordingActive : (isRecording || isListening)}
                        />

                        <div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 md:py-5 text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-purple-500" />
                              <span className="tracking-wide">Additional Settings</span>
                            </div>
                            {showAdvanced ? (
                              <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </Button>


                          {showAdvanced && (
                            <div className="mt-3 border border-border rounded-lg p-4 space-y-6 hover:border-purple-500 transition-colors">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Question Specification (optional)
                                </label>
                                <Input
                                  placeholder="e.g., Focus on key concepts, multiple choice only"
                                  value={questionSpec}
                                  onChange={(e) => setQuestionSpec(e.target.value)}
                                  className="text-xs sm:text-base"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Provide specific instructions for question generation
                                </p>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">AI Model</label>
                                <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                                <p className="text-xs text-muted-foreground">
                                  Select the AI model to use for generation
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-center mt-4">
                          <Button
                            onClick={handleGenerateClick}
                            disabled={
                              isRecording ||
                              isListening ||
                              isGenerating ||
                              (isGenerateClicked && transcriber.output?.isBusy)
                            }
                            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 px-5 sm:px-7 py-2 sm:py-3 rounded-md flex items-center gap-2 text-sm sm:text-base transition-all"
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

                      </CardContent>
                    </Card>

                    ) : (
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
            </ScrollArea>
          </div>


        {/* Main Content - Two Cards Side by Side */}
          <div className="pt-4 h-full grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Create Poll  */}
            <Card className="flex flex-col bg-white/90 dark:bg-gray-900/90 border border-slate-200/80 dark:border-gray-700/80 shadow">
              <CardHeader>
                <div className="flex items-center justify-between w-full gap-2">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-500" />
                    Create Poll
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 overflow-y-auto">
                {generatedQuestions.length > 0 && (
                  <section>
                    <h4 className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      Generated Questions (from AI)
                    </h4>

                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                      {generatedQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 flex flex-col gap-2"
                        >
                          <span className="font-medium text-xs sm:text-sm">{q.question}</span>

                          <div className="flex flex-wrap gap-1">
                            {q.options.map((opt, i) => (
                              <span
                                key={i}
                                className={`px-2 py-0.5 rounded text-xs ${
                                  q.correctOptionIndex === i
                                    ? "bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 font-semibold"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {opt}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-1 w-fit border-purple-400 text-purple-600 dark:text-purple-300 text-xs"
                              onClick={() => selectGeneratedQuestion(q)}
                            >
                              Use This Question
                            </Button>

                            <span className="text-xs text-muted-foreground">AI generated — review before creating</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Poll question
                  </label>
                  <Input
                    placeholder="Enter your poll question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="dark:bg-gray-800/50 text-sm"
                    aria-label="Poll question"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter the question students will answer.
                  </p>
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
                    Poll options (choose correct/right option)
                  </legend>

                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={correctOptionIndex === i}
                        onChange={() => setCorrectOptionIndex(i)}
                        className="h-4 w-4 sm:h-5 sm:w-5 accent-purple-600 dark:accent-purple-400"
                        aria-label={`Select option ${i + 1} as correct`}
                      />
                      <Input
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const copy = [...options];
                          copy[i] = e.target.value;
                          setOptions(copy);
                        }}
                        className="dark:bg-gray-800/50 text-sm"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tip: Provide at least 2 meaningful options for a valid poll.
                  </p>
                </fieldset>

                {/* Timer */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 gap-1">
                    <Clock className="w-4 h-4" />
                    Timer (seconds)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 30"
                      value={timer}
                      min={5}
                      onChange={(e) => setTimer(Number(e.target.value))}
                      className="dark:bg-gray-800/50 text-sm w-36"
                      aria-label="Timer in seconds"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    The timer controls how long the poll remains open for students to vote.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-4">
                  <Button
                    onClick={createPoll}
                    disabled={!question || options.filter((opt) => opt.trim()).length < 2}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 flex-1 text-sm"
                    aria-disabled={!question || options.filter((opt) => opt.trim()).length < 2}
                  >
                    Create Poll
                  </Button>

                  <Button
                    variant="outline"
                    onClick={fetchResults}
                    className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/30 text-sm"
                  >
                    Fetch Results
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/*  Poll Results  */}
            <Card className="flex flex-col bg-white/90 dark:bg-gray-900/90 border border-slate-200/80 dark:border-gray-700/80 shadow">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-purple-500" />
                    Poll Results
                  </CardTitle>
                  <div className="flex items-center gap-2">
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
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                {/* No results state */}
                {Object.keys(pollResults).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No poll results yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Poll results will appear here once students submit their responses.
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
                  /* Results list (scrollable) */
                  <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    {Object.entries(pollResults ?? {})
                      .reverse()
                      .map(([pollQuestion, options]) => {
                        const totalVotes = Object.values(options ?? {}).reduce((sum, data) => sum + data.count, 0);
                        const isShowingNames = showMemberNames[pollQuestion] !== false;

                        // compute winner(s)
                        const sortedOptions = Object.entries(options ?? {}).sort((a, b) => b[1].count - a[1].count);
                        const topCount = sortedOptions?.[0]?.[1]?.count ?? 0;

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
                                    {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                                  </span>

                                  <Button
                                    onClick={() => toggleMemberNames(pollQuestion)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                                    title={isShowingNames ? "Hide member names" : "Show member names"}
                                  >
                                    {isShowingNames ? <Eye size={16} /> : <EyeOff size={16} />}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                {Object.entries(options ?? {}).map(([opt, data]) => {
                                  const percentage = totalVotes > 0 ? ((data.count / totalVotes) * 100).toFixed(1) : "0";
                                  const isTop = data.count === topCount && topCount > 0;

                                  return (
                                    <div key={opt} className="space-y-2">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <span className="font-medium text-purple-600 dark:text-purple-400 text-xs sm:text-sm flex-shrink-0">
                                            {opt}
                                            {isTop && (
                                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                                Top
                                              </span>
                                            )}
                                          </span>

                                          {/* progress bar */}
                                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-0">
                                            <div
                                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                                              style={{ width: `${percentage}%` }}
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                          <span className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
                                            {data.count}
                                          </span>
                                          <span className="text-gray-500 dark:text-gray-400 text-xs">({percentage}%)</span>
                                        </div>
                                      </div>

                                      {/* member list or count */}
                                      {isShowingNames && data.users.length > 0 ? (
                                        <div className="ml-4 pl-2 border-l-2 border-purple-200 dark:border-purple-700">
                                          <div className="flex flex-wrap gap-1 mt-1">
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
                                      ) : data.users.length > 0 ? (
                                        <div className="ml-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                          <Users size={12} />
                                          <span>{data.users.length} member{data.users.length !== 1 ? "s" : ""}</span>
                                        </div>
                                      ) : null}
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
          </div>
      </div>    
      
      <Modal
        show={showRecordModal}
        title={"Record with Whisper AI"}
        content={
          <>
            <p className="mb-4">Record audio using your microphone with Whisper AI transcription</p>
            <AudioRecorder
              onRecordingComplete={handleAudioFromRecording}
              onAudioStream={handleLiveAudioStream}
              enableLiveTranscription={true}
            />
            {audioBlob && (
              <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-green-800 dark:text-green-400 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Recording complete! Click "Load" to process with Whisper AI
                </p>
              </div>
            )}
          </>
        }
        onClose={() => {
          setShowRecordModal(false);
          setAudioBlob(undefined);
          setIsLiveRecordingActive(false);
        }}
        submitText={"Load"}
        submitEnabled={audioBlob !== undefined}
        onSubmit={() => {
          processAudioBlob();
          setAudioBlob(undefined);
        }}
      />
    </main>
  );
}