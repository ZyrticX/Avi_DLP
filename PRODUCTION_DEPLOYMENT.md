# מדריך פרודקשן - Production Deployment Guide

## ✅ האם זה יעבוד ב-Production?

**כן, אבל יש כמה דברים שצריך להגדיר!** 

המערכת תוכננה לעבוד ב-production, אבל יש כמה שלבים שצריך לבצע לפני העלאה.

---

## 📋 Checklist לפני העלאה ל-Production

### ✅ 1. Frontend (React/Vite)

#### משתני סביבה שצריך להגדיר:

**ב-Vercel/Netlify/פלטפורמה אחרת:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# אופציונלי - אם יש לך שרת Python נפרד
VITE_YOUTUBE_API_URL=https://your-youtube-server.com
VITE_YOUTUBE_API_KEY=your_api_key
```

**איך להגדיר ב-Vercel:**
1. היכנס ל-Dashboard → Project → Settings → Environment Variables
2. הוסף את כל המשתנים הנ"ל
3. בחר Production environment
4. שמור

**איך להגדיר ב-Netlify:**
1. Site settings → Build & deploy → Environment
2. הוסף את כל המשתנים
3. שמור

#### Build:
```bash
npm run build
```

הקובץ `dist/` מוכן לפרודקשן.

---

### ✅ 2. Supabase Edge Functions

#### משתני סביבה שצריך להגדיר ב-Supabase Dashboard:

1. היכנס ל-Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. הוסף את המשתנים הבאים:

```env
# חובה אם יש לך שרת Python
YOUTUBE_API_URL=https://your-youtube-server.com
YOUTUBE_API_KEY=your_api_key_here

# אופציונלי - אם אתה משתמש ב-Shazam לזיהוי שירים
RAPIDAPI_KEY=your_rapidapi_key

# אופציונלי - אם אתה משתמש ב-OpenSubtitles
OPENSUBTITLES_API_KEY=your_opensubtitles_key

# אופציונלי - אם אתה משתמש ב-Lovable API
LOVABLE_API_KEY=your_lovable_key
```

#### Deploy Edge Functions:
```bash
# התקן Supabase CLI אם לא מותקן
npm install -g supabase

# התחבר
supabase login

# קשר את הפרויקט
supabase link --project-ref your-project-ref

# Deploy את כל ה-Functions
supabase functions deploy download-youtube-video
supabase functions deploy get-youtube-info
supabase functions deploy identify-song
# ... וכל שאר ה-Functions
```

---

### ✅ 3. שרת Python (yt-dlp) - **הכי חשוב!**

#### אפשרויות Deploy:

#### **אופציה 1: VPS/Cloud Server (מומלץ)**

**למשל: DigitalOcean, AWS EC2, Google Cloud, Azure**

```bash
# התחבר לשרת
ssh user@your-server.com

# התקן Python ו-FFmpeg
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv ffmpeg -y

