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
  Palette
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
          <CardContent className="space-y-8">
            
            {/* תצוגה מקדימה */}
            <div className="aspect-video bg-gradient-to-br from-muted to-background rounded-xl border-2 border-dashed border-accent/30 flex items-center justify-center relative">
              <div className="text-center">
                <Video className="w-20 h-20 text-accent mx-auto mb-4" />
                <p className="text-2xl text-accent font-semibold mb-2">תצוגה מקדימה</p>
                <p className="text-lg text-muted-foreground">הוידאו יופיע כאן לאחר הטעינה</p>
              </div>
            </div>

            {/* בקרות מעל הנגן - שתי שורות */}
            <div className="space-y-3">
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
              
              {/* ציר זמן וחיתוך */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 md:gap-4">
                  <span className={`${isMobile ? 'text-sm' : 'text-lg'} font-mono`}>00:00</span>
                  <div className="flex-1">
                    <Slider
                      value={currentTime}
                      onValueChange={setCurrentTime}
                      max={100}
                      step={0.1}
                      className="w-full [&_.slider-thumb]:w-6 [&_.slider-thumb]:h-6"
                    />
                  </div>
                  <span className={`${isMobile ? 'text-sm' : 'text-lg'} font-mono`}>03:45</span>
                </div>
                
                <div className={`flex justify-center gap-2 md:gap-4 ${isMobile ? 'flex-wrap' : ''}`}>
                  <Button className="bg-accent hover:bg-accent/90" size={isMobile ? "default" : "lg"}>
                    <Scissors className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 md:mr-2`} />
                    חתוך כאן
                  </Button>
                  <Button variant="outline" size={isMobile ? "default" : "lg"}>
                    <ChevronLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 md:mr-2`} />
                    {isMobile ? 'התחלה' : 'נקודת התחלה'}
                  </Button>
                  <Button variant="outline" size={isMobile ? "default" : "lg"}>
                    <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 md:mr-2`} />
                    {isMobile ? 'סיום' : 'נקודת סיום'}
                  </Button>
                </div>
              </div>

              {/* עוצמת קול */}
              <div className="flex items-center gap-4 mt-4 md:mt-6">
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