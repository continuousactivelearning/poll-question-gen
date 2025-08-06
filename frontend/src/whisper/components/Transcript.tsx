import { useRef, useEffect, useState } from "react";
import { TranscriberData } from "../../hooks/useTranscriber";

interface Props {
    transcribedData: TranscriberData | undefined;
}

export default function Transcript({ transcribedData }: Props) {
    const divRef = useRef<HTMLDivElement>(null);
    const [showAll, setShowAll] = useState(false);

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
    };

    const exportJSON = () => {
        let jsonData = JSON.stringify(transcribedData?.chunks ?? [], null, 2);
        const regex = /(    "timestamp": )\[\s+(\S+)\s+(\S+)\s+\]/gm;
        jsonData = jsonData.replace(regex, "$1[$2 $3]");
        const blob = new Blob([jsonData], { type: "application/json" });
        saveBlob(blob, "transcript.json");
    };

    useEffect(() => {
        if (divRef.current && showAll) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }, [showAll]);

    const fullText = (transcribedData?.chunks ?? [])
        .map((chunk) => chunk.text)
        .join("")
        .trim();

    return (
        <div className='w-full flex flex-col my-2 p-4 max-h-[20rem] overflow-y-auto bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80 rounded-lg' ref={divRef}>
            {fullText && (
                <div
                    className={`text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap transition-all duration-300 ${showAll ? "" : "line-clamp-2"
                        }`}
                >
                    {fullText}
                </div>
            )}

            {fullText && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className='text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline mt-2 self-start'
                >
                    {showAll ? "Show Less" : "Show More"}
                </button>
            )}

            {transcribedData && !transcribedData.isBusy && (
                <div className='w-full text-right mt-4'>
                    <button
                        onClick={exportTXT}
                        className='text-white bg-purple-500 hover:bg-purple-600 focus:ring-4 focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-4 py-2 text-center mr-2 inline-flex items-center'
                    >
                        Export TXT
                    </button>
                    <button
                        onClick={exportJSON}
                        className='text-white bg-purple-500 hover:bg-purple-600 focus:ring-4 focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center'
                    >
                        Export JSON
                    </button>
                </div>
            )}
        </div>
    );
}