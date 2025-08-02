import os
import asyncio
import logging
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from typing import Optional
import aiofiles
import subprocess
import tempfile

logger = logging.getLogger(__name__)

class VideoService:
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "video_processing"
        self.temp_dir.mkdir(exist_ok=True)
    
    async def download_video(self, youtube_url: str) -> str:
        """
        Download video from YouTube URL using yt-dlp
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            str: Path to downloaded video file
            
        Raises:
            Exception: If download fails or invalid URL
        """
        try:
            # Extract video ID from URL
            parsed_url = urlparse(youtube_url)
            if 'youtube.com' in parsed_url.netloc:
                video_id = parse_qs(parsed_url.query).get('v')
                if not video_id:
                    raise Exception('Invalid YouTube URL: Missing video ID')
                video_id = video_id[0]
            elif 'youtu.be' in parsed_url.netloc:
                video_id = parsed_url.path.lstrip('/')
                if not video_id:
                    raise Exception('Invalid YouTube URL: Missing video ID')
            else:
                raise Exception('Invalid YouTube URL: Not a YouTube URL')

            # Create videos directory
            videos_dir = self.temp_dir / "videos"
            videos_dir.mkdir(exist_ok=True)
            
            # Output template - let yt-dlp choose extension
            output_template = str(videos_dir / f"{video_id}.%(ext)s")
            
            # Format selector for HLS streams and separated video/audio
            format_selector = 'bv*[height<=720]+ba/bv*+ba/best'
            
            # Build yt-dlp command
            command = [
                'yt-dlp',
                '-f', format_selector,
                '--merge-output-format', 'mp4',
                '--no-playlist',
                '--hls-prefer-ffmpeg',
                '-o', output_template,
                youtube_url
            ]
            
            logger.info(f"Executing yt-dlp command: {' '.join(command)}")
            
            # Execute command asynchronously
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            # Log output
            if stdout:
                logger.info(f"yt-dlp stdout: {stdout.decode()}")
            if stderr:
                logger.info(f"yt-dlp stderr: {stderr.decode()}")
            
            if process.returncode != 0:
                raise Exception(f"yt-dlp failed with return code {process.returncode}: {stderr.decode()}")
            
            # Find the downloaded file
            downloaded_files = [f for f in videos_dir.iterdir() if f.name.startswith(video_id)]
            
            if not downloaded_files:
                files_in_dir = [f.name for f in videos_dir.iterdir()]
                logger.error(f"yt-dlp completed but no file found. Video ID: {video_id}. Files in directory: {files_in_dir}")
                raise Exception('Failed to download video: Output file not found after yt-dlp execution')
            
            final_path = str(downloaded_files[0])
            logger.info(f"Video downloaded successfully to {final_path}")
            return final_path
            
        except Exception as e:
            logger.error(f"Error downloading video: {str(e)}")
            raise Exception(f"Failed to download video: {str(e)}")
    
    async def cleanup_video(self, video_path: str) -> None:
        """Clean up video file"""
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
                logger.info(f"Cleaned up video file: {video_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup video file {video_path}: {str(e)}")