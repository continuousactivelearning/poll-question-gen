import os
import asyncio
import logging
import tempfile
from pathlib import Path
from typing import Optional
import time

logger = logging.getLogger(__name__)

class AudioService:
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "video_processing"
        self.temp_audio_dir = self.temp_dir / "temp_audio"
        self.temp_audio_dir.mkdir(parents=True, exist_ok=True)
    
    async def extract_audio(self, video_path: str) -> str:
        """
        Extract audio from video file and convert to 16kHz, 1-channel WAV format
        
        Args:
            video_path: Path to input video file
            
        Returns:
            str: Path to processed audio file
            
        Raises:
            Exception: If FFmpeg processing fails
        """
        if not os.path.exists(video_path):
            raise Exception(f"Input video file not found: {video_path}")
        
        # Generate output filename
        video_name = Path(video_path).stem
        timestamp = int(time.time() * 1000)
        processed_audio_filename = f"{timestamp}_{video_name}_processed.wav"
        processed_audio_path = str(self.temp_audio_dir / processed_audio_filename)
        
        logger.info(f"Standardizing {video_path} to {processed_audio_path} (16kHz, 1-channel WAV)")
        
        try:
            # Build FFmpeg command
            command = [
                'ffmpeg',
                '-i', video_path,           # Input file
                '-vn',                      # No video
                '-acodec', 'pcm_s16le',    # Audio codec
                '-ar', '16000',             # Sample rate 16kHz
                '-ac', '1',                 # 1 channel (mono)
                '-y',                       # Overwrite output file
                processed_audio_path        # Output file
            ]
            
            logger.info(f"Executing FFmpeg command: {' '.join(command)}")
            
            # Execute command asynchronously
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                logger.error(f"FFmpeg error: {error_msg}")
                raise Exception(f"FFmpeg audio standardization failed: {error_msg}")
            
            if not os.path.exists(processed_audio_path):
                raise Exception(f"FFmpeg completed but output file not found: {processed_audio_path}")
            
            logger.info(f"FFmpeg standardization finished: {processed_audio_path}")
            
            # Clean up the original video file
            try:
                if os.path.exists(video_path):
                    os.remove(video_path)
                    logger.info(f"Cleaned up intermediate video file: {video_path}")
            except Exception as cleanup_err:
                logger.warning(f"Error deleting intermediate video file {video_path}: {cleanup_err}")
            
            return processed_audio_path
            
        except Exception as e:
            logger.error(f"Error during audio extraction: {str(e)}")
            # Clean up partially created audio file if it exists
            if os.path.exists(processed_audio_path):
                try:
                    os.remove(processed_audio_path)
                except:
                    pass
            raise Exception(f"FFmpeg audio extraction failed: {str(e)}")
    
    async def cleanup_audio(self, audio_path: str) -> None:
        """Clean up audio file"""
        try:
            if os.path.exists(audio_path):
                os.remove(audio_path)
                logger.info(f"Cleaned up audio file: {audio_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup audio file {audio_path}: {str(e)}")