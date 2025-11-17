# YouTube Slice and Voice - חתוך ותתרגם

שירות מקצועי לחיתוך, עריכה ותרגום סרטוני YouTube. זיהוי אוטומטי של שירים, הורדה באיכות גבוהה ותמיכה בכתוביות ודיבוב.

## תכונות עיקריות

- 🎬 **הורדת סרטונים מיוטיוב** - הורדה ישירה עם תמיכה באיכויות שונות (yt-dlp)
- ✂️ **חיתוך ועריכה** - חיתוך קטעים מסרטונים, מיזוג קטעים מרובים
- 🎵 **זיהוי שירים** - זיהוי אוטומטי של שירים בקטעים
- 🎨 **עיבוד וידאו** - חילוץ אודיו, נרמול, הסרת ווקאלים, אפקטים
- 📝 **תרגום כתוביות** - חיפוש, הורדה ותרגום כתוביות לסרטים
- 🔊 **דיבוב** - דיבוב אוטומטי לשפות שונות
- 📱 **תמיכה בפלטפורמות סטרימינג** - אינטגרציה עם שירותי סטרימינג פופולריים

## טכנולוגיות

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Edge Functions + PostgreSQL + Storage)
- **Video Processing**: FFmpeg (WASM)
- **YouTube Downloader**: yt-dlp (Python Server)
- **State Management**: React Query (TanStack Query)

## התקנה והפעלה

> **📦 מדריך התקנה מפורט:** [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) - מדריך מלא שלב אחר שלב להתקנת כל המערכת

### דרישות מקדימות

