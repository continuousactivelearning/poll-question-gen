import { useCallback, useMemo, useState, useRef } from "react";
import { useWorker } from "./useWorker";
import Constants from "../utils/Constants";

interface ProgressItem {
    file: string;
    loaded: number;
    progress: number;
    total: number;
    name: string;
    status: string;
}

interface TranscriberUpdateData {
    data: [
        string,
        { chunks: { text: string; timestamp: [number, number | null] }[] },
    ];
    text: string;
}

interface TranscriberCompleteData {
    data: {
        text: string;
        chunks: { text: string; timestamp: [number, number | null] }[];
    };
}

export interface TranscriberData {
    isBusy: boolean;
    text: string;
    chunks: { text: string; timestamp: [number, number | null] }[];
}

export interface Transcriber {
    onInputChange: () => void;
    isBusy: boolean;
    isModelLoading: boolean;
    progressItems: ProgressItem[];
    start: (audioData: AudioBuffer | undefined) => void;
    output?: TranscriberData;
    model: string;
    setModel: (model: string) => void;
    multilingual: boolean;
    setMultilingual: (model: boolean) => void;
    quantized: boolean;
    setQuantized: (model: boolean) => void;
    subtask: string;
    setSubtask: (subtask: string) => void;
    language?: string;
    setLanguage: (language: string) => void;
    isLiveMode: boolean;
    accumulatedChunks: { text: string; timestamp: [number, number | null] }[];
}

