# מדריך yt-dlp - הסבר מפורט

## מה זה yt-dlp?

**yt-dlp** הוא כלי Python מתקדם להורדת סרטונים ואודיו מאתרים שונים, כולל YouTube, Vimeo, TikTok ועוד מאות פלטפורמות. זהו fork משופר של youtube-dl עם תכונות נוספות וביצועים טובים יותר.

## למה להשתמש ב-yt-dlp?

1. **אמינות גבוהה** - מתעדכן באופן קבוע להתמודדות עם שינויים ב-YouTube
2. **תמיכה רחבה** - תומך במאות אתרים ופלטפורמות
3. **גמישות** - אפשרות לבחור איכות, פורמט, וקטעים ספציפיים
4. **מהירות** - הורדות מהירות יותר מ-youtube-dl המקורי
5. **מידע עשיר** - מספק metadata מפורט על הסרטונים

## איך זה עובד?

### תהליך ההורדה:

1. **ניתוח URL** - yt-dlp מנתח את הקישור של הסרטון
2. **חילוץ מידע** - מקבל מידע על הסרטון (שם, תיאור, איכויות זמינות)
3. **הורדה** - מוריד את הקבצים (וידאו ואודיו בנפרד או משולב)
4. **מיזוג** - משתמש ב-FFmpeg למזג וידאו ואודיו אם צריך

### דוגמאות שימוש:

#### קבלת מידע על סרטון (ללא הורדה):
```python
import yt_dlp

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info_dict = ydl.extract_info('https://www.youtube.com/watch?v=VIDEO_ID', download=False)
    
    print(f"שם הסרטון: {info_dict['title']}")
    print(f"אורך: {info_dict['duration']} שניות")
    print(f"יוצר: {info_dict['uploader']}")
```

#### הורדת סרטון:
```python
import yt_dlp

ydl_opts = {
    'format': 'bestvideo+bestaudio/best',  # האיכות הטובה ביותר
    'outtmpl': '%(title)s.%(ext)s',        # שם הקובץ
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download(['https://www.youtube.com/watch?v=VIDEO_ID'])
```

#### בחירת איכות ספציפית:
```python
ydl_opts = {
    'format': 'bestvideo[height<=720]+bestaudio/best[height<=720]',  # 720p
}
```

## אינטגרציה במערכת שלנו

במערכת שלנו, yt-dlp רץ על שרת Python נפרד (FastAPI) שמציע REST API:

### Endpoints זמינים:

1. **GET /info** - קבלת מידע על סרטון
   - `?url=https://youtube.com/watch?v=VIDEO_ID`
   - `?video_id=VIDEO_ID`

2. **POST /download** - הורדת סרטון
   ```json
   {
     "video_id": "VIDEO_ID",
     "quality": "best",
     "format": "mp4"
   }
   ```

3. **POST /download-stream** - קבלת streaming URL (לסרטונים גדולים)

### יתרונות הארכיטקטורה:

- **ביצועים** - שרת Python ייעודי לעיבוד וידאו
- **גמישות** - קל לעדכן או להחליף את השרת
- **אמינות** - Fallback ל-Invidious אם השרת לא זמין
- **מערכת** - ניתן להריץ על שרת נפרד או באותו מכונה

## מידע נוסף

- **תיעוד רשמי**: https://github.com/yt-dlp/yt-dlp
- **רשימת אתרים נתמכים**: https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md
- **אפשרויות תצורה**: https://github.com/yt-dlp/yt-dlp#usage-and-options

## הערות חשובות

⚠️ **זכויות יוצרים** - ודא שאתה משתמש בהתאם לתנאי השימוש ולחוק
⚠️ **שימוש הוגן** - אל תעמיס על השרת, השתמש ב-rate limiting
⚠️ **אבטחה** - השתמש ב-API keys ב-production
⚠️ **FFmpeg** - נדרש למיזוג וידאו ואודיו




