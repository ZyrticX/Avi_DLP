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

```bash
cd /var/www/yt-slice-and-voice/frontend

# שכפל את הפרויקט
git clone https://github.com/ZyrticX/Avi_DLP.git .

# או העלה את הקבצים דרך SCP/SFTP
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

הוסף את התוכן הבא (החלף בערכים האמיתיים):

```env
VITE_SUPABASE_URL=https://esrtnatrbkjheskjcipz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_YOUTUBE_API_URL=https://api.your-domain.com
VITE_YOUTUBE_API_KEY=your_api_key_here
```

**חשוב:** בנה מחדש אחרי שינוי `.env.production`:
```bash
npm run build
```

---

## 🐍 התקנת Python Server

### שלב 1: העתקת קבצים

```bash
cd /var/www/yt-slice-and-voice/youtube_server

# העתק את הקבצים מהפרויקט המקומי או שכפל מהגיט
# הקבצים הנדרשים:
# - server.py
# - requirements.txt
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
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

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

