import axios, { AxiosError } from 'axios';
import { injectable } from 'inversify';
import { HttpError, InternalServerError } from 'routing-controllers';
import { questionSchemas } from '../schemas/index.js';
import { extractJSONFromMarkdown } from '../utils/extractJSONFromMarkdown.js';
import { cleanTranscriptLines } from '../utils/cleanTranscriptLines.js';

// --- Type Definitions ---
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
  private readonly ollimaApiBaseUrl = 'http://localhost:11434/api';
  private readonly llmApiUrl = `${this.ollimaApiBaseUrl}/generate`;

  // --- Segmentation Logic ---
  public async segmentTranscript(
    transcript: string,
    model = 'gemma3',
    desiredSegments = 3 // <-- make fallback segments configurable
  ): Promise<Record<string, string>> {
    if (!transcript?.trim()) {
      throw new HttpError(400, 'Transcript text is required and must be non-empty.');
    }

    console.log(`[segmentTranscript] Processing transcript length: ${transcript.length} chars, model: ${model}`);

    const prompt = `Analyze the following timed lecture transcript. Segment into meaningful subtopics (max ${desiredSegments} segments).
Format: each line as [start_time --> end_time] text OR start_time --> end_time text.
Response must be ONLY valid JSON array, no markdown, no explanation, no comments.
Use property name "transcript_lines" exactly.

Example:
[
  {
    "end_time": "01:30.000",
    "transcript_lines": ["00:00.000 --> 00:30.000 Text", "00:30.000 --> 01:30.000 More text"]
  }
]

Transcript:
${transcript}

JSON:`;

    let segments: TranscriptSegment[] = [];

    try {
      const response = await axios.post(this.llmApiUrl, {
        model,
        prompt,
        stream: false,
        options: { temperature: 0.1, top_p: 0.9 },
      });

      const generatedText = response.data?.response;
      if (typeof generatedText !== 'string') {
        throw new InternalServerError('Unexpected Ollima response format.');
      }

      console.log('[segmentTranscript] Response preview:', generatedText.slice(0, 300));

      let jsonToParse = '';
      try {
        const cleaned = extractJSONFromMarkdown(generatedText);
        const arrayMatch = cleaned.match(/\[[\s\S]*?\]/);
        jsonToParse = arrayMatch ? arrayMatch[0] : cleaned;

        const fixedJson = jsonToParse
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/}\s*{/g, '},{')
          .replace(/]\s*\[/g, '],[')
          .replace(/\s+/g, ' ')
          .trim();

        console.log('[segmentTranscript] Attempting to parse JSON...');
        segments = JSON.parse(fixedJson);

        if (!Array.isArray(segments) || segments.length === 0) {
          throw new Error('Parsed segments invalid or empty.');
        }

        segments.forEach((seg, idx) => {
          if (!seg.end_time || !Array.isArray(seg.transcript_lines)) {
            throw new Error(`Invalid segment at index ${idx}`);
          }
        });

        console.log(`[segmentTranscript] Successfully parsed ${segments.length} segments.`);
      } catch (parseError: any) {
        console.error('[segmentTranscript] JSON parse failed:', parseError.message);
        console.error('[segmentTranscript] Raw text preview:', generatedText.slice(0, 200));

        // Fallback segmentation
        console.log('[segmentTranscript] Using fallback segmentation...');
        const lines = transcript.split('\n').filter(line => line.trim() !== '');
        const desiredSegments = 3;
        const minLines = 8;
        segments = [];
        if (lines.length <= minLines) {
          // Transcript is very small → single segment
          const lastLine = lines[lines.length - 1] || '';
          const timeMatch = lastLine.match(/(\d{2}:\d{2}(?::\d{2})?\.\d{3})/g);
          const endTime = timeMatch && timeMatch.length > 0 ? timeMatch[timeMatch.length - 1] : '00:00.000';
          segments.push({
            end_time: endTime,
            transcript_lines: lines,
          });
          console.log(`[segmentTranscript] Small transcript detected. Created 1 segment with ${lines.length} lines.`);
        } else {
          // Larger transcript → split into segments with minLines
          const linesPerSegment = Math.max(minLines, Math.ceil(lines.length / desiredSegments));
          for (let i = 0; i < lines.length; i += linesPerSegment) {
            const segmentLines = lines.slice(i, i + linesPerSegment);
            const lastLine = segmentLines[segmentLines.length - 1] || '';
            const timeMatch = lastLine.match(/(\d{2}:\d{2}(?::\d{2})?\.\d{3})/g);
            const endTime = timeMatch && timeMatch.length > 0 ? timeMatch[timeMatch.length - 1] : `00:${String(i).padStart(2, '0')}.000`;
            segments.push({
              end_time: endTime,
              transcript_lines: segmentLines,
            });
          }
          console.log(`[segmentTranscript] Created ${segments.length} fallback segments.`);
        }
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('Ollima API error:', error.response?.data);
        throw new InternalServerError(`Ollima API error: ${(error.response?.data as any)?.error || error.message}`);
      }
      throw new InternalServerError(`Segmentation failed: ${error.message}`);
    }

    // Clean transcript lines and build final object
    const result: Record<string, string> = {};
    for (const seg of segments) {
      try {
        const clean = cleanTranscriptLines(seg.transcript_lines);
        if (clean?.trim()) {
          result[seg.end_time] = clean;
        }
      } catch (e) {
        console.warn(`[segmentTranscript] Failed cleaning segment ${seg.end_time}:`, e);
      }
    }

    console.log(`[segmentTranscript] Done. Returning ${Object.keys(result).length} segments.`);
    return result;
  }

  // --- Question Generation Logic ---
  private createQuestionPrompt(
    questionType: string,
    count: number,
    transcriptContent: string
  ): string {
    const base = `Based on the transcript below, generate ${count} question(s) of type ${questionType}.
Transcript:
${transcriptContent}

Each question:
- Should match transcript content
- isParameterized: false unless needed
`;

    const instructions: Record<string, string> = {
      SOL: 'Single correct answer MCQ, 3-4 incorrect options + explanations, 1 correct + explanation, timeLimitSeconds:60, points:5',
      SML: 'Multiple correct answers MCQ, ~2-3 incorrect + ~2-3 correct with explanations, timeLimitSeconds:90, points:8',
      OTL: 'Ordering question, 3-5 items with explanations, timeLimitSeconds:120, points:10',
      NAT: 'Numeric answer with value/range, timeLimitSeconds:90, points:6',
      DES: 'Descriptive answer, detailed solution, timeLimitSeconds:300, points:15'
    };

    return base + (instructions[questionType] || '');
  }

  public async generateQuestions(args: {
    segments: Record<string | number, string>;
    globalQuestionSpecification: QuestionSpec[];
    model?: string;
  }): Promise<GeneratedQuestion[]> {
    const { segments, globalQuestionSpecification, model = 'gemma3' } = args;

    if (!segments || Object.keys(segments).length === 0) {
      throw new HttpError(400, 'segments must be a non-empty object.');
    }
    if (!globalQuestionSpecification?.length || !Object.keys(globalQuestionSpecification[0] || {}).length) {
      throw new HttpError(400, 'globalQuestionSpecification must be a non-empty array with at least one spec.');
    }

    const questionSpecs = globalQuestionSpecification[0];
    const allQuestions: GeneratedQuestion[] = [];
    console.log(`[generateQuestions] Model: ${model}`);

    for (const rawSegmentId in segments) {
      const segmentId = String(rawSegmentId); // normalize
      const transcript = segments[segmentId];
      if (!transcript) continue;

      for (const [type, count] of Object.entries(questionSpecs)) {
        if (typeof count === 'number' && count > 0) {
          try {
            const schema = (questionSchemas as any)[type];
            if (!schema) console.warn(`[generateQuestions] No schema for type ${type}.`);

            const format = count === 1 ? schema : { type: 'array', items: schema, minItems: count, maxItems: count };
            const prompt = this.createQuestionPrompt(type, count, transcript);

            const response = await axios.post(this.llmApiUrl, {
              model,
              prompt,
              stream: false,
              format: schema ? format : undefined,
              options: { temperature: 0 }
            });

            const text = response.data?.response;
            if (typeof text !== 'string') {
              console.warn(`[generateQuestions] Unexpected response for type ${type}, segment ${segmentId}.`);
              continue;
            }

            const cleaned = extractJSONFromMarkdown(text);
            const parsed = JSON.parse(cleaned);
            const questions = Array.isArray(parsed) ? parsed : [parsed];

            questions.forEach(q => {
              q.segmentId = segmentId;
              q.questionType = type;
            });

            allQuestions.push(...questions);
            console.log(`[generateQuestions] Generated ${questions.length} ${type} questions for segment ${segmentId}`);
          } catch (e: any) {
            console.error(`[generateQuestions] Failed for type ${type}, segment ${segmentId}:`, e.message);
            if (axios.isAxiosError(e)) console.error('Ollima API error:', e.response?.data);
          }
        }
      }
    }

    console.log(`[generateQuestions] Done. Total questions: ${allQuestions.length}`);
    return allQuestions;
  }
}
