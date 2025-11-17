# 📦 מדריך התקנה מלא - YouTube Slice and Voice

מדריך מפורט להתקנת כל רכיבי המערכת מקומית.

---

## 📋 תוכן עניינים

1. [דרישות מקדימות](#דרישות-מקדימות)
2. [התקנת Frontend](#התקנת-frontend)
3. [התקנת Python Server (yt-dlp)](#התקנת-python-server-yt-dlp)
4. [התקנת Supabase](#התקנת-supabase)
5. [הגדרת משתני סביבה](#הגדרת-משתני-סביבה)
6. [הפעלת המערכת](#הפעלת-המערכת)
7. [בדיקת התקנה](#בדיקת-התקנה)
8. [פתרון בעיות](#פתרון-בעיות)

---

## 🔧 דרישות מקדימות

### חובה

- **Node.js 18+** - [הורדה](https://nodejs.org/)
  ```bash
  node --version  # צריך להציג v18.0.0 או גבוה יותר
  ```

- **npm או yarn** - מגיע עם Node.js
  ```bash
  npm --version
  ```

- **Python 3.8+** - [הורדה](https://www.python.org/downloads/)
  ```bash
  python --version  # צריך להציג Python 3.8.0 או גבוה יותר
  ```

- **FFmpeg** - נדרש לעיבוד וידאו
  - **Windows**: [הורדה](https://ffmpeg.org/download.html) והוסף ל-PATH
  - **Linux**: `sudo apt-get install ffmpeg`
  - **Mac**: `brew install ffmpeg`
  
  בדיקה:
  ```bash
  ffmpeg -version
  ```

- **Git** - [הורדה](https://git-scm.com/downloads)
  ```bash
  git --version
  ```

### אופציונלי (מומלץ)

- **Supabase CLI** - להפעלה מקומית של Supabase
  ```bash
  npm install -g supabase
  ```

- **Visual Studio Code** - עורך קוד מומלץ

---

## 🎨 התקנת Frontend

### שלב 1: שכפול הפרויקט

```bash
# שכפול מהמאגר
git clone https://github.com/ZyrticX/Avi_DLP.git
cd Avi_DLP

# או אם כבר יש לך את הפרויקט
cd yt-slice-and-voice
```

### שלב 2: התקנת תלויות

```bash
# התקנת כל התלויות
npm install

# זה יקח כמה דקות...
```

### שלב 3: יצירת קובץ משתני סביבה

צור קובץ `.env.local` בתיקיית השורש:

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# Linux/Mac
touch .env.local
```

ערוך את הקובץ והוסף:

```env
# Supabase Configuration (חובה)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# YouTube API (אופציונלי - אם יש שרת Python מקומי)
VITE_YOUTUBE_API_URL=http://localhost:8000
VITE_YOUTUBE_API_KEY=your_api_key_here
```

> **💡 טיפ:** אם אין לך עדיין Supabase, דלג על זה כרגע וחזור לזה אחרי שתסיים את התקנת Supabase.

### שלב 4: בדיקת התקנה

```bash
# הפעלת שרת פיתוח
npm run dev
```

אם הכל תקין, תראה:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

פתח את הדפדפן בכתובת `http://localhost:5173` - האפליקציה אמורה להיטען.

> **✅ הצלחה:** אם האפליקציה נטענת, Frontend מותקן בהצלחה!

---

## 🐍 התקנת Python Server (yt-dlp)

### שלב 1: נווט לתיקיית השרת

```bash
cd youtube_server
```

### שלב 2: יצירת סביבה וירטואלית

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

> **💡 טיפ:** אחרי ההפעלה תראה `(venv)` בתחילת השורה - זה אומר שהסביבה הוירטואלית פעילה.

### שלב 3: התקנת תלויות

```bash
# התקנת כל החבילות הנדרשות
pip install -r requirements.txt
```

זה יתקין:
- `fastapi` - מסגרת עבודה ל-API
- `uvicorn` - שרת ASGI
- `yt-dlp` - ספרייה להורדת סרטונים
- `python-dotenv` - ניהול משתני סביבה

### שלב 4: יצירת קובץ משתני סביבה

צור קובץ `.env` בתיקיית `youtube_server`:

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

ערוך את הקובץ:

```env
# API Key (אופציונלי - מומלץ ל-production)
API_KEY=your_very_secret_api_key_here_min_32_chars

# Port (ברירת מחדל: 8000)
PORT=8000

# CORS Origins (ב-production, הגבל לכתובות ספציפיות)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080

# Cookies file path (אופציונלי - רק אם יש לך cookies)
# COOKIES_FILE_PATH=/path/to/cookies.txt
```

**יצירת API Key חזק:**
```bash
# Linux/Mac
openssl rand -hex 32

# או Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### שלב 5: בדיקת התקנה

```bash
# הפעלת השרת
python server.py
```

אם הכל תקין, תראה:
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

פתח דפדפן בכתובת `http://localhost:8000` - אמור להופיע:
```json
{"status": "ok", "message": "YouTube Downloader API"}
```

> **✅ הצלחה:** אם אתה רואה את ההודעה, השרת Python מותקן בהצלחה!

### שלב 6: בדיקת API

פתח טרמינל נוסף ובדוק:

```bash
# בדיקת health check
curl http://localhost:8000

# בדיקת info endpoint (החלף VIDEO_ID ב-ID אמיתי)
curl "http://localhost:8000/info?video_id=dQw4w9WgXcQ"
```

---

## ☁️ התקנת Supabase

### אפשרות 1: Supabase Cloud (מומלץ להתחלה)

1. **היכנס ל-[Supabase](https://supabase.com)**
2. **צור חשבון** (אם אין לך)
3. **צור פרויקט חדש:**
   - לחץ על "New Project"
   - בחר שם לפרויקט
   - בחר סיסמה למסד הנתונים
   - בחר אזור (מומלץ: קרוב אליך)
   - לחץ "Create new project"

4. **קבל את ה-API Keys:**
   - לך ל-Project Settings → API
   - העתק:
     - **Project URL** → זה ה-`VITE_SUPABASE_URL`
     - **anon public key** → זה ה-`VITE_SUPABASE_PUBLISHABLE_KEY`

5. **עדכן את `.env.local`:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### אפשרות 2: Supabase Local (מתקדם)

```bash
# התקנת Supabase CLI
npm install -g supabase

# התחברות ל-Supabase
supabase login

# אתחול פרויקט מקומי
supabase init

# הפעלת Supabase מקומית
supabase start
```

> **💡 טיפ:** עבור רוב המשתמשים, Supabase Cloud הוא הקל ביותר.

### הגדרת Edge Functions

1. **היכנס ל-Supabase Dashboard**
2. **לך ל-Edge Functions → Create Function**
3. **העלה את כל ה-Functions:**
   ```bash
   # מהתיקייה הראשית של הפרויקט
   cd supabase/functions
   
   # העלה כל function בנפרד
   supabase functions deploy download-youtube-video
   supabase functions deploy get-youtube-info
   supabase functions deploy identify-song
   # ... וכו'
   ```

   או העלה הכל בבת אחת:
   ```bash
   supabase functions deploy --all
   ```

### הגדרת משתני סביבה ב-Supabase

1. **היכנס ל-Supabase Dashboard**
2. **לך ל-Project Settings → Edge Functions → Secrets**
3. **הוסף את המשתנים הבאים:**

   ```env
   # אם יש שרת Python
   YOUTUBE_API_URL=http://localhost:8000
   YOUTUBE_API_KEY=your_api_key_here
   
   # לזיהוי שירים (Shazam)
   RAPIDAPI_KEY=your_rapidapi_key_here
   
   # לניתוח AI (אופציונלי)
   LOVABLE_API_KEY=your_lovable_key_here
   ```

> **⚠️ חשוב:** ב-production, החלף `http://localhost:8000` בכתובת ה-production של שרת Python!

---

## ⚙️ הגדרת משתני סביבה

### סיכום כל המשתנים

#### Frontend (`.env.local`)

```env
# Supabase (חובה)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# YouTube API (אופציונלי)
VITE_YOUTUBE_API_URL=http://localhost:8000
VITE_YOUTUBE_API_KEY=your_api_key_here
```

#### Python Server (`youtube_server/.env`)

```env
# API Key (מומלץ)
API_KEY=your_very_secret_api_key_here_min_32_chars

# Port
PORT=8000

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Cookies (אופציונלי)
# COOKIES_FILE_PATH=/path/to/cookies.txt
```

#### Supabase (Dashboard → Secrets)

```env
# YouTube API
YOUTUBE_API_URL=http://localhost:8000
YOUTUBE_API_KEY=your_api_key_here

# Shazam (אופציונלי)
RAPIDAPI_KEY=your_rapidapi_key_here

# AI (אופציונלי)
LOVABLE_API_KEY=your_lovable_key_here
```

> **📖 לפרטים נוספים:** ראה `ENVIRONMENT_VARIABLES.md`

---

## 🚀 הפעלת המערכת

### סדר הפעלה מומלץ

#### 1. הפעל את שרת Python

```bash
cd youtube_server
source venv/bin/activate  # או venv\Scripts\activate ב-Windows
python server.py
```

**ודא שהשרת רץ:**
- פתח `http://localhost:8000` בדפדפן
- אמור להופיע: `{"status": "ok"}`

#### 2. הפעל את Frontend

פתח טרמינל חדש:

```bash
# מהתיקייה הראשית
npm run dev
```

**ודא שהאפליקציה רצה:**
- פתח `http://localhost:5173` בדפדפן
- האפליקציה אמורה להיטען

#### 3. בדוק את Supabase

- ודא שהפרויקט פעיל ב-Supabase Dashboard
- ודא שה-Edge Functions מועלים ופועלים

---

## ✅ בדיקת התקנה

### בדיקה מהירה

1. **Frontend רץ?**
   - פתח `http://localhost:5173`
   - אמור לראות את האפליקציה

2. **Python Server רץ?**
   - פתח `http://localhost:8000`
   - אמור לראות: `{"status": "ok"}`

3. **Supabase מחובר?**
   - בדוק ב-Console של הדפדפן (F12)
   - אין שגיאות Supabase

### בדיקה מלאה

#### בדיקת הורדת סרטון

1. פתח את האפליקציה ב-`http://localhost:5173`
2. הכנס קישור YouTube
3. לחץ על "הורד"
4. בדוק שהסרטון מתחיל להוריד

#### בדיקת חיתוך

1. לאחר שהסרטון נטען
2. צור קטע חדש
3. הגדר זמן התחלה וסיום
4. לחץ על "חתוך"
5. בדוק שהקטע נחתך בהצלחה

#### בדיקת זיהוי שירים

1. בחר קטע
2. לחץ על "זהה שיר"
3. בדוק שהשיר מזוהה (או לפחות שהבקשה נשלחת)

---

## 🔧 פתרון בעיות

### בעיה: Frontend לא נטען

**תסמינים:**
- שגיאת 404 או דף ריק
- שגיאות ב-Console

**פתרונות:**
```bash
# נקה cache
rm -rf node_modules
rm package-lock.json
npm install

# בדוק את משתני הסביבה
cat .env.local

# הפעל מחדש
npm run dev
```

### בעיה: Python Server לא מתחיל

**תסמינים:**
- שגיאת `ModuleNotFoundError`
- שגיאת `port already in use`

**פתרונות:**
```bash
# ודא שהסביבה הוירטואלית פעילה
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# התקן מחדש תלויות
pip install -r requirements.txt

# בדוק שהפורט פנוי
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -i :8000

# שנה פורט ב-.env
PORT=8001
```

### בעיה: FFmpeg לא נמצא

**תסמינים:**
- שגיאת `ffmpeg: command not found`
- שגיאות בעיבוד וידאו

**פתרונות:**

**Windows:**
1. הורד FFmpeg מ-[כאן](https://ffmpeg.org/download.html)
2. חלץ לתיקייה (למשל `C:\ffmpeg`)
3. הוסף ל-PATH:
   - לחץ ימני על "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - הוסף `C:\ffmpeg\bin` ל-Path

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

**בדיקה:**
```bash
ffmpeg -version
```

### בעיה: yt-dlp לא מוריד סרטונים

**תסמינים:**
- שגיאת `ERROR: Video unavailable`
- שגיאת `Private video`

**פתרונות:**
```bash
# עדכן את yt-dlp
pip install --upgrade yt-dlp

# חלק מהסרטונים דורשים cookies
# ראה COOKIES_GUIDE.md לפרטים
```

### בעיה: Supabase לא מתחבר

**תסמינים:**
- שגיאת `Invalid API key`
- שגיאת `Failed to fetch`

**פתרונות:**
1. בדוק את `.env.local`:
   ```bash
   cat .env.local
   ```

2. ודא שה-URL וה-Key נכונים:
   - לך ל-Supabase Dashboard
   - Project Settings → API
   - העתק מחדש את ה-URL וה-Key

3. נקה cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### בעיה: Edge Functions לא עובדות

**תסמינים:**
- שגיאת 404 ב-Function
- שגיאת `Function not found`

**פתרונות:**
1. ודא שה-Functions הועלו:
   ```bash
   supabase functions list
   ```

2. העלה מחדש:
   ```bash
   supabase functions deploy download-youtube-video
   ```

3. בדוק את ה-Logs:
   ```bash
   supabase functions logs download-youtube-video
   ```

### בעיה: CORS errors

**תסמינים:**
- שגיאת `CORS policy` ב-Console
- בקשות נחסמות

**פתרונות:**

1. **ב-Python Server:**
   - עדכן את `ALLOWED_ORIGINS` ב-`.env`:
     ```env
     ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
     ```

2. **ב-Supabase:**
   - ודא שה-CORS מוגדר נכון ב-Dashboard

---

## 📚 משאבים נוספים

- **מדריך העלאה ל-Production:** `DEPLOYMENT_GUIDE_HEBREW.md`
- **משתני סביבה:** `ENVIRONMENT_VARIABLES.md`
- **מדריך yt-dlp:** `youtube_server/YT_DLP_GUIDE.md`
- **מדריך Cookies:** `youtube_server/COOKIES_GUIDE.md`
- **README ראשי:** `README.md`

---

## 🎉 סיכום

אם הגעת עד כאן והכל עובד, **מזל טוב!** המערכת מותקנת ופועלת.

**השלבים הבאים:**
1. נסה להוריד סרטון
2. נסה לחתוך קטע
3. נסה לזהות שיר
4. קרא את `DEPLOYMENT_GUIDE_HEBREW.md` להעלאה ל-production

**שאלות?** פתח issue ב-GitHub או צור קשר עם המפתחים.

---

**עודכן לאחרונה:** 2025-01-XX

