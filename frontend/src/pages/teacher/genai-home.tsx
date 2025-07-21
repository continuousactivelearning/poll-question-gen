/*import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  useGenerateQuestions,
  useGenerateTranscript,
  useSegmentTranscript
} from "@/lib/api/genAihooks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GenAIHomePage() {
  const [inputMode, setInputMode] = useState<"youtube" | "upload" | "record">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<string[]>([]);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [questionsPerSegment, setQuestionsPerSegment] = useState(2);

  const { mutate: generateTranscript, isPending: isTranscriptPending } =
    useGenerateTranscript(
      (data) => {
        toast.success("Transcript generated successfully!");
        setTranscript(data.generatedTranscript);
        setEditedTranscript(data.generatedTranscript);
        setSegments({});
        setQuestions([]);
      },
      (_error) => {
        toast.error("Failed to generate transcript");
      }
    );

  const { mutate: segmentTranscript, isPending: isSegmentPending } =
    useSegmentTranscript((data) => {
      toast.success("Transcript segmented");
      setSegments(data.segments);
    });

  const { mutate: generateQuestions, isPending: isQuestionsPending } =
    useGenerateQuestions((data) => {
      toast.success("Questions generated");
      setQuestions(data);
    });

  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      toast.warning("Enter a YouTube link");
      return;
    }
    generateTranscript({ youtubeUrl });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.warning("Please select a video or audio file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadFile);
    generateTranscript(formData as any);
  };

  const startRecording = async () => {
    setAudioBlob(null);
    setIsPaused(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Could not access microphone.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleSendAudio = () => {
    const currentChunks = audioChunksRef.current;
    if (!currentChunks.length) {
      toast.warning("No audio recorded yet.");
      return;
    }
    const blob = new Blob(currentChunks, { type: "audio/webm" });
    setAudioBlob(blob);
    const formData = new FormData();
    formData.append("file", new File([blob], "recording.webm", { type: "audio/webm" }));
    generateTranscript(formData as any);
  };

  return (
    <main className="relative flex-1 p-6 lg:p-8">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400">
            AI Content Generator
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Convert a video or voice to a full set of learning materials
          </p>
        </header>

        <div className="flex gap-4 justify-center">
          <Button
            variant={inputMode === "youtube" ? "default" : "outline"}
            onClick={() => setInputMode("youtube")}
            className="transition-all duration-300 hover:shadow-md"
          >
            Use YouTube URL
          </Button>
          <Button
            variant={inputMode === "upload" ? "default" : "outline"}
            onClick={() => setInputMode("upload")}
            className="transition-all duration-300 hover:shadow-md"
          >
            Upload Video/Audio
          </Button>
          <Button
            variant={inputMode === "record" ? "default" : "outline"}
            onClick={() => setInputMode("record")}
            className="transition-all duration-300 hover:shadow-md"
          >
            Record Voice
          </Button>
        </div>

        {inputMode === "youtube" && (
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80">
            <CardHeader>
              <CardTitle className="text-xl">Step 1: Enter YouTube URL</CardTitle>
              <CardDescription>We'll transcribe the video.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleYouTubeSubmit} className="space-y-4">
                <Input
                  placeholder="https://youtube.com/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isTranscriptPending}
                  className="dark:bg-gray-800/50"
                />
                <Button 
                  type="submit" 
                  disabled={isTranscriptPending || !youtubeUrl}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                >
                  {isTranscriptPending ? "Generating..." : "Generate Transcript"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {inputMode === "upload" && (
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80">
            <CardHeader>
              <CardTitle className="text-xl">Step 1: Upload Video or Audio File</CardTitle>
              <CardDescription>
                Upload a video or audio file to generate a transcript.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <Input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  disabled={isTranscriptPending}
                  required
                  className="dark:bg-gray-800/50"
                />
                <Button 
                  type="submit" 
                  disabled={isTranscriptPending || !uploadFile}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                >
                  {isTranscriptPending ? "Generating..." : "Generate Transcript"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {inputMode === "record" && (
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80">
            <CardHeader>
              <CardTitle className="text-xl">Step 1: Record Your Voice</CardTitle>
              <CardDescription>
                Record your voice and generate a transcript.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {!isRecording && (
                  <Button
                    onClick={startRecording}
                    disabled={isTranscriptPending}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                  >
                    Start Recording
                  </Button>
                )}
                {isRecording && !isPaused && (
                  <>
                    <Button
                      onClick={pauseRecording}
                      variant="secondary"
                      disabled={isTranscriptPending}
                    >
                      Pause
                    </Button>
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      disabled={isTranscriptPending}
                    >
                      Stop
                    </Button>
                  </>
                )}
                {isRecording && isPaused && (
                  <>
                    <Button
                      onClick={resumeRecording}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                      disabled={isTranscriptPending}
                    >
                      Resume
                    </Button>
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      disabled={isTranscriptPending}
                    >
                      Stop
                    </Button>
                  </>
                )}
                {audioChunksRef.current.length > 0 && (
                  <audio controls src={URL.createObjectURL(new Blob(audioChunksRef.current, { type: "audio/webm" }))} />
                )}
              </div>
              <Button
                onClick={handleSendAudio}
                disabled={isTranscriptPending || audioChunksRef.current.length === 0}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
              >
                {isTranscriptPending ? "Generating..." : "Generate Transcript"}
              </Button>
            </CardContent>
          </Card>
        )}

        {transcript && (
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80">
            <CardHeader>
              <CardTitle className="text-xl">Step 2: Edit & Segment Transcript</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                rows={10}
                className="dark:bg-gray-800/50"
              />
              <Button
                onClick={() => segmentTranscript({ transcript: editedTranscript })}
                disabled={isSegmentPending}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
              >
                {isSegmentPending ? "Segmenting..." : "Segment"}
              </Button>
            </CardContent>
          </Card>
        )}

        {Object.keys(segments).length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80">
            <CardHeader>
              <CardTitle className="text-xl">Step 3: Generate Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-4 space-y-2 text-sm">
                {Object.entries(segments).map(([endTime, seg], i) => (
                  <li key={i} className="dark:text-gray-300">
                    <strong className="text-purple-600 dark:text-purple-400">{endTime}</strong>: {seg}
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-4">
                <div>
                  <label htmlFor="qps" className="block text-sm font-medium mb-1 dark:text-gray-300">Questions per Segment</label>
                  <Input
                    id="qps"
                    type="number"
                    min={1}
                    value={questionsPerSegment}
                    onChange={(e) => setQuestionsPerSegment(parseInt(e.target.value) || 1)}
                    className="w-24 dark:bg-gray-800/50"
                  />
                </div>
                <Button
                  onClick={() =>
                    generateQuestions({
                      segments,
                      questionsPerSegment,
                    })}
                  disabled={isQuestionsPending}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 mt-6"
                >
                  {isQuestionsPending ? "Generating..." : "Generate Questions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {questions.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80">
            <CardHeader>
              <CardTitle className="text-xl">Step 4: Generated Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-4 space-y-2 dark:text-gray-300">
                {questions.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}*/