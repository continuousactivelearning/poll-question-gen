import { useRef, useEffect, useState } from "react";
import { TranscriberData } from "../../hooks/useTranscriber";
import { FiMoreVertical } from "react-icons/fi"; // icon for menu

interface Props {
    transcribedData: TranscriberData | undefined;
    isLiveRecording?: boolean; // Pass this from parent
}

export default function Transcript({ transcribedData, isLiveRecording }: Props) {
    const divRef = useRef<HTMLDivElement>(null);
    const [showAll, setShowAll] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const saveBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportTXT = () => {
        const text = (transcribedData?.chunks ?? [])
            .map((chunk) => chunk.text)
            .join("")
            .trim();
        const blob = new Blob([text], { type: "text/plain" });
        saveBlob(blob, "transcript.txt");
        setMenuOpen(false);
    };

    const exportJSON = () => {
        let jsonData = JSON.stringify(transcribedData?.chunks ?? [], null, 2);
        const regex = /(    "timestamp": )\[\s+(\S+)\s+(\S+)\s+\]/gm;
        jsonData = jsonData.replace(regex, "$1[$2 $3]");
        const blob = new Blob([jsonData], { type: "application/json" });
        saveBlob(blob, "transcript.json");
        setMenuOpen(false);
    };

    useEffect(() => {
        if (divRef.current && (showAll || isLiveRecording)) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }, [showAll, transcribedData, isLiveRecording]);

    const fullText = (transcribedData?.chunks ?? [])
        .map((chunk) => chunk.text)
        .join("")
        .trim();

    const isTranscribing = transcribedData?.isBusy || isLiveRecording;

    return (
        <div
            className="w-full flex flex-col my-2 p-4 max-h-60 overflow-y-auto bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80 rounded-lg relative"
            ref={divRef}
        >
            {/* Status Indicator */}
            {isTranscribing && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                        <svg
                            className="animate-spin h-3 w-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            ></path>
                        </svg>
                        <span className="animate-pulse">
                            {isLiveRecording ? "Live transcription in progress..." : "Transcribing..."}
                        </span>
                    </div>
                </div>
            )}

            {fullText ? (
                <div
                    className={`text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap transition-all duration-300 ${showAll ? "" : "line-clamp-2"
                        } ${isTranscribing ? "opacity-90" : "opacity-100"}`}
                >
                    {fullText}
                    {isTranscribing && (
                        <span className="inline-block w-2 h-4 ml-1 bg-purple-600 dark:bg-purple-400 animate-pulse" />
                    )}
                </div>
            ) : (
                <p className="text-gray-400 text-sm">
                    Transcript will appear here once audio is uploaded...
                </p>
            )}

            {/* Show toggle button only if transcript exists and not currently transcribing */}
            {fullText && !isTranscribing && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline mt-2 text-xs px-2 py-1 self-start"
                >
                    {showAll ? "Show Less" : "Show More"}
                </button>
            )}

            {/* Export icon - only show when transcription is complete */}
            {transcribedData && !isTranscribing && fullText && (
                <div className="absolute bottom-2 right-2">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-lg p-1"
                        aria-label="Export options"
                        title="Export options"
                    >
                        <FiMoreVertical />
                    </button>

                    {menuOpen && (
                        <div className="absolute bottom-10 right-0 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
                            <button
                                onClick={exportTXT}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                            >
                                Export TXT
                            </button>
                            <button
                                onClick={exportJSON}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-700"
                            >
                                Export JSON
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}