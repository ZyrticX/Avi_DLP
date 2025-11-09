# Production Deployment Checklist

## ✅ לפני העלאה - ודא שהכל מוכן:

### Frontend
- [ ] Environment Variables מוגדרים (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- [ ] Build עובד: `npm run build`
- [ ] Preview עובד: `npm run preview`
- [ ] כל ה-imports תקינים

### Supabase
- [ ] Edge Functions מוגדרות ב-Dashboard
- [ ] Environment Variables מוגדרים (YOUTUBE_API_URL, RAPIDAPI_KEY, וכו')
- [ ] Storage bucket `temp-media` קיים
- [ ] Database migrations רץ
- [ ] RLS Policies מוגדרים

### Python Server (yt-dlp)
- [ ] שרת Python מוכן ופועל
- [ ] FFmpeg מותקן על השרת
- [ ] Environment Variables מוגדרים (API_KEY, PORT)
- [ ] CORS מוגדר נכון עם הדומיין שלך
- [ ] HTTPS מופעל

### בדיקות
- [ ] הורדת סרטון עובדת
- [ ] חיתוך עובד
- [ ] זיהוי שירים עובד
- [ ] מיזוג segments עובד
- [ ] אין שגיאות ב-Console

---

## 🚀 שלבי Deploy

1. **Frontend** → Vercel/Netlify
2. **Python Server** → VPS/Railway/Render
3. **Supabase Functions** → `supabase functions deploy`
4. **Environment Variables** → הגדר בכל הפלטפורמות
5. **בדיקה** → בדוק שהכל עובד

---

## 📝 משתני סביבה שצריך להגדיר

### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=xxx
VITE_YOUTUBE_API_URL=https://your-server.com
VITE_YOUTUBE_API_KEY=xxx
```

### Supabase Edge Functions
- YOUTUBE_API_URL
- YOUTUBE_API_KEY
- RAPIDAPI_KEY (לזיהוי שירים)

### Python Server
- API_KEY
- PORT
- ALLOWED_ORIGINS

---

## ✅ מוכן ל-Production!

ראה `PRODUCTION_DEPLOYMENT.md` לפרטים מלאים.

