import os
import asyncio
import logging
import tempfile
import shutil
from pathlib import Path
from typing import Optional, List
from faster_whisper import WhisperModel
import time

logger = logging.getLogger(__name__)

class TranscriptionService:
    # Supported languages for transcription
    SUPPORTED_LANGUAGES = ['English', 'Hindi']
    
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "video_processing"
        self.temp_transcript_dir = self.temp_dir / "temp_transcripts"
        self.temp_transcript_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize faster-whisper model
        # You can change model size: tiny, base, small, medium, large-v1, large-v2, large-v3
        self.model_size = "small"
        self.model: Optional[WhisperModel] = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the faster-whisper model"""
        try:
            # Use GPU if available, otherwise CPU
            device = "cuda" if os.system("nvidia-smi") == 0 else "cpu"
            compute_type = "float16" if device == "cuda" else "int8"
            
            logger.info(f"Initializing faster-whisper model: {self.model_size} on {device}")
            self.model = WhisperModel(
                self.model_size, 
                device=device, 
                compute_type=compute_type
            )
            logger.info("faster-whisper model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize faster-whisper model: {str(e)}")
            raise Exception(f"Failed to initialize transcription model: {str(e)}")
        
    @property
    def _model(self) -> WhisperModel:
        if self.model is None:
           raise RuntimeError("Whisper model is not initialized.")
        return self.model

    def _is_language_supported(self, language: str) -> bool:
        """Check if the provided language is supported"""
        return language in self.SUPPORTED_LANGUAGES
    
    def _format_timestamp(self, seconds: float) -> str:
        """Convert seconds to MM:SS.mmm format"""
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes:02d}:{remaining_seconds:06.3f}"
    
    def _parse_segments_to_timestamp_format(self, segments) -> str:
        """Parse faster-whisper segments to desired timestamp format"""
        result = []
        
        for segment in segments:
            start_time = self._format_timestamp(segment.start)
            end_time = self._format_timestamp(segment.end)
            text = segment.text.strip()
            
            if text:
                result.append(f"[{start_time} --> {end_time}]  {text}")
        
        return '\n'.join(result)
    
    async def transcribe(self, audio_path: str, language: str = 'English') -> str:
        """
        Transcribe audio file using faster-whisper
        
        Args:
            audio_path: Path to input audio file (WAV format expected)
            language: Language for transcription (default: 'English')
            
        Returns:
            str: Transcribed text with timestamps
            
        Raises:
            Exception: If transcription fails
        """
        if not os.path.exists(audio_path):
            raise Exception(f"Input audio file not found: {audio_path}")
        
        # Validate language support
        if not self._is_language_supported(language):
            raise Exception(
                f"Unsupported language: {language}. Supported languages: {', '.join(self.SUPPORTED_LANGUAGES)}"
            )
        
        logger.info(f"Starting transcription of {audio_path} in language: {language}")
        
        try:
            # Map language names to whisper language codes
            language_code_map = {
                'English': 'en',
                'Hindi': 'hi'
            }
            
            language_code = language_code_map.get(language, 'en')
            
            # Run transcription in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            segments, info = await loop.run_in_executor(
                None,
                lambda: self._model.transcribe(
                    audio_path,
                    language=language_code,
                    beam_size=5,
                    word_timestamps=True,
                    vad_filter=True,
                    vad_parameters=dict(min_silence_duration_ms=500)
                )
            )
            
            # Convert segments to list for processing
            segments_list = list(segments)
            
            if not segments_list:
                logger.warning("No segments found in transcription")
                return ""
            
            # Format segments to desired timestamp format
            formatted_transcript = self._parse_segments_to_timestamp_format(segments_list)
            
            logger.info(f"Transcription completed successfully. Language detected: {info.language}, Probability: {info.language_probability:.2f}")
            
            return formatted_transcript
            
        except Exception as e:
            logger.error(f"Error during transcription: {str(e)}")
            raise Exception(f"Transcription failed: {str(e)}")
    
    async def transcribe_with_whisper_cli(self, audio_path: str, language: str = 'English') -> str:
        """
        Alternative method using Whisper CLI (kept for compatibility)
        This method is now deprecated in favor of faster-whisper
        """
        logger.warning("Using deprecated CLI method. Consider using the main transcribe method with faster-whisper")
        
        if not os.path.exists(audio_path):
            raise Exception(f"Input audio file not found: {audio_path}")
        
        if not self._is_language_supported(language):
            raise Exception(
                f"Unsupported language: {language}. Supported languages: {', '.join(self.SUPPORTED_LANGUAGES)}"
            )
        
        # Create temporary directory for this transcription
        timestamp = int(time.time() * 1000)
        temp_transcript_dir = self.temp_transcript_dir / str(timestamp)
        temp_transcript_dir.mkdir(exist_ok=True)
        
        try:
            audio_filename = Path(audio_path).stem
            expected_transcript_path = temp_transcript_dir / f"{audio_filename}.vtt"
            
            # Build whisper command
            command = [
                'whisper',
                audio_path,
                '--model', 'small',
                '--language', language,
                '--output_format', 'vtt',
                '--output_dir', str(temp_transcript_dir),
                '--verbose', 'False'
            ]
            
            logger.info(f"Executing Whisper CLI: {' '.join(command)}")
            
            # Execute command
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            # Check for errors
            if stderr and not os.path.exists(expected_transcript_path):
                error_msg = stderr.decode()
                logger.error(f"Whisper CLI stderr: {error_msg}")
                raise Exception(f"Whisper processing error: {error_msg}")
            
            if not os.path.exists(expected_transcript_path):
                error_msg = stderr.decode() if stderr else "Unknown error"
                logger.error(f"Whisper output file not found: {expected_transcript_path}. stderr: {error_msg}")
                raise Exception(f"Whisper output file not found. stderr: {error_msg}")
            
            # Read the VTT content
            with open(expected_transcript_path, 'r', encoding='utf-8') as f:
                vtt_content = f.read().strip()
            
            # Parse VTT to timestamp format
            formatted_transcript = self._parse_vtt_to_timestamp_format(vtt_content)
            
            logger.info("Whisper CLI transcription successful")
            return formatted_transcript
            
        except Exception as e:
            logger.error(f"Error during CLI transcription: {str(e)}")
            raise Exception(f"CLI Transcription failed: {str(e)}")
        finally:
            # Cleanup temporary directory
            if temp_transcript_dir.exists():
                try:
                    shutil.rmtree(temp_transcript_dir)
                    logger.info(f"Cleaned up temporary transcript directory: {temp_transcript_dir}")
                except Exception as cleanup_error:
                    logger.error(f"Failed to cleanup temporary transcript directory {temp_transcript_dir}: {cleanup_error}")
    
    def _parse_vtt_to_timestamp_format(self, vtt_content: str) -> str:
        """Parse VTT format to desired timestamp format (for CLI compatibility)"""
        lines = vtt_content.split('\n')
        result = []
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Look for timestamp lines (format: "00:00:00.000 --> 00:00:09.880")
            if ' --> ' in line:
                timestamp_line = line
                i += 1
                
                # Get text content (next non-empty lines)
                text_content = ''
                while i < len(lines) and lines[i].strip() != '':
                    if text_content:
                        text_content += ' '
                    text_content += lines[i].strip()
                    i += 1
                
                if text_content:
                    # Convert timestamp format from VTT (00:00:00.000) to desired format (00:00.000)
                    import re
                    converted_timestamp = re.sub(r'(\d{2}):(\d{2}):(\d{2}\.\d{3})', r'\2:\3', timestamp_line)
                    result.append(f"[{converted_timestamp}]  {text_content}")
            
            i += 1
        
        return '\n'.join(result)