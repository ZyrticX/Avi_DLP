import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Scissors, 
  Download, 
  Upload,
  Music,
  Video,
  Settings
} from "lucide-react";

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-white p-4 text-black">
      
      {/* כותרת ראשית */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Music className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-6xl font-bold text-black">
            YouTube Cutter Pro
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-600 mb-6">
          חתכו וערכו סרטוני YouTube בקלות
        </p>
        <div className="flex gap-4 justify-center">
          <Badge className="text-lg px-4 py-2">חיתוך מהיר</Badge>
          <Badge className="text-lg px-4 py-2">איכות גבוהה</Badge>
          <Badge className="text-lg px-4 py-2">זיהוי שירים</Badge>
        </div>
      </div>

      {/* ממשק ראשי */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* הכנסת לינק */}
        <Card className="bg-green-50 border-2 border-green-500 p-4 md:p-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary" />
              הכנסת לינק YouTube
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="text-lg p-3"
              dir="ltr"
            />
            <Button variant="default" size="lg" className="w-full text-lg">
              <Play className="w-5 h-5 mr-2" />
              טען סרטון
            </Button>
          </CardContent>
        </Card>

        {/* נגן ובקרות */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Video className="w-6 h-6 text-secondary" />
              נגן וחיתוך
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* תצוגה מקדימה */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">התצוגה המקדימה תופיע כאן</p>
              </div>
            </div>

            {/* כפתורי בקרה */}
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-lg px-6"
              >
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? 'עצור' : 'נגן'}
              </Button>
              <Button variant="secondary" className="text-lg px-6">
                <Scissors className="w-5 h-5 mr-2" />
                חתוך
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* הגדרות איכות */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Settings className="w-6 h-6 text-accent" />
              הגדרות איכות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="text-lg font-medium">פורמט אודיו</label>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-lg">MP3</Button>
                <Button variant="outline" className="text-lg">WAV</Button>
                <Button variant="outline" className="text-lg">FLAC</Button>
                <Button variant="default" className="text-lg">AAC</Button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-lg font-medium">איכות</label>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="text-lg">128k</Button>
                <Button variant="outline" className="text-lg">256k</Button>
                <Button variant="default" className="text-lg">320k</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* הורדה */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" />
              הורדה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="default" size="lg" className="w-full text-xl py-4">
              <Download className="w-6 h-6 mr-2" />
              הורד קבצים
            </Button>
            <Button variant="secondary" className="w-full text-lg">
              איחוד מקטעים
            </Button>
            <p className="text-center text-muted-foreground">
              זיהוי אוטומטי של שמות שירים
            </p>
          </CardContent>
        </Card>

      </div>

      {/* מידע נוסף */}
      <div className="text-center mt-12 p-6 bg-muted rounded-lg max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">התכונות שלנו</h3>
        <div className="grid md:grid-cols-3 gap-4 text-lg">
          <div>✂️ חיתוך מדויק</div>
          <div>🎵 זיהוי שירים</div>
          <div>📱 מותאם לנייד</div>
          <div>🎧 איכות HD</div>
          <div>⚡ מהיר וקל</div>
          <div>🆓 בחינם</div>
        </div>
      </div>

    </div>
  );
};

export default Index;