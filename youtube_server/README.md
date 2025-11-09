# YouTube Downloader Server
# שרת Python עם yt-dlp להורדת סרטונים ולקבלת מידע

## התקנה

### 1. התקנת Python
ודא ש-Python 3.8+ מותקן:
```bash
python --version
```

### 2. יצירת סביבה וירטואלית (מומלץ)
```bash
cd youtube_server
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. התקנת תלויות
```bash
pip install -r requirements.txt
```

### 4. התקנת FFmpeg (נדרש ל-yt-dlp)
**Windows:**
- הורד מ: https://ffmpeg.org/download.html
- הוסף ל-PATH או שמור בתיקיית הפרויקט

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

## הפעלה

### שרת פיתוח
```bash
python server.py
```

או:
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### שרת פרודקשן
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4
```

## משתני סביבה

צור קובץ `.env` בתיקיית `youtube_server`:

```env
# API Key (אופציונלי - להגדרה ב-production)
API_KEY=your_secret_api_key_here

# Port (ברירת מחדל: 8000)
PORT=8000

# Cookies file path (אופציונלי - מומלץ ל-production)
# קרא את COOKIES_GUIDE.md לפרטים על איך להשיג cookies
COOKIES_FILE_PATH=/path/to/cookies.txt

# CORS Origins (ב-production, הגבל לכתובות ספציפיות)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

## Cookies - מתי צריך?

**yt-dlp לא תמיד דורש cookies**, אבל זה מומלץ/נדרש ל:

- ✅ סרטונים מוגבלים (Private, Members-only)
- ✅ איכויות גבוהות יותר
- ✅ הימנעות מ-rate limiting
- ✅ תוכן מוגבל לגיל

**ראה `COOKIES_GUIDE.md` לפרטים מלאים על איך להשיג ולהשתמש ב-cookies.**

## API Endpoints

### 1. קבלת מידע על סרטון
```
GET /info?url=https://www.youtube.com/watch?v=VIDEO_ID
```

או:
```
GET /info?video_id=VIDEO_ID
```

**תגובה:**
```json
{
  "id": "VIDEO_ID",
  "title": "שם הסרטון",
  "description": "תיאור הסרטון",
  "duration": 120,
  "duration_string": "2:00",
  "uploader": "שם הערוץ",
  "thumbnail": "https://...",
  "view_count": 1000,
  "like_count": 50,
  ...
}
```

### 2. הורדת סרטון
```
POST /download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "quality": "best",  // או "720p", "1080p", etc.
  "format": "mp4"     // או "webm"
}
```

### 3. הורדת סרטון עם streaming URL
```
POST /download-stream
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "quality": "best"
}
```

## שילוב עם הפרויקט

### הגדרת משתני סביבה בפרויקט הראשי
הוסף ל-`.env.local`:
```env
VITE_YOUTUBE_API_URL=http://localhost:8000
VITE_YOUTUBE_API_KEY=your_secret_api_key_here
```

### או שימוש דרך Supabase Edge Function
עדכן את `supabase/functions/download-youtube-video/index.ts` לקרוא לשרת Python במקום Invidious.

## הערות חשובות

1. **FFmpeg נדרש** - yt-dlp דורש FFmpeg למיזוג קבצי וידאו ואודיו
2. **דיסק** - ודא שיש מספיק מקום על הדיסק לסרטונים
3. **זכויות יוצרים** - ודא שאתה משתמש בהתאם לתנאי השימוש
4. **Rate Limiting** - שקול להוסיף rate limiting ב-production
5. **Security** - השתמש ב-API_KEY ב-production

## פתרון בעיות

### שגיאת FFmpeg לא נמצא
- ודא ש-FFmpeg מותקן וזמין ב-PATH
- או הוסף את הנתיב המלא ל-FFmpeg ב-ydl_opts

### שגיאת הורדה
- בדוק את החיבור לאינטרנט
- ודא שה-URL תקין
- חלק מהסרטונים עשויים להיות מוגבלים גיאוגרפית

### שגיאת זכרונות
- עבור סרטונים גדולים, השתמש ב-`/download-stream` במקום `/download`