# העתק את הקבצים
scp -r youtube_server/* user@your-server.com:/opt/youtube-server/

# על השרת
cd /opt/youtube-server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# צור systemd service
sudo nano /etc/systemd/system/youtube-server.service
```

תוכן הקובץ:
```ini
[Unit]
Description=YouTube Downloader API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/youtube-server
Environment="PATH=/opt/youtube-server/venv/bin"
ExecStart=/opt/youtube-server/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# הפעל את השירות
sudo systemctl daemon-reload
sudo systemctl enable youtube-server
sudo systemctl start youtube-server

# בדוק שהכל עובד
sudo systemctl status youtube-server
```

#### **אופציה 2: Railway/Render/Fly.io**

**Railway:**
1. היכנס ל-[railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. בחר את תיקיית `youtube_server`
4. הגדר Environment Variables:
   - `API_KEY` (אופציונלי)
   - `PORT` (Railway יקבע אוטומטית)
5. Railway יתקין את הכל אוטומטית!

**Render:**
1. היכנס ל-[render.com](https://render.com)
2. New → Web Service
3. חבר את ה-GitHub repo
4. Root Directory: `youtube_server`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
7. הוסף Environment Variables

#### **אופציה 3: Docker (מומלץ ל-Production)**

צור `Dockerfile` ב-`youtube_server/`:

```dockerfile
FROM python:3.11-slim

# התקן FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**Deploy עם Docker:**
```bash
cd youtube_server
docker build -t youtube-server .
docker run -d -p 8000:8000 --env-file .env youtube-server
```

---

### ✅ 4. CORS Configuration

#### שרת Python - עדכן את ה-CORS:

```python
# ב-youtube_server/server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "https://your-vercel-app.vercel.app",
        # הוסף את כל הדומיינים שלך
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**או ב-Production, השתמש ב-Environment Variable:**
```python
import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### ✅ 5. Supabase Storage

#### ודא ש-Storage Bucket מוגדר:

1. היכנס ל-Supabase Dashboard → Storage
2. ודא שיש bucket בשם `temp-media`
3. הגדר Policies:
   - Public read access
   - Public upload (אם צריך)
   - Auto-delete after 24 hours

#### או הגדר ב-SQL:
```sql
-- ודא שהבאקט קיים
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temp-media',
  'temp-media',
  false,
  524288000,
  ARRAY['video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;
```

---

### ✅ 6. Database Migrations

#### ודא שכל ה-Migrations רץ:

```bash
supabase db push
```

או דרך Supabase Dashboard → SQL Editor → הרץ את כל ה-migrations.

---

## 🔒 אבטחה ב-Production

### 1. API Keys
- ✅ **אל תפרסם** API keys ב-GitHub
- ✅ השתמש ב-Environment Variables
- ✅ הגבל גישה ל-API עם API Key

### 2. Rate Limiting
מומלץ להוסיף Rate Limiting לשרת Python:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/download")
@limiter.limit("10/minute")  # 10 הורדות לדקה
async def download_video(...):
    ...
```

### 3. HTTPS
- ✅ **חובה** להשתמש ב-HTTPS ב-production
- ✅ Vercel/Netlify מספקים HTTPS אוטומטית
- ✅ השתמש ב-Let's Encrypt לשרת Python

---

## 🧪 בדיקות לפני Production

### 1. בדוק שהכל עובד:

```bash
# Frontend
npm run build
npm run preview

# בדוק שהכל נטען
# בדוק שהורדת סרטונים עובדת
# בדוק שחיתוך עובד
# בדוק שזיהוי שירים עובד
```

### 2. בדוק את שרת Python:

```bash
# בדוק שהשרת רץ
curl https://your-youtube-server.com/

# בדוק info endpoint
curl "https://your-youtube-server.com/info?video_id=VIDEO_ID"

# בדוק download endpoint
curl -X POST https://your-youtube-server.com/download \
  -H "Content-Type: application/json" \
  -d '{"video_id": "VIDEO_ID"}'
```

### 3. בדוק Edge Functions:

```bash
# Test locally
supabase functions serve download-youtube-video

# Test in production
curl https://your-project.supabase.co/functions/v1/download-youtube-video \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"videoId": "VIDEO_ID"}'
```

---

## 📊 Monitoring & Logs

### 1. Supabase Logs:
- Dashboard → Logs → Edge Functions
- בדוק שגיאות

### 2. Python Server Logs:
```bash
# אם זה systemd service
sudo journalctl -u youtube-server -f

# אם זה Docker
docker logs -f youtube-server
```

### 3. Frontend Errors:
- בדוק את Console ב-Browser DevTools
- בדוק את Network tab

---

## 🚀 שלבי Deploy

### שלב 1: Deploy Frontend
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# או דרך GitHub → Auto Deploy
```

### שלב 2: Deploy Python Server
```bash
# VPS
# עקוב אחר ההוראות למעלה

# Railway/Render
# עקוב אחר ההוראות למעלה
```

### שלב 3: Deploy Edge Functions
```bash
supabase functions deploy --all
```

### שלב 4: הגדר Environment Variables
- Frontend: Vercel/Netlify Dashboard
- Supabase: Supabase Dashboard → Edge Functions → Secrets
- Python Server: Environment Variables של הפלטפורמה

### שלב 5: בדוק הכל
- ✅ הורדת סרטון
- ✅ חיתוך
- ✅ זיהוי שיר
- ✅ מיזוג

---

## ❗ בעיות נפוצות

### 1. CORS Error
**פתרון:** ודא שה-CORS ב-Python server כולל את הדומיין שלך

### 2. API לא מגיב
**פתרון:** 
- בדוק שה-URL נכון
- בדוק שה-API Key נכון
- בדוק שה-Edge Function רץ

### 3. FFmpeg לא נמצא
**פתרון:** התקן FFmpeg על השרת:
```bash
sudo apt-get install ffmpeg
```

### 4. Memory Issues
**פתרון:** 
- הגבל גודל קבצים
- השתמש ב-streaming במקום הורדה מלאה
- הגדל את ה-memory של השרת

---

## ✅ סיכום

**כן, זה יעבוד ב-Production!** 

אבל צריך:
1. ✅ להגדיר Environment Variables
2. ✅ ל-Deploy את שרת Python
3. ✅ ל-Deploy את Edge Functions
4. ✅ להגדיר CORS נכון
5. ✅ לוודא ש-FFmpeg מותקן

**המערכת מוכנה ל-Production! 🚀**



