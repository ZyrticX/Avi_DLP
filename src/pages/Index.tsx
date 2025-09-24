import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Scissors, 
  Download, 
  Upload,
  Music,
  Video,
  Settings,
  Youtube,
  Link2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  SkipBack,
  SkipForward,
  Edit3,
  Save,
  FileText,
  Layers3,
  Headphones
} from "lucide-react";

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState([0]);
  const [segments, setSegments] = useState<Array<{id: number, start: number, end: number, title: string}>>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      
      {/* כותרת ראשית עם גרדיאנט */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
            <Music className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            YouTube Cutter Pro
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground mb-6">
          חתכו וערכו סרטוני YouTube בקלות - ללא עלויות
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Badge className="text-lg px-6 py-3 bg-primary text-primary-foreground">חיתוך מהיר</Badge>
          <Badge className="text-lg px-6 py-3 bg-secondary text-secondary-foreground">איכות גבוהה</Badge>
          <Badge className="text-lg px-6 py-3 bg-accent text-accent-foreground">זיהוי שירים</Badge>
          <Badge className="text-lg px-6 py-3 bg-muted text-muted-foreground">חינמי</Badge>
        </div>
      </div>

      {/* הודעת Supabase */}
      <Card className="max-w-4xl mx-auto mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-center">
            <Settings className="w-6 h-6 text-primary" />
            <p className="text-lg">
              לשימוש מלא באפליקציה (חיבור ליוטיוב, חיתוך וידאו, שמירת קבצים), יש להתחבר ל-Supabase דרך הכפתור הירוק למעלה
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-7xl mx-auto grid gap-8">
        
        {/* אזור הכנסת לינק */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 shadow-glow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Youtube className="w-8 h-8 text-primary" />
                התחבר לחשבון YouTube
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full text-lg bg-primary hover:bg-primary/90">
                <Youtube className="w-6 h-6 mr-2" />
                התחבר לחשבון
              </Button>
              <p className="text-center text-muted-foreground">משוך פלייליסטים ווידאו מהחשבון שלך</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Link2 className="w-8 h-8 text-secondary" />
                הדבק לינק ישיר
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="text-lg p-4 border-secondary/30"
                dir="ltr"
              />
              <Button size="lg" className="w-full text-lg bg-secondary hover:bg-secondary/90">
                <Upload className="w-6 h-6 mr-2" />
                טען וידאו
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* נגן וחיתוך */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 shadow-card">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Video className="w-10 h-10 text-accent" />
              נגן וחיתוך מתקדם
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* תצוגה מקדימה */}
            <div className="aspect-video bg-gradient-to-br from-muted to-background rounded-xl border-2 border-dashed border-accent/30 flex items-center justify-center relative">
              <div className="text-center">
                <Video className="w-20 h-20 text-accent mx-auto mb-4" />
                <p className="text-2xl text-accent font-semibold mb-2">תצוגה מקדימה</p>
                <p className="text-lg text-muted-foreground">הוידאו יופיע כאן לאחר הטעינה</p>
              </div>
              
              {/* בקרות תרגום ודיבוב */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur">
                  <FileText className="w-4 h-4 mr-1" />
                  כתוביות
                </Button>
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur">
                  <Volume2 className="w-4 h-4 mr-1" />
                  דיבוב
                </Button>
              </div>
              
              {/* בחירת שפה */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur">
                  🇬🇧 אנגלית
                </Button>
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur">
                  🇪🇸 ספרדית
                </Button>
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur">
                  🇫🇷 צרפתית
                </Button>
              </div>
            </div>

            {/* בקרות נגן */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl">
              <div className="flex justify-center gap-4 mb-6">
                <Button variant="outline" size="lg" className="text-lg px-6">
                  <SkipBack className="w-5 h-5 mr-2" />
                  -10s
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-xl px-8 bg-primary hover:bg-primary/90"
                >
                  {isPlaying ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {isPlaying ? 'עצור' : 'נגן'}
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-6">
                  <SkipForward className="w-5 h-5 mr-2" />
                  +10s
                </Button>
              </div>
              
              {/* ציר זמן וחיתוך */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-mono">00:00</span>
                  <div className="flex-1">
                    <Slider
                      value={currentTime}
                      onValueChange={setCurrentTime}
                      max={100}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <span className="text-lg font-mono">03:45</span>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button className="bg-accent hover:bg-accent/90" size="lg">
                    <Scissors className="w-5 h-5 mr-2" />
                    חתוך כאן
                  </Button>
                  <Button variant="outline" size="lg">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    נקודת התחלה
                  </Button>
                  <Button variant="outline" size="lg">
                    <ChevronRight className="w-5 h-5 mr-2" />
                    נקודת סיום
                  </Button>
                </div>
              </div>

              {/* עוצמת קול */}
              <div className="flex items-center gap-4 mt-6">
                <Volume2 className="w-6 h-6 text-accent" />
                <Slider value={[75]} max={100} className="flex-1" />
                <span className="text-lg">75%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* רשימת מקטעים */}
        <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/30">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Layers3 className="w-10 h-10 text-secondary" />
              מקטעים נחתכו
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {segments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">עדיין לא נחתכו מקטעים</p>
                <p>התחל לחתוך כדי לראות את המקטעים כאן</p>
              </div>
            ) : (
              segments.map((segment, index) => (
                <div key={segment.id} className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-secondary/20">
                  <span className="text-2xl font-bold text-secondary">{index + 1}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{segment.title || `מקטע ${index + 1}`}</h3>
                    <p className="text-muted-foreground">{segment.start}s - {segment.end}s</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-1" />
                    ערוך
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    נגן
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* הגדרות איכות ויצוא */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Headphones className="w-8 h-8 text-accent" />
                הגדרות איכות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-lg font-medium">פורמט אודיו</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="text-lg">MP3</Button>
                  <Button variant="outline" className="text-lg">WAV</Button>
                  <Button variant="outline" className="text-lg">FLAC</Button>
                  <Button className="text-lg bg-accent hover:bg-accent/90">AAC</Button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-lg font-medium">איכות אודיו</label>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="text-lg">128k</Button>
                  <Button variant="outline" className="text-lg">256k</Button>
                  <Button className="text-lg bg-accent hover:bg-accent/90">320k</Button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-lg font-medium">פורמט וידאו</label>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="text-lg">720p</Button>
                  <Button variant="outline" className="text-lg">1080p</Button>
                  <Button className="text-lg bg-accent hover:bg-accent/90">4K</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-glow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Download className="w-8 h-8 text-primary" />
                אפשרויות הורדה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full text-xl py-4 bg-primary hover:bg-primary/90">
                <Download className="w-6 h-6 mr-2" />
                הורד את כל המקטעים
              </Button>
              <Button variant="outline" size="lg" className="w-full text-lg">
                <Save className="w-6 h-6 mr-2" />
                הורד מקטעים נבחרים
              </Button>
              <Button variant="outline" size="lg" className="w-full text-lg">
                <Layers3 className="w-6 h-6 mr-2" />
                איחוד מקטעים עם מיקס
              </Button>
              
              {/* הורדת כתוביות ודיבוב בנפרד */}
              <div className="border-t pt-4">
                <p className="text-lg font-semibold mb-3 text-center">הורדות נפרדות</p>
                <Button variant="outline" size="lg" className="w-full text-lg mb-2">
                  <FileText className="w-6 h-6 mr-2" />
                  הורד רק כתוביות (.srt)
                </Button>
                <Button variant="outline" size="lg" className="w-full text-lg mb-2">
                  <Volume2 className="w-6 h-6 mr-2" />
                  הורד רק דיבוב (.mp3)
                </Button>
                <Button variant="outline" size="lg" className="w-full text-lg">
                  <Video className="w-6 h-6 mr-2" />
                  הורד וידאו מתורגם
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* מידע נוסף */}
        <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-3xl font-bold mb-6 text-center bg-gradient-primary bg-clip-text text-transparent">
              התכונות המתקדמות שלנו
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-lg">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Scissors className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className="font-semibold">חיתוך מדויק</div>
                <div className="text-muted-foreground">חיתוך במדויקות שניות</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Music className="w-12 h-12 text-secondary mx-auto mb-2" />
                <div className="font-semibold">זיהוי שירים</div>
                <div className="text-muted-foreground">זיהוי אוטומטי של שמות</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Headphones className="w-12 h-12 text-accent mx-auto mb-2" />
                <div className="font-semibold">איכות HD</div>
                <div className="text-muted-foreground">קידוד איכותי ברזולוציה גבוהה</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Video className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className="font-semibold">מיקס מתקדם</div>
                <div className="text-muted-foreground">מעברים חלקים בין מקטעים</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <FileText className="w-12 h-12 text-secondary mx-auto mb-2" />
                <div className="font-semibold">כתוביות</div>
                <div className="text-muted-foreground">תרגום וכתוביות אוטומטיות</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Download className="w-12 h-12 text-accent mx-auto mb-2" />
                <div className="font-semibold">ללא עלויות</div>
                <div className="text-muted-foreground">שירות חינמי ללא הגבלה</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Index;