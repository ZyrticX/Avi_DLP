# ⚡ מדריך העלאה מהיר - Quick Deployment Guide

מדריך קצר וממוקד להעלאת המערכת לייצור.

---

## 🎯 שלבים מהירים

### 1️⃣ Frontend → Vercel (5 דקות)

```bash
# התקן Vercel CLI
npm install -g vercel

# התחבר
vercel login

# Deploy
vercel --prod
```

**הגדר Environment Variables ב-Vercel Dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_YOUTUBE_API_URL`
- `VITE_YOUTUBE_API_KEY`

---

### 2️⃣ Python Server → Railway (10 דקות)

1. היכנס ל-[Railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. בחר את ה-repo → Root Directory: `youtube_server`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. הוסף Variables:
   - `API_KEY` (צור מפתח חזק!)
   - `ALLOWED_ORIGINS` (דומיין ה-Frontend)

**קבל את ה-URL מה-Dashboard!**

---

### 3️⃣ Supabase Functions → CLI (5 דקות)

```bash
# התקן Supabase CLI
npm install -g supabase

# התחבר
supabase login

# קשר לפרויקט
supabase link --project-ref YOUR_PROJECT_REF

# Deploy הכל
supabase functions deploy --all
```

**הגדר Secrets ב-Supabase Dashboard:**
- `YOUTUBE_API_URL` (מה-Railway)
- `YOUTUBE_API_KEY` (אותו מפתח מה-Railway)
- `RAPIDAPI_KEY` (לזיהוי שירים)
- `LOVABLE_API_KEY` (לניתוח description)

---

## ✅ בדיקה מהירה

```bash
# בדוק Python Server
curl https://your-railway-app.railway.app/

# בדוק Frontend
# פתח בדפדפן: https://your-app.vercel.app

# בדוק Supabase Function
curl https://your-project.supabase.co/functions/v1/download-youtube-video \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"videoId": "dQw4w9WgXcQ"}'
```

---

## 📝 משתני סביבה - סיכום

### Frontend (Vercel)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=xxx
VITE_YOUTUBE_API_URL=https://xxx.railway.app
VITE_YOUTUBE_API_KEY=xxx
```

### Python Server (Railway)
```
API_KEY=your_secret_key_here
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Supabase (Dashboard → Secrets)
```
YOUTUBE_API_URL=https://xxx.railway.app
YOUTUBE_API_KEY=xxx
RAPIDAPI_KEY=xxx
LOVABLE_API_KEY=xxx
```

---

## 🚨 בעיות נפוצות

**CORS Error?**
→ ודא ש-`ALLOWED_ORIGINS` כולל את דומיין ה-Frontend

**API לא מגיב?**
→ בדוק שה-URLs הם HTTPS (לא HTTP!)

**401 Unauthorized?**
→ ודא שה-API_KEY זהה בכל המקומות

---

## 📚 מדריך מפורט

ראה `DEPLOYMENT_GUIDE_HEBREW.md` לפרטים מלאים.

---

**בהצלחה! 🚀**

