import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFFmpeg, AudioFormat, VideoResolution } from "@/hooks/useFFmpeg";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  AlertCircle,
  Wand2,
  Crop,
  Mic,
  AudioWaveform,
  Plus,
  Minus
} from "lucide-react";

// Format seconds to HH:MM:SS
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// SortableItem component for drag and drop segments
const SortableItem = ({ segment, index, onEdit, onPlay, onDelete }: {
  segment: {id: number, start: number, end: number, title: string},
  index: number,
  onEdit: (id: number, newTitle: string) => void,
  onPlay: (id: number) => void,
  onDelete: (id: number) => void
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
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold">{segment.title || `Segment ${index + 1}`}</h3>
            <p className="text-muted-foreground">{formatTime(segment.start)} - {formatTime(segment.end)}</p>
          </>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
        <Edit3 className="w-4 h-4 mr-1" />
        Edit
      </Button>
      <Button variant="outline" size="sm" onClick={() => onPlay(segment.id)}>
        <Play className="w-4 h-4 mr-1" />
        Play
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(segment.id)}>
        <X className="w-4 h-4 mr-1" />
        Delete
      </Button>
    </div>
  );
};

interface ConnectedPlatform {
  name: string;
  icon: string;
  favorites: Array<{ id: string; title: string; thumbnail: string }>;
  playlists: Array<{ id: string; name: string; count: number }>;
}

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState([0]);
  const [segments, setSegments] = useState<Array<{id: number, start: number, end: number, title: string}>>([]);
  const [fadeInDuration, setFadeInDuration] = useState([2]);
  const [fadeOutDuration, setFadeOutDuration] = useState([2]);
  const [projectName, setProjectName] = useState("YouTube Cutter Project");
  const [startTime, setStartTime] = useState([0]);
  const [endTime, setEndTime] = useState([100]);
  const [showStreamingServices, setShowStreamingServices] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [player, setPlayer] = useState<any>(null);
  const [videoDuration, setVideoDuration] = useState(100);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, ConnectedPlatform>>({});
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  const [cuttingMode, setCuttingMode] = useState<"video" | "audio" | null>(null);
  const [showCuttingOptions, setShowCuttingOptions] = useState(false);
  const [currentEditingFile, setCurrentEditingFile] = useState<{file: File, url: string, type: 'audio' | 'video'} | null>(null);
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<AudioFormat>('aac');
  const [selectedVideoResolution, setSelectedVideoResolution] = useState<VideoResolution>('1080p');
  const [selectedEffect, setSelectedEffect] = useState<'grayscale' | 'sepia' | 'negative' | 'blur' | 'sharpen'>('grayscale');
  const [cropSettings, setCropSettings] = useState({ width: 1920, height: 1080, x: 0, y: 0 });
  const [youtubeQuality, setYoutubeQuality] = useState<'best' | '720p' | '480p' | '360p'>('best');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [processedFilename, setProcessedFilename] = useState<string>("");
  const [jumpTimeSeconds, setJumpTimeSeconds] = useState<number>(10);
  const [showJumpTimeDialog, setShowJumpTimeDialog] = useState<boolean>(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const localMediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    isLoading: isProcessing, 
    isReady: isFFmpegReady, 
    progress, 
    cutVideo, 
    mergeSegments, 
    extractAudio,
    normalizeAudio,
    cropVideo,
    applyVideoEffect,
    removeVocals,
    downloadBlob 
  } = useFFmpeg();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API ready');
    };
  }, []);

  // Create YouTube player when videoId changes
  useEffect(() => {
    if (!videoId || player || !playerRef.current) return;
    
    // Wait a bit for DOM to be ready
    const timer = setTimeout(() => {
      if (!playerRef.current) {
        console.error('Player container not found after timeout');
        return;
      }

      const newPlayer = new (window as any).YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          controls: 1,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            const duration = event.target.getDuration();
            setVideoDuration(duration);
            setEndTime([duration]);
            setStartTime([0]);
            setCurrentTime([0]);
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
          },
        },
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [videoId, player]);

  // Update current time from player
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        setCurrentTime([time]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player]);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const loadVideo = () => {
    const id = extractVideoId(youtubeUrl);
    if (!id) {
      alert('Invalid YouTube URL');
      return;
    }

    setVideoId(id);
    
    // Clear any local file
    setCurrentEditingFile(null);

    if (player) {
      player.loadVideoById(id);
    }
    
    // Scroll to player
    setTimeout(() => {
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }, 500);
  };

  const togglePlayPause = () => {
    if (currentEditingFile && localMediaRef.current) {
      const media = localMediaRef.current as HTMLVideoElement | HTMLAudioElement;
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
    } else if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const seekTo = (time: number) => {
    if (player && player.seekTo) {
      player.seekTo(time, true);
    }
  };

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
    const segment = segments.find(s => s.id === id);
    if (segment && player) {
      seekTo(segment.start);
      player.playVideo();
    }
  };

  const handleDeleteSegment = (id: number) => {
    setSegments(segments.filter(segment => segment.id !== id));
  };

  const addSegment = () => {
    const start = startTime[0];
    const end = endTime[0];
    
    if (start >= end) {
      alert('Start time must be before end time');
      return;
    }

    const newSegment = {
      id: Date.now(),
      start,
      end,
      title: `Segment ${segments.length + 1}`,
    };

    setSegments([...segments, newSegment]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      console.log('Files uploaded:', newFiles.map(f => f.name));
    }
  };

  const handleEditFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type.startsWith('video/') ? 'video' : 'audio';
    
    setCurrentEditingFile({ file, url: fileUrl, type: fileType });
    
    // Wait for the media element to load to get duration
    setTimeout(() => {
      if (localMediaRef.current) {
        localMediaRef.current.onloadedmetadata = () => {
          const duration = localMediaRef.current!.duration;
          setVideoDuration(duration);
          setEndTime([duration]);
          setStartTime([0]);
          setCurrentTime([0]);
        };
      }
    }, 100);
    
    // Clear YouTube video
    setVideoId("");
    
    // Scroll to player
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      console.log('Files dropped:', newFiles.map(f => f.name));
    }
  };

  const downloadYouTubeVideo = async (videoId: string): Promise<File | null> => {
    try {
      toast({
        title: "מוריד סרטון מיוטיוב...",
        description: "זה עשוי לקחת מספר דקות",
      });

      const { data, error } = await supabase.functions.invoke('download-youtube-video', {
        body: { videoId, quality: youtubeQuality }
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'video/mp4' });
      const file = new File([blob], `youtube_${videoId}.mp4`, { type: 'video/mp4' });

      toast({
        title: "הסרטון הורד בהצלחה!",
        description: "כעת ניתן לערוך אותו",
      });

      return file;
    } catch (error) {
      console.error('Error downloading YouTube video:', error);
      toast({
        title: "שגיאה בהורדת הסרטון",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleDownloadSegment = async (segment: typeof segments[0]) => {
    let fileToProcess = currentEditingFile;

    // If we have a YouTube video but no file, download it first
    if (videoId && !currentEditingFile) {
      const downloadedFile = await downloadYouTubeVideo(videoId);
      if (!downloadedFile) return;
      
      const url = URL.createObjectURL(downloadedFile);
      fileToProcess = { file: downloadedFile, url, type: 'video' };
      setCurrentEditingFile(fileToProcess);
    }

    if (!fileToProcess) {
      toast({
        title: "אין קובץ לעיבוד",
        description: "אנא העלה קובץ תחילה",
        variant: "destructive",
      });
      return;
    }

    const isAudio = cuttingMode === 'audio' || fileToProcess.type === 'audio';
    const format = isAudio ? selectedAudioFormat : 'mp4';
    
    const blob = await cutVideo(
      fileToProcess.file,
      segment,
      format,
      isAudio ? undefined : selectedVideoResolution
    );

    if (blob) {
      const extension = isAudio ? selectedAudioFormat : 'mp4';
      const filename = `${segment.title || 'segment'}.${extension}`;
      setProcessedBlob(blob);
      setProcessedFilename(filename);
      setShowContinueDialog(true);
    }
  };

  const handleDownloadAllSegments = async () => {
    let fileToProcess = currentEditingFile;

    // If we have a YouTube video but no file, download it first
    if (videoId && !currentEditingFile) {
      const downloadedFile = await downloadYouTubeVideo(videoId);
      if (!downloadedFile) return;
      
      const url = URL.createObjectURL(downloadedFile);
      fileToProcess = { file: downloadedFile, url, type: 'video' };
      setCurrentEditingFile(fileToProcess);
    }

    if (!fileToProcess || segments.length === 0) {
      toast({
        title: "אין מקטעים להורדה",
        description: "אנא צור מקטעים תחילה",
        variant: "destructive",
      });
      return;
    }

    for (const segment of segments) {
      await handleDownloadSegment(segment);
    }
  };

  const handleMergeAndDownload = async () => {
    let fileToProcess = currentEditingFile;

    // If we have a YouTube video but no file, download it first
    if (videoId && !currentEditingFile) {
      const downloadedFile = await downloadYouTubeVideo(videoId);
      if (!downloadedFile) return;
      
      const url = URL.createObjectURL(downloadedFile);
      fileToProcess = { file: downloadedFile, url, type: 'video' };
      setCurrentEditingFile(fileToProcess);
    }

    if (!fileToProcess || segments.length === 0) {
      toast({
        title: "אין מקטעים למיזוג",
        description: "אנא צור מקטעים תחילה",
        variant: "destructive",
      });
      return;
    }

    const isAudio = cuttingMode === 'audio' || fileToProcess.type === 'audio';
    const format = isAudio ? selectedAudioFormat : 'mp4';

    const blob = await mergeSegments(
      fileToProcess.file,
      segments,
      format,
      fadeInDuration[0],
      fadeOutDuration[0]
    );

    if (blob) {
      const extension = isAudio ? selectedAudioFormat : 'mp4';
      const filename = `merged_${Date.now()}.${extension}`;
      setProcessedBlob(blob);
      setProcessedFilename(filename);
      setShowContinueDialog(true);
    }
  };

  const handleExtractAudio = async () => {
    let fileToProcess = currentEditingFile;

    // If we have a YouTube video but no file, download it first
    if (videoId && !currentEditingFile) {
      const downloadedFile = await downloadYouTubeVideo(videoId);
      if (!downloadedFile) return;
      
      const url = URL.createObjectURL(downloadedFile);
      fileToProcess = { file: downloadedFile, url, type: 'video' };
      setCurrentEditingFile(fileToProcess);
    }

    if (!fileToProcess) {
      toast({
        title: "אין קובץ לעיבוד",
        description: "אנא העלה קובץ וידאו תחילה",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "מחלץ אודיו...",
      description: "זה עשוי לקחת מספר שניות",
    });

    const blob = await extractAudio(fileToProcess.file, selectedAudioFormat, '320k');
    if (blob) {
      const filename = `audio.${selectedAudioFormat}`;
      setProcessedBlob(blob);
      setProcessedFilename(filename);
      setShowContinueDialog(true);
      toast({
        title: "הצלחה!",
        description: "האודיו הופק בהצלחה",
      });
    }
  };

  const handleNormalizeAudio = async () => {
    let fileToProcess = currentEditingFile;

    // If we have a YouTube video but no file, download it first
    if (videoId && !currentEditingFile) {
      const downloadedFile = await downloadYouTubeVideo(videoId);
      if (!downloadedFile) return;
      
      const url = URL.createObjectURL(downloadedFile);
      fileToProcess = { file: downloadedFile, url, type: 'video' };
      setCurrentEditingFile(fileToProcess);
    }

    if (!fileToProcess) {
      toast({
        title: "אין קובץ לעיבוד",
        description: "אנא העלה קובץ תחילה",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "מנרמל עוצמת קול...",
      description: "זה עשוי לקחת מספר שניות",
    });

    const blob = await normalizeAudio(fileToProcess.file, selectedAudioFormat);
    if (blob) {
      const filename = `normalized.${selectedAudioFormat}`;
      setProcessedBlob(blob);
      setProcessedFilename(filename);
      setShowContinueDialog(true);
      toast({
        title: "הצלחה!",
        description: "האודיו נורמל בהצלחה",
      });
    }
  };

  const handleRemoveVocals = async () => {
    let fileToProcess = currentEditingFile;

    // If we have a YouTube video but no file, download it first
    if (videoId && !currentEditingFile) {
      const downloadedFile = await downloadYouTubeVideo(videoId);
      if (!downloadedFile) return;
      
      const url = URL.createObjectURL(downloadedFile);
      fileToProcess = { file: downloadedFile, url, type: 'video' };
      setCurrentEditingFile(fileToProcess);
    }

    if (!fileToProcess) {
      toast({
        title: "אין קובץ לעיבוד",
        description: "אנא העלה קובץ אודיו תחילה",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "מסיר ווקאלים...",
      description: "זה עשוי לקחת זמן רב",
    });

    const blob = await removeVocals(fileToProcess.file);
    if (blob) {
      const filename = `instrumental.mp3`;
      setProcessedBlob(blob);
      setProcessedFilename(filename);
      setShowContinueDialog(true);
      toast({
        title: "הצלחה!",
        description: "גרסה אינסטרומנטלית נוצרה",
      });
    }
  };

  const handleCropVideo = async () => {
    let fileToProcess = currentEditingFile;

    // If we have a YouTube video but no file, download it first
    if (videoId && !currentEditingFile) {
      const downloadedFile = await downloadYouTubeVideo(videoId);
      if (!downloadedFile) return;
      
      const url = URL.createObjectURL(downloadedFile);
      fileToProcess = { file: downloadedFile, url, type: 'video' };
      setCurrentEditingFile(fileToProcess);
    }

    if (!fileToProcess || fileToProcess.type !== 'video') {
      toast({
        title: "אין קובץ וידאו",
        description: "אנא העלה קובץ וידאו תחילה",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "חותך וידאו...",
      description: "זה עשוי לקחת מספר שניות",
    });

    const blob = await cropVideo(
      fileToProcess.file,
      cropSettings.width,
      cropSettings.height,
      cropSettings.x,
      cropSettings.y
    );
    
    if (blob) {
      const filename = `cropped.mp4`;
      setProcessedBlob(blob);
      setProcessedFilename(filename);
      setShowContinueDialog(true);
      toast({
        title: "הצלחה!",
        description: "הוידאו נחתך בהצלחה",
      });
    }
  };

  const handleApplyEffect = async () => {
    let fileToProcess = currentEditingFile;

    // If we have a YouTube video but no file, download it first
    if (videoId && !currentEditingFile) {
      const downloadedFile = await downloadYouTubeVideo(videoId);
      if (!downloadedFile) return;
      
      const url = URL.createObjectURL(downloadedFile);
      fileToProcess = { file: downloadedFile, url, type: 'video' };
      setCurrentEditingFile(fileToProcess);
    }

    if (!fileToProcess || fileToProcess.type !== 'video') {
      toast({
        title: "אין קובץ וידאו",
        description: "אנא העלה קובץ וידאו תחילה",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `מוסיף אפקט ${selectedEffect}...`,
      description: "זה עשוי לקחת מספר שניות",
    });

    const blob = await applyVideoEffect(fileToProcess.file, selectedEffect);
    if (blob) {
      const filename = `${selectedEffect}.mp4`;
      setProcessedBlob(blob);
      setProcessedFilename(filename);
      setShowContinueDialog(true);
      toast({
        title: "הצלחה!",
        description: `אפקט ${selectedEffect} הוחל בהצלחה`,
      });
    }
  };

  const continueEditingProcessed = () => {
    if (!processedBlob) return;
    
    // המרת Blob ל-File
    const file = new File([processedBlob], processedFilename, { 
      type: processedBlob.type 
    });
    
    // טעינת הקובץ המעובד כקובץ חדש
    handleEditFile(file);
    
    // איפוס
    setSegments([]);
    setProcessedBlob(null);
    setShowContinueDialog(false);
  };

  const downloadAndFinish = () => {
    if (!processedBlob) return;
    
    downloadBlob(processedBlob, processedFilename);
    setProcessedBlob(null);
    setShowContinueDialog(false);
  };

  const handlePlatformConnect = (platformName: string) => {
    // Mock data - בעתיד יחובר ל-API אמיתי
    const mockData: Record<string, ConnectedPlatform> = {
      "YouTube": {
        name: "YouTube",
        icon: "📺",
        favorites: [
          { id: "1", title: "Top Hits 2025", thumbnail: "🎵" },
          { id: "2", title: "Workout Mix", thumbnail: "💪" },
          { id: "3", title: "Chill Vibes", thumbnail: "🌊" },
        ],
        playlists: [
          { id: "p1", name: "My Favorites", count: 45 },
          { id: "p2", name: "Study Music", count: 28 },
          { id: "p3", name: "Party Mix", count: 67 },
        ]
      },
      "Spotify": {
        name: "Spotify",
        icon: "🎵",
        favorites: [
          { id: "1", title: "Daily Mix 1", thumbnail: "🎧" },
          { id: "2", title: "Discover Weekly", thumbnail: "✨" },
          { id: "3", title: "Release Radar", thumbnail: "🚀" },
        ],
        playlists: [
          { id: "p1", name: "Liked Songs", count: 234 },
          { id: "p2", name: "Road Trip", count: 56 },
          { id: "p3", name: "Focus Flow", count: 89 },
        ]
      },
      "SoundCloud": {
        name: "SoundCloud",
        icon: "🎧",
        favorites: [
          { id: "1", title: "Underground Beats", thumbnail: "🔥" },
          { id: "2", title: "Indie Discoveries", thumbnail: "🌟" },
          { id: "3", title: "Electronic Vibes", thumbnail: "⚡" },
        ],
        playlists: [
          { id: "p1", name: "Favorites", count: 78 },
          { id: "p2", name: "Remixes", count: 42 },
        ]
      }
    };

    if (mockData[platformName]) {
      setConnectedPlatforms(prev => ({
        ...prev,
        [platformName]: mockData[platformName]
      }));
      setSelectedPlatform(platformName);
      setShowPlatformDialog(true);
      setShowStreamingServices(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      
      {/* כפתור התחברות */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => navigate("/auth")}
          className="bg-primary hover:bg-primary/90"
        >
          Sign In / Sign Up
        </Button>
      </div>

      {/* כותרת ראשית עם גרדיאנט */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
            <Music className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {projectName}
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground mb-6">
          Cut and edit YouTube videos easily - no cost
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Badge className="text-lg px-6 py-3 bg-primary text-primary-foreground">Fast Cutting</Badge>
          <Badge className="text-lg px-6 py-3 bg-secondary text-secondary-foreground">High Quality</Badge>
          <Badge className="text-lg px-6 py-3 bg-accent text-accent-foreground">Song Recognition</Badge>
          <Badge className="text-lg px-6 py-3 bg-muted text-muted-foreground">Free</Badge>
        </div>
        
        {/* FFmpeg Status Indicator */}
        {!isFFmpegReady && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">טוען מנוע עיבוד וידאו...</span>
          </div>
        )}
        {isFFmpegReady && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm">
            <div className="rounded-full h-2 w-2 bg-green-500"></div>
            <span className="text-green-600">מנוע עיבוד מוכן!</span>
          </div>
        )}
      </div>


      <div className="max-w-7xl mx-auto grid gap-8">
        
        {/* הגבלות שימוש חינמי */}
        <Card className="max-w-4xl mx-auto mb-8 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-center">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-lg font-semibold">Limited Free Usage</p>
                <p className="text-sm text-muted-foreground">
                  Up to 2 minutes, basic quality, 3 attempts per day. For full usage - upgrade to subscription
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">Attempts: {3 - usageCount}/3</Badge>
                  <Badge variant="outline">Max time: 2 minutes</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* אזור הכנסת קבצים */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 shadow-glow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Upload className="w-8 h-8 text-primary" />
                Choose File
              </CardTitle>
              <div className="flex gap-1 flex-wrap mt-2">
                <Badge variant="outline" className="text-xs px-2 py-1">💳 Paid</Badge>
                <Badge variant="outline" className="text-xs px-2 py-1">🎥 Video</Badge>
                <Badge variant="outline" className="text-xs px-2 py-1">🎵 Audio</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="video/*,audio/*,.mp4,.mov,.avi,.mkv,.webm,.flv,.wmv,.m4v,.mp3,.wav,.aac,.flac,.ogg,.m4a,.wma"
                multiple
                onChange={handleFileSelect}
              />
              <label
                htmlFor="file-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/10 scale-105' 
                    : 'border-primary/30 hover:border-primary/50'
                }`}
              >
                <Upload className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-lg font-medium">Drag files here</p>
                <p className="text-sm text-muted-foreground">or click to select</p>
                <p className="text-xs text-muted-foreground mt-2">All video & audio formats supported</p>
              </label>
              <Button size="lg" className="w-full text-lg bg-primary hover:bg-primary/90" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-6 h-6 mr-2" />
                Choose Files
              </Button>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold">Uploaded Files ({uploadedFiles.length}):</p>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="text-xs p-2 bg-primary/10 rounded flex items-center gap-2">
                      {file.type.startsWith('video/') ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <Music className="w-4 h-4" />
                      )}
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-2 text-xs"
                        onClick={() => handleEditFile(file)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✨ Automatic Translation</p>
                <p>🎙️ AI Voice Dubbing</p>
                <p>✂️ Smart Cutting</p>
                <p>🏷️ Song & Name Recognition</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Link2 className="w-8 h-8 text-secondary" />
                Paste Direct Link
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
              <Button 
                size="lg" 
                className="w-full text-lg bg-secondary hover:bg-secondary/90"
                onClick={loadVideo}
                disabled={!youtubeUrl}
              >
                <Upload className="w-6 h-6 mr-2" />
                Load Video
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Music className="w-8 h-8 text-accent" />
                Streaming Services
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
                  Connect to Service
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                {showStreamingServices && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-background border border-border rounded-lg shadow-lg z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm"
                      onClick={() => handlePlatformConnect("YouTube")}
                    >
                      📺 YouTube {connectedPlatforms["YouTube"] && <Check className="w-4 h-4 ml-auto text-green-500" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm"
                      onClick={() => handlePlatformConnect("Spotify")}
                    >
                      🎵 Spotify {connectedPlatforms["Spotify"] && <Check className="w-4 h-4 ml-auto text-green-500" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm"
                      onClick={() => handlePlatformConnect("SoundCloud")}
                    >
                      🎧 SoundCloud {connectedPlatforms["SoundCloud"] && <Check className="w-4 h-4 ml-auto text-green-500" />}
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
              <p className="text-center text-muted-foreground text-sm">Access content from popular platforms</p>
            </CardContent>
          </Card>
        </div>

        {/* הצגת תוכן מפלטפורמות מחוברות */}
        {Object.keys(connectedPlatforms).length > 0 && (
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="w-8 h-8 text-primary" />
                Connected Platforms Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.values(connectedPlatforms).map((platform) => (
                <div key={platform.name} className="border border-border/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platform.icon}</span>
                    <h3 className="text-xl font-semibold">{platform.name}</h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPlatform(platform.name);
                        setShowPlatformDialog(true);
                      }}
                    >
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Favorites</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {platform.favorites.slice(0, 3).map((fav) => (
                        <Button
                          key={fav.id}
                          variant="outline"
                          className="justify-start text-sm h-auto py-3"
                        >
                          <span className="text-2xl mr-2">{fav.thumbnail}</span>
                          <span className="truncate">{fav.title}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Playlists</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {platform.playlists.slice(0, 3).map((playlist) => (
                        <Button
                          key={playlist.id}
                          variant="outline"
                          className="justify-between text-sm h-auto py-3"
                        >
                          <span className="truncate">{playlist.name}</span>
                          <Badge variant="secondary" className="ml-2">{playlist.count}</Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* נגן וחיתוך */}
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 shadow-card">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Video className="w-10 h-10 text-accent" />
              Advanced Player & Cutting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* בקרות מעל הנגן - שתי שורות */}
            <div className="space-y-3 mb-4">
              {/* שורה ראשונה: דיבוב וכתוביות */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" className="px-4 py-2">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Dubbing ▼
                </Button>
                <Button variant="outline" size="sm" className="px-4 py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Subtitles ▼
                </Button>
              </div>
              
              {/* שורה שנייה: חיתוך וידאו ואודיו */}
              <div className="flex justify-center gap-4 relative">
                <Button 
                  variant={cuttingMode === "video" ? "default" : "outline"} 
                  size="sm" 
                  className="px-4 py-2"
                  onClick={() => {
                    setCuttingMode("video");
                    setShowCuttingOptions(true);
                  }}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video Cutting
                </Button>
                <Button 
                  variant={cuttingMode === "audio" ? "default" : "outline"} 
                  size="sm" 
                  className="px-4 py-2"
                  onClick={() => {
                    setCuttingMode("audio");
                    setShowCuttingOptions(true);
                  }}
                >
                  <Headphones className="w-4 h-4 mr-2" />
                  Audio Cutting
                </Button>
              </div>

              {/* אופציות חיתוך */}
              {showCuttingOptions && cuttingMode && (
                <Card className="p-4 bg-background/95 border-primary/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      {cuttingMode === "video" ? (
                        <>
                          <Video className="w-4 h-4 text-primary" />
                          Video Cutting Options
                        </>
                      ) : (
                        <>
                          <Headphones className="w-4 h-4 text-primary" />
                          Audio Cutting Options
                        </>
                      )}
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowCuttingOptions(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {cuttingMode === "video" ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={!currentEditingFile || isProcessing}
                          onClick={async () => {
                            if (!currentEditingFile) return;
                            const blob = await cropVideo(currentEditingFile.file, 1280, 720, 0, 0);
                            if (blob) downloadBlob(blob, 'cropped_video.mp4');
                          }}
                        >
                          <Video className="w-3 h-3 mr-1" />
                          Crop Video
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={!currentEditingFile || isProcessing || segments.length === 0}
                          onClick={() => handleDownloadSegment(segments[0])}
                        >
                          <Scissors className="w-3 h-3 mr-1" />
                          Trim
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={!currentEditingFile || isProcessing}
                          onClick={async () => {
                            if (!currentEditingFile) return;
                            const blob = await applyVideoEffect(currentEditingFile.file, 'grayscale');
                            if (blob) downloadBlob(blob, 'effect_video.mp4');
                          }}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Effects
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={!currentEditingFile || isProcessing}
                          onClick={async () => {
                            if (!currentEditingFile) return;
                            const blob = await cutVideo(currentEditingFile.file, { id: 0, start: 0, end: videoDuration, title: 'full' }, 'mp4', selectedVideoResolution);
                            if (blob) downloadBlob(blob, `quality_${selectedVideoResolution}.mp4`);
                          }}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Quality
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>• Precise frame-by-frame cutting</p>
                        <p>• Multiple resolution options</p>
                        <p>• Video effects and filters</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={!currentEditingFile || isProcessing}
                          onClick={async () => {
                            if (!currentEditingFile) return;
                            const blob = await extractAudio(currentEditingFile.file, selectedAudioFormat);
                            if (blob) downloadBlob(blob, `audio.${selectedAudioFormat}`);
                          }}
                        >
                          <Headphones className="w-3 h-3 mr-1" />
                          Extract Audio
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={!currentEditingFile || isProcessing}
                          onClick={async () => {
                            if (!currentEditingFile) return;
                            const blob = await normalizeAudio(currentEditingFile.file, selectedAudioFormat);
                            if (blob) downloadBlob(blob, `normalized.${selectedAudioFormat}`);
                          }}
                        >
                          <Volume2 className="w-3 h-3 mr-1" />
                          Normalize
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={!currentEditingFile || isProcessing}
                          onClick={async () => {
                            if (!currentEditingFile) return;
                            const blob = await removeVocals(currentEditingFile.file);
                            if (blob) downloadBlob(blob, 'instrumental.mp3');
                          }}
                        >
                          <Music className="w-3 h-3 mr-1" />
                          Remove Vocals
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          disabled={!currentEditingFile || isProcessing}
                          onClick={async () => {
                            if (!currentEditingFile) return;
                            const blob = await extractAudio(currentEditingFile.file, selectedAudioFormat, '320k');
                            if (blob) downloadBlob(blob, `hq_audio.${selectedAudioFormat}`);
                          }}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Audio Quality
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>• High-quality audio extraction</p>
                        <p>• Noise reduction</p>
                        <p>• Audio normalization</p>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* תצוגה מקדימה - נגן YouTube או קובץ מקומי */}
            <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-5xl'} mx-auto mb-4`}>
              <div className="aspect-video bg-gradient-to-br from-muted to-background rounded-3xl border-2 border-accent/30 overflow-hidden relative shadow-xl">
                {currentEditingFile ? (
                  currentEditingFile.type === 'video' ? (
                    <video
                      ref={localMediaRef as React.RefObject<HTMLVideoElement>}
                      src={currentEditingFile.url}
                      controls
                      className="w-full h-full"
                      onTimeUpdate={(e) => {
                        const time = (e.target as HTMLVideoElement).currentTime;
                        setCurrentTime([time]);
                      }}
                      onLoadedMetadata={(e) => {
                        const duration = (e.target as HTMLVideoElement).duration;
                        setVideoDuration(duration);
                        setEndTime([duration]);
                        setStartTime([0]);
                        setCurrentTime([0]);
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <div className="text-center space-y-4">
                        <Music className="w-32 h-32 text-primary mx-auto animate-pulse" />
                        <p className="text-2xl font-semibold">{currentEditingFile.file.name}</p>
                        <audio
                          ref={localMediaRef as React.RefObject<HTMLAudioElement>}
                          src={currentEditingFile.url}
                          controls
                          className="w-full max-w-md mx-auto"
                          onTimeUpdate={(e) => {
                            const time = (e.target as HTMLAudioElement).currentTime;
                            setCurrentTime([time]);
                          }}
                          onLoadedMetadata={(e) => {
                            const duration = (e.target as HTMLAudioElement).duration;
                            setVideoDuration(duration);
                            setEndTime([duration]);
                            setStartTime([0]);
                            setCurrentTime([0]);
                          }}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                      </div>
                    </div>
                  )
                ) : videoId ? (
                  <div id="youtube-player" ref={playerRef} className="w-full h-full"></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Video className={`${isMobile ? 'w-12 h-12' : 'w-20 h-20'} text-accent mx-auto mb-4`} />
                      <p className={`${isMobile ? 'text-lg' : 'text-2xl'} text-accent font-semibold mb-2`}>Preview</p>
                      <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-muted-foreground`}>Upload file or paste YouTube link</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* ציר זמן מתקדם עם סמני חיתוך ווייבפורם */}
              <div className="mt-8 space-y-6 bg-black/95 rounded-2xl p-6 border border-accent/20 shadow-2xl">
                {/* Waveform visualization with cut markers */}
                <div className="relative h-48 bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden border border-gray-700">
                  {/* Zoom controls - positioned top right */}
                  <div className="absolute top-2 right-2 flex gap-2 z-20">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-black/80 border-white/20 hover:bg-white/10"
                      onClick={() => {
                        const center = (startTime[0] + endTime[0]) / 2;
                        const range = endTime[0] - startTime[0];
                        const newRange = Math.max(10, range * 0.7);
                        setStartTime([Math.max(0, center - newRange / 2)]);
                        setEndTime([Math.min(videoDuration, center + newRange / 2)]);
                      }}
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-black/80 border-white/20 hover:bg-white/10"
                      onClick={() => {
                        const center = (startTime[0] + endTime[0]) / 2;
                        const range = endTime[0] - startTime[0];
                        const newRange = Math.min(videoDuration, range * 1.3);
                        setStartTime([Math.max(0, center - newRange / 2)]);
                        setEndTime([Math.min(videoDuration, center + newRange / 2)]);
                      }}
                    >
                      <Minus className="h-4 w-4 text-white" />
                    </Button>
                  </div>

                  {/* Simulated waveform background */}
                  <div className="absolute inset-0 flex items-center">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }} />
                          <stop offset="50%" style={{ stopColor: '#14b8a6', stopOpacity: 0.9 }} />
                          <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.7 }} />
                        </linearGradient>
                      </defs>
                      {Array.from({ length: 200 }, (_, i) => {
                        const x = (i / 200) * 100;
                        const height = 30 + Math.random() * 60 + Math.sin(i / 10) * 20;
                        return (
                          <rect
                            key={i}
                            x={`${x}%`}
                            y={`${50 - height / 2}%`}
                            width="0.4%"
                            height={`${height}%`}
                            fill="url(#waveGradient)"
                            opacity={0.9}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Start marker - Red vertical line */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-red-500 cursor-grab active:cursor-grabbing z-10 shadow-lg shadow-red-500/50"
                    style={{ left: `${(startTime[0] / videoDuration) * 100}%` }}
                    draggable
                    onMouseDown={(e) => {
                      const startX = e.clientX;
                      const startVal = startTime[0];
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                      
                      const handleMouseMove = (e: MouseEvent) => {
                        const deltaX = e.clientX - startX;
                        const deltaPercent = deltaX / rect.width;
                        const newVal = Math.max(0, Math.min(endTime[0] - 1, startVal + deltaPercent * videoDuration));
                        setStartTime([newVal]);
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      const startX = touch.clientX;
                      const startVal = startTime[0];
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                      
                      const handleTouchMove = (e: TouchEvent) => {
                        const touch = e.touches[0];
                        const deltaX = touch.clientX - startX;
                        const deltaPercent = deltaX / rect.width;
                        const newVal = Math.max(0, Math.min(endTime[0] - 1, startVal + deltaPercent * videoDuration));
                        setStartTime([newVal]);
                      };
                      
                      const handleTouchEnd = () => {
                        document.removeEventListener('touchmove', handleTouchMove);
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      
                      document.addEventListener('touchmove', handleTouchMove);
                      document.addEventListener('touchend', handleTouchEnd);
                    }}
                  />

                  {/* End marker - Red vertical line */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-red-500 cursor-grab active:cursor-grabbing z-10 shadow-lg shadow-red-500/50"
                    style={{ left: `${(endTime[0] / videoDuration) * 100}%` }}
                    draggable
                    onMouseDown={(e) => {
                      const startX = e.clientX;
                      const startVal = endTime[0];
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                      
                      const handleMouseMove = (e: MouseEvent) => {
                        const deltaX = e.clientX - startX;
                        const deltaPercent = deltaX / rect.width;
                        const newVal = Math.max(startTime[0] + 1, Math.min(videoDuration, startVal + deltaPercent * videoDuration));
                        setEndTime([newVal]);
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      const startX = touch.clientX;
                      const startVal = endTime[0];
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                      
                      const handleTouchMove = (e: TouchEvent) => {
                        const touch = e.touches[0];
                        const deltaX = touch.clientX - startX;
                        const deltaPercent = deltaX / rect.width;
                        const newVal = Math.max(startTime[0] + 1, Math.min(videoDuration, startVal + deltaPercent * videoDuration));
                        setEndTime([newVal]);
                      };
                      
                      const handleTouchEnd = () => {
                        document.removeEventListener('touchmove', handleTouchMove);
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      
                      document.addEventListener('touchmove', handleTouchMove);
                      document.addEventListener('touchend', handleTouchEnd);
                    }}
                  />

                  {/* Current time indicator */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/60 z-10"
                    style={{ left: `${(currentTime[0] / videoDuration) * 100}%` }}
                  />
                </div>

                {/* Time inputs below waveform */}
                <div className="flex justify-between items-center gap-4 mt-4">
                  <div className="flex-1">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center">
                      <p className="text-white font-mono text-xl font-semibold">
                        {Math.floor(startTime[0] / 60).toString().padStart(2, '0')}:{Math.floor(startTime[0] % 60).toString().padStart(2, '0')}:{Math.floor((startTime[0] % 1) * 1000).toString().padStart(3, '0')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">זמן התחלת חיתוך</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center">
                      <p className="text-white font-mono text-xl font-semibold">
                        {Math.floor(endTime[0] / 60).toString().padStart(2, '0')}:{Math.floor(endTime[0] % 60).toString().padStart(2, '0')}:{Math.floor((endTime[0] % 1) * 1000).toString().padStart(3, '0')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">זמן סיום חיתוך</p>
                    </div>
                  </div>
                </div>

                {/* Playback slider */}
                <div className="relative">
                  <Slider
                    value={currentTime}
                    onValueChange={(val) => {
                      setCurrentTime(val);
                      seekTo(val[0]);
                    }}
                    max={videoDuration}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 font-mono mt-1">
                    <span>{Math.floor(currentTime[0] / 60).toString().padStart(2, '0')}:{Math.floor(currentTime[0] % 60).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(videoDuration / 60).toString().padStart(2, '0')}:{Math.floor(videoDuration % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* בקרות נגן */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-3 md:p-6 rounded-xl">
              <div className={`flex justify-center gap-2 md:gap-4 mb-4 md:mb-6 ${isMobile ? 'flex-wrap' : ''}`}>
                <Button 
                  variant="outline" 
                  size={isMobile ? "default" : "lg"} 
                  className={`${isMobile ? 'text-sm px-3' : 'text-lg px-6'}`}
                  onClick={() => {
                    if (currentEditingFile && localMediaRef.current) {
                      const newTime = Math.max(0, currentTime[0] - jumpTimeSeconds);
                      (localMediaRef.current as any).currentTime = newTime;
                      setCurrentTime([newTime]);
                    } else if (player) {
                      seekTo(Math.max(0, currentTime[0] - jumpTimeSeconds));
                    }
                  }}
                  onMouseDown={() => {
                    longPressTimer.current = setTimeout(() => {
                      setShowJumpTimeDialog(true);
                    }, 500);
                  }}
                  onMouseUp={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  onTouchStart={() => {
                    longPressTimer.current = setTimeout(() => {
                      setShowJumpTimeDialog(true);
                    }, 500);
                  }}
                  onTouchEnd={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  disabled={!player && !currentEditingFile}
                >
                  <SkipBack className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 md:mr-2`} />
                  -{jumpTimeSeconds}s
                </Button>
                <Button 
                  size={isMobile ? "default" : "default"}
                  onClick={togglePlayPause}
                  className={`${isMobile ? 'text-base px-4' : 'text-lg px-6'} bg-primary hover:bg-primary/90`}
                  disabled={!player && !currentEditingFile}
                >
                  {isPlaying ? <Pause className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} mr-1 md:mr-2`} /> : <Play className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} mr-1 md:mr-2`} />}
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
                <Button 
                  variant="outline" 
                  size={isMobile ? "default" : "lg"} 
                  className={`${isMobile ? 'text-sm px-3' : 'text-lg px-6'}`}
                  onClick={() => {
                    if (currentEditingFile && localMediaRef.current) {
                      const newTime = Math.min(videoDuration, currentTime[0] + jumpTimeSeconds);
                      (localMediaRef.current as any).currentTime = newTime;
                      setCurrentTime([newTime]);
                    } else if (player) {
                      seekTo(Math.min(videoDuration, currentTime[0] + jumpTimeSeconds));
                    }
                  }}
                  onMouseDown={() => {
                    longPressTimer.current = setTimeout(() => {
                      setShowJumpTimeDialog(true);
                    }, 500);
                  }}
                  onMouseUp={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  onTouchStart={() => {
                    longPressTimer.current = setTimeout(() => {
                      setShowJumpTimeDialog(true);
                    }, 500);
                  }}
                  onTouchEnd={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  disabled={!player && !currentEditingFile}
                >
                  <SkipForward className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 md:mr-2`} />
                  +{jumpTimeSeconds}s
                </Button>
              </div>
              
              {/* כפתורי חיתוך בשורה אחת - מותאם למובייל */}
              <div className={`flex justify-between items-center gap-2 mb-4 ${isMobile ? 'max-w-xs' : 'max-w-2xl'} mx-auto`}>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "lg"} 
                  className={`rounded-full ${isMobile ? 'px-3 py-2 text-sm' : 'px-8 py-3'}`}
                  onClick={() => setStartTime([currentTime[0]])}
                  disabled={!player && !currentEditingFile}
                >
                  <ChevronLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
                  Start
                </Button>
                <Button 
                  className={`bg-accent hover:bg-accent/90 rounded-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-8 py-3'}`} 
                  size={isMobile ? "sm" : "lg"}
                  onClick={addSegment}
                  disabled={!player && !currentEditingFile}
                >
                  <Scissors className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
                  Cut
                </Button>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "lg"} 
                  className={`rounded-full ${isMobile ? 'px-3 py-2 text-sm' : 'px-8 py-3'}`}
                  onClick={() => setEndTime([currentTime[0]])}
                  disabled={!player && !currentEditingFile}
                >
                  <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
                  End
                </Button>
              </div>

              {/* כפתור שמירה/הורדה של מקטע חתוך */}
              <div className="flex justify-center mb-4">
                <Button 
                  className={`bg-primary hover:bg-primary/90 rounded-full ${isMobile ? 'px-4 py-2 text-sm' : 'px-8 py-3'}`} 
                  size={isMobile ? "sm" : "lg"}
                  onClick={async () => {
                    if (!currentEditingFile) {
                      toast({
                        title: "אין קובץ",
                        description: "יש להעלות קובץ תחילה",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    const start = startTime[0];
                    const end = endTime[0];
                    
                    if (end <= start) {
                      toast({
                        title: "טעות בזמנים",
                        description: "זמן הסיום חייב להיות גדול מזמן ההתחלה",
                        variant: "destructive"
                      });
                      return;
                    }

                    try {
                      const blob = await cutVideo(
                        currentEditingFile.file, 
                        start, 
                        end, 
                        selectedVideoResolution
                      );
                      
                      if (blob) {
                        const extension = currentEditingFile.file.name.split('.').pop() || 'mp4';
                        downloadBlob(blob, `cut_${start.toFixed(0)}-${end.toFixed(0)}.${extension}`);
                        toast({
                          title: "הורדה הושלמה",
                          description: "המקטע החתוך הורד בהצלחה"
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "שגיאה",
                        description: "אירעה שגיאה בחיתוך הקובץ",
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={!currentEditingFile || isProcessing}
                >
                  <Download className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                  {isProcessing ? `${progress.toFixed(0)}%` : 'שמור מקטע'}
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
              Cut Segments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {segments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className={`${isMobile ? 'text-lg' : 'text-xl'}`}>No segments cut yet</p>
                <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>Start cutting to see segments here</p>
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
                      onDelete={handleDeleteSegment}
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
                Quality Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Audio Format</label>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  <Button 
                    variant={selectedAudioFormat === 'mp3' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedAudioFormat('mp3')}
                  >
                    MP3
                  </Button>
                  <Button 
                    variant={selectedAudioFormat === 'wav' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedAudioFormat('wav')}
                  >
                    WAV
                  </Button>
                  <Button 
                    variant={selectedAudioFormat === 'flac' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedAudioFormat('flac')}
                  >
                    FLAC
                  </Button>
                  <Button 
                    variant={selectedAudioFormat === 'aac' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedAudioFormat('aac')}
                  >
                    AAC
                  </Button>
                  <Button 
                    variant={selectedAudioFormat === 'ogg' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedAudioFormat('ogg')}
                  >
                    OGG
                  </Button>
                  <Button 
                    variant={selectedAudioFormat === 'm4a' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedAudioFormat('m4a')}
                  >
                    M4A
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <label className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Audio Quality</label>
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
                <label className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Video Resolution</label>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  <Button 
                    variant={selectedVideoResolution === '480p' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedVideoResolution('480p')}
                  >
                    480p
                  </Button>
                  <Button 
                    variant={selectedVideoResolution === '720p' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedVideoResolution('720p')}
                  >
                    720p
                  </Button>
                  <Button 
                    variant={selectedVideoResolution === '1080p' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedVideoResolution('1080p')}
                  >
                    1080p
                  </Button>
                  <Button 
                    variant={selectedVideoResolution === '1440p' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedVideoResolution('1440p')}
                  >
                    1440p
                  </Button>
                  <Button 
                    variant={selectedVideoResolution === '4k' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedVideoResolution('4k')}
                  >
                    4K
                  </Button>
                  <Button 
                    variant={selectedVideoResolution === '8k' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setSelectedVideoResolution('8k')}
                  >
                    8K
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <label className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>YouTube Download Quality</label>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
                  <Button 
                    variant={youtubeQuality === '360p' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setYoutubeQuality('360p')}
                  >
                    360p
                  </Button>
                  <Button 
                    variant={youtubeQuality === '480p' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setYoutubeQuality('480p')}
                  >
                    480p
                  </Button>
                  <Button 
                    variant={youtubeQuality === '720p' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setYoutubeQuality('720p')}
                  >
                    720p
                  </Button>
                  <Button 
                    variant={youtubeQuality === 'best' ? 'default' : 'outline'} 
                    className={`${isMobile ? 'text-sm' : 'text-lg'}`}
                    onClick={() => setYoutubeQuality('best')}
                  >
                    Best
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-glow w-full">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Download className="w-10 h-10 text-primary" />
                Download Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* בקרות מיקス */}
              <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/20">
                <h4 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4 flex items-center gap-2`}>
                  <Palette className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-accent`} />
                  Mix Settings
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

              {isProcessing && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">מעבד...</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button 
                size={isMobile ? "default" : "lg"} 
                className={`w-full ${isMobile ? 'text-lg py-3' : 'text-xl py-4'} bg-primary hover:bg-primary/90`}
                onClick={handleDownloadAllSegments}
                disabled={!isFFmpegReady || isProcessing || !currentEditingFile || segments.length === 0}
              >
                <Download className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                {isFFmpegReady ? 'Download All Segments' : 'טוען FFmpeg...'}
              </Button>
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "lg"} 
                className={`w-full ${isMobile ? 'text-base' : 'text-lg'}`}
                onClick={handleMergeAndDownload}
                disabled={!isFFmpegReady || isProcessing || !currentEditingFile || segments.length === 0}
              >
                <Layers3 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                Merge Segments with Mix
              </Button>
              
              {/* הורדת כתוביות ודיבוב בנפרד */}
              <div className="border-t pt-4">
                <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-3 text-center`}>Separate Downloads</p>
                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-sm' : 'text-lg'} mb-2`}>
                  <FileText className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                  Download Subtitles Only (.srt)
                </Button>
                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-sm' : 'text-lg'} mb-2`}>
                  <Volume2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                  Download Audio Only (.mp3)
                </Button>
                <Button variant="outline" size={isMobile ? "default" : "lg"} className={`w-full ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  <Video className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                  Download Translated Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* כלים מתקדמים */}
        {currentEditingFile && (
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Wand2 className="w-10 h-10 text-purple-500" />
                כלים מתקדמים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* כלי אודיו */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold flex items-center gap-2 text-purple-400">
                  <AudioWaveform className="w-6 h-6" />
                  עיבוד אודיו
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-24 flex-col gap-2 border-purple-500/30 hover:bg-purple-500/10"
                    onClick={handleExtractAudio}
                    disabled={isProcessing || !isFFmpegReady}
                  >
                    <Music className="w-8 h-8 text-purple-500" />
                    <div className="text-center">
                      <div className="font-semibold">חילוץ אודיו</div>
                      <div className="text-xs text-muted-foreground">הפק אודיו מוידאו</div>
                    </div>
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-24 flex-col gap-2 border-purple-500/30 hover:bg-purple-500/10"
                    onClick={handleNormalizeAudio}
                    disabled={isProcessing || !isFFmpegReady}
                  >
                    <Volume2 className="w-8 h-8 text-purple-500" />
                    <div className="text-center">
                      <div className="font-semibold">נרמול עוצמת קול</div>
                      <div className="text-xs text-muted-foreground">איזון עוצמת קול</div>
                    </div>
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-24 flex-col gap-2 border-purple-500/30 hover:bg-purple-500/10"
                    onClick={handleRemoveVocals}
                    disabled={isProcessing || !isFFmpegReady}
                  >
                    <Mic className="w-8 h-8 text-purple-500" />
                    <div className="text-center">
                      <div className="font-semibold">הסרת ווקאלים</div>
                      <div className="text-xs text-muted-foreground">יצירת גרסה אינסטרומנטלית</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* כלי וידאו */}
              {currentEditingFile.type === 'video' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold flex items-center gap-2 text-pink-400">
                    <Video className="w-6 h-6" />
                    עיבוד וידאו
                  </h4>
                  
                  {/* חיתוך וידאו */}
                  <div className="bg-background/50 p-4 rounded-lg border border-pink-500/30">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <Crop className="w-5 h-5 text-pink-500" />
                      חיתוך פריים
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="text-sm">רוחב</label>
                        <Input 
                          type="number" 
                          value={cropSettings.width}
                          onChange={(e) => setCropSettings({...cropSettings, width: parseInt(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm">גובה</label>
                        <Input 
                          type="number" 
                          value={cropSettings.height}
                          onChange={(e) => setCropSettings({...cropSettings, height: parseInt(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm">X</label>
                        <Input 
                          type="number" 
                          value={cropSettings.x}
                          onChange={(e) => setCropSettings({...cropSettings, x: parseInt(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Y</label>
                        <Input 
                          type="number" 
                          value={cropSettings.y}
                          onChange={(e) => setCropSettings({...cropSettings, y: parseInt(e.target.value)})}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleCropVideo}
                      disabled={isProcessing || !isFFmpegReady}
                    >
                      <Crop className="w-5 h-5 mr-2" />
                      חתוך וידאו
                    </Button>
                  </div>

                  {/* אפקטים */}
                  <div className="bg-background/50 p-4 rounded-lg border border-pink-500/30">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-pink-500" />
                      אפקטים ויזואליים
                    </h5>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                      <Button 
                        variant={selectedEffect === 'grayscale' ? 'default' : 'outline'}
                        onClick={() => setSelectedEffect('grayscale')}
                        size="sm"
                      >
                        שחור לבן
                      </Button>
                      <Button 
                        variant={selectedEffect === 'sepia' ? 'default' : 'outline'}
                        onClick={() => setSelectedEffect('sepia')}
                        size="sm"
                      >
                        ספיה
                      </Button>
                      <Button 
                        variant={selectedEffect === 'negative' ? 'default' : 'outline'}
                        onClick={() => setSelectedEffect('negative')}
                        size="sm"
                      >
                        נגטיב
                      </Button>
                      <Button 
                        variant={selectedEffect === 'blur' ? 'default' : 'outline'}
                        onClick={() => setSelectedEffect('blur')}
                        size="sm"
                      >
                        טשטוש
                      </Button>
                      <Button 
                        variant={selectedEffect === 'sharpen' ? 'default' : 'outline'}
                        onClick={() => setSelectedEffect('sharpen')}
                        size="sm"
                      >
                        חידוד
                      </Button>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleApplyEffect}
                      disabled={isProcessing || !isFFmpegReady}
                    >
                      <Wand2 className="w-5 h-5 mr-2" />
                      החל אפקט: {selectedEffect}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* כרטיסי מחירים ומנויים */}
        <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-4xl font-bold mb-2 text-center bg-gradient-primary bg-clip-text text-transparent">
              Choose Your Plan
            </h3>
            <p className="text-center text-muted-foreground mb-8 text-lg">
              For every level of usage - we have the perfect solution for you
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* חבילה חינמית */}
              <Card className="border-2 border-muted/30 bg-background/50">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold">Basic</h4>
                  <div className="text-4xl font-bold">Free</div>
                  <p className="text-muted-foreground">Perfect for starters</p>
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
                    Start Free
                  </Button>
                </CardContent>
              </Card>

              {/* חבילת פרו */}
              <Card className="border-2 border-primary bg-primary/5 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                    <Crown className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold">Pro</h4>
                  <div className="text-4xl font-bold">$9<span className="text-lg text-muted-foreground">/month</span></div>
                  <p className="text-muted-foreground">For content creators</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Unlimited time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Up to 100 clips per day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">4K Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Multiple cuts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Priority support</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                    Start 7-day Trial
                  </Button>
                </CardContent>
              </Card>

              {/* חבילת פרמיום */}
              <Card className="border-2 border-accent bg-accent/5">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold">Premium</h4>
                  <div className="text-4xl font-bold">$29<span className="text-lg text-muted-foreground">/month</span></div>
                  <p className="text-muted-foreground">For businesses & studios</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">All Pro features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Unlimited clips</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">8K Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">API Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">24/7 Support</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-accent hover:bg-accent/90">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* הערה על התשלום */}
            <div className="text-center mt-8 p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Cancel anytime • Full refund within 30 days • Secure payment
              </p>
            </div>
          </CardContent>
        </Card>

        {/* מידע נוסף */}
        <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-3xl font-bold mb-6 text-center bg-gradient-primary bg-clip-text text-transparent">
              Our Advanced Features
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-lg">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Scissors className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className="font-semibold">Precise Cutting</div>
                <div className="text-muted-foreground">Cut with second precision</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Music className="w-12 h-12 text-secondary mx-auto mb-2" />
                <div className="font-semibold">Song Recognition</div>
                <div className="text-muted-foreground">Automatic name detection</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Headphones className="w-12 h-12 text-accent mx-auto mb-2" />
                <div className="font-semibold">HD Quality</div>
                <div className="text-muted-foreground">Quality encoding at high resolution</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Video className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className="font-semibold">Advanced Mixing</div>
                <div className="text-muted-foreground">Smooth transitions between segments</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <FileText className="w-12 h-12 text-secondary mx-auto mb-2" />
                <div className="font-semibold">Subtitles</div>
                <div className="text-muted-foreground">Automatic translation and subtitles</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Crown className="w-12 h-12 text-accent mx-auto mb-2" />
                <div className="font-semibold">Multiple Platforms</div>
                <div className="text-muted-foreground">Support for all streaming services</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Dialog להמשך עריכה או הורדה */}
      {showContinueDialog && (
        <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                העיבוד הושלם בהצלחה!
              </DialogTitle>
              <DialogDescription>
                הקובץ {processedFilename} מוכן. האם ברצונך להוריד אותו או להמשיך לערוך?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 mt-4">
              <Button
                onClick={continueEditingProcessed}
                className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                המשך עריכה
              </Button>
              <Button
                onClick={downloadAndFinish}
                variant="outline"
                className="w-full text-lg py-6"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                הורד והסתיים
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p>💡 טיפ: אם תבחר "המשך עריכה", תוכל להוסיף עוד אפקטים או לחתוך את הקובץ המעובד.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog להצגת תוכן פלטפורמה */}
      {showPlatformDialog && selectedPlatform && connectedPlatforms[selectedPlatform] && (
        <Dialog open={showPlatformDialog} onOpenChange={setShowPlatformDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <span className="text-3xl">{connectedPlatforms[selectedPlatform]?.icon}</span>
                {selectedPlatform} Content
              </DialogTitle>
              <DialogDescription>
                Your personalized favorites and playlists from {selectedPlatform}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Favorites
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {connectedPlatforms[selectedPlatform].favorites.map((fav) => (
                    <Button
                      key={fav.id}
                      variant="outline"
                      className="justify-start text-left h-auto py-4"
                      onClick={() => {
                        console.log('Loading:', fav.title);
                        setShowPlatformDialog(false);
                      }}
                    >
                      <span className="text-3xl mr-3">{fav.thumbnail}</span>
                      <div className="flex-1">
                        <div className="font-medium">{fav.title}</div>
                        <div className="text-xs text-muted-foreground">Click to load</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Layers3 className="w-5 h-5 text-secondary" />
                  Playlists
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {connectedPlatforms[selectedPlatform].playlists.map((playlist) => (
                    <Button
                      key={playlist.id}
                      variant="outline"
                      className="justify-between h-auto py-4"
                      onClick={() => {
                        console.log('Loading playlist:', playlist.name);
                        setShowPlatformDialog(false);
                      }}
                    >
                      <div className="flex-1 text-left">
                        <div className="font-medium">{playlist.name}</div>
                        <div className="text-xs text-muted-foreground">{playlist.count} items</div>
                      </div>
                      <Badge variant="secondary">{playlist.count}</Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog להגדרת זמן קפיצה */}
      <Dialog open={showJumpTimeDialog} onOpenChange={setShowJumpTimeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              הגדרת זמן קפיצה
            </DialogTitle>
            <DialogDescription>
              בחר כמה שניות לדלג כשלוחצים על כפתורי +/- (0.5s עד 60s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">זמן קפיצה</span>
                <span className="text-2xl font-bold text-primary">{jumpTimeSeconds}s</span>
              </div>
              <Slider
                value={[jumpTimeSeconds]}
                onValueChange={(val) => setJumpTimeSeconds(val[0])}
                min={0.5}
                max={60}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5s</span>
                <span>60s</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={() => setJumpTimeSeconds(5)}
              >
                5s
              </Button>
              <Button
                variant="outline"
                onClick={() => setJumpTimeSeconds(10)}
              >
                10s
              </Button>
              <Button
                variant="outline"
                onClick={() => setJumpTimeSeconds(30)}
              >
                30s
              </Button>
            </div>

            <Button
              onClick={() => setShowJumpTimeDialog(false)}
              className="w-full"
            >
              <Check className="w-4 h-4 mr-2" />
              שמור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;