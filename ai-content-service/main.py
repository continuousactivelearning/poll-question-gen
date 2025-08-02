from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import os
import tempfile
import shutil
from pathlib import Path
import asyncio
from typing import Optional, Dict, List, Any
import json
import logging
from contextlib import asynccontextmanager

# Import our service classes
from services.video_service import VideoService
from services.audio_service import AudioService
from services.transcription_service import TranscriptionService
from services.ai_content_service import AIContentService
from services.cleanup_service import CleanupService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global service instances
services: Dict[str, Any] = {
    'video_service': None,
    'audio_service': None,
    'transcription_service': None,
    'ai_content_service': None,
    'cleanup_service': None
}

def get_service(service_name: str):
    """Get service instance with error handling"""
    service = services.get(service_name)
    if service is None:
        raise HTTPException(status_code=500, detail=f"{service_name} not initialized")
    return service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        services['video_service'] = VideoService()
        services['audio_service'] = AudioService()
        services['transcription_service'] = TranscriptionService()
        services['ai_content_service'] = AIContentService()
        services['cleanup_service'] = CleanupService()
        
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Application shutting down")

app = FastAPI(
    title="Video Processing Microservice",
    description="Microservice for video processing, transcription, and AI content generation",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Service is running"}

@app.post("/download-video")
async def download_video_endpoint(youtube_url: str = Form(...)):
    """Download video from YouTube URL"""
    try:
        video_service = get_service('video_service')
        logger.info(f"Downloading video from: {youtube_url}")
        video_path = await video_service.download_video(youtube_url)
        return {"video_path": video_path, "message": "Video downloaded successfully"}
    except Exception as e:
        logger.error(f"Error downloading video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to download video: {str(e)}")

@app.post("/extract-audio")
async def extract_audio_endpoint(video_path: str = Form(...)):
    """Extract audio from video file"""
    try:
        audio_service = get_service('audio_service')
        logger.info(f"Extracting audio from: {video_path}")
        audio_path = await audio_service.extract_audio(video_path)
        return {"audio_path": audio_path, "message": "Audio extracted successfully"}
    except Exception as e:
        logger.error(f"Error extracting audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract audio: {str(e)}")

@app.post("/transcribe")
async def transcribe_endpoint(
    audio_path: str = Form(...),
    language: str = Form(default="English")
):
    """Transcribe audio file using fastest-whisper"""
    try:
        transcription_service = get_service('transcription_service') 
        logger.info(f"Transcribing audio: {audio_path} in language: {language}")
        transcript = await transcription_service.transcribe(audio_path, language)
        return {"transcript": transcript, "message": "Transcription completed successfully"}
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")

@app.post("/transcribe-upload")
async def transcribe_upload_endpoint(
    audio_file: UploadFile = File(...),
    language: str = Form(default="English")
):
    """Transcribe uploaded audio file"""
    temp_audio_path = None
    try:
        transcription_service = get_service('transcription_service')
        cleanup_service = get_service('cleanup_service')
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            shutil.copyfileobj(audio_file.file, tmp_file)
            temp_audio_path = tmp_file.name
        
        logger.info(f"Transcribing uploaded audio in language: {language}")
        transcript = await transcription_service.transcribe(temp_audio_path, language)
        
        return {"transcript": transcript, "message": "Transcription completed successfully"}
    except Exception as e:
        logger.error(f"Error transcribing uploaded audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")
    finally:
        # Cleanup temporary file
        if temp_audio_path and os.path.exists(temp_audio_path):
            cleanup_service = services.get('cleanup_service')
            if cleanup_service:
                await cleanup_service.cleanup([temp_audio_path])

@app.post("/segment-transcript")
async def segment_transcript_endpoint(
    transcript: str = Form(...),
    model: str = Form(default="gemma3"),
    desired_segments: int = Form(default=3)
):
    """Segment transcript into meaningful parts"""
    try:
        ai_content_service = get_service("ai_content_service")
        logger.info(f"Segmenting transcript with model: {model}")
        segments = await ai_content_service.segment_transcript(transcript, model, desired_segments)
        return {"segments": segments, "message": "Transcript segmented successfully"}
    except Exception as e:
        logger.error(f"Error segmenting transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to segment transcript: {str(e)}")

@app.post("/generate-questions")
async def generate_questions_endpoint(
    segments: str = Form(...),  # JSON string
    global_question_specification: str = Form(...),  # JSON string
    model: str = Form(default="gemma3")
):
    """Generate questions from transcript segments"""
    try:
        # Parse JSON strings
        segments_dict = json.loads(segments)
        question_specs = json.loads(global_question_specification)
        ai_content_service = get_service("ai_content_service")
        logger.info(f"Generating questions with model: {model}")
        questions = await ai_content_service.generate_questions({
            "segments": segments_dict,
            "globalQuestionSpecification": question_specs,
            "model": model
        })
        
        return {"questions": questions, "message": "Questions generated successfully"}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@app.post("/process-youtube-video")
async def process_youtube_video_endpoint(
    youtube_url: str = Form(...),
    language: str = Form(default="English"),
    model: str = Form(default="gemma3"),
    desired_segments: int = Form(default=3),
    global_question_specification: str = Form(...)  # JSON string
):
    """Complete pipeline: download video, extract audio, transcribe, segment, and generate questions"""
    video_path = None
    audio_path = None
    
    try:
        # Parse question specification
        question_specs = json.loads(global_question_specification)
        
        video_service = get_service('video_service')
        audio_service = get_service('audio_service')
        transcription_service = get_service('transcription_service')
        ai_content_service = get_service('ai_content_service')
        cleanup_service = get_service('cleanup_service')

        logger.info(f"Starting complete processing for: {youtube_url}")
        
        # Step 1: Download video
        logger.info("Step 1: Downloading video...")
        video_path = await video_service.download_video(youtube_url)
        
        # Step 2: Extract audio
        logger.info("Step 2: Extracting audio...")
        audio_path = await audio_service.extract_audio(video_path)
        
        # Step 3: Transcribe audio
        logger.info("Step 3: Transcribing audio...")
        transcript = await transcription_service.transcribe(audio_path, language)
        
        # Step 4: Segment transcript
        logger.info("Step 4: Segmenting transcript...")
        segments = await ai_content_service.segment_transcript(transcript, model, desired_segments)
        
        # Step 5: Generate questions
        logger.info("Step 5: Generating questions...")
        questions = await ai_content_service.generate_questions({
            "segments": segments,
            "globalQuestionSpecification": question_specs,
            "model": model
        })
        
        return {
            "transcript": transcript,
            "segments": segments,
            "questions": questions,
            "message": "Video processed successfully"
        }
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process video: {str(e)}")
    finally:
        # Cleanup temporary files
        cleanup_paths = []
        if audio_path:
            cleanup_paths.append(audio_path)
        if video_path:
            cleanup_paths.append(video_path)
        
        if cleanup_paths:
            await cleanup_service.cleanup(cleanup_paths)

@app.post("/cleanup")
async def cleanup_endpoint(paths: List[str] = Form(...)):
    """Cleanup specified file paths"""
    try:
        cleanup_service = get_service('cleanup_service')
        logger.info(f"Cleaning up paths: {paths}")
        await cleanup_service.cleanup(paths)
        return {"message": "Cleanup completed successfully"}
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to cleanup: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "localhost")
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server at http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)