- Node.js 18+ (מומלץ להשתמש ב-[nvm](https://github.com/nvm-sh/nvm))
- Python 3.8+ (לשרת YouTube downloader)
- FFmpeg (לעיבוד וידאו)
- npm או yarn
- חשבון Supabase (להתקנה מקומית)

### שלבי התקנה

#### 1. התקנת הפרויקט הראשי

```bash
# שכפול הפרויקט
git clone <YOUR_GIT_URL>
cd yt-slice-and-voice

# התקנת תלויות
npm install

# הגדרת משתני סביבה
# צור קובץ .env.local על בסיס .env.example
cp .env.example .env.local

# ערוך את .env.local והוסף את פרטי Supabase שלך:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

#### 2. התקנת שרת YouTube Downloader (yt-dlp)

```bash
# נווט לתיקיית השרת
cd youtube_server

# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

**התקנה ידנית:**

```bash
cd youtube_server
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

**התקנת FFmpeg:**

- **Windows**: הורד מ-[https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
- **Linux**: `sudo apt-get install ffmpeg`
- **Mac**: `brew install ffmpeg`

#### 3. הפעלת השרתים

**שרת YouTube Downloader:**
```bash
cd youtube_server
source venv/bin/activate  # או venv\Scripts\activate ב-Windows
python server.py
```

השרת ירוץ על `http://localhost:8000`

**שרת Frontend:**
```bash
npm run dev
```

האפליקציה תהיה זמינה בכתובת: `http://localhost:8080`

## הגדרת משתני סביבה

### Frontend (.env.local)
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# YouTube Downloader API (אופציונלי - אם השרת Python רץ בנפרד)
VITE_YOUTUBE_API_URL=http://localhost:8000
VITE_YOUTUBE_API_KEY=your_api_key_here
```

### YouTube Server (youtube_server/.env)
```env
# API Key (אופציונלי - להגדרה ב-production)
API_KEY=your_secret_api_key_here

# Port (ברירת מחדל: 8000)
PORT=8000
```

### Supabase Edge Functions
הגדר משתני סביבה ב-Supabase Dashboard:
- `YOUTUBE_API_URL` - כתובת שרת Python (לדוגמה: `http://localhost:8000`)
- `YOUTUBE_API_KEY` - מפתח API (אופציונלי)

## מבנה הפרויקט

```
yt-slice-and-voice/
├── src/
│   ├── components/          # רכיבי UI
│   │   ├── ui/             # רכיבי shadcn/ui
│   │   └── FAQ.tsx         # שאלות נפוצות
│   ├── pages/              # דפי האפליקציה
│   │   ├── Index.tsx       # דף ראשי - חיתוך וידאו
│   │   ├── Movies.tsx      # תרגום כתוביות לסרטים
│   │   └── Auth.tsx        # אימות
│   ├── hooks/              # React Hooks מותאמים
│   │   ├── useFFmpeg.tsx   # Hook לעיבוד וידאו
│   │   └── use-mobile.tsx  # זיהוי מכשיר נייד
│   ├── config/             # קבצי תצורה
│   │   └── api.ts          # תצורת API
│   ├── lib/                # ספריות עזר
│   │   ├── constants.ts    # קבועים
│   │   └── utils.ts        # פונקציות עזר
│   └── integrations/       # אינטגרציות
│       └── supabase/       # לקוח Supabase
├── youtube_server/          # ✅ שרת Python עם yt-dlp
│   ├── server.py           # שרת FastAPI
│   ├── requirements.txt    # תלויות Python
│   ├── setup.sh            # Script התקנה (Linux/Mac)
│   └── setup.bat            # Script התקנה (Windows)
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── download-youtube-video/  # הורדת סרטונים
│   │   ├── get-youtube-info/        # קבלת מידע על סרטונים
│   │   ├── identify-song/           # זיהוי שירים
│   │   ├── translate-subtitles/     # תרגום כתוביות
│   │   └── ...
│   └── migrations/         # מיגרציות מסד נתונים
└── public/                 # קבצים סטטיים
```

## איך זה עובד?

### זרימת הורדת סרטון

1. **Frontend** → שולח בקשה ל-Supabase Edge Function
2. **Supabase Edge Function** → מנסה להשתמש ב-yt-dlp API (שרת Python)
3. **שרת Python (yt-dlp)** → מוריד את הסרטון באמצעות yt-dlp
4. **Fallback** → אם שרת Python לא זמין, משתמש ב-Invidious instances

### קבלת מידע על סרטון

1. **Frontend** → שולח בקשה ל-Supabase Edge Function
2. **Supabase Edge Function** → מקבל מידע מ-yt-dlp API
3. **שרת Python (yt-dlp)** → משתמש ב-yt-dlp לקבלת metadata

## בנייה לפרודקשן

```bash
# בנייה
npm run build

# תצוגה מקדימה של הבנייה
npm run preview
```

## 🚀 העלאה ל-Production

**מדריכים מפורטים:**

- 📦 **[מדריך התקנה מלא](INSTALLATION_GUIDE.md)** - מדריך מפורט להתקנה מקומית
- 🐧 **[מדריך העלאה ל-Ubuntu VPS](UBUNTU_DEPLOYMENT_GUIDE.md)** - מדריך מפורט להעלאה לשרת Ubuntu
- 📖 **[מדריך העלאה מלא בעברית](DEPLOYMENT_GUIDE_HEBREW.md)** - מדריך מפורט להעלאת כל המערכת
- ⚡ **[מדריך העלאה מהיר](QUICK_DEPLOYMENT.md)** - מדריך קצר וממוקד
- 🔐 **[משתני סביבה](ENVIRONMENT_VARIABLES.md)** - רשימה מלאה של כל משתני הסביבה

**סיכום מהיר:**
1. **Frontend** → Vercel/Netlify (`vercel --prod`)
2. **Python Server** → Railway/Render/VPS
3. **Supabase Functions** → `supabase functions deploy --all`
4. **Environment Variables** → הגדר בכל הפלטפורמות

## פתרון בעיות

### שרת Python לא מגיב
- ודא שהשרת רץ: `python server.py`
- בדוק את ה-PORT (ברירת מחדל: 8000)
- ודא ש-FFmpeg מותקן

### שגיאת FFmpeg
- ודא ש-FFmpeg מותקן וזמין ב-PATH
- בדוק: `ffmpeg -version`

### שגיאת yt-dlp
- עדכן את yt-dlp: `pip install --upgrade yt-dlp`
- חלק מהסרטונים עשויים להיות מוגבלים

## רישיון

הפרויקט הזה הוא פרטי.

## תמיכה

לשאלות ובעיות, פתח issue ב-GitHub או צור קשר עם המפתחים.
