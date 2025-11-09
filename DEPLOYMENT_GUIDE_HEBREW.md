# 🚀 מדריך העלאה מלא ל-Production - Hebrew Guide

מדריך מפורט בעברית להעלאת כל המערכת לייצור.

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [העלאת Frontend (React/Vite)](#1-העלאת-frontend-reactvite)
3. [העלאת Python API Server](#2-העלאת-python-api-server)
4. [העלאת Supabase Edge Functions](#3-העלאת-supabase-edge-functions)
5. [הגדרת משתני סביבה](#4-הגדרת-משתני-סביבה)
6. [בדיקות ופתרון בעיות](#5-בדיקות-ופתרון-בעיות)

---

## סקירה כללית

המערכת מורכבת מ-3 חלקים עיקריים:

1. **Frontend** - אפליקציית React (Vite) - מועלה ל-Vercel/Netlify
2. **Python API Server** - שרת yt-dlp - מועלה ל-VPS/Railway/Render
3. **Supabase Edge Functions** - פונקציות backend - מועלות דרך Supabase CLI

---

## 1. העלאת Frontend (React/Vite)

### אופציה A: Vercel (מומלץ)

#### שלב 1: הכנה מקומית

```bash
# ודא שהפרויקט בונה בהצלחה
npm run build

# בדוק שהבנייה עובדת
npm run preview
```

#### שלב 2: התקנת Vercel CLI

```bash
npm install -g vercel
```

#### שלב 3: התחברות ל-Vercel

```bash
vercel login
```

#### שלב 4: Deploy ראשוני

```bash
# בתיקיית הפרויקט
vercel
```

עקוב אחר ההוראות:
- Set up and deploy? **Y**
- Which scope? בחר את החשבון שלך
- Link to existing project? **N** (לפרויקט חדש)
- Project name? **yt-slice-and-voice** (או שם אחר)
- Directory? **./** (שורש הפרויקט)
- Override settings? **N**

#### שלב 5: הגדרת Environment Variables

1. היכנס ל-[Vercel Dashboard](https://vercel.com/dashboard)
2. בחר את הפרויקט
3. Settings → Environment Variables
4. הוסף את המשתנים הבאים:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_YOUTUBE_API_URL=https://your-youtube-server.com
VITE_YOUTUBE_API_KEY=your_api_key_here
```

**חשוב:** בחר **Production**, **Preview**, ו-**Development** לכל המשתנים.

#### שלב 6: Deploy ל-Production

```bash
vercel --prod
```

או דרך GitHub:
1. Push את הקוד ל-GitHub
2. חבר את ה-repo ל-Vercel
3. Vercel יעלה אוטומטית בכל push ל-main

---

### אופציה B: Netlify

#### שלב 1: הכנה מקומית

```bash
npm run build
```

#### שלב 2: התקנת Netlify CLI

```bash
npm install -g netlify-cli
```

#### שלב 3: התחברות

```bash
netlify login
```

#### שלב 4: Deploy ראשוני

```bash
netlify init
```

עקוב אחר ההוראות:
- Create & configure a new site? **Yes**
- Team: בחר את הצוות שלך
- Site name: **yt-slice-and-voice** (או שם אחר)
- Build command: **npm run build**
- Directory to deploy: **dist**

#### שלב 5: הגדרת Environment Variables

1. היכנס ל-[Netlify Dashboard](https://app.netlify.com)
2. Site settings → Build & deploy → Environment
3. הוסף את כל המשתנים (כמו ב-Vercel)

#### שלב 6: Deploy ל-Production

```bash
netlify deploy --prod
```

---

### אופציה C: GitHub Pages (סטטי)

```bash
# התקן את ה-plugin
npm install --save-dev gh-pages

# הוסף ל-package.json:
# "homepage": "https://yourusername.github.io/yt-slice-and-voice",
# "scripts": {
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d dist"
# }

npm run deploy
```

---

## 2. העלאת Python API Server

### אופציה A: VPS/Cloud Server (מומלץ ל-Production)

#### שלב 1: הכנת השרת

**דוגמה: DigitalOcean, AWS EC2, Google Cloud**

```bash
# התחבר לשרת
ssh root@your-server-ip

# עדכן את המערכת
sudo apt-get update && sudo apt-get upgrade -y

# התקן Python ו-FFmpeg
sudo apt-get install python3 python3-pip python3-venv ffmpeg nginx -y

# התקן certbot ל-HTTPS
sudo apt-get install certbot python3-certbot-nginx -y
```

#### שלב 2: העתקת הקבצים

**מהמחשב המקומי:**

```bash
# צור תיקייה על השרת
ssh root@your-server-ip "mkdir -p /opt/youtube-server"

# העתק את הקבצים
scp -r youtube_server/* root@your-server-ip:/opt/youtube-server/
```

**או דרך Git:**

```bash
# על השרת
cd /opt
git clone https://github.com/yourusername/yt-slice-and-voice.git
cd yt-slice-and-voice/youtube_server
```

#### שלב 3: התקנת התלויות

```bash
cd /opt/youtube-server

# צור סביבה וירטואלית
python3 -m venv venv

# הפעל את הסביבה
source venv/bin/activate

# התקן תלויות
pip install -r requirements.txt
```

#### שלב 4: הגדרת Environment Variables

```bash
# צור קובץ .env
nano .env
```

הוסף:

```env
API_KEY=your_very_secret_api_key_here
PORT=8000
COOKIES_FILE_PATH=/opt/youtube-server/cookies.txt
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-vercel-app.vercel.app
```

**חשוב:** צור את ה-API_KEY חזק (לפחות 32 תווים אקראיים).

#### שלב 5: יצירת Systemd Service

```bash
sudo nano /etc/systemd/system/youtube-server.service
```

הוסף:

```ini
[Unit]
Description=YouTube Downloader API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/youtube-server
Environment="PATH=/opt/youtube-server/venv/bin"
EnvironmentFile=/opt/youtube-server/.env
ExecStart=/opt/youtube-server/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

שמור וצא (`Ctrl+X`, `Y`, `Enter`).

#### שלב 6: הפעלת השירות

```bash
# טען את השירות
sudo systemctl daemon-reload

# הפעל את השירות
sudo systemctl enable youtube-server
sudo systemctl start youtube-server

# בדוק שהכל עובד
sudo systemctl status youtube-server

# צפה בלוגים
sudo journalctl -u youtube-server -f
```

#### שלב 7: הגדרת Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/youtube-server
```

הוסף:

```nginx
server {
    listen 80;
    server_name your-youtube-server.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

הפעל:

```bash
sudo ln -s /etc/nginx/sites-available/youtube-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### שלב 8: הגדרת HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d your-youtube-server.com
```

עקוב אחר ההוראות. Certbot יגדיר HTTPS אוטומטית.

---

### אופציה B: Railway (קל ומהיר)

#### שלב 1: הכנה

1. היכנס ל-[Railway.app](https://railway.app)
2. התחבר עם GitHub
3. New Project → Deploy from GitHub repo

#### שלב 2: הגדרת הפרויקט

1. בחר את ה-repo שלך
2. Root Directory: **youtube_server**
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### שלב 3: Environment Variables

ב-Railway Dashboard → Variables:

```env
API_KEY=your_secret_api_key
COOKIES_FILE_PATH=/app/cookies.txt
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

#### שלב 4: Deploy

Railway יעלה אוטומטית! קבל את ה-URL מה-Dashboard.

---

### אופציה C: Render

#### שלב 1: הכנה

1. היכנס ל-[Render.com](https://render.com)
2. New → Web Service
3. חבר את ה-GitHub repo

#### שלב 2: הגדרות

- **Name:** youtube-server
- **Environment:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** `youtube_server`

#### שלב 3: Environment Variables

```env
API_KEY=your_secret_api_key
COOKIES_FILE_PATH=/opt/render/project/src/cookies.txt
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

#### שלב 4: Deploy

Render יעלה אוטומטית!

---

### אופציה D: Docker (מומלץ ל-Production מתקדם)

#### שלב 1: צור Dockerfile

צור `youtube_server/Dockerfile`:

```dockerfile
FROM python:3.11-slim

# התקן FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# העתק requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# העתק את הקוד
COPY server.py .

# יצירת תיקייה ל-cookies
RUN mkdir -p /app/cookies

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### שלב 2: Build ו-Run

```bash
cd youtube_server

# Build
docker build -t youtube-server .

# Run
docker run -d \
  --name youtube-server \
  -p 8000:8000 \
  -e API_KEY=your_secret_api_key \
  -e ALLOWED_ORIGINS=https://your-frontend-domain.com \
  -v $(pwd)/cookies.txt:/app/cookies.txt \
  youtube-server
```

#### שלב 3: Deploy ל-Docker Hub / Cloud

```bash
# Tag
docker tag youtube-server yourusername/youtube-server:latest

# Push
docker push yourusername/youtube-server:latest

# Deploy ל-Cloud (AWS ECS, Google Cloud Run, וכו')
```

---

## 3. העלאת Supabase Edge Functions

### שלב 1: התקנת Supabase CLI

```bash
npm install -g supabase
```

או:

```bash
# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Mac (Homebrew)
brew install supabase/tap/supabase

# Linux
curl -fsSL https://supabase.com/install.sh | sh
```

### שלב 2: התחברות ל-Supabase

```bash
supabase login
```

עקוב אחר ההוראות בדפדפן.

### שלב 3: קישור לפרויקט

```bash
# בתיקיית הפרויקט
supabase link --project-ref your-project-ref
```

**איך למצוא את ה-project-ref:**
1. היכנס ל-Supabase Dashboard
2. Project Settings → General
3. Copy את ה-Reference ID

### שלב 4: Deploy כל ה-Functions

```bash
# Deploy כל ה-Functions בבת אחת
supabase functions deploy --all

# או Deploy אחד אחד:
supabase functions deploy download-youtube-video
supabase functions deploy get-youtube-info
supabase functions deploy identify-song
supabase functions deploy analyze-description
supabase functions deploy cut-video-segment
supabase functions deploy translate-subtitles
supabase functions deploy download-subtitle
supabase functions deploy search-subtitles
supabase functions deploy adjust-subtitle-timing
supabase functions deploy cleanup-expired-files
```

### שלב 5: הגדרת Environment Variables ב-Supabase

1. היכנס ל-Supabase Dashboard
2. Project Settings → Edge Functions → Secrets
3. הוסף את המשתנים הבאים:

```env
YOUTUBE_API_URL=https://your-youtube-server.com
YOUTUBE_API_KEY=your_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_for_shazam
LOVABLE_API_KEY=your_lovable_key_for_ai
```

**חשוב:** ודא שה-URLs הם **HTTPS** ב-production!

---

## 4. הגדרת משתני סביבה

### סיכום כל המשתנים שצריך להגדיר:

#### Frontend (Vercel/Netlify)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_YOUTUBE_API_URL=https://your-youtube-server.com
VITE_YOUTUBE_API_KEY=your_api_key_here
```

#### Python Server (.env או Environment Variables)

```env
API_KEY=your_very_secret_api_key_here
PORT=8000
COOKIES_FILE_PATH=/path/to/cookies.txt
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-vercel-app.vercel.app
```

#### Supabase Edge Functions (Dashboard → Secrets)

```env
YOUTUBE_API_URL=https://your-youtube-server.com
YOUTUBE_API_KEY=your_api_key_here
RAPIDAPI_KEY=your_rapidapi_key
LOVABLE_API_KEY=your_lovable_key
```

---

## 5. בדיקות ופתרון בעיות

### בדיקות בסיסיות

#### 1. בדיקת Frontend

```bash
# בדוק שהבנייה עובדת
npm run build
npm run preview

# פתח בדפדפן: http://localhost:4173
# בדוק:
# - האם האפליקציה נטענת?
# - האם יש שגיאות ב-Console?
# - האם ה-API calls עובדים?
```

#### 2. בדיקת Python Server

```bash
# בדוק שהשרת רץ
curl https://your-youtube-server.com/

# תגובה צריכה להיות:
# {"status":"ok","service":"YouTube Downloader API"}

# בדוק info endpoint
curl "https://your-youtube-server.com/info?video_id=dQw4w9WgXcQ"

# בדוק download endpoint (עם API Key)
curl -X POST https://your-youtube-server.com/download \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"video_id": "dQw4w9WgXcQ", "quality": "best"}'
```

#### 3. בדיקת Supabase Edge Functions

```bash
# Test locally
supabase functions serve download-youtube-video

# Test in production
curl https://your-project.supabase.co/functions/v1/download-youtube-video \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"videoId": "dQw4w9WgXcQ"}'
```

---

### פתרון בעיות נפוצות

#### בעיה 1: CORS Error

**תסמינים:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**פתרון:**
1. ודא ש-`ALLOWED_ORIGINS` ב-Python server כולל את הדומיין של ה-Frontend
2. ודא שה-URLs הם **HTTPS** ב-production
3. בדוק שה-CORS middleware מוגדר נכון ב-`server.py`

#### בעיה 2: API לא מגיב

**תסמינים:**
- Timeout errors
- 502 Bad Gateway
- Connection refused

**פתרון:**
1. בדוק שהשרת Python רץ: `sudo systemctl status youtube-server`
2. בדוק את הלוגים: `sudo journalctl -u youtube-server -f`
3. ודא שה-PORT נכון
4. בדוק שה-Firewall מאפשר את ה-PORT

#### בעיה 3: FFmpeg לא נמצא

**תסמינים:**
```
ERROR: ffmpeg not found
```

**פתרון:**
```bash
# התקן FFmpeg
sudo apt-get install ffmpeg

# או ב-Docker, ודא שה-Dockerfile כולל:
RUN apt-get update && apt-get install -y ffmpeg
```

#### בעיה 4: שגיאת API Key

**תסמינים:**
```
401 Unauthorized
Invalid API Key
```

**פתרון:**
1. ודא שה-API_KEY זהה ב-Python server וב-Supabase Edge Functions
2. ודא שה-Header נשלח נכון: `X-API-Key: your_key`
3. בדוק שאין רווחים או תווים מיוחדים ב-API_KEY

#### בעיה 5: Memory Issues

**תסמינים:**
- השרת קורס
- Out of memory errors

**פתרון:**
1. הגבל את גודל הקבצים
2. השתמש ב-streaming במקום הורדה מלאה
3. הגדל את ה-memory של השרת
4. השתמש ב-workers מרובים: `--workers 4`

---

## ✅ Checklist סופי לפני Production

### Frontend
- [ ] Build עובד: `npm run build`
- [ ] Preview עובד: `npm run preview`
- [ ] Environment Variables מוגדרים ב-Vercel/Netlify
- [ ] האפליקציה נטענת ב-production
- [ ] אין שגיאות ב-Console

### Python Server
- [ ] השרת רץ: `systemctl status youtube-server`
- [ ] FFmpeg מותקן: `ffmpeg -version`
- [ ] HTTPS מופעל (Let's Encrypt)
- [ ] CORS מוגדר נכון
- [ ] API Key מוגדר
- [ ] Environment Variables מוגדרים

### Supabase
- [ ] כל ה-Edge Functions מועלים: `supabase functions list`
- [ ] Environment Variables מוגדרים ב-Dashboard
- [ ] Database migrations רץ
- [ ] Storage buckets מוגדרים

### בדיקות פונקציונליות
- [ ] הורדת סרטון עובדת
- [ ] חיתוך עובד
- [ ] זיהוי שירים עובד
- [ ] מיזוג segments עובד
- [ ] תרגום כתוביות עובד

---

## 🎉 סיכום

אם עברת על כל השלבים למעלה, המערכת שלך אמורה לעבוד ב-production!

**זכור:**
- ✅ תמיד השתמש ב-HTTPS ב-production
- ✅ הגן על ה-API Keys שלך
- ✅ בדוק את הלוגים באופן קבוע
- ✅ הגדר Rate Limiting אם צריך
- ✅ גבה את הנתונים שלך

**קישורים שימושיים:**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

**תמיכה:**
אם נתקלת בבעיות, בדוק את הלוגים וצור issue ב-GitHub.

---

**בהצלחה! 🚀**

