import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause } from "lucide-react";

export default function AudioPlayer(props: {
    audioUrl: string;
    mimeType: string;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Update source on prop change
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = props.audioUrl;
            audioRef.current.load();
            setIsLoading(true);
            setCurrentTime(0);
            setIsPlaying(false);
        }
    }, [props.audioUrl]);

    // Audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedData = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleLoadStart = () => {
            setIsLoading(true);
        };

        audio.addEventListener('loadeddata', handleLoadedData);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadstart', handleLoadStart);

        return () => {
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadstart', handleLoadStart);
        };
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current || isLoading) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }, [isPlaying, isLoading]);

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !progressRef.current || isLoading) return;

        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }, [duration, isLoading]);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-lg dark:bg-gray-900/90 dark:border-gray-700/80 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-3">
                    {/* Play/Pause Button */}
                    <button
                        onClick={togglePlay}
                        disabled={isLoading}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isPlaying ? (
                            <Pause size={16} />
                        ) : (
                            <Play size={16} />
                        )}
                    </button>

                    {/* Progress and Time */}
                    <div className="flex-1 space-y-1">
                        {/* Progress Bar */}
                        <div
                            ref={progressRef}
                            onClick={handleProgressClick}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden"
                        >
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        {/* Time Display */}
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>

                {/* Hidden Audio Element */}
                <audio
                    ref={audioRef}
                    preload="metadata"
                >
                    <source src={props.audioUrl} type={props.mimeType} />
                </audio>
            </div>
        </div>
    );
}