import axios from 'axios';
import { injectable } from 'inversify';
import { HttpError, InternalServerError } from 'routing-controllers';
import { extractJSONFromMarkdown } from '../utils/extractJSONFromMarkdown.js';
import { cleanTranscriptLines } from '../utils/cleanTranscriptLines.js';

export interface TranscriptSegment {
  end_time: string;
  transcript_lines: string[];
}

export interface GeneratedQuestion {
  segmentId?: string;
  questionType?: string;
  questionText: string;
  options?: Array<{ text: string; correct?: boolean; explanation?: string }>;
  solution?: any;
  isParameterized?: boolean;
  timeLimitSeconds?: number;
  points?: number;
}

type QuestionType = 'SOL' | 'SML' | 'OTL' | 'NAT' | 'DES';
type QuestionSpec = Partial<Record<QuestionType, number>>;

@injectable()
export class AIContentService {
  private readonly ollamaApiUrl = 'http://localhost:11434/api/generate';

  // --- Segmentation ---
  public async segmentTranscript(
    transcript: string,
    model = 'gemma3',
    desiredSegments = 3
  ): Promise<Record<string, string>> {
    if (!transcript?.trim()) {
      throw new HttpError(400, 'Transcript is empty.');
    }

    // Early fallback: very small transcript
    if (transcript.length < 300) {
      console.log('[segmentTranscript] Small transcript detected → fallback segmentation.');
      return this.fallbackSegmentation(transcript, desiredSegments);
    }

    const prompt = `Analyze the transcript below and segment into ~${desiredSegments} subtopics.
Return ONLY JSON array: [{"end_time": "...", "transcript_lines": ["..."]}].
NO markdown, NO text before or after JSON.

Transcript:
${transcript}`;

    try {
      const response = await axios.post(this.ollamaApiUrl, {
        model,
        prompt,
        stream: false,
      });

      const text = response.data?.response;
      console.log('[segmentTranscript] Response preview:', text?.slice(0, 200));

      const cleaned = extractJSONFromMarkdown(text);
      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) throw new Error('Parsed segments not array.');

      // Validate segments
      parsed.forEach((seg, idx) => {
        if (!seg.end_time || !Array.isArray(seg.transcript_lines)) {
          throw new Error(`Invalid segment at index ${idx}`);
        }
      });

      console.log(`[segmentTranscript] Parsed ${parsed.length} segments.`);

      // Clean transcript lines
      const result: Record<string, string> = {};
      for (const seg of parsed) {
        const clean = cleanTranscriptLines(seg.transcript_lines);
        if (clean?.trim()) {
          result[seg.end_time] = clean;
        }
      }

      return result;

    } catch (err: any) {
      console.error('[segmentTranscript] LLM call failed:', err.message);
      if (axios.isAxiosError(err)) console.error('API error details:', err.response?.data);
      console.log('[segmentTranscript] Using fallback segmentation.');
      return this.fallbackSegmentation(transcript, desiredSegments);
    }
  }

  private fallbackSegmentation(transcript: string, desiredSegments: number): Record<string, string> {
    const lines = transcript.split('\n').filter(l => l.trim());
    const segments: Record<string, string> = {};

    const linesPerSegment = Math.ceil(lines.length / desiredSegments);
    for (let i = 0; i < lines.length; i += linesPerSegment) {
      const segLines = lines.slice(i, i + linesPerSegment);
      const text = segLines.join(' ');
      const segId = `seg_${i / linesPerSegment + 1}`;
      segments[segId] = text;
    }

    console.log(`[fallbackSegmentation] Created ${Object.keys(segments).length} segments.`);
    return segments;
  }

  // --- Question Generation ---
  private createQuestionPrompt(type: string, count: number, transcript: string): string {
    const instructions: Record<string, string> = {
      SOL: 'Single correct MCQ, 3-4 incorrect + explanation, 1 correct + explanation, timeLimitSeconds:60, points:5',
      SML: 'Multiple correct MCQ, ~2-3 correct + ~2-3 incorrect, explanations, timeLimitSeconds:90, points:8',
      OTL: 'Ordering question, 3-5 items, explanations, timeLimitSeconds:120, points:10',
      NAT: 'Numeric answer with value/range, timeLimitSeconds:90, points:6',
      DES: 'Descriptive answer, detailed solution, timeLimitSeconds:300, points:15',
    };
    return `Based on transcript below, generate ${count} question(s) of type ${type}.
Return ONLY JSON array of question objects. NO markdown.

Transcript:
${transcript}

Each question:
- Should be related to transcript
- Fields: questionText, options (if any), solution, isParameterized:false, timeLimitSeconds, points
${instructions[type] || ''}`;
  }

  public async generateQuestions(args: {
    segments: Record<string | number, string>;
    globalQuestionSpecification: QuestionSpec[];
    model?: string;
  }): Promise<GeneratedQuestion[]> {
    const { segments, globalQuestionSpecification, model = 'gemma3' } = args;
    const questionSpecs = globalQuestionSpecification[0];
    const allQuestions: GeneratedQuestion[] = [];

    for (const segmentId in segments) {
      const transcript = segments[segmentId];
      for (const [type, count] of Object.entries(questionSpecs)) {
        if (!count || count <= 0) continue;

        try {
          const prompt = this.createQuestionPrompt(type, count, transcript);

          const response = await axios.post(this.ollamaApiUrl, {
            model,
            prompt,
            stream: false,
          });

          const text = response.data?.response;
          console.log(`[generateQuestions] Response preview:`, text?.slice(0, 200));

          const cleaned = extractJSONFromMarkdown(text);
          const parsed = JSON.parse(cleaned);
          const questions = Array.isArray(parsed) ? parsed : [parsed];

          questions.forEach(q => {
            q.segmentId = segmentId;
            q.questionType = type;
          });

          allQuestions.push(...questions);
          console.log(`[generateQuestions] Added ${questions.length} ${type} question(s) for segment ${segmentId}`);
        } catch (e: any) {
          console.error(`[generateQuestions] Failed for type ${type}, segment ${segmentId}:`, e.message);
          if (axios.isAxiosError(e)) console.error('API error details:', e.response?.data);
        }
      }
    }

    console.log(`[generateQuestions] Total generated: ${allQuestions.length}`);
    return allQuestions;
  }
}
