import axios, { AxiosResponse } from 'axios';
import { injectable } from 'inversify';
import { InternalServerError } from 'routing-controllers';
import * as fs from 'fs';
import FormData from 'form-data';

// Type definitions matching Python service responses
export interface VideoDownloadResponse {
    video_path: string;
    message: string;
}

export interface AudioExtractionResponse {
    audio_path: string;
    message: string;
}

export interface TranscriptionResponse {
    transcript: string;
    message: string;
}

export interface SegmentationResponse {
    segments: Record<string, string>;
    message: string;
}

export interface GeneratedQuestion {
    segmentId?: string;
    questionType?: string;
    questionText: string;
    options?: Array<{
        text: string;
        correct?: boolean;
        explanation?: string;
    }>;
    solution?: any;
    isParameterized?: boolean;
    timeLimitSeconds?: number;
    points?: number;
}

export interface QuestionGenerationResponse {
    questions: GeneratedQuestion[];
    segments?: Record<string, string>;
}

export interface CompleteProcessingResponse {
    transcript: string;
    segments: Record<string, string>;
    questions: GeneratedQuestion[];
    message: string;
}

export type QuestionType = 'SOL' | 'SML' | 'OTL' | 'NAT' | 'DES';
export type QuestionSpec = Partial<Record<QuestionType, number>>;

@injectable()
export class PythonMicroserviceClient {
    private readonly baseUrl: string;
    private readonly timeout: number = 300000; // 5 minutes timeout

    constructor() {
        // Set this to your Cloud Run service URL
        this.baseUrl = process.env.PYTHON_MICROSERVICE_URL || 'http://localhost:8000';
    }

    /**
     * Download video from YouTube URL
     */
    public async downloadVideo(youtubeUrl: string): Promise<VideoDownloadResponse> {
        try {
            const formData = new FormData();
            formData.append('youtube_url', youtubeUrl);

            const response: AxiosResponse<VideoDownloadResponse> = await axios.post(
                `${this.baseUrl}/download-video`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: this.timeout,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error downloading video:', error.response?.data || error.message);
            throw new InternalServerError(`Failed to download video: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Extract audio from video file
     */
    public async extractAudio(videoPath: string): Promise<AudioExtractionResponse> {
        try {
            const formData = new FormData();
            formData.append('video_path', videoPath);

            const response: AxiosResponse<AudioExtractionResponse> = await axios.post(
                `${this.baseUrl}/extract-audio`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: this.timeout,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error extracting audio:', error.response?.data || error.message);
            throw new InternalServerError(`Failed to extract audio: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Transcribe audio file using path
     */
    public async transcribe(audioPath: string, language: string = 'English'): Promise<TranscriptionResponse> {
        try {
            const formData = new FormData();
            formData.append('audio_path', audioPath);
            formData.append('language', language);

            const response: AxiosResponse<TranscriptionResponse> = await axios.post(
                `${this.baseUrl}/transcribe`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: this.timeout,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error transcribing audio:', error.response?.data || error.message);
            throw new InternalServerError(`Failed to transcribe audio: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Transcribe uploaded audio file
     */
    public async transcribeUpload(audioBuffer: Buffer, filename: string, language: string = 'English'): Promise<TranscriptionResponse> {
        try {
            const formData = new FormData();
            formData.append('audio_file', audioBuffer, {
                filename: filename,
                contentType: 'audio/wav'
            });
            formData.append('language', language);

            const response: AxiosResponse<TranscriptionResponse> = await axios.post(
                `${this.baseUrl}/transcribe-upload`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: this.timeout,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error transcribing uploaded audio:', error.response?.data || error.message);
            throw new InternalServerError(`Failed to transcribe uploaded audio: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Segment transcript into meaningful parts
     */
    public async segmentTranscript(
        transcript: string,
        model: string = 'gemma3',
        desiredSegments: number = 3
    ): Promise<SegmentationResponse> {
        try {
            const formData = new FormData();
            formData.append('transcript', transcript);
            formData.append('model', model);
            formData.append('desired_segments', desiredSegments.toString());

            const response: AxiosResponse<SegmentationResponse> = await axios.post(
                `${this.baseUrl}/segment-transcript`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: this.timeout,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error segmenting transcript:', error.response?.data || error.message);
            throw new InternalServerError(`Failed to segment transcript: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Generate questions from transcript segments
     */
    public async generateQuestions(args: {
        segments: Record<string | number, string>;
        globalQuestionSpecification: QuestionSpec[];
        model?: string;
    }): Promise<QuestionGenerationResponse> {
        try {
            const { segments, globalQuestionSpecification, model = 'gemma3' } = args;

            const formData = new FormData();
            formData.append('segments', JSON.stringify(segments));
            formData.append('global_question_specification', JSON.stringify(globalQuestionSpecification));
            formData.append('model', model);

            const response: AxiosResponse<QuestionGenerationResponse> = await axios.post(
                `${this.baseUrl}/generate-questions`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: this.timeout,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error generating questions:', error.response?.data || error.message);
            throw new InternalServerError(`Failed to generate questions: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Complete pipeline: process YouTube video end-to-end
     */
    public async processYouTubeVideo(args: {
        youtubeUrl: string;
        language?: string;
        model?: string;
        desiredSegments?: number;
        globalQuestionSpecification: QuestionSpec[];
    }): Promise<CompleteProcessingResponse> {
        try {
            const {
                youtubeUrl,
                language = 'English',
                model = 'gemma3',
                desiredSegments = 3,
                globalQuestionSpecification
            } = args;

            const formData = new FormData();
            formData.append('youtube_url', youtubeUrl);
            formData.append('language', language);
            formData.append('model', model);
            formData.append('desired_segments', desiredSegments.toString());
            formData.append('global_question_specification', JSON.stringify(globalQuestionSpecification));

            const response: AxiosResponse<CompleteProcessingResponse> = await axios.post(
                `${this.baseUrl}/process-youtube-video`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: this.timeout,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error processing YouTube video:', error.response?.data || error.message);
            throw new InternalServerError(`Failed to process YouTube video: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Cleanup specified file paths
     */
    public async cleanup(paths: string[]): Promise<void> {
        try {
            const formData = new FormData();
            paths.forEach(path => {
                formData.append('paths', path);
            });

            await axios.post(
                `${this.baseUrl}/cleanup`,
                formData,
                {
                    headers: formData.getHeaders(),
                    timeout: 30000, // 30 seconds timeout for cleanup
                }
            );
        } catch (error: any) {
            console.error('Error during cleanup:', error.response?.data || error.message);
            // Don't throw error for cleanup failures, just log them
        }
    }

    /**
     * Health check for the microservice
     */
    public async healthCheck(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, {
                timeout: 10000, // 10 seconds timeout
            });
            return response.status === 200;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}