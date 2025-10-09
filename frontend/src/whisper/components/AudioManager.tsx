import React, { JSX, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import Modal from "./modal/Modal";
import { UrlInput } from "./modal/UrlInput";
import AudioPlayer from "./AudioPlayer";
import Constants from "../../utils/Constants";
import { Transcriber } from "../../hooks/useTranscriber";
import AudioRecorder from "./AudioRecorder";
import api from "@/lib/api/api";
//import { t } from "node_modules/framer-motion/dist/types.d-D0HXPxHm";

// List of supported languages:
// https://help.openai.com/en/articles/7031512-whisper-api-faq
// https://github.com/openai/whisper/blob/248b6cb124225dd263bb9bd32d060b6517e067f8/whisper/tokenizer.py#L79
/*
const LANGUAGES = {
    en: "english",
    zh: "chinese",
    de: "german",
    es: "spanish/castilian",
    ru: "russian",
    ko: "korean",
    fr: "french",
    ja: "japanese",
    pt: "portuguese",
    tr: "turkish",
    pl: "polish",
    ca: "catalan/valencian",
    nl: "dutch/flemish",
    ar: "arabic",
    sv: "swedish",
    it: "italian",
    id: "indonesian",
    hi: "hindi",
    fi: "finnish",
    vi: "vietnamese",
    he: "hebrew",
    uk: "ukrainian",
    el: "greek",
    ms: "malay",
    cs: "czech",
    ro: "romanian/moldavian/moldovan",
    da: "danish",
    hu: "hungarian",
    ta: "tamil",
    no: "norwegian",
    th: "thai",
    ur: "urdu",
    hr: "croatian",
    bg: "bulgarian",
    lt: "lithuanian",
    la: "latin",
    mi: "maori",
    ml: "malayalam",
    cy: "welsh",
    sk: "slovak",
    te: "telugu",
    fa: "persian",
    lv: "latvian",
    bn: "bengali",
    sr: "serbian",
    az: "azerbaijani",
    sl: "slovenian",
    kn: "kannada",
    et: "estonian",
    mk: "macedonian",
    br: "breton",
    eu: "basque",
    is: "icelandic",
    hy: "armenian",
    ne: "nepali",
    mn: "mongolian",
    bs: "bosnian",
    kk: "kazakh",
    sq: "albanian",
    sw: "swahili",
    gl: "galician",
    mr: "marathi",
    pa: "punjabi/panjabi",
    si: "sinhala/sinhalese",
    km: "khmer",
    sn: "shona",
    yo: "yoruba",
    so: "somali",
    af: "afrikaans",
    oc: "occitan",
    ka: "georgian",
    be: "belarusian",
    tg: "tajik",
    sd: "sindhi",
    gu: "gujarati",
    am: "amharic",
    yi: "yiddish",
    lo: "lao",
    uz: "uzbek",
    fo: "faroese",
    ht: "haitian creole/haitian",
    ps: "pashto/pushto",
    tk: "turkmen",
    nn: "nynorsk",
    mt: "maltese",
    sa: "sanskrit",
    lb: "luxembourgish/letzeburgesch",
    my: "myanmar/burmese",
    bo: "tibetan",
    tl: "tagalog",
    mg: "malagasy",
    as: "assamese",
    tt: "tatar",
    haw: "hawaiian",
    ln: "lingala",
    ha: "hausa",
    ba: "bashkir",
    jw: "javanese",
    su: "sundanese",
};
*/
export enum AudioSource {
    URL = "URL",
    FILE = "FILE",
    RECORDING = "RECORDING",
}

export function AudioManager(props: {
    transcriber: Transcriber;
    enableLiveTranscription?: boolean;
    onLiveRecordingStart?: () => void;  
    onLiveRecordingStop?: () => void;   
}) {
    const [progress, setProgress] = useState<number | undefined>(undefined);
    const [audioData, setAudioData] = useState<
        | {
            buffer: AudioBuffer;
            url: string;
            source: AudioSource;
            mimeType: string;
        }
        | undefined
    >(undefined);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<
        string | undefined
    >(undefined);
    const [isLiveRecording, setIsLiveRecording] = useState(false);

    const isAudioLoading = progress !== undefined;
    const [isProcessing, setIsProcessing] = useState(false);

    const resetAudio = () => {
        setAudioData(undefined);
        setAudioDownloadUrl(undefined);
        setIsLiveRecording(false);
    };

    const setAudioFromDownload = async (
        data: ArrayBuffer,
        mimeType: string,
    ) => {
        const audioCTX = new AudioContext({
            sampleRate: Constants.SAMPLING_RATE,
        });
        const blobUrl = URL.createObjectURL(
            new Blob([data], { type: "audio/*" }),
        );
        const decoded = await audioCTX.decodeAudioData(data);
        setAudioData({
            buffer: decoded,
            url: blobUrl,
            source: AudioSource.URL,
            mimeType: mimeType,
        });
        setIsProcessing(true);
        props.transcriber.start(decoded);
    };

    const setAudioFromRecording = async (data: Blob) => {
        resetAudio();
        setProgress(0);
        const blobUrl = URL.createObjectURL(data);
        const fileReader = new FileReader();
        fileReader.onprogress = (event) => {
            setProgress(event.loaded / event.total || 0);
        };
        fileReader.onloadend = async () => {
            const audioCTX = new AudioContext({
                sampleRate: Constants.SAMPLING_RATE,
            });
            const arrayBuffer = fileReader.result as ArrayBuffer;
            const decoded = await audioCTX.decodeAudioData(arrayBuffer);
            setProgress(undefined);
            setAudioData({
                buffer: decoded,
                url: blobUrl,
                source: AudioSource.RECORDING,
                mimeType: data.type,
            });
            if (!props.enableLiveTranscription) {
                setIsProcessing(true);
                props.transcriber.start(decoded);
            }
        };
        fileReader.readAsArrayBuffer(data);
    };

    // Handle live audio streaming during recording
    const handleLiveAudioStream = (audioBuffer: AudioBuffer) => {
        setIsLiveRecording(true);
        props.transcriber.start(audioBuffer);
    };

    const downloadAudioFromUrl = async (
        requestAbortController: AbortController,
    ) => {
        if (audioDownloadUrl) {
            try {
                setAudioData(undefined);
                setProgress(0);
                const { data, headers } = (await axios.get(audioDownloadUrl, {
                    signal: requestAbortController.signal,
                    responseType: "arraybuffer",
                    onDownloadProgress(progressEvent) {
                        setProgress(progressEvent.progress || 0);
                    },
                })) as {
                    data: ArrayBuffer;
                    headers: { "content-type": string };
                };

                let mimeType = headers["content-type"];
                if (!mimeType || mimeType === "audio/wave") {
                    mimeType = "audio/wav";
                }
                setAudioFromDownload(data, mimeType);
            } catch (error) {
                console.log("Request failed or aborted", error);
            } finally {
                setProgress(undefined);
            }
        }
    };

    function isYouTubeUrl(url: string): boolean {
        return url.includes("youtube.com") || url.includes("youtu.be");
    }

    const handleYouTubeUrl = async (youtubeUrl: string) => {
        try {
            setAudioData(undefined);
            setProgress(0);

            const response: AxiosResponse<ArrayBuffer> = await api.get<ArrayBuffer>(
                `/livequizzes/rooms/youtube-audio`,
                {
                    params: { url: youtubeUrl },
                    responseType: "arraybuffer",
                    onDownloadProgress(progressEvent) {
                        setProgress(progressEvent.progress || 0);
                    },
                }
            );
            const data = response.data;
            // console.log("YouTube audio data received:", data);
            setProgress(undefined);
            setAudioFromDownload(data, "audio/mp3");
        } catch (err) {
            console.error("Failed to fetch YouTube audio:", err);
            setProgress(undefined);
        }
    };

    // When URL changes, download audio
    useEffect(() => {
        if (audioDownloadUrl) {
            const requestAbortController = new AbortController();
            downloadAudioFromUrl(requestAbortController);
            return () => {
                requestAbortController.abort();
            };
        }
    }, [audioDownloadUrl]);

    useEffect(() => {
        if (!props.transcriber.output?.isBusy) {
            setIsProcessing(false);
        }
    }, [props.transcriber.output?.isBusy]);

    return (
        <div className="flex flex-col items-center justify-start w-full max-w-2xl mx-auto mt-6 space-y-4 px-4">
            <div className="w-full rounded-lg bg-white dark:bg-slate-800 shadow-md ring-1 ring-slate-300 dark:ring-slate-700 p-4 space-y-4">
                <div className="flex flex-wrap justify-center items-center gap-4">
                    {/* <UrlTile
                        icon={<AnchorIcon />}
                        text={"From URL"}
                        onUrlUpdate={async (e) => {
                            props.transcriber.onInputChange();
                            if (isYouTubeUrl(e)) {
                                await handleYouTubeUrl(e);
                            } else {
                                setAudioDownloadUrl(e);
                            }
                        }}
                    /> */}
                    <FileTile
                        icon={<FolderIcon />}
                        text={"From file"}
                        onFileUpdate={(decoded, blobUrl, mimeType) => {
                            props.transcriber.onInputChange();
                            setAudioData({
                                buffer: decoded,
                                url: blobUrl,
                                source: AudioSource.FILE,
                                mimeType: mimeType,
                            });
                            setIsProcessing(true);
                            props.transcriber.start(decoded);
                        }}
                    />
                    {navigator.mediaDevices && (
                        <RecordTile
                            icon={<MicrophoneIcon />}
                            text={"Record"}
                            setAudioData={(e) => {
                                props.transcriber.onInputChange();
                                setAudioFromRecording(e);
                            }}
                            onAudioStream={
                                props.enableLiveTranscription
                                    ? handleLiveAudioStream
                                    : undefined
                            }
                            enableLiveTranscription={props.enableLiveTranscription}
                            onRecordingStart={props.onLiveRecordingStart}
                            onRecordingStop={props.onLiveRecordingStop}
                        />
                    )}
                </div>

                {<AudioDataBar progress={isAudioLoading ? progress : +!!audioData} />}
            </div>

            {audioData && (
                <div className="w-full max-w-xl">
                    <AudioPlayer
                        audioUrl={audioData.url}
                        mimeType={audioData.mimeType}
                    />
                </div>
            )}

            {(isProcessing || isLiveRecording) && (
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 mt-2">
                    <svg
                        className="animate-spin h-4 w-4 text-purple-600 dark:text-purple-400"
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
                    <span>
                        {isLiveRecording
                            ? "Live transcription in progress..."
                            : "Processing audio..."}
                    </span>
                </div>
            )}
        </div>
    );
}

function AudioDataBar(props: { progress: number }) {
    return <ProgressBar progress={`${Math.round(props.progress * 100)}%`} />;
}

function ProgressBar(props: { progress: string }) {
    return (
        <div className='w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700'>
            <div
                className='bg-blue-600 h-1 rounded-full transition-all duration-100'
                style={{ width: props.progress }}
            ></div>
        </div>
    );
}

function UrlTile(props: {
    icon: JSX.Element;
    text: string;
    onUrlUpdate: (url: string) => void;
}) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Tile icon={props.icon} text={props.text} onClick={() => setShowModal(true)} />
            <UrlModal
                show={showModal}
                onSubmit={(url) => {
                    props.onUrlUpdate(url);
                    setShowModal(false);
                }}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}