export function useTranscriber(): Transcriber {
    const [transcript, setTranscript] = useState<TranscriberData | undefined>(
        undefined,
    );
    const [isBusy, setIsBusy] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);

    const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

    // State for live transcription mode
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [accumulatedChunks, setAccumulatedChunks] = useState<
        { text: string; timestamp: [number, number | null] }[]
    >([]);
    const accumulatedTextRef = useRef<string>("");

    const webWorker = useWorker((event) => {
        const message = event.data;
        // Update the state with the result
        switch (message.status) {
            case "progress":
                // Model file progress: update one of the progress items.
                setProgressItems((prev) =>
                    prev.map((item) => {
                        if (item.file === message.file) {
                            return { ...item, progress: message.progress };
                        }
                        return item;
                    }),
                );
                break;
            case "update":
                // Received partial update
                // console.log("update", message);
                // eslint-disable-next-line no-case-declarations
                const updateMessage = message as TranscriberUpdateData;

                // NEW: In live mode, accumulate chunks
                if (isLiveMode) {
                    const newChunks = updateMessage.data[1].chunks;
                    setAccumulatedChunks((prev) => {
                        // Filter out duplicates based on text and timestamp
                        const existingTexts = new Set(prev.map(c => c.text));
                        const uniqueNewChunks = newChunks.filter(
                            chunk => !existingTexts.has(chunk.text)
                        );
                        return [...prev, ...uniqueNewChunks];
                    });

                    // Update accumulated text
                    accumulatedTextRef.current = updateMessage.data[0];
                }

                setTranscript({
                    isBusy: true,
                    text: updateMessage.data[0],
                    chunks: updateMessage.data[1].chunks,
                });
                break;
            case "complete":
                // Received complete transcript
                // console.log("complete", message);
                // eslint-disable-next-line no-case-declarations
                const completeMessage = message as TranscriberCompleteData;

                // NEW: In live mode, merge with accumulated chunks
                if (isLiveMode) {
                    const finalChunks = completeMessage.data.chunks;
                    setAccumulatedChunks((prev) => {
                        // Merge accumulated chunks with final chunks
                        const allChunks = [...prev, ...finalChunks];

                        // Remove duplicates based on text content
                        const uniqueChunks = allChunks.filter((chunk, index, self) =>
                            index === self.findIndex(c => c.text === chunk.text)
                        );

                        return uniqueChunks;
                    });

                    // Build complete text from all chunks
                    const completeText = accumulatedChunks
                        .concat(finalChunks)
                        .map(c => c.text)
                        .join(' ')
                        .trim();

                    setTranscript({
                        isBusy: false,
                        text: completeText || completeMessage.data.text,
                        chunks: accumulatedChunks.length > 0
                            ? [...accumulatedChunks, ...finalChunks]
                            : completeMessage.data.chunks,
                    });
                } else {
                    setTranscript({
                        isBusy: false,
                        text: completeMessage.data.text,
                        chunks: completeMessage.data.chunks,
                    });
                }

                setIsBusy(false);
                break;

            case "initiate":
                // Model file start load: add a new progress item to the list.
                setIsModelLoading(true);
                setProgressItems((prev) => [...prev, message]);
                break;
            case "ready":
                setIsModelLoading(false);
                break;
            case "error":
                setIsBusy(false);
                setIsLiveMode(false);
                alert(
                    `${message.data.message} This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.`,
                );
                break;
            case "done":
                // Model file loaded: remove the progress item from the list.
                setProgressItems((prev) =>
                    prev.filter((item) => item.file !== message.file),
                );
                break;

            default:
                // initiate/download/done
                break;
        }
    });

    const [model, setModel] = useState<string>(Constants.DEFAULT_MODEL);
    const [subtask, setSubtask] = useState<string>(Constants.DEFAULT_SUBTASK);
    const [quantized, setQuantized] = useState<boolean>(
        Constants.DEFAULT_QUANTIZED,
    );
    const [multilingual, setMultilingual] = useState<boolean>(
        Constants.DEFAULT_MULTILINGUAL,
    );
    const [language, setLanguage] = useState<string>(
        Constants.DEFAULT_LANGUAGE,
    );

    const onInputChange = useCallback(() => {
        setTranscript(undefined);
        setIsLiveMode(false);
        setAccumulatedChunks([]);
        accumulatedTextRef.current = "";
    }, []);

    const postRequest = useCallback(
        async (audioData: AudioBuffer | undefined) => {
            if (audioData) {
                // NEW: Detect if we're already transcribing (live mode)
                if (isBusy) {
                    setIsLiveMode(true);
                } else {
                    setTranscript(undefined);
                    setIsLiveMode(false);
                    setAccumulatedChunks([]);
                    accumulatedTextRef.current = "";
                }

                setIsBusy(true);

                let audio;
                if (audioData.numberOfChannels === 2) {
                    const SCALING_FACTOR = Math.sqrt(2);

                    let left = audioData.getChannelData(0);
                    let right = audioData.getChannelData(1);

                    audio = new Float32Array(left.length);
                    for (let i = 0; i < audioData.length; ++i) {
                        audio[i] = SCALING_FACTOR * (left[i] + right[i]) / 2;
                    }
                } else {
                    // If the audio is not stereo, we can just use the first channel:
                    audio = audioData.getChannelData(0);
                }

                webWorker.postMessage({
                    audio,
                    model,
                    multilingual,
                    quantized,
                    subtask: multilingual ? subtask : null,
                    language:
                        multilingual && language !== "auto" ? language : null,
                });
            }
        },
        [webWorker, model, multilingual, quantized, subtask, language, isBusy],
    );

    const transcriber = useMemo(() => {
        return {
            onInputChange,
            isBusy,
            isModelLoading,
            progressItems,
            start: postRequest,
            output: transcript,
            model,
            setModel,
            multilingual,
            setMultilingual,
            quantized,
            setQuantized,
            subtask,
            setSubtask,
            language,
            setLanguage,
            isLiveMode,
            accumulatedChunks,
        };
    }, [
        isBusy,
        isModelLoading,
        progressItems,
        postRequest,
        transcript,
        model,
        multilingual,
        quantized,
        subtask,
        language,
        isLiveMode,
        accumulatedChunks,
    ]);

    return transcriber;
}