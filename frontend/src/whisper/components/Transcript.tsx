import { useRef, useEffect, useState } from "react";
import { TranscriberData } from "../../hooks/useTranscriber";
import { FiMoreVertical } from "react-icons/fi"; // icon for menu

interface Props {
    transcribedData: TranscriberData | undefined;
}

export default function Transcript({ transcribedData }: Props) {
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
        if (divRef.current && showAll) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }, [showAll, transcribedData]);

    const fullText = (transcribedData?.chunks ?? [])
        .map((chunk) => chunk.text)
        .join("")
        .trim();

    return (
        <div
            className="w-full flex flex-col my-2 p-4 h-35 overflow-y-auto bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80 rounded-lg relative"
            ref={divRef}
        >
            {fullText ? (
                <div
                    className={`text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap transition-all duration-300 mt-2 ${showAll ? "" : "line-clamp-2"
                        }`}
                >
                    {fullText}
                </div>
            ) : (
                <p className="text-gray-400 text-sm">
                    Transcript will appear here once audio is uploaded...
                </p>
            )}

            {/* Show toggle button only if transcript exists */}
            {fullText && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline mt-2 text-xs px-2 py-1 self-start"
                >
                    {showAll ? "Show Less" : "Show More"}
                </button>
            )}

            {/* Export icon fixed at bottom */}
            {transcribedData && !transcribedData.isBusy && fullText && (
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