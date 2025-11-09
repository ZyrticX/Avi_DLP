# Cookies Support - Quick Summary

## ✅ האם yt-dlp דורש Cookies?

**תשובה קצרה:** לא תמיד, אבל **מומלץ מאוד** ב-production!

### מתי צריך Cookies:
- ✅ סרטונים מוגבלים (Private, Members-only)
- ✅ איכויות גבוהות יותר
- ✅ הימנעות מ-rate limiting  
- ✅ תוכן מוגבל לגיל

### מתי לא צריך:
- ✅ רוב הסרטונים הציבוריים עובדים בלי
- ✅ Fallback ל-Invidious עובד בלי

---

## 🚀 Setup מהיר

### 1. קבל Cookies מהדפדפן:
- Chrome: התקן [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
- לחץ Export → שמור כ-`cookies.txt`

### 2. העלה לשרת:
```bash
# העלה את cookies.txt לשרת (לא ל-Git!)
scp cookies.txt user@server:/opt/youtube-server/
```

### 3. הגדר Environment Variable:
```env
COOKIES_FILE_PATH=/opt/youtube-server/cookies.txt
```

### 4. הפעל מחדש את השרת:
```bash
sudo systemctl restart youtube-server
```

---

## ⚠️ אבטחה

**חשוב מאוד:**
- ❌ אל תפרסם cookies.txt ב-GitHub
- ✅ הוסף ל-`.gitignore`
- ✅ השתמש בחשבון משני
- ✅ Cookies מתפוגגים - צריך לרענן מדי פעם

---

## 📖 לפרטים נוספים

ראה `COOKIES_GUIDE.md` למדריך מלא.