function UrlModal(props: {
    show: boolean;
    onSubmit: (url: string) => void;
    onClose: () => void;
}) {
    const [url, setUrl] = useState(Constants.DEFAULT_AUDIO_URL);

    return (
        <Modal
            show={props.show}
            title={"From URL"}
            content={
                <>
                    {"Enter the URL of the audio file you want to load."}
                    <UrlInput onChange={(e) => setUrl(e.target.value)} value={url} />
                </>
            }
            onClose={props.onClose}
            submitText={"Load"}
            onSubmit={() => props.onSubmit(url)}
        />
    );
}

function FileTile(props: {
    icon: JSX.Element;
    text: string;
    onFileUpdate: (decoded: AudioBuffer, blobUrl: string, mimeType: string) => void;
}) {
    let elem = document.createElement("input");
    elem.type = "file";
    elem.oninput = (event) => {
        let files = (event.target as HTMLInputElement).files;
        if (!files) return;

        const urlObj = URL.createObjectURL(files[0]);
        const mimeType = files[0].type;

        const reader = new FileReader();
        reader.addEventListener("load", async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            if (!arrayBuffer) return;

            const audioCTX = new AudioContext({
                sampleRate: Constants.SAMPLING_RATE,
            });

            const decoded = await audioCTX.decodeAudioData(arrayBuffer);
            props.onFileUpdate(decoded, urlObj, mimeType);
        });
        reader.readAsArrayBuffer(files[0]);
        elem.value = "";
    };

    return <Tile icon={props.icon} text={props.text} onClick={() => elem.click()} />;
}

