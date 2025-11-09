# Cookies Support - סיכום מחקר

## ✅ ממצאי המחקר

### האם yt-dlp דורש Cookies?

**תשובה:** לא תמיד, אבל **מומלץ מאוד** ב-production!

---

## מתי צריך Cookies:

1. ✅ **סרטונים מוגבלים** - Private videos, Members-only content
2. ✅ **איכויות גבוהות** - חלק מהאיכויות זמינות רק למשתמשים מחוברים
3. ✅ **Rate Limiting** - Cookies עוזרים להימנע מהגבלות
4. ✅ **Age-restricted content** - תוכן מוגבל לגיל
5. ✅ **YouTube Premium** - גישה לתוכן Premium

### מתי לא צריך:

- ✅ רוב הסרטונים הציבוריים עובדים בלי cookies
- ✅ Fallback ל-Invidious עובד גם בלי cookies

---

## מה עוד יכול להיות נדרש:

### PO Token (Proof of Origin)
- YouTube החלה לדרוש PO Token לסרטונים מסוימים
- yt-dlp לא יכול לייצר את זה בעצמו
- יש תוסף: `yt-dlp-get-pot` (אם נדרש)

---

## מה עודכנו במערכת:

1. ✅ **תמיכה ב-Cookies** - הוספתי תמיכה מלאה ב-cookies
2. ✅ **Environment Variable** - `COOKIES_FILE_PATH`
3. ✅ **אוטומטי** - אם הקובץ קיים, הוא משתמש בו
4. ✅ **`.gitignore`** - Cookies לא יפורסמו ב-Git
5. ✅ **מדריכים** - מדריכים מלאים ב-`COOKIES_GUIDE.md`

---

## איך להשתמש:

### 1. קבל Cookies:
```bash
# Chrome Extension:
# Get cookies.txt LOCALLY
# Export → שמור כ-cookies.txt
```

### 2. העלה לשרת:
```bash
scp cookies.txt user@server:/opt/youtube-server/
```

### 3. הגדר Environment Variable:
```env
COOKIES_FILE_PATH=/opt/youtube-server/cookies.txt
```

### 4. הפעל מחדש:
```bash
sudo systemctl restart youtube-server
```

---

## ⚠️ אזהרות חשובות:

1. **אל תפרסם** cookies ב-GitHub
2. **השתמש בחשבון משני** - לא הראשי
3. **Cookies מתפוגגים** - צריך לרענן מדי פעם
4. **YouTube יכולה לזהות** שימוש אוטומטי

---

## 📖 לפרטים נוספים:

- `COOKIES_GUIDE.md` - מדריך מלא
- `COOKIES_QUICKSTART.md` - Quick start guide

---

## ✅ סיכום:

**yt-dlp לא תמיד דורש cookies, אבל:**
- ✅ זה מומלץ מאוד ב-production
- ✅ עוזר עם rate limiting
- ✅ מאפשר גישה לאיכויות גבוהות יותר
- ✅ נדרש לסרטונים מוגבלים

**המערכת מוכנה לתמוך ב-cookies! 🍪**

