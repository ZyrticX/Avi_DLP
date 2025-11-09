# מדריך Cookies ל-yt-dlp

## למה צריך Cookies?

yt-dlp **לא תמיד** דורש cookies, אבל במקרים הבאים זה מומלץ/נדרש:

### ✅ מתי צריך Cookies:

1. **סרטונים מוגבלים** - Private videos, Members-only content
2. **איכויות גבוהות** - חלק מהאיכויות זמינות רק למשתמשים מחוברים
3. **Rate Limiting** - Cookies עוזרים להימנע מהגבלות
4. **Age-restricted content** - תוכן מוגבל לגיל
5. **YouTube Premium** - גישה לתוכן Premium

### ⚠️ מתי לא צריך:

- רוב הסרטונים הציבוריים עובדים בלי cookies
- Fallback ל-Invidious עובד גם בלי cookies

---

## איך להשיג Cookies

### דרך 1: Export מהדפדפן (Chrome/Edge)

1. התחבר ל-YouTube בדפדפן
2. התקן תוסף:
   - **Chrome**: [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
   - **Firefox**: [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)
3. לחץ על התוסף → Export cookies
4. שמור את הקובץ כ-`cookies.txt`

### דרך 2: Export ידני (Netscape format)

צור קובץ `cookies.txt` בפורמט Netscape:

```
# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	1735689600	__Secure-1PSID	VALUE_HERE
.youtube.com	TRUE	/	TRUE	1735689600	__Secure-3PSID	VALUE_HERE
```

### דרך 3: שימוש ב-cURL

```bash
# Chrome (Windows)
curl -s "https://www.youtube.com" --cookie-jar cookies.txt

# או Export ידני מהדפדפן
```

---

## פורמט Cookies.txt

הקובץ צריך להיות בפורמט Netscape:

```
# Netscape HTTP Cookie File
# This is a generated file! Do not edit.

.youtube.com	TRUE	/	FALSE	1735689600	VISITOR_INFO1_LIVE	VALUE
.youtube.com	TRUE	/	TRUE	1735689600	__Secure-1PSID	VALUE
.youtube.com	TRUE	/	TRUE	1735689600	__Secure-3PSID	VALUE
.youtube.com	TRUE	/	TRUE	1735689600	__Secure-3PSIDCC	VALUE
```

**פורמט:**
```
domain	flag	path	secure	expiration	name	value
```

---

## שימוש ב-yt-dlp

### דרך Command Line:
```bash
yt-dlp --cookies cookies.txt "https://www.youtube.com/watch?v=VIDEO_ID"
```

### דרך Python:
```python
ydl_opts = {
    'cookies': 'cookies.txt',  # או נתיב לקובץ
}
```

---

## אבטחה ואזהרות

⚠️ **חשוב מאוד:**

1. **אל תפרסם** את קובץ ה-cookies ב-GitHub או במקומות ציבוריים
2. **השתמש בחשבון משני** - לא בחשבון הראשי שלך
3. **Cookies מתפוגגים** - צריך לרענן אותם מדי פעם
4. **YouTube יכולה לזהות** שימוש אוטומטי ויכולה להשבית את החשבון
5. **השתמש ב-Environment Variables** - אל תכניס את הקובץ לקוד

---

## Production Setup

1. העלה את `cookies.txt` לשרת (לא ל-Git!)
2. הגדר את הנתיב ב-Environment Variable
3. הוסף ל-`.gitignore`:
   ```
   cookies.txt
   *.cookies
   ```

---

## עדכון המערכת

המערכת שלנו תומכת ב-cookies דרך:
- Environment Variable: `COOKIES_FILE_PATH`
- או העלאה דרך API (אם תוסיף את זה)

