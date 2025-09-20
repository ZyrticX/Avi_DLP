import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap,
  Sparkles,
  Volume2
} from "lucide-react";
import heroImage from "@/assets/hero-audio-bg.jpg";

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState([0]);
  const [duration, setDuration] = useState(300);
  const [cutSegments, setCutSegments] = useState([{ start: 30, end: 90, id: 1 }]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <div 
        className="relative min-h-[50vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="w-8 h-8 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              YouTube Cutter Pro
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            חתכו, עדכנו ותרגמו סרטוני YouTube בצורה מקצועית. איכות גבוהה, זיהוי שירים אוטומטי ותמיכה בכתוביות ודיבוב.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-4 h-4 mr-1" />
              חיתוך מהיר
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Sparkles className="w-4 h-4 mr-1" />
              זיהוי שירים אוטומטי
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Volume2 className="w-4 h-4 mr-1" />
              איכות HD
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* URL Input & Video Preview */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* URL Input */}
            <Card className="shadow-card border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  הכנסת לינק YouTube
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="bg-input/50 border-border/50 text-right"
                    dir="ltr"
                  />
                  <Button variant="audio" size="lg">
                    <Play className="w-4 h-4" />
                    טען סרטון
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  תמיכה בסרטונים מכל אורך, פלייליסטים וערוצים פרטיים
                </p>
              </CardContent>
            </Card>

            {/* Video Player & Timeline */}
            <Card className="shadow-card border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-secondary" />
                    נגן וחיתוך
                  </span>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(currentTime[0])} / {formatTime(duration)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Video Preview */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">התצוגה המקדימה תופיע כאן</p>
                  </div>
                </div>

                {/* Timeline Slider */}
                <div className="space-y-4">
                  <Slider
                    value={currentTime}
                    onValueChange={setCurrentTime}
                    max={duration}
                    step={1}
                    className="w-full"
                  />
                  
                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="player" 
                      size="sm"
                      onClick={() => setCurrentTime([Math.max(0, currentTime[0] - 5)])}
                    >
                      -5s
                    </Button>
                    <Button 
                      variant="player" 
                      size="sm"
                      onClick={() => setCurrentTime([Math.max(0, currentTime[0] - 1)])}
                    >
                      -1s
                    </Button>
                    <Button 
                      variant="audio" 
                      size="lg"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button 
                      variant="player" 
                      size="sm"
                      onClick={() => setCurrentTime([Math.min(duration, currentTime[0] + 1)])}
                    >
                      +1s
                    </Button>
                    <Button 
                      variant="player" 
                      size="sm"
                      onClick={() => setCurrentTime([Math.min(duration, currentTime[0] + 5)])}
                    >
                      +5s
                    </Button>
                  </div>
                </div>

                {/* Cut Segments */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-accent" />
                    מקטעים לחיתוך
                  </h4>
                  {cutSegments.map((segment, index) => (
                    <div key={segment.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge variant="outline">מקטע {index + 1}</Badge>
                      <span className="text-sm">
                        {formatTime(segment.start)} - {formatTime(segment.end)}
                      </span>
                      <Button variant="cut" size="sm" className="mr-auto">
                        עדכן
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    + הוסף מקטע חדש
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Settings & Download Panel */}
          <div className="space-y-6">
            
            {/* Format & Quality Settings */}
            <Card className="shadow-card border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  הגדרות איכות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="audio" className="space-y-4">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="audio">אודיו</TabsTrigger>
                    <TabsTrigger value="video">וידאו</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="audio" className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">פורמט אודיו</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">MP3</Button>
                        <Button variant="outline" size="sm">WAV</Button>
                        <Button variant="outline" size="sm">FLAC</Button>
                        <Button variant="outline" size="sm">AAC</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">איכות</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm">128k</Button>
                        <Button variant="outline" size="sm">256k</Button>
                        <Button variant="default" size="sm">320k</Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="video" className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">רזולוציה</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">720p</Button>
                        <Button variant="default" size="sm">1080p</Button>
                        <Button variant="outline" size="sm">1440p</Button>
                        <Button variant="outline" size="sm">4K</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Download Actions */}
            <Card className="shadow-card border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-audio-progress" />
                  הורדה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="download" className="w-full" size="lg">
                  <Download className="w-4 h-4" />
                  הורד מקטעים נפרדים
                </Button>
                <Button variant="secondary" className="w-full">
                  איחוד כל המקטעים
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  זיהוי אוטומטי של שמות שירים
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card className="shadow-card border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>התקדמות</span>
                    <span>0%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-audio w-0 transition-all duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;