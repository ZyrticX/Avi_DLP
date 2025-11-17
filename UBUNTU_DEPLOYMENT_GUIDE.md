# 🐧 מדריך העלאה מלא לשרת Ubuntu

מדריך מפורט להעלאת כל המערכת לשרת Ubuntu VPS.

---

## 📋 תוכן עניינים

1. [דרישות מקדימות](#דרישות-מקדימות)
2. [הכנת השרת](#הכנת-השרת)
3. [התקנת Frontend](#התקנת-frontend)
4. [התקנת Python Server](#התקנת-python-server)
5. [הגדרת Nginx](#הגדרת-nginx)
6. [הגדרת SSL עם Let's Encrypt](#הגדרת-ssl-עם-lets-encrypt)
7. [הגדרת Systemd Services](#הגדרת-systemd-services)
8. [משתני סביבה](#משתני-סביבה)
9. [בדיקות וטיפול בבעיות](#בדיקות-וטיפול-בבעיות)

---

## 🔧 דרישות מקדימות

### חומרה מינימלית
- **RAM**: 2GB (מומלץ 4GB+)
- **CPU**: 2 cores (מומלץ 4+)
- **דיסק**: 20GB (מומלץ 50GB+)
- **רשת**: גישה לאינטרנט

### תוכנה
- Ubuntu 20.04+ או 22.04 LTS
- גישה root או משתמש עם sudo
- דומיין (אופציונלי אבל מומלץ)

---

## 🚀 הכנת השרת

### שלב 1: עדכון המערכת

```bash
# התחבר לשרת
ssh user@your-server-ip

# עדכן את המערכת
sudo apt update
sudo apt upgrade -y

# התקן כלים בסיסיים
sudo apt install -y curl wget git build-essential
```

### שלב 2: התקנת Node.js 18+

```bash
# התקן Node.js דרך NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# בדוק את הגרסה
node --version  # צריך להציג v18.x.x או גבוה יותר
npm --version
```

### שלב 3: התקנת Python 3.8+

```bash
# בדוק אם Python מותקן
python3 --version

# אם לא מותקן או גרסה ישנה
sudo apt install -y python3 python3-pip python3-venv

# התקן FFmpeg (חובה!)
sudo apt install -y ffmpeg

# בדוק
ffmpeg -version
```

### שלב 4: התקנת Nginx

```bash
sudo apt install -y nginx

# הפעל את Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# בדוק סטטוס
sudo systemctl status nginx
```

### שלב 5: התקנת PM2 (לניהול Node.js)

```bash
sudo npm install -g pm2

# הפעל PM2 בעת אתחול
pm2 startup systemd
# העתק את הפקודה שהפלטה והרץ אותה
```

---

## 📁 יצירת מבנה תיקיות

```bash
# צור תיקיית פרויקטים
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www

# צור תיקיות לפרויקט
cd /var/www
mkdir -p yt-slice-and-voice/{frontend,youtube_server}
```

---

## 🎨 התקנת Frontend

### שלב 1: שכפול הפרויקט

**אפשרות 1: שכפול לתיקיית frontend (מומלץ)**
```bash
cd /var/www/yt-slice-and-voice/frontend

# שכפל את הפרויקט
git clone https://github.com/ZyrticX/Avi_DLP.git .

# עכשיו העתק את youtube_server לתיקייה נפרדת
cd /var/www/yt-slice-and-voice
cp -r frontend/youtube_server ./

# או העתק ידנית:
# mv frontend/youtube_server ./
```

**אפשרות 2: שכפול לתיקייה ראשית ואז העתקה**
```bash
cd /var/www/yt-slice-and-voice

# שכפל את הפרויקט לתיקייה זמנית
git clone https://github.com/ZyrticX/Avi_DLP.git temp

# העתק את הקבצים הנכונים
mv temp/src frontend/
mv temp/package.json frontend/
mv temp/vite.config.ts frontend/
mv temp/tsconfig.json frontend/
mv temp/tailwind.config.ts frontend/
mv temp/index.html frontend/
mv temp/public frontend/
mv temp/youtube_server ./

# מחק את התיקייה הזמנית
rm -rf temp
```

**חשוב:** המבנה הסופי צריך להיות:
```
/var/www/yt-slice-and-voice/
├── frontend/          # קבצי React/Vite
│   ├── src/
│   ├── package.json
│   └── ...
└── youtube_server/    # שרת Python
    ├── server.py
    ├── requirements.txt
    └── ...
```

### שלב 2: התקנת תלויות

```bash
cd /var/www/yt-slice-and-voice/frontend

# התקן תלויות (חובה! כולל devDependencies כי vite נדרש לבנייה)
npm install

# הערה: צריך את כל התלויות (לא רק --production) כי vite הוא ב-devDependencies
```

### שלב 3: בניית הפרויקט

```bash
# בנייה ל-production
npm run build

# זה יוצר תיקיית dist/ עם הקבצים הסטטיים
```

### שלב 4: יצירת קובץ .env.production

```bash
cd /var/www/yt-slice-and-voice/frontend

# צור קובץ משתני סביבה
nano .env.production
```

הוסף את התוכן הבא (עם IP שלך: 65.21.192.187):

```env
VITE_SUPABASE_URL=https://esrtnatrbkjheskjcipz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
# אפשרות B: הכל דרך Nginx על פורט 80
VITE_YOUTUBE_API_URL=http://65.21.192.187/api
VITE_YOUTUBE_API_KEY=your_api_key_here
```

**חשוב:** עם אפשרות B, ה-API יהיה זמין דרך `/api/`:
- `http://65.21.192.187/api/` - health check
- `http://65.21.192.187/api/info` - קבלת מידע על סרטון
- `http://65.21.192.187/api/download` - הורדת סרטון

**חשוב:** בנה מחדש אחרי שינוי `.env.production`:
```bash
npm run build
```

---

## 🐍 התקנת Python Server

### שלב 1: העתקת קבצים

**אם כבר שכפלת את הפרויקט לתיקיית frontend:**

```bash
# העתק את youtube_server מתוך frontend לתיקייה נפרדת
cd /var/www/yt-slice-and-voice

# אם youtube_server נמצא ב-frontend
if [ -d "frontend/youtube_server" ]; then
    cp -r frontend/youtube_server ./
    echo "youtube_server הועתק בהצלחה"
fi

# בדוק שהתיקייה קיימת
ls -la youtube_server/
```

**אם עדיין לא שכפלת:**

```bash
cd /var/www/yt-slice-and-voice

# שכפל את הפרויקט
git clone https://github.com/ZyrticX/Avi_DLP.git temp

# העתק את youtube_server
mv temp/youtube_server ./

# העתק את קבצי ה-frontend
mv temp/src frontend/
mv temp/package.json frontend/
mv temp/vite.config.ts frontend/
mv temp/tsconfig.json frontend/
mv temp/tailwind.config.ts frontend/
mv temp/index.html frontend/
mv temp/public frontend/
# וכל שאר הקבצים של frontend...

# מחק את התיקייה הזמנית
rm -rf temp
```

**אפשרות 2: העתקה ידנית (אם אין גיט)**
```bash
cd /var/www/yt-slice-and-voice/youtube_server

# ודא שיש לך את הקבצים הבאים:
# - server.py
# - requirements.txt

# בדוק שהקבצים קיימים
ls -la

# אם חסרים, העתק אותם מהמחשב המקומי:
# scp server.py user@your-server:/var/www/yt-slice-and-voice/youtube_server/
# scp requirements.txt user@your-server:/var/www/yt-slice-and-voice/youtube_server/
```

**חשוב:** ודא שהקובץ `requirements.txt` קיים לפני המשך!
```bash
# בדוק שהקובץ קיים
cd /var/www/yt-slice-and-voice/youtube_server
ls -la requirements.txt

# אם הקובץ לא קיים, תראה שגיאה
```

### שלב 2: יצירת סביבה וירטואלית

```bash
cd /var/www/yt-slice-and-voice/youtube_server

# צור סביבה וירטואלית
python3 -m venv venv

# הפעל את הסביבה
source venv/bin/activate

# התקן תלויות
pip install --upgrade pip
pip install -r requirements.txt
```

### שלב 3: יצירת קובץ .env

```bash
cd /var/www/yt-slice-and-voice/youtube_server

nano .env
```

הוסף:

```env
# API Key חזק (לפחות 32 תווים)
API_KEY=your_very_secret_api_key_here_min_32_chars

# Port (ברירת מחדל: 8000)
PORT=8000

# CORS Origins - כתובות ה-Frontend
# אם יש דומיין:
# ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
# אם אין דומיין, השתמש ב-IP:
ALLOWED_ORIGINS=http://65.21.192.187

# Cookies (אופציונלי - רק אם יש לך cookies.txt)
# COOKIES_FILE_PATH=/var/www/yt-slice-and-voice/youtube_server/cookies.txt
```

**יצירת API Key חזק:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### שלב 4: בדיקת השרת

```bash
cd /var/www/yt-slice-and-voice/youtube_server
source venv/bin/activate

# הרץ את השרת
python server.py
```

פתח טרמינל נוסף ובדוק:
```bash
curl http://localhost:8000
```

אמור להחזיר: `{"status": "ok", "message": "YouTube Downloader API"}`

---

## 🌐 הגדרת Nginx

### שלב 1: יצירת קובץ תצורה

```bash
sudo nano /etc/nginx/sites-available/yt-slice-and-voice
```

הוסף את התוכן הבא (החלף `your-domain.com` בדומיין שלך):

```nginx
# Frontend - שרת סטטי
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/yt-slice-and-voice/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Python API Server - Reverse Proxy
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for large video downloads
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

### שלב 2: הפעלת התצורה

```bash
# צור symbolic link
sudo ln -s /etc/nginx/sites-available/yt-slice-and-voice /etc/nginx/sites-enabled/

# בדוק את התצורה
sudo nginx -t

# אם הכל תקין, טען מחדש את Nginx
sudo systemctl reload nginx
```

---

## 🔒 הגדרת SSL עם Let's Encrypt

### שלב 1: התקנת Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### שלב 2: קבלת תעודת SSL

```bash
# החלף your-domain.com בדומיין שלך
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# עקוב אחר ההוראות על המסך
```

Certbot יעדכן אוטומטית את קובץ ה-Nginx עם HTTPS.

### שלב 3: עדכון אוטומטי

```bash
# בדוק שהאוטומציה עובדת
sudo certbot renew --dry-run
```

---

## ⚙️ הגדרת Systemd Services

### שלב 1: יצירת Service ל-Python Server

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
WorkingDirectory=/var/www/yt-slice-and-voice/youtube_server
Environment="PATH=/var/www/yt-slice-and-voice/youtube_server/venv/bin"
ExecStart=/var/www/yt-slice-and-voice/youtube_server/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### שלב 2: הפעלת ה-Service

```bash
# טען מחדש את systemd
sudo systemctl daemon-reload

# הפעל את השירות
sudo systemctl start youtube-server

# הפעל בעת אתחול
sudo systemctl enable youtube-server

# בדוק סטטוס
sudo systemctl status youtube-server

# צפה בלוגים
sudo journalctl -u youtube-server -f
```

### שלב 3: יצירת Service ל-Frontend (PM2)

```bash
cd /var/www/yt-slice-and-voice/frontend

# צור קובץ ecosystem.config.js
nano ecosystem.config.js
```

הוסף:

```javascript
module.exports = {
  apps: [{
    name: 'yt-slice-frontend',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/yt-slice-and-voice/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**או** אם אתה משתמש ב-Nginx לשרת קבצים סטטיים (מומלץ), אין צורך ב-PM2 ל-Frontend.

---

## 🔑 איך להגדיר API KEY ודומיין?

### יצירת API KEY

**API KEY הוא מפתח סודי שמגן על ה-API שלך מפני שימוש לא מורשה.**

#### שלב 1: יצירת API KEY חזק

```bash
# בשרת Ubuntu, הרץ:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# או עם openssl:
openssl rand -hex 32
```

זה יפלוט מפתח ארוך, למשל:
```
aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890
```

**שמור את המפתח הזה!** תצטרך אותו בהמשך.

#### שלב 2: הגדרת API KEY ב-Python Server

```bash
cd /var/www/yt-slice-and-voice/youtube_server
nano .env
```

הוסף:
```env
API_KEY=aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890
```

**חשוב:** המפתח הזה צריך להיות **זהה** גם ב-Supabase Secrets!

#### שלב 3: הגדרת API KEY ב-Supabase

1. היכנס ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. בחר את הפרויקט שלך
3. לך ל-**Project Settings** → **Edge Functions** → **Secrets**
4. לחץ על **Add new secret**
5. הוסף:
   - **Name**: `YOUTUBE_API_KEY`
   - **Value**: אותו מפתח שיצרת (המפתח מ-`.env` של Python Server)

#### שלב 4: הגדרת API KEY ב-Frontend

```bash
cd /var/www/yt-slice-and-voice/frontend
nano .env.production
```

הוסף:
```env
VITE_YOUTUBE_API_KEY=aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890
```

**חשוב:** בנה מחדש אחרי שינוי:
```bash
npm run build
```

---

### הגדרת דומיין

**דומיין זה הכתובת של האתר שלך (למשל: `example.com`).**

#### אפשרות 1: שימוש ב-IP Address (ללא דומיין)

אם אין לך דומיין, תוכל להשתמש ב-IP של השרת:

```bash
# בדוק את ה-IP של השרת
curl ifconfig.me
# או
hostname -I
```

**דוגמה עם IP שלך:** `65.21.192.187`

**ב-Frontend (.env.production):**
```env
VITE_SUPABASE_URL=https://esrtnatrbkjheskjcipz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
# עם אפשרות B (כל דרך Nginx):
VITE_YOUTUBE_API_URL=http://65.21.192.187/api
VITE_YOUTUBE_API_KEY=your_api_key_here
```

**ב-Python Server (.env):**
```env
API_KEY=your_api_key_here
PORT=8000
ALLOWED_ORIGINS=http://65.21.192.187
```

**ב-Nginx (אפשרות B - מומלץ! הכל דרך פורט 80):**
```nginx
server {
    listen 80;
    server_name 65.21.192.187;
    
    root /var/www/yt-slice-and-voice/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # API דרך /api - כל בקשה ל-/api/* תועבר ל-Python Server
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for large video downloads
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**חשוב:** עם תצורה זו:
- Frontend: `http://65.21.192.187/`
- API: `http://65.21.192.187/api/`

**⚠️ הערה חשובה:** עם IP בלבד, לא תוכל להשתמש ב-SSL (HTTPS). אם אתה רוצה HTTPS, תצטרך דומיין.

**⚠️ מגבלות:**
- לא תוכל להשתמש ב-SSL (HTTPS) עם IP בלבד
- כתובת פחות ידידותית למשתמשים
- לא מומלץ ל-production

#### אפשרות 2: שימוש בדומיין (מומלץ!)

**שלב 1: רכישת דומיין**

קנה דומיין מ:
- [Namecheap](https://www.namecheap.com/)
- [GoDaddy](https://www.godaddy.com/)
- [Cloudflare](https://www.cloudflare.com/)
- או כל ספק אחר

**שלב 2: הגדרת DNS**

לך ל-DNS של הדומיין שלך והוסף רשומות:

**A Record** (עבור Frontend):
```
Type: A
Name: @ (או your-domain.com)
Value: [IP של השרת שלך]
TTL: 3600
```

**A Record** (עבור API subdomain):
```
Type: A
Name: api
Value: [IP של השרת שלך]
TTL: 3600
```

**דוגמה:**
אם הדומיין שלך הוא `myapp.com` וה-IP הוא `123.45.67.89`:

```
@ (myapp.com)     → A → 123.45.67.89
api (api.myapp.com) → A → 123.45.67.89
```

**שלב 3: עדכון משתני הסביבה**

**Frontend (.env.production):**
```env
VITE_SUPABASE_URL=https://esrtnatrbkjheskjcipz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_YOUTUBE_API_URL=https://api.myapp.com
VITE_YOUTUBE_API_KEY=aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890
```

**Python Server (.env):**
```env
API_KEY=aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890
PORT=8000
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com
```

**שלב 4: עדכון Nginx**

```bash
sudo nano /etc/nginx/sites-available/yt-slice-and-voice
```

החלף `your-domain.com` ב-`myapp.com`:
```nginx
server {
    listen 80;
    server_name myapp.com www.myapp.com;
    # ...
}

server {
    listen 80;
    server_name api.myapp.com;
    # ...
}
```

**שלב 5: בדיקת DNS**

```bash
# בדוק שהדומיין מפנה ל-IP הנכון
nslookup myapp.com
nslookup api.myapp.com

# או
dig myapp.com
dig api.myapp.com
```

**שלב 6: התקנת SSL (חובה עם דומיין!)**

```bash
sudo certbot --nginx -d myapp.com -d www.myapp.com -d api.myapp.com
```

---

### סיכום - מה להגדיר איפה?

| משתנה | איפה | דוגמה |
|--------|------|-------|
| **API_KEY** | Python Server `.env` | `aBc123XyZ...` |
| **API_KEY** | Supabase Secrets | `aBc123XyZ...` (זהה!) |
| **VITE_YOUTUBE_API_KEY** | Frontend `.env.production` | `aBc123XyZ...` (זהה!) |
| **VITE_YOUTUBE_API_URL** | Frontend `.env.production` | `https://api.myapp.com` |
| **ALLOWED_ORIGINS** | Python Server `.env` | `https://myapp.com` |
| **server_name** | Nginx config | `myapp.com` |

---

## 🔐 משתני סביבה - סיכום מלא

### Frontend (.env.production)

```env
VITE_SUPABASE_URL=https://esrtnatrbkjheskjcipz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_YOUTUBE_API_URL=https://api.your-domain.com
VITE_YOUTUBE_API_KEY=your_api_key_here
```

**מיקום:** `/var/www/yt-slice-and-voice/frontend/.env.production`

### Python Server (.env)

```env
API_KEY=your_very_secret_api_key_here_min_32_chars
PORT=8000
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
COOKIES_FILE_PATH=/var/www/yt-slice-and-voice/youtube_server/cookies.txt
```

**מיקום:** `/var/www/yt-slice-and-voice/youtube_server/.env`

### Supabase Edge Functions (Dashboard → Secrets)

```env
YOUTUBE_API_URL=https://api.your-domain.com
YOUTUBE_API_KEY=your_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
LOVABLE_API_KEY=your_lovable_key_here
SUPABASE_URL=https://esrtnatrbkjheskjcipz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
```

**מיקום:** Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

## 🔍 איך לדעת איפה הכל רץ?

### בדיקת תצורת Nginx

```bash
# צפה בקובץ התצורה של Nginx
sudo cat /etc/nginx/sites-available/yt-slice-and-voice

# או ערוך אותו
sudo nano /etc/nginx/sites-available/yt-slice-and-voice
```

**מה לחפש:**
- **Frontend**: שים לב ל-`server_name` - זה הדומיין של ה-Frontend
  ```nginx
  server_name your-domain.com www.your-domain.com;
  ```
  זה אומר שה-Frontend רץ על: `https://your-domain.com`

- **API**: שים לב ל-`server_name` של ה-API
  ```nginx
  server_name api.your-domain.com;
  ```
  זה אומר שה-API רץ על: `https://api.your-domain.com`

### בדיקת פורטים פעילים

```bash
# בדוק איזה פורטים פתוחים
sudo netstat -tulpn | grep LISTEN

# או עם ss (מודרני יותר)
sudo ss -tulpn | grep LISTEN
```

**מה לחפש:**
- **Port 80** (HTTP) - Nginx
- **Port 443** (HTTPS) - Nginx עם SSL
- **Port 8000** - Python Server (רק מקומי, לא חיצוני)

### בדיקת שירותים פעילים

```bash
# בדוק שירותי systemd
sudo systemctl list-units --type=service --state=running | grep -E "(nginx|youtube)"

# בדוק סטטוס ספציפי
sudo systemctl status nginx
sudo systemctl status youtube-server
```

### בדיקת כתובות IP של השרת

```bash
# כתובת IP פנימית
hostname -I

# כתובת IP חיצונית (אם יש)
curl ifconfig.me
```

### בדיקת DNS (אם יש דומיין)

```bash
# בדוק מה ה-DNS מחזיר
nslookup your-domain.com
nslookup api.your-domain.com

# או עם dig
dig your-domain.com
dig api.your-domain.com
```

### בדיקת משתני סביבה

```bash
# Frontend - בדוק את הקובץ
cat /var/www/yt-slice-and-voice/frontend/.env.production

# Python Server - בדוק את הקובץ
cat /var/www/yt-slice-and-voice/youtube_server/.env
```

**מה לבדוק:**
- `VITE_YOUTUBE_API_URL` צריך להיות: `https://api.your-domain.com`
- `ALLOWED_ORIGINS` צריך לכלול: `https://your-domain.com`

### בדיקת תצורת Supabase

```bash
# בדוק את קובץ התצורה
cat supabase/config.toml
```

**מה לחפש:**
- `project_id` - זה ה-project ID של Supabase שלך
- כתובת ה-URL תהיה: `https://[project_id].supabase.co`

### סיכום - איפה הכל רץ?

| שירות | כתובת | איך לבדוק |
|------|-------|-----------|
| **Frontend** | `https://your-domain.com` | `curl https://your-domain.com` |
| **API (Python)** | `https://api.your-domain.com` | `curl https://api.your-domain.com` |
| **API מקומי** | `http://localhost:8000` | `curl http://localhost:8000` |
| **Supabase** | `https://[project_id].supabase.co` | בדוק ב-`config.toml` |

---

## 🚀 איך להפעיל את כל המערכת?

### סדר הפעלה מומלץ

#### שלב 0: בדוק שהכל מוכן לפני הפעלה

```bash
# 1. ודא ש-Python Server מוכן
cd /var/www/yt-slice-and-voice/youtube_server

# בדוק שהסביבה הוירטואלית קיימת
ls -la venv/

# בדוק שקובץ .env קיים
ls -la .env

# בדוק שקובץ server.py קיים
ls -la server.py

# 2. ודא ש-Frontend מוכן
cd /var/www/yt-slice-and-voice/frontend

# בדוק שקובץ .env.production קיים
ls -la .env.production

# בדוק שהתיקייה dist קיימת (אם לא, בנה: npm run build)
ls -la dist/
```

#### שלב 1: צור Systemd Service (אם עדיין לא קיים)

**בדוק אם ה-service כבר קיים:**
```bash
sudo systemctl status youtube-server
```

**אם אתה רואה שגיאה "Unit youtube-server.service could not be found", צור את ה-service:**

```bash
# צור את קובץ ה-service
sudo nano /etc/systemd/system/youtube-server.service
```

**העתק את התוכן הבא (חשוב: אין רווחים מיותרים או תווים מיוחדים!):**
```ini
[Unit]
Description=YouTube Downloader API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/yt-slice-and-voice/youtube_server
Environment=PATH=/var/www/yt-slice-and-voice/youtube_server/venv/bin
ExecStart=/var/www/yt-slice-and-voice/youtube_server/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**חשוב מאוד:**
- אין רווחים לפני או אחרי `=`
- אין גרשיים מיותרים ב-`Environment` (לא `Environment="..."` אלא `Environment=...`)
- כל שורה חייבת להיות תקינה

**שמור וצא:** `Ctrl+X`, `Y`, `Enter`

**אם יש שגיאות, בדוק את הקובץ:**
```bash
# בדוק את הקובץ
sudo cat /etc/systemd/system/youtube-server.service

# או ערוך מחדש
sudo nano /etc/systemd/system/youtube-server.service
```

**טען את ה-service:**
```bash
sudo systemctl daemon-reload
```

#### שלב 2: הפעל את Python Server

```bash
# הפעל את השירות
sudo systemctl start youtube-server

# הפעל בעת אתחול (כדי שהשרת יתחיל אוטומטית אחרי אתחול)
sudo systemctl enable youtube-server

# בדוק שהשרת רץ
sudo systemctl status youtube-server
```

**אם אתה רואה שגיאה, בדוק את הלוגים:**
```bash
# צפה בלוגים
sudo journalctl -u youtube-server -n 50

# או צפה בזמן אמת
sudo journalctl -u youtube-server -f
```

**בדיקה מהירה:**
```bash
# בדוק שהשרת מגיב מקומית
curl http://localhost:8000

# אמור להחזיר: {"status": "ok", "service": "YouTube Downloader API"}
```

**אם יש שגיאה, נסה להריץ ידנית:**
```bash
cd /var/www/yt-slice-and-voice/youtube_server
source venv/bin/activate
python server.py
```

זה יעזור לך לראות את השגיאה ישירות.

#### שלב 2: ודא ש-Frontend בנוי

```bash
cd /var/www/yt-slice-and-voice/frontend

# בדוק שהתיקייה dist קיימת
ls -la dist/

# אם לא קיימת או ריקה, בנה מחדש
npm run build

# ודא שהקבצים נוצרו
ls -la dist/
```

#### שלב 2.5: הפעלת Frontend כשירות (אופציונלי)

**אפשרות A: עם Nginx (מומלץ - כבר מוגדר!)**

אם אתה משתמש ב-Nginx לשרת קבצים סטטיים (כמו בתצורה שלנו), **אין צורך בשירות נפרד** ל-Frontend. Nginx משרת את הקבצים מ-`dist/` אוטומטית.

**בדוק שהכל עובד:**
```bash
# בדוק ש-Nginx רץ
sudo systemctl status nginx

# בדוק שהקבצים נגישים
curl http://65.21.192.187
```

**אפשרות B: עם PM2 (אם אתה רוצה preview server)**

אם אתה רוצה להריץ את ה-Frontend כ-preview server (לא מומלץ ל-production):

```bash
# התקן PM2 אם עדיין לא התקנת
sudo npm install -g pm2

# עבור לתיקיית Frontend
cd /var/www/yt-slice-and-voice/frontend

# צור קובץ תצורה ל-PM2
nano ecosystem.config.js
```

הוסף (ודא שאין רווחים מיותרים או תווים מיוחדים):
```javascript
module.exports = {
  apps: [{
    name: 'yt-slice-frontend',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/yt-slice-and-voice/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**חשוב:** 
- ודא שהקובץ מתחיל עם `module.exports` (ללא רווחים לפני)
- אין תווים מיוחדים או BOM (Byte Order Mark)
- כל הסוגריים מסוגרים נכון

**אם יש שגיאה, מחק את הקובץ וצור מחדש:**
```bash
# מחק את הקובץ הישן
rm ecosystem.config.js

# צור מחדש
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'yt-slice-frontend',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/yt-slice-and-voice/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# בדוק שהקובץ תקין
cat ecosystem.config.js

# נסה שוב
pm2 start ecosystem.config.js
```

**הפעל עם PM2:**
```bash
# הפעל את ה-application
pm2 start ecosystem.config.js

# הפעל בעת אתחול
pm2 startup
# העתק והרץ את הפקודה שהפלטה

# שמור את הרשימה
pm2 save

# בדוק סטטוס
pm2 status

# צפה בלוגים
pm2 logs yt-slice-frontend
```

**⚠️ הערה:** עם PM2, תצטרך לעדכן את תצורת Nginx להפנות ל-`http://localhost:3000` במקום לקבצים הסטטיים.

**אפשרות C: עם Systemd (אם אתה מעדיף systemd)**

```bash
# צור קובץ service
sudo nano /etc/systemd/system/yt-slice-frontend.service
```

הוסף:
```ini
[Unit]
Description=YT Slice Frontend Preview Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/yt-slice-and-voice/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**הפעל:**
```bash
sudo systemctl daemon-reload
sudo systemctl start yt-slice-frontend
sudo systemctl enable yt-slice-frontend
sudo systemctl status yt-slice-frontend
```

**⚠️ הערה:** גם כאן תצטרך לעדכן את Nginx להפנות ל-`http://localhost:3000`.

#### שלב 3: הפעל את Nginx

```bash
# בדוק את התצורה
sudo nginx -t

# אם הכל תקין, טען את התצורה
sudo systemctl reload nginx

# או הפעל מחדש
sudo systemctl restart nginx

# בדוק סטטוס
sudo systemctl status nginx

# ודא ש-Nginx רץ
sudo systemctl is-active nginx
```

#### שלב 4: בדוק שהכל עובד

**בדיקת Frontend:**
```bash
# בדוק דרך curl
curl http://65.21.192.187

# או פתח בדפדפן
# http://65.21.192.187
```

**בדיקת API דרך Nginx:**
```bash
# Health check
curl http://65.21.192.187/api/

# אמור להחזיר: {"status": "ok", "service": "YouTube Downloader API"}
```

**בדיקת API ישירות (מקומי):**
```bash
curl http://localhost:8000
```

### הפעלה אוטומטית בעת אתחול

**Python Server:**
```bash
# ודא שה-service מופעל בעת אתחול
sudo systemctl enable youtube-server

# בדוק
sudo systemctl is-enabled youtube-server
# אמור להחזיר: enabled
```

**Nginx:**
```bash
# Nginx כבר מופעל אוטומטית בדרך כלל
sudo systemctl enable nginx

# בדוק
sudo systemctl is-enabled nginx
```

### פקודות שימושיות לניהול

**הפעלה:**
```bash
# הפעל את Python Server
sudo systemctl start youtube-server

# הפעל את Nginx
sudo systemctl start nginx
```

**עצירה:**
```bash
# עצור את Python Server
sudo systemctl stop youtube-server

# עצור את Nginx
sudo systemctl stop nginx
```

**הפעלה מחדש:**
```bash
# הפעל מחדש את Python Server
sudo systemctl restart youtube-server

# הפעל מחדש את Nginx
sudo systemctl restart nginx
```

**צפייה בלוגים:**
```bash
# לוגים של Python Server
sudo journalctl -u youtube-server -f

# לוגים של Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# לוגים של המערכת
sudo journalctl -f
```

### Checklist לפני הפעלה

**Python Server:**
- [ ] סביבה וירטואלית נוצרה (`venv/` קיים)
- [ ] תלויות הותקנו (`pip install -r requirements.txt`)
- [ ] קובץ `.env` קיים עם `API_KEY` ו-`ALLOWED_ORIGINS`
- [ ] קובץ `server.py` קיים
- [ ] Systemd service נוצר (`/etc/systemd/system/youtube-server.service`)

**Frontend:**
- [ ] תלויות הותקנו (`npm install`)
- [ ] קובץ `.env.production` קיים עם כל המשתנים
- [ ] Frontend בנוי (`npm run build` הושלם)
- [ ] תיקייה `dist/` קיימת ולא ריקה
- [ ] Nginx משרת את הקבצים הסטטיים (או PM2/Systemd אם משתמש ב-preview server)

**Nginx:**
- [ ] Nginx מותקן (`sudo apt install nginx`)
- [ ] תצורה נוצרה (`/etc/nginx/sites-available/yt-slice-and-voice`)
- [ ] תצורה מופעלת (`/etc/nginx/sites-enabled/yt-slice-and-voice`)
- [ ] תצורה נכונה (`sudo nginx -t` עובר)

**Supabase (אופציונלי):**
- [ ] Supabase Secrets מוגדרים (אם משתמש ב-Edge Functions)

---

## ✅ בדיקות

### בדיקת Frontend

```bash
# בדוק שהקבצים קיימים
ls -la /var/www/yt-slice-and-voice/frontend/dist

# בדוק דרך הדפדפן
curl http://your-domain.com
```

### בדיקת Python Server

```bash
# בדוק שהשירות רץ
sudo systemctl status youtube-server

# בדוק את הלוגים
sudo journalctl -u youtube-server -n 50

# בדוק את ה-API
curl http://localhost:8000
curl https://api.your-domain.com
```

### בדיקת Nginx

```bash
# בדוק סטטוס
sudo systemctl status nginx

# בדוק לוגים
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# בדוק תצורה
sudo nginx -t
```

### בדיקת SSL

```bash
# בדוק תעודת SSL
sudo certbot certificates

# בדוק תאריך תפוגה
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔧 תחזוקה שוטפת

### עדכון Frontend

```bash
cd /var/www/yt-slice-and-voice/frontend

# משוך שינויים
git pull

# התקן תלויות חדשות
npm install

# בנה מחדש
npm run build

# אין צורך בטעינה מחדש - Nginx משרת קבצים סטטיים
```

### עדכון Python Server

```bash
cd /var/www/yt-slice-and-voice/youtube_server

# משוך שינויים
git pull

# הפעל סביבה וירטואלית
source venv/bin/activate

# עדכן תלויות
pip install -r requirements.txt

# הפעל מחדש את השירות
sudo systemctl restart youtube-server
```

### עדכון yt-dlp

```bash
cd /var/www/yt-slice-and-voice/youtube_server
source venv/bin/activate

pip install --upgrade yt-dlp
```

### גיבוי

```bash
# צור סקריפט גיבוי
nano /home/user/backup.sh
```

הוסף:

```bash
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# גבה את הפרויקט
tar -czf $BACKUP_DIR/yt-slice-$DATE.tar.gz /var/www/yt-slice-and-voice

# מחק גיבויים ישנים (יותר מ-7 ימים)
find $BACKUP_DIR -name "yt-slice-*.tar.gz" -mtime +7 -delete

echo "Backup completed: yt-slice-$DATE.tar.gz"
```

הפוך לביצועי:
```bash
chmod +x /home/user/backup.sh
```

הוסף ל-crontab:
```bash
crontab -e

# הוסף שורה זו להרצה יומית ב-2 בלילה
0 2 * * * /home/user/backup.sh
```

---

## 🚨 פתרון בעיות

### שגיאת "vite: not found" בעת בנייה

**תסמינים:**
```
sh: 1: vite: not found
```

**פתרון:**
```bash
cd /var/www/yt-slice-and-voice/frontend

# ודא שאתה בתיקייה הנכונה
pwd

# נקה node_modules אם קיים
rm -rf node_modules package-lock.json

# התקן מחדש את כל התלויות (חובה!)
npm install

# בדוק ש-vite מותקן
ls node_modules/.bin/vite

# עכשיו נסה לבנות מחדש
npm run build
```

**סיבה:** `vite` הוא ב-`devDependencies` ולכן צריך להריץ `npm install` (לא `--production`).

### שגיאת "requirements.txt: No such file or directory"

**תסמינים:**
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

**פתרון:**
```bash
# ודא שאתה בתיקייה הנכונה
cd /var/www/yt-slice-and-voice/youtube_server
pwd

# בדוק שהקובץ קיים
ls -la requirements.txt

# אם הקובץ לא קיים, העתק אותו:
# דרך 1: שכפל מהגיט
cd /var/www/yt-slice-and-voice
git pull  # או git clone אם עדיין לא שכפלת

# דרך 2: העתק ידנית מהמחשב המקומי
# scp requirements.txt user@your-server:/var/www/yt-slice-and-voice/youtube_server/

# דרך 3: צור את הקובץ ידנית
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
yt-dlp==2023.11.16
pydantic==2.5.0
python-multipart==0.0.6
EOF

# עכשיו נסה שוב
pip install -r requirements.txt
```

### שגיאת Systemd Service - "Assignment outside of section"

**תסמינים:**
```
systemd[1]: /etc/systemd/system/youtube-server.service:1: Assignment outside of section. Ignoring.
systemd[1]: /etc/systemd/system/youtube-server.service:17: Missing '=', ignoring line.
```

**פתרון:**
```bash
# בדוק את הקובץ
sudo cat /etc/systemd/system/youtube-server.service

# ערוך את הקובץ מחדש
sudo nano /etc/systemd/system/youtube-server.service
```

**ודא שהקובץ נראה כך בדיוק (ללא רווחים מיותרים או תווים מיוחדים):**
```ini
[Unit]
Description=YouTube Downloader API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/yt-slice-and-voice/youtube_server
Environment=PATH=/var/www/yt-slice-and-voice/youtube_server/venv/bin
ExecStart=/var/www/yt-slice-and-voice/youtube_server/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**חשוב:**
- אין גרשיים ב-`Environment` (לא `Environment="PATH=..."` אלא `Environment=PATH=...`)
- אין רווחים לפני או אחרי `=`
- כל שורה חייבת להיות תקינה

**אחרי התיקון:**
```bash
# טען מחדש
sudo systemctl daemon-reload

# הפעל מחדש
sudo systemctl restart youtube-server

# בדוק סטטוס
sudo systemctl status youtube-server
```

### Python Server לא מתחיל

```bash
# בדוק לוגים
sudo journalctl -u youtube-server -n 100

# בדוק שהפורט פנוי
sudo netstat -tulpn | grep 8000

# בדוק הרשאות
ls -la /var/www/yt-slice-and-voice/youtube_server

# בדוק שהסביבה הוירטואלית קיימת
ls -la /var/www/yt-slice-and-voice/youtube_server/venv

# בדוק שהקבצים הנדרשים קיימים
ls -la /var/www/yt-slice-and-voice/youtube_server/server.py
ls -la /var/www/yt-slice-and-voice/youtube_server/requirements.txt
```

### Nginx לא משרת קבצים

```bash
# בדוק הרשאות
sudo chown -R www-data:www-data /var/www/yt-slice-and-voice/frontend/dist

# בדוק תצורה
sudo nginx -t

# טען מחדש
sudo systemctl reload nginx
```

### שגיאת CORS

```bash
# ודא ש-ALLOWED_ORIGINS ב-.env של Python Server כולל את הדומיין הנכון
nano /var/www/yt-slice-and-voice/youtube_server/.env

# הפעל מחדש
sudo systemctl restart youtube-server
```

### שגיאת PM2 - "File ecosystem.config.js malformated"

**תסמינים:**
```
[PM2][ERROR] File ecosystem.config.js malformated
ReferenceError: javascript is not defined
```

**פתרון:**
```bash
cd /var/www/yt-slice-and-voice/frontend

# מחק את הקובץ הישן
rm ecosystem.config.js

# צור מחדש עם cat (ללא nano כדי למנוע בעיות encoding)
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'yt-slice-frontend',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/yt-slice-and-voice/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# בדוק שהקובץ תקין
cat ecosystem.config.js

# בדוק syntax
node -c ecosystem.config.js

# נסה שוב עם PM2
pm2 start ecosystem.config.js
```

**אם עדיין יש בעיה, נסה גרסה פשוטה יותר:**
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'yt-slice-frontend',
    script: 'npm',
    args: 'run preview',
    instances: 1,
    autorestart: true
  }]
};
EOF
```

### שגיאת SSL

```bash
# בדוק תעודה
sudo certbot certificates

# חידוש ידני
sudo certbot renew

# טען מחדש Nginx
sudo systemctl reload nginx
```

### בעיות דיסק

```bash
# בדוק שימוש בדיסק
df -h

# נקה קבצים זמניים
sudo apt autoremove -y
sudo apt autoclean

# נקה לוגים ישנים
sudo journalctl --vacuum-time=7d
```

---

## 📊 ניטור

### ניטור שימוש במשאבים

```bash
# CPU ו-RAM
htop

# דיסק
df -h
du -sh /var/www/yt-slice-and-voice/*

# רשת
sudo iftop
```

### ניטור לוגים

```bash
# Python Server
sudo journalctl -u youtube-server -f

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -f
```

---

## 🔐 אבטחה

### Firewall (UFW)

```bash
# הפעל firewall
sudo ufw enable

# אפשר SSH
sudo ufw allow 22/tcp

# אפשר HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# בדוק סטטוס
sudo ufw status
```

### עדכונים אוטומטיים

```bash
# התקן unattended-upgrades
sudo apt install -y unattended-upgrades

# הגדר
sudo dpkg-reconfigure -plow unattended-upgrades
```

### הגבלת גישה ל-API

```bash
# הוסף IP whitelist ב-Nginx
sudo nano /etc/nginx/sites-available/yt-slice-and-voice
```

הוסף ל-location של ה-API:

```nginx
location / {
    # Allow only specific IPs (אופציונלי)
    # allow 1.2.3.4;
    # deny all;
    
    proxy_pass http://localhost:8000;
    # ... שאר ההגדרות
}
```

---

## 📝 Checklist סופי

### לפני העלאה
- [ ] שרת Ubuntu מוכן ועודכן
- [ ] Node.js 18+ מותקן
- [ ] Python 3.8+ מותקן
- [ ] FFmpeg מותקן
- [ ] Nginx מותקן
- [ ] דומיין מוגדר (אופציונלי)

### אחרי העלאה
- [ ] Frontend בנוי ומוגש דרך Nginx
- [ ] Python Server רץ כ-systemd service
- [ ] SSL מוגדר (Let's Encrypt)
- [ ] כל משתני הסביבה מוגדרים
- [ ] Firewall מופעל
- [ ] גיבויים מוגדרים
- [ ] ניטור מוגדר

### בדיקות
- [ ] Frontend נטען בדפדפן
- [ ] Python API מגיב
- [ ] SSL עובד
- [ ] אין שגיאות ב-logs

---

## 🎉 סיכום

אם הגעת עד כאן והכל עובד, **מזל טוב!** המערכת מועלת ופועלת על שרת Ubuntu.

**קישורים שימושיים:**
- Frontend: `https://your-domain.com`
- API: `https://api.your-domain.com`
- Supabase Dashboard: `https://supabase.com/dashboard`

**תמיכה:**
- לוגים: `sudo journalctl -u youtube-server -f`
- Nginx: `sudo tail -f /var/log/nginx/error.log`
- Supabase: Dashboard → Logs

---

**עודכן לאחרונה:** 2025-01-XX

