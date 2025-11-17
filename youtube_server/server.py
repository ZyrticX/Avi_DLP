"""
YouTube Downloader API Server
שרת Python עם yt-dlp להורדת סרטונים ולקבלת מידע
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import yt_dlp
import os
import tempfile
import uvicorn
from pathlib import Path

app = FastAPI(title="YouTube Downloader API", version="1.0.0")

# CORS middleware
# ב-production, השתמש ב-ALLOWED_ORIGINS environment variable
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
if ALLOWED_ORIGINS == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ב-production, הגבל לכתובות ספציפיות
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key (אופציונלי - להגדרה ב-env)
API_KEY = os.getenv("API_KEY", "")

# Cookies file path (אופציונלי - להגדרה ב-env)
COOKIES_FILE_PATH = os.getenv("COOKIES_FILE_PATH", "")

def get_ydl_opts_base():
    """הגדרות בסיסיות ל-yt-dlp"""
    opts = {
        'quiet': True,
        'no_warnings': True,
    }
    
    # הוסף cookies אם קיים
    if COOKIES_FILE_PATH and os.path.exists(COOKIES_FILE_PATH):
        opts['cookies'] = COOKIES_FILE_PATH
        print(f"Using cookies file: {COOKIES_FILE_PATH}")
    
    return opts


class VideoInfoRequest(BaseModel):
    url: str
    video_id: Optional[str] = None


class DownloadRequest(BaseModel):
    url: Optional[str] = None
    video_id: Optional[str] = None
    quality: Optional[str] = "best"
    format: Optional[str] = "mp4"


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """אימות API Key (אופציונלי)"""
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return True


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "YouTube Downloader API"}


@app.get("/info")
async def get_video_info(url: Optional[str] = None, video_id: Optional[str] = None):
    """
    קבלת מידע על סרטון YouTube
    Parameters:
    - url: קישור לסרטון YouTube
    - video_id: (אופציונלי) ID של הסרטון
    """
    try:
        # אם יש video_id, נבנה את ה-URL
        if video_id and not url:
            url = f"https://www.youtube.com/watch?v={video_id}"
        
        if not url:
            raise HTTPException(status_code=400, detail="URL or video_id is required")

        # הגדרות yt-dlp לקבלת מידע בלבד (ללא הורדה)
        ydl_opts = get_ydl_opts_base()
        ydl_opts['extract_flat'] = False

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)
            
            # חילוץ המידע הרלוונטי
            video_info = {
                'id': info_dict.get('id', ''),
                'title': info_dict.get('title', ''),
                'description': info_dict.get('description', ''),
                'duration': info_dict.get('duration', 0),
                'duration_string': info_dict.get('duration_string', ''),
                'uploader': info_dict.get('uploader', ''),
                'uploader_id': info_dict.get('uploader_id', ''),
                'upload_date': info_dict.get('upload_date', ''),
                'view_count': info_dict.get('view_count', 0),
                'like_count': info_dict.get('like_count', 0),
                'thumbnail': info_dict.get('thumbnail', ''),
                'webpage_url': info_dict.get('webpage_url', ''),
                'formats_count': len(info_dict.get('formats', [])),
                'categories': info_dict.get('categories', []),
                'tags': info_dict.get('tags', []),
            }

            return JSONResponse(content=video_info)

    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=400, detail=f"Error extracting video info: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/download")
async def download_video(request: DownloadRequest, x_api_key: Optional[str] = Header(None, alias="X-API-Key")):
    """
    הורדת סרטון YouTube
    Parameters:
    - url: קישור לסרטון YouTube
    - video_id: (אופציונלי) ID של הסרטון
    - quality: איכות הסרטון (best, worst, 1080p, 720p, etc.)
    - format: פורמט הקובץ (mp4, webm, etc.)
    """
    print(f"[download] Received request: video_id={request.video_id}, url={request.url}, quality={request.quality}")
    
    # Verify API key if configured
    if API_KEY:
        if x_api_key != API_KEY:
            print(f"[download] Invalid API Key provided (expected: {API_KEY[:10]}..., got: {x_api_key[:10] if x_api_key else 'None'}...)")
            raise HTTPException(status_code=401, detail="Invalid API Key")
        print(f"[download] API Key verified")
    else:
        print(f"[download] No API Key configured, skipping verification")
    
    try:
        # אם יש video_id, נבנה את ה-URL
        if request.video_id and not request.url:
            request.url = f"https://www.youtube.com/watch?v={request.video_id}"
        
        if not request.url:
            raise HTTPException(status_code=400, detail="URL or video_id is required")
        
        print(f"[download] Using URL: {request.url}")

        # יצירת תיקייה זמנית להורדה
        temp_dir = tempfile.mkdtemp()
        output_template = os.path.join(temp_dir, '%(title)s.%(ext)s')

        # הגדרות yt-dlp להורדה
        ydl_opts = get_ydl_opts_base()
        ydl_opts.update({
            'format': request.quality or 'best',
            'outtmpl': output_template,
        })

        # אם מבקשים פורמט ספציפי
        if request.format:
            if request.format == 'mp4':
                ydl_opts['format'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
            elif request.format == 'webm':
                ydl_opts['format'] = 'bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]/best'
            else:
                ydl_opts['format'] = f'best[ext={request.format}]/best'

        downloaded_file = None
        video_title = "video"

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # ראשית, נקבל את שם הסרטון
            print(f"[download] Extracting info for: {request.url}")
            info_dict = ydl.extract_info(request.url, download=False)
            video_title = info_dict.get('title', 'video')
            print(f"[download] Video title: {video_title}")
            
            # עכשיו נוריד את הסרטון
            print(f"[download] Starting download...")
            ydl.download([request.url])
            print(f"[download] Download completed!")

            # נמצא את הקובץ שהורד
            downloaded_files = list(Path(temp_dir).glob('*'))
            if downloaded_files:
                downloaded_file = downloaded_files[0]

        if not downloaded_file or not downloaded_file.exists():
            raise HTTPException(status_code=500, detail="Failed to download video")

        # נקרא את הקובץ ונשלח אותו
        def generate():
            try:
                with open(downloaded_file, 'rb') as f:
                    while chunk := f.read(8192):
                        yield chunk
            finally:
                # נקה את הקובץ לאחר שליחה
                try:
                    if downloaded_file and downloaded_file.exists():
                        os.remove(downloaded_file)
                    if os.path.exists(temp_dir):
                        os.rmdir(temp_dir)
                except Exception as cleanup_error:
                    print(f"Cleanup error: {cleanup_error}")

        # קביעת שם הקובץ
        safe_title = "".join(c for c in video_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"{safe_title}.{downloaded_file.suffix[1:]}" if downloaded_file.suffix else f"{safe_title}.mp4"

        return StreamingResponse(
            generate(),
            media_type='video/mp4',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"',
                'X-Video-Title': video_title,
            }
        )

    except yt_dlp.utils.DownloadError as e:
        print(f"[download] DownloadError: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error downloading video: {str(e)}")
    except Exception as e:
        print(f"[download] Exception: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"[download] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/download-stream")
async def download_video_stream(request: DownloadRequest):
    """
    הורדת סרטון YouTube כסטרימינג (לסרטונים גדולים)
    """
    try:
        if request.video_id and not request.url:
            request.url = f"https://www.youtube.com/watch?v={request.video_id}"
        
        if not request.url:
            raise HTTPException(status_code=400, detail="URL or video_id is required")

        # קבלת מידע על הסרטון
        ydl_opts_info = get_ydl_opts_base()

        with yt_dlp.YoutubeDL(ydl_opts_info) as ydl:
            info_dict = ydl.extract_info(request.url, download=False)
            video_title = info_dict.get('title', 'video')
            
            # מציאת הפורמט הטוב ביותר
            formats = info_dict.get('formats', [])
            best_format = None
            
            if request.quality == 'best':
                # מציאת הפורמט הטוב ביותר עם וידאו ואודיו
                best_format = next(
                    (f for f in formats if f.get('vcodec') != 'none' and f.get('acodec') != 'none'),
                    formats[-1] if formats else None
                )
            else:
                # חיפוש לפי quality label
                best_format = next(
                    (f for f in formats if f.get('quality_label') == request.quality),
                    formats[-1] if formats else None
                )

            if not best_format or not best_format.get('url'):
                raise HTTPException(status_code=400, detail="Could not find suitable format")

            # החזרת URL ישיר לסטרימינג
            return JSONResponse(content={
                'stream_url': best_format['url'],
                'title': video_title,
                'format': best_format.get('format_id', ''),
                'filesize': best_format.get('filesize', 0),
                'duration': info_dict.get('duration', 0),
            })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

