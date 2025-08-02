import json
import re
import logging
import asyncio
import os
from typing import Dict, List, Any, Optional, Union
import aiohttp
import math

logger = logging.getLogger(__name__)

class AIContentService:
    def __init__(self):
        # Configuration - these should be set via environment variables in production
        self.ollama_server_ip = os.getenv('AI_SERVER_IP', 'localhost')
        self.ollama_server_port = os.getenv('AI_SERVER_PORT', '11434')
        self.ollama_api_base_url = f"http://{self.ollama_server_ip}:{self.ollama_server_port}/api"
        self.llm_api_url = f"{self.ollama_api_base_url}/generate"
        
        # Proxy configuration if needed
        self.proxy_address = os.getenv('PROXY_ADDRESS')
        
        # Session for HTTP requests
        self.session = None
    
    async def __aenter__(self):
        connector = None
        if self.proxy_address:
            # For SOCKS proxy support, you might need aiohttp-socks
            connector = aiohttp.TCPConnector()
        
        self.session = aiohttp.ClientSession(connector=connector)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def _extract_json_from_markdown(self, text: str) -> str:
        """Extract JSON from markdown code blocks"""
        # Remove markdown code blocks
        text = re.sub(r'```(?:json)?\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        return text.strip()
    
    def _clean_transcript_lines(self, transcript_lines: List[str]) -> str:
        """Clean and join transcript lines"""
        cleaned_lines = []
        for line in transcript_lines:
            line = line.strip()
            if line:
                # Remove timestamp markers if present
                line = re.sub(r'^\[[\d:.\-\s>]+\]\s*', '', line)
                cleaned_lines.append(line)
        return ' '.join(cleaned_lines)
    
    async def segment_transcript(
        self, 
        transcript: str, 
        model: str = 'gemma3', 
        desired_segments: int = 3
    ) -> Dict[str, str]:
        """
        Segment transcript into meaningful subtopics
        
        Args:
            transcript: The transcript text to segment
            model: LLM model to use
            desired_segments: Number of desired segments
            
        Returns:
            Dict[str, str]: Dictionary with end_time as key and transcript content as value
        """
        if not transcript or not transcript.strip():
            raise ValueError('Transcript text is required and must be non-empty.')
        
        logger.info(f"Processing transcript length: {len(transcript)} chars, model: {model}")
        
        prompt = f"""Analyze the following timed lecture transcript. Segment into meaningful subtopics (max {desired_segments} segments).
Format: each line as [start_time --> end_time] text OR start_time --> end_time text.
Response must be ONLY valid JSON array, no markdown, no explanation, no comments.
Use property name "transcript_lines" exactly.

Example:
[
  {{
    "end_time": "01:30.000",
    "transcript_lines": ["00:00.000 --> 00:30.000 Text", "00:30.000 --> 01:30.000 More text"]
  }}
]

Transcript:
{transcript}

JSON:"""
        
        segments = []
        
        try:
            # Prepare request data
            request_data = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "top_p": 0.9
                }
            }
            
            # Make API request
            if not self.session:
                async with aiohttp.ClientSession() as session:
                    async with session.post(self.llm_api_url, json=request_data) as response:
                        response_data = await response.json()
            else:
                async with self.session.post(self.llm_api_url, json=request_data) as response:
                    response_data = await response.json()
            
            generated_text = response_data.get('response')
            if not isinstance(generated_text, str):
                raise Exception('Unexpected Ollama response format.')
            
            logger.info(f"Response preview: {generated_text[:300]}")
            
            # Parse JSON response
            try:
                cleaned = self._extract_json_from_markdown(generated_text)
                array_match = re.search(r'\[[\s\S]*?\]', cleaned)
                json_to_parse = array_match.group(0) if array_match else cleaned
                
                # Fix common JSON issues
                fixed_json = re.sub(r',\s*([}\]])', r'\1', json_to_parse)
                fixed_json = re.sub(r'}\s*{', r'},{', fixed_json)
                fixed_json = re.sub(r']\s*\[', r'],[', fixed_json)
                fixed_json = re.sub(r'\s+', ' ', fixed_json).strip()
                
                logger.info("Attempting to parse JSON...")
                segments = json.loads(fixed_json)
                
                if not isinstance(segments, list) or len(segments) == 0:
                    raise ValueError('Parsed segments invalid or empty.')
                
                # Validate segments
                for idx, seg in enumerate(segments):
                    if 'end_time' not in seg or 'transcript_lines' not in seg:
                        raise ValueError(f'Invalid segment at index {idx}')
                    if not isinstance(seg['transcript_lines'], list):
                        raise ValueError(f'Invalid transcript_lines at index {idx}')
                
                logger.info(f"Successfully parsed {len(segments)} segments.")
                
            except (json.JSONDecodeError, ValueError) as parse_error:
                logger.error(f"JSON parse failed: {parse_error}")
                logger.error(f"Raw text preview: {generated_text[:200]}")
                
                # Fallback segmentation
                logger.info("Using fallback segmentation...")
                segments = self._create_fallback_segments(transcript, desired_segments)
                
        except Exception as error:
            logger.error(f"Ollama API error: {error}")
            raise Exception(f"Segmentation failed: {str(error)}")
        
        # Clean transcript lines and build final result
        result = {}
        for seg in segments:
            try:
                clean_content = self._clean_transcript_lines(seg['transcript_lines'])
                if clean_content and clean_content.strip():
                    result[seg['end_time']] = clean_content
            except Exception as e:
                logger.warning(f"Failed cleaning segment {seg.get('end_time', 'unknown')}: {e}")
        
        logger.info(f"Done. Returning {len(result)} segments.")
        return result
    
    def _create_fallback_segments(self, transcript: str, desired_segments: int = 3) -> List[Dict[str, Any]]:
        """Create fallback segments when AI segmentation fails"""
        lines = [line.strip() for line in transcript.split('\n') if line.strip()]
        min_lines = 8
        segments = []
        
        if len(lines) <= min_lines:
            # Small transcript - single segment
            last_line = lines[-1] if lines else ""
            time_match = re.findall(r'(\d{2}:\d{2}(?::\d{2})?\.\d{3})', last_line)
            end_time = time_match[-1] if time_match else '00:00.000'
            
            segments.append({
                "end_time": end_time,
                "transcript_lines": lines
            })
            logger.info(f"Small transcript detected. Created 1 segment with {len(lines)} lines.")
        else:
            # Larger transcript - split into segments
            lines_per_segment = max(min_lines, math.ceil(len(lines) / desired_segments))
            
            for i in range(0, len(lines), lines_per_segment):
                segment_lines = lines[i:i + lines_per_segment]
                last_line = segment_lines[-1] if segment_lines else ""
                time_match = re.findall(r'(\d{2}:\d{2}(?::\d{2})?\.\d{3})', last_line)
                end_time = time_match[-1] if time_match else f"00:{str(i).zfill(2)}.000"
                
                segments.append({
                    "end_time": end_time,
                    "transcript_lines": segment_lines
                })
            
            logger.info(f"Created {len(segments)} fallback segments.")
        
        return segments
    
    def _create_question_prompt(self, question_type: str, count: int, transcript_content: str) -> str:
        """Create prompt for question generation"""
        base = f"""You are an AI question generator.
Based on the transcript below, generate {count} question(s) of type {question_type}.
For each question:
- Provide exactly 4 options only.
- Mark the correct option.

You must output JSON **exactly** in this shape, no nesting, no markdown:
[
  {{
    "questionText": "...",
    "options": [
      {{"text": "...", "correct": true, "explanation": "..." }},
      {{"text": "...", "correct": false, "explanation": "..." }}
    ],
    "solution": "...",
    "isParameterized": false,
    "timeLimitSeconds": 60,
    "points": 5
  }}
]
Do not wrap questionText inside another 'question' object. Output must be raw JSON.

Important:
- Output only JSON, no markdown, no extra text.
- Each question must have at least 4 options.
- Only one option can have "correct": true for SOL.
- Fill all fields.
- questionText must be clear and relevant to transcript.
- explanation field must explain why the option is correct/incorrect.

Transcript:
{transcript_content}

"""
        
        instructions = {
            'SOL': 'Generate single-correct MCQ as above. timeLimitSeconds:60, points:5',
            'SML': 'Multiple-correct MCQ, 2-3 correct:true, timeLimitSeconds:90, points:8',
            'OTL': 'Ordering question, with options in correct order, timeLimitSeconds:120, points:10',
            'NAT': 'Numeric answer with value, timeLimitSeconds:90, points:6',
            'DES': 'Descriptive answer, detailed solution, timeLimitSeconds:300, points:15'
        }
        
        return base + instructions.get(question_type, '')
    
    async def generate_questions(self, args: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate questions from transcript segments
        
        Args:
            args: Dictionary containing:
                - segments: Dict of segment_id -> transcript content
                - globalQuestionSpecification: List of question specifications
                - model: LLM model to use (optional)
                
        Returns:
            List[Dict]: List of generated questions
        """
        segments = args.get('segments', {})
        global_question_specification = args.get('globalQuestionSpecification', [])
        model = args.get('model', 'gemma3')
        
        if not segments or len(segments) == 0:
            raise ValueError('segments must be a non-empty object.')
        
        if not global_question_specification or len(global_question_specification) == 0:
            raise ValueError('globalQuestionSpecification must be a non-empty array with at least one spec.')
        
        question_specs = global_question_specification[0]
        all_questions = []
        
        logger.info(f"Model: {model}")
        
        for raw_segment_id, transcript in segments.items():
            segment_id = str(raw_segment_id)
            if not transcript:
                continue
            
            for question_type, count in question_specs.items():
                if isinstance(count, int) and count > 0:
                    try:
                        prompt = self._create_question_prompt(question_type, count, transcript)
                        
                        request_data = {
                            "model": model,
                            "prompt": prompt,
                            "stream": False,
                            "options": {"temperature": 0.2}
                        }
                        
                        # Make API request
                        if not self.session:
                            async with aiohttp.ClientSession() as session:
                                async with session.post(self.llm_api_url, json=request_data) as response:
                                    response_data = await response.json()
                        else:
                            async with self.session.post(self.llm_api_url, json=request_data) as response:
                                response_data = await response.json()
                        logger.info(f"Ollama raw response for {question_type}, segment {segment_id}: {response_data}")
                        text = response_data.get('response')
                        if not isinstance(text, str):
                             logger.warning(f"Model response for type {question_type}, segment {segment_id} was not a string: {text}")
                             continue 
                        if not text.strip().startswith('['):
                            logger.warning(f"Response does not appear to be valid JSON array. Text: {text[:200]}")
                        
                        cleaned = self._extract_json_from_markdown(text)
                        parsed = json.loads(cleaned)
                        questions = parsed if isinstance(parsed, list) else [parsed]
                        
                        # Process and add questions
                        for q in questions:
                            question_text = q.get('question', {}).get('text') or q.get('questionText', '')
                            options = []
                            
                            # Extract options from various formats
                            if 'solution' in q and 'incorrectLotItems' in q['solution']:
                                options = [
                                    {
                                        'text': item['text'],
                                        'correct': False,
                                        'explanation': item.get('explaination') or item.get('explanation', '')
                                    }
                                    for item in q['solution']['incorrectLotItems']
                                ]
                            
                            if 'solution' in q and 'correctLotItem' in q['solution']:
                                correct_item = q['solution']['correctLotItem']
                                options.append({
                                    'text': correct_item['text'],
                                    'correct': True,
                                    'explanation': correct_item.get('explaination') or correct_item.get('explanation', '')
                                })
                            
                            # Use options directly if available
                            if 'options' in q:
                                options = q['options']
                            
                            processed_question = {
                                'questionText': question_text,
                                'options': options,
                                'solution': q.get('solution', ''),
                                'isParameterized': q.get('question', {}).get('isParameterized', False),
                                'timeLimitSeconds': q.get('question', {}).get('timeLimitSeconds', 60),
                                'points': q.get('question', {}).get('points', 5),
                                'segmentId': segment_id,
                                'questionType': question_type
                            }
                            
                            all_questions.append(processed_question)
                        
                        logger.info(f"Generated {len(questions)} {question_type} questions for segment {segment_id}")
                        logger.info(f"Raw LLM text for type {question_type}, segment {segment_id}: {text[:500]}")
                        
                    except Exception as e:
                        logger.error(f"Failed for type {question_type}, segment {segment_id}: {str(e)}")
        
        logger.info(f"Done. Total questions: {len(all_questions)}")
        return all_questions