function RecordTile(props: {
    icon: JSX.Element;
    text: string;
    setAudioData: (data: Blob) => void;
    onAudioStream?: (audioBuffer: AudioBuffer) => void;
    enableLiveTranscription?: boolean;
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
}) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Tile icon={props.icon} text={props.text} onClick={() => setShowModal(true)} />
            <RecordModal
                show={showModal}
                onSubmit={(data) => {
                    if (data) {
                        props.setAudioData(data);
                        setShowModal(false);
                    }
                }}
                onClose={() => setShowModal(false)}
                onAudioStream={props.onAudioStream}
                enableLiveTranscription={props.enableLiveTranscription}
                onRecordingStart={props.onRecordingStart}
                onRecordingStop={props.onRecordingStop}
            />
        </>
    );
}

function RecordModal(props: {
    show: boolean;
    onSubmit: (data: Blob | undefined) => void;
    onClose: () => void;
    onAudioStream?: (audioBuffer: AudioBuffer) => void;
    enableLiveTranscription?: boolean;
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
}) {
    const [audioBlob, setAudioBlob] = useState<Blob>();

    return (
        <Modal
            show={props.show}
            title={"From Recording"}
            content={
                <>
                    {"Record audio using your microphone"}
                    <AudioRecorder
                        onRecordingComplete={setAudioBlob}
                        onAudioStream={props.onAudioStream}
                        enableLiveTranscription={props.enableLiveTranscription}
                        // onRecordingStart={props.onRecordingStart}
                        // onRecordingStop={props.onRecordingStop}  
                    />
                </>
            }
            onClose={() => {
                props.onClose();
                setAudioBlob(undefined);
            }}
            submitText={"Load"}
            submitEnabled={audioBlob !== undefined}
            onSubmit={() => {
                props.onSubmit(audioBlob);
                setAudioBlob(undefined);
            }}
        />
    );
}

function Tile(props: { icon: JSX.Element; text?: string; onClick?: () => void }) {
    return (
        <button
            onClick={props.onClick}
            className='flex items-center justify-center rounded-lg p-2 bg-blue text-slate-500 dark:hover:text-gray-200 hover:text-gray-800 dark:hover:bg-gray-700  hover:bg-gray-100 transition-all duration-200'
        >
            <div className='w-7 h-7'>{props.icon}</div>
            {props.text && (
                <div className='ml-2 break-text text-center text-md w-30'>
                    {props.text}
                </div>
            )}
        </button>
    );
}

function AnchorIcon() {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' />
        </svg>
    );
}

function FolderIcon() {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776' />
        </svg>
    );
}

function MicrophoneIcon() {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z' />
        </svg>
    );
}

