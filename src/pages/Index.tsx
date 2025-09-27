import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  Headphones,
  GripVertical,
  Clock,
  Palette,
  ChevronDown,
  Crown,
  Check,
  X,
  Star,
  Sparkles,
  AlertCircle
} from "lucide-react";

// SortableItem component for drag and drop segments
const SortableItem = ({ segment, index, onEdit, onPlay }: {
  segment: {id: number, start: number, end: number, title: string},
  index: number,
  onEdit: (id: number, newTitle: string) => void,
  onPlay: (id: number) => void
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(segment.title);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onEdit(segment.id, editTitle);
    setIsEditing(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-secondary/20"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <span className="text-2xl font-bold text-secondary">{index + 1}</span>
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                שמור
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                ביטול
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold">{segment.title || `מקטע ${index + 1}`}</h3>
            <p className="text-muted-foreground">{segment.start}s - {segment.end}s</p>
          </>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
        <Edit3 className="w-4 h-4 mr-1" />
        ערוך
      </Button>
      <Button variant="outline" size="sm" onClick={() => onPlay(segment.id)}>
        <Play className="w-4 h-4 mr-1" />
        נגן
      </Button>
    </div>
  );
};

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState([0]);
  const [segments, setSegments] = useState<Array<{id: number, start: number, end: number, title: string}>>([]);
  const [fadeInDuration, setFadeInDuration] = useState([2]);
  const [fadeOutDuration, setFadeOutDuration] = useState([2]);
  const [projectName, setProjectName] = useState("פרויקט YouTube Cutter");
  const [isEditingName, setIsEditingName] = useState(false);
  const [startTime, setStartTime] = useState([0]);
  const [endTime, setEndTime] = useState([100]);
  const [showStreamingServices, setShowStreamingServices] = useState(false);
  const [usageCount, setUsageCount] = useState(0); // מספר השימושים של המשתמש
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSegments((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEditSegment = (id: number, newTitle: string) => {
    setSegments(segments.map(segment => 
      segment.id === id ? { ...segment, title: newTitle } : segment
    ));
  };

  const handlePlaySegment = (id: number) => {
    console.log(`Playing segment ${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      
      {/* כותרת ראשית עם גרדיאנט */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
            <Music className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="flex flex-col items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-2xl md:text-4xl font-bold text-center"
                  onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                />
                <Button size="sm" onClick={() => setIsEditingName(false)}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {projectName}
                </h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingName(true)}
                  className="opacity-70 hover:opacity-100"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
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
        
        {/* הגבלות שימוש חינמי */}
        <Card className="max-w-4xl mx-auto mb-8 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-center">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-lg font-semibold">שימוש חינמי מוגבל</p>
                <p className="text-sm text-muted-foreground">
                  עד 2 דקות, איכות בסיסית, 3 ניסיונות ליום. לשימוש מלא - שדרגו למנוי
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">ניסיונות: {3 - usageCount}/3</Badge>
                  <Badge variant="outline">זמן מקסימלי: 2 דקות</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* אזור הכנסת לינק */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
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

          <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Music className="w-8 h-8 text-accent" />
                שירותי סטרימינג
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Button 
                  size="lg" 
                  className="w-full text-lg bg-accent hover:bg-accent/90"
                  onClick={() => setShowStreamingServices(!showStreamingServices)}
                >
                  <Music className="w-6 h-6 mr-2" />
                  התחבר לשירות
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                {showStreamingServices && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-background border border-border rounded-lg shadow-lg z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      📺 YouTube
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎵 Spotify
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎧 SoundCloud
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎵 Apple Music
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      📸 Instagram
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      📘 Facebook
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      📱 TikTok
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      📺 Twitch
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎥 Vimeo
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎶 Deezer
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎵 Pandora
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎧 Mixcloud
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎵 Beatport
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎧 Bandcamp
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎵 Tidal
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      📻 Radio.com
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎶 Audiomack
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎵 Napster
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎧 8tracks
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🎵 Qobuz
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-center text-muted-foreground text-sm">גש לתכנים מהפלטפורמות הפופולריות</p>
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
          <CardContent className="space-y-8">
            
            {/* בקרות מעל הנגן - שתי שורות */}
            <div className="space-y-3 mb-4">
              {/* שורה ראשונה: דיבוב וכתוביות */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" className="px-4 py-2">
                  <Volume2 className="w-4 h-4 mr-2" />
                  דיבוב ▼
                </Button>
                <Button variant="outline" size="sm" className="px-4 py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  כתוביות ▼
                </Button>
              </div>
              
              {/* שורה שנייה: חיתוך וידאו ואודיו */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" className="px-4 py-2">
                  <Video className="w-4 h-4 mr-2" />
                  חיתוך וידאו
                </Button>
                <Button variant="outline" size="sm" className="px-4 py-2">
                  <Headphones className="w-4 h-4 mr-2" />
                  חיתוך אודיו
                </Button>
              </div>
            </div>

            {/* תצוגה מקדימה - מתאימה למובייל */}
            <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-4xl'} mx-auto mb-8`}>
              <div className="aspect-video bg-gradient-to-br from-muted to-background rounded-3xl border-2 border-dashed border-accent/30 flex items-center justify-center relative">
                <div className="text-center">
                  <Video className={`${isMobile ? 'w-12 h-12' : 'w-20 h-20'} text-accent mx-auto mb-4`} />
                  <p className={`${isMobile ? 'text-lg' : 'text-2xl'} text-accent font-semibold mb-2`}>תצוגה מקדימה</p>
                  <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-muted-foreground`}>הוידאו יופיע כאן לאחר הטעינה</p>
                </div>
              </div>
              
              {/* ציר זמן מתקדם עם סמני חיתוך */}
              <div className="mt-6 space-y-4">
                <div className="relative">
                  {/* ציר הזמן הראשי */}
                  <Slider
                    value={currentTime}
                    onValueChange={setCurrentTime}
                    max={100}
                    step={0.1}
                    className="w-full [&_.slider-thumb]:w-6 [&_.slider-thumb]:h-6 [&_.slider-thumb]:bg-primary"
                  />
                  
                  {/* סמני התחלה וסיום לחיתוך */}
                  <div className="relative mt-2">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span>התחלה</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span>סיום</span>
                      </div>
                    </div>
                    
                    {/* סלידר להתחלה */}
                    <div className="mb-2">
                      <Slider
                        value={startTime}
                        onValueChange={setStartTime}
                        max={100}
                        step={0.1}
                        className="w-full [&_.slider-thumb]:w-4 [&_.slider-thumb]:h-4 [&_.slider-thumb]:bg-green-500"
                      />
                    </div>
                    
                    {/* סלידר לסיום */}
                    <div>
                      <Slider
                        value={endTime}
                        onValueChange={setEndTime}
                        max={100}
                        step={0.1}
                        className="w-full [&_.slider-thumb]:w-4 [&_.slider-thumb]:h-4 [&_.slider-thumb]:bg-red-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* זמנים ומידע על החיתוך */}
                <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">התחלה</p>
                      <p className="font-mono text-sm font-semibold text-green-600">
                        {Math.floor(startTime[0] * 3.45 / 100 * 60).toString().padStart(2, '0')}:{Math.floor((startTime[0] * 3.45 / 100 % 1) * 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">סיום</p>
                      <p className="font-mono text-sm font-semibold text-red-600">
                        {Math.floor(endTime[0] * 3.45 / 100 * 60).toString().padStart(2, '0')}:{Math.floor((endTime[0] * 3.45 / 100 % 1) * 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">אורך המקטע</p>
                      <p className="font-mono text-sm font-semibold">
                        {Math.floor((endTime[0] - startTime[0]) * 3.45 / 100 * 60).toString().padStart(2, '0')}:{Math.floor(((endTime[0] - startTime[0]) * 3.45 / 100 % 1) * 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* בקרות נגן */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-3 md:p-6 rounded-xl">
              <div className={`flex justify-center gap-2 md:gap-4 mb-4 md:mb-6 ${isMobile ? 'flex-wrap' : ''}`}>
                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`${isMobile ? 'text-sm px-3' : 'text-lg px-6'}`}>
                  <SkipBack className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 md:mr-2`} />
                  -10s
                </Button>
                <Button 
                  size={isMobile ? "default" : "default"}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`${isMobile ? 'text-base px-4' : 'text-lg px-6'} bg-primary hover:bg-primary/90`}
                >
                  {isPlaying ? <Pause className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} mr-1 md:mr-2`} /> : <Play className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} mr-1 md:mr-2`} />}
                  {isPlaying ? 'עצור' : 'נגן'}
                </Button>
                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`${isMobile ? 'text-sm px-3' : 'text-lg px-6'}`}>
                  <SkipForward className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 md:mr-2`} />
                  +10s
                </Button>
              </div>
              
              {/* כפתורי חיתוך בשורה אחת - מותאם למובייל */}
              <div className={`flex justify-between items-center gap-2 mb-4 ${isMobile ? 'max-w-xs' : 'max-w-2xl'} mx-auto`}>
                <Button variant="outline" size={isMobile ? "sm" : "lg"} className={`rounded-full ${isMobile ? 'px-3 py-2 text-sm' : 'px-8 py-3'}`}>
                  <ChevronLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
                  התחלה
                </Button>
                <Button className={`bg-accent hover:bg-accent/90 rounded-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-8 py-3'}`} size={isMobile ? "sm" : "lg"}>
                  <Scissors className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
                  חתוך
                </Button>
                <Button variant="outline" size={isMobile ? "sm" : "lg"} className={`rounded-full ${isMobile ? 'px-3 py-2 text-sm' : 'px-8 py-3'}`}>
                  <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
                  סיום
                </Button>
              </div>

              {/* עוצמת קול */}
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 md:w-6 h-5 md:h-6 text-accent" />
                <Slider value={[75]} max={100} className="flex-1" />
                <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>75%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* רשימת מקטעים מורחבת */}
        <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/30 w-full">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Layers3 className="w-10 h-10 text-secondary" />
              מקטעים נחתכו
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {segments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className={`${isMobile ? 'text-lg' : 'text-xl'}`}>עדיין לא נחתכו מקטעים</p>
                <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>התחל לחתוך כדי לראות את המקטעים כאן</p>
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={segments} strategy={verticalListSortingStrategy}>
                  {segments.map((segment, index) => (
                    <SortableItem 
                      key={segment.id}
                      segment={segment}
                      index={index}
                      onEdit={handleEditSegment}
                      onPlay={handlePlaySegment}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* הגדרות איכות ויצוא מורחבות */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30 w-full">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Headphones className="w-10 h-10 text-accent" />
                הגדרות איכות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>פורמט אודיו</label>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>MP3</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>WAV</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>FLAC</Button>
                  <Button className={`${isMobile ? 'text-sm' : 'text-lg'} bg-accent hover:bg-accent/90`}>AAC</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>OGG</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>M4A</Button>
                </div>
              </div>
              <div className="space-y-3">
                <label className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>איכות אודיו</label>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>96k</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>128k</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>192k</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>256k</Button>
                  <Button className={`${isMobile ? 'text-sm' : 'text-lg'} bg-accent hover:bg-accent/90`}>320k</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>FLAC</Button>
                </div>
              </div>
              <div className="space-y-3">
                <label className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>רזולוציית וידאו</label>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>480p</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>720p</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>1080p</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>1440p</Button>
                  <Button className={`${isMobile ? 'text-sm' : 'text-lg'} bg-accent hover:bg-accent/90`}>4K</Button>
                  <Button variant="outline" className={`${isMobile ? 'text-sm' : 'text-lg'}`}>8K</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-glow w-full">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Download className="w-10 h-10 text-primary" />
                אפשרויות הורדה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* בקרות מיקス */}
              <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/20">
                <h4 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4 flex items-center gap-2`}>
                  <Palette className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-accent`} />
                  הגדרות מיקס
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium flex items-center gap-2`}>
                      <Clock className="w-4 h-4" />
                      Fade In ({fadeInDuration[0]}s)
                    </label>
                    <Slider
                      value={fadeInDuration}
                      onValueChange={setFadeInDuration}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium flex items-center gap-2`}>
                      <Clock className="w-4 h-4" />
                      Fade Out ({fadeOutDuration[0]}s)
                    </label>
                    <Slider
                      value={fadeOutDuration}
                      onValueChange={setFadeOutDuration}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Button size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-lg py-3' : 'text-xl py-4'} bg-primary hover:bg-primary/90`}>
                <Download className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                הורד את כל המקטעים
              </Button>
              <Button variant="outline" size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-base' : 'text-lg'}`}>
                <Save className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                הורד מקטעים נבחרים
              </Button>
              <Button variant="outline" size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-base' : 'text-lg'}`}>
                <Layers3 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                איחוד מקטעים עם מיקס
              </Button>
              
              {/* הורדת כתוביות ודיבוב בנפרד */}
              <div className="border-t pt-4">
                <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-3 text-center`}>הורדות נפרדות</p>
                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-sm' : 'text-lg'} mb-2`}>
                  <FileText className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                  הורד רק כתוביות (.srt)
                </Button>
                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-sm' : 'text-lg'} mb-2`}>
                  <Volume2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                  הורד רק דיבוב (.mp3)
                </Button>
                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  <Video className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                  הורד וידאו מתורגם
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* כרטיסי מחירים ומנויים */}
        <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-4xl font-bold mb-2 text-center bg-gradient-primary bg-clip-text text-transparent">
              בחר את החבילה שלך
            </h3>
            <p className="text-center text-muted-foreground mb-8 text-lg">
              מכל רמה של שימוש - יש לנו פתרון מושלם בשבילך
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* חבילה חינמית */}
              <Card className="border-2 border-muted/30 bg-background/50">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold">בסיסי</h4>
                  <div className="text-4xl font-bold">חינם</div>
                  <p className="text-muted-foreground">מושלם להתחלה</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">עד 2 דקות לקליप</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">3 ניסיונות ליום</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">איכות 720p</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">בלי חיתוכים מרובים</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6" variant="outline">
                    התחל חינם
                  </Button>
                </CardContent>
              </Card>

              {/* חבילת פרו */}
              <Card className="border-2 border-primary bg-primary/5 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    הכי פופולרי
                  </Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                    <Crown className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold">פרו</h4>
                  <div className="text-4xl font-bold">₪29<span className="text-lg text-muted-foreground">/חודש</span></div>
                  <p className="text-muted-foreground">ליוצרי תוכן</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">ללא הגבלת זמן</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">עד 100 קליפים ביום</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">איכות 4K</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">חיתוכים מרובים</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">תמיכה בעדיפות</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                    התחל ניסיון 7 ימים
                  </Button>
                </CardContent>
              </Card>

              {/* חבילת פרמיום */}
              <Card className="border-2 border-accent bg-accent/5">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold">פרמיום</h4>
                  <div className="text-4xl font-bold">₪79<span className="text-lg text-muted-foreground">/חודש</span></div>
                  <p className="text-muted-foreground">לעסקים וסטודיו</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">כל התכונות של פרו</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">ללא הגבלת קליפים</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">איכות 8K</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">API גישה</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">תמיכה 24/7</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-accent hover:bg-accent/90">
                    צור קשר למכירות
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* הערה על התשלום */}
            <div className="text-center mt-8 p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                לביטול בכל עת • החזר מלא תוך 30 יום • תשלום מאובטח
              </p>
            </div>
          </CardContent>
        </Card>

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
                <Crown className="w-12 h-12 text-accent mx-auto mb-2" />
                <div className="font-semibold">פלטפורמות מרובות</div>
                <div className="text-muted-foreground">תמיכה בכל שירותי הסטרימינג</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Index;