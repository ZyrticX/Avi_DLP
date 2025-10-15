import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, Languages, Download, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFFmpeg } from '@/hooks/useFFmpeg';

interface Movie {
  id: string;
  title: string;
  year: number | null;
  file_id: string;
  duration: number | null;
}

interface Subtitle {
  id: string;
  movie_id: string;
  language: string;
  file_path: string;
  is_translated: boolean;
  source_language: string | null;
}

interface SubtitleSearchResult {
  id: string;
  language: string;
  file_name: string;
  download_count: number;
  rating: number;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export default function Movies() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { burnSubtitles, isLoading: ffmpegLoading, progress: ffmpegProgress } = useFFmpeg();

  const [step, setStep] = useState<'upload' | 'identify' | 'search' | 'manage' | 'export'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState('');
  const [searchLanguages, setSearchLanguages] = useState<string[]>(['en']);
  const [searchResults, setSearchResults] = useState<{ [key: string]: SubtitleSearchResult[] }>({});
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('he');
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);

  // Burn-in settings
  const [fontName, setFontName] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('white');
  const [position, setPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 2GB validation
    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast({
        title: 'קובץ גדול מדי',
        description: 'גודל הקובץ המקסימלי הוא 2GB',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
    
    toast({
      title: 'קובץ נטען בהצלחה',
      description: `${file.name} מוכן לעיבוד`,
    });

    setStep('identify');
  };

  const handleIdentifyMovie = async () => {
    if (!uploadedFile || !movieTitle) {
      toast({
        title: 'חסרים פרטים',
        description: 'אנא הזן את שם הסרט',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Upload file to storage first
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `temp-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('temp-media')
        .upload(filePath, uploadedFile);

      if (uploadError) throw uploadError;

      // Create uploaded_files record
      const { data: uploadedFileData, error: fileError } = await supabase
        .from('uploaded_files')
        .insert({
          file_path: filePath,
          file_size: uploadedFile.size,
          mime_type: uploadedFile.type,
          original_filename: uploadedFile.name,
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // Create movie record
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .insert({
          file_id: uploadedFileData.id,
          title: movieTitle,
          year: movieYear ? parseInt(movieYear) : null,
        })
        .select()
        .single();

      if (movieError) throw movieError;

      setMovie(movieData);
      setStep('search');

      toast({
        title: 'סרט זוהה בהצלחה',
        description: `${movieTitle} נשמר במערכת`,
      });
    } catch (error) {
      console.error('Error identifying movie:', error);
      toast({
        title: 'שגיאה בזיהוי סרט',
        description: 'נסה שוב',
        variant: 'destructive',
      });
    }
  };

  const handleSearchSubtitles = async () => {
    if (!movie || searchLanguages.length === 0) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-subtitles', {
        body: {
          movieTitle: movie.title,
          year: movie.year,
          languages: searchLanguages,
        },
      });

      if (error) throw error;

      setSearchResults(data.results || {});
      
      toast({
        title: 'חיפוש הושלם',
        description: `נמצאו כתוביות ב-${Object.keys(data.results || {}).length} שפות`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'שגיאה בחיפוש',
        description: 'לא ניתן לחפש כתוביות',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadSubtitle = async (result: SubtitleSearchResult) => {
    if (!movie) return;

    setIsDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('download-subtitle', {
        body: {
          movieId: movie.id,
          fileId: result.id,
          language: result.language,
          fileName: result.file_name,
        },
      });

      if (error) throw error;

      // Refresh subtitles list
      await fetchSubtitles();

      toast({
        title: 'כתוביות הורדו',
        description: `${result.file_name} נשמר בהצלחה`,
      });

      setStep('manage');
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'שגיאה בהורדה',
        description: 'לא ניתן להוריד את הכתוביות',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchSubtitles = async () => {
    if (!movie) return;

    const { data, error } = await supabase
      .from('subtitles')
      .select('*')
      .eq('movie_id', movie.id);

    if (!error && data) {
      setSubtitles(data);
    }
  };

  const handleTranslateSubtitle = async (subtitle: Subtitle) => {
    setIsTranslating(true);
    setTranslationProgress(0);
    
    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setTranslationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // First, check if subtitles already exist in target language
      const existingSubtitlesInTargetLang = searchResults[targetLanguage];
      
      if (existingSubtitlesInTargetLang && existingSubtitlesInTargetLang.length > 0) {
        // Found existing subtitles in target language - download them instead of translating
        console.log('Found existing subtitles in target language:', targetLanguage);
        
        // Use the highest rated one
        const bestSubtitle = existingSubtitlesInTargetLang[0];
        
        const { data, error } = await supabase.functions.invoke('download-subtitle', {
          body: {
            movieId: movie?.id,
            fileId: bestSubtitle.id,
            language: targetLanguage,
            fileName: bestSubtitle.file_name,
          },
        });

        if (error) throw error;

        // Mark as "translated" in the database for UI consistency
        const { error: updateError } = await supabase
          .from('subtitles')
          .update({ 
            is_translated: true,
            source_language: subtitle.language 
          })
          .eq('id', data.subtitle.id);

        if (updateError) {
          console.error('Failed to mark as translated:', updateError);
        }

        clearInterval(progressInterval);
        setTranslationProgress(100);

        toast({
          title: 'כתוביות נוספו בהצלחה',
          description: `נמצאו כתוביות מוכנות ב${LANGUAGES.find((l) => l.code === targetLanguage)?.name}`,
        });
      } else {
        // No existing subtitles found - actually translate
        console.log('No existing subtitles found, translating...');
        
        const { data, error } = await supabase.functions.invoke('translate-subtitles', {
          body: {
            movieId: movie?.id,
            sourceSubtitleId: subtitle.id,
            targetLanguage,
          },
        });

        if (error) throw error;

        clearInterval(progressInterval);
        setTranslationProgress(100);

        toast({
          title: 'תרגום הושלם',
          description: `כתוביות תורגמו ל${LANGUAGES.find((l) => l.code === targetLanguage)?.name}`,
        });
      }

      await fetchSubtitles();

    } catch (error) {
      console.error('Translation/download error:', error);
      toast({
        title: 'שגיאה בתרגום',
        description: 'לא ניתן לתרגם את הכתוביות',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
    }
  };

  const handleBurnSubtitles = async () => {
    if (!uploadedFile || !selectedSubtitle) {
      toast({
        title: 'חסרים נתונים',
        description: 'בחר כתוביות להדבקה',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Download subtitle file from storage
      const { data: subtitleData, error: downloadError } = await supabase.storage
        .from('movie-subtitles')
        .download(selectedSubtitle.file_path);

      if (downloadError) throw downloadError;

      const subtitleFile = new File([subtitleData], 'subtitle.srt', { type: 'text/plain' });

      const result = await burnSubtitles(uploadedFile, subtitleFile, {
        fontName,
        fontSize,
        fontColor,
        position,
      });

      if (result) {
        const url = URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${movie?.title}_subtitled.mp4`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: 'סרט ייוצא בהצלחה!',
          description: 'הסרט עם הכתוביות מוכן להורדה',
        });
      }
    } catch (error) {
      console.error('Burn error:', error);
      toast({
        title: 'שגיאה ביצוא',
        description: 'לא ניתן ליצא את הסרט',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2">
                <Film className="h-8 w-8" />
                תרגום וכתוביות לסרטים
              </h1>
              <p className="text-muted-foreground mt-1">
                העלה סרט, חפש כתוביות, תרגם והדבק אותן לווידאו
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8">
          {['upload', 'identify', 'search', 'manage', 'export'].map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full ${
                ['upload', 'identify', 'search', 'manage', 'export'].indexOf(step) >= i 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`} />
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                שלב 1: העלאת סרט
              </CardTitle>
              <CardDescription>
                בחר קובץ וידאו (מקסימום 2GB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                />
                <Label htmlFor="video-upload" className="cursor-pointer">
                  <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">לחץ לבחירת קובץ וידאו</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    MP4, MOV, AVI, MKV - עד 2GB
                  </p>
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Identify */}
        {step === 'identify' && uploadedFile && (
          <Card>
            <CardHeader>
              <CardTitle>שלב 2: זיהוי סרט</CardTitle>
              <CardDescription>הזן את פרטי הסרט</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>קובץ נבחר</Label>
                <Badge variant="secondary" className="mt-2">
                  {uploadedFile.name}
                </Badge>
              </div>

              <div>
                <Label htmlFor="title">שם הסרט *</Label>
                <Input
                  id="title"
                  placeholder="לדוגמה: Inception"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="year">שנה</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="לדוגמה: 2010"
                  value={movieYear}
                  onChange={(e) => setMovieYear(e.target.value)}
                />
              </div>

              <Button onClick={handleIdentifyMovie} className="w-full">
                המשך לחיפוש כתוביות
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Search */}
        {step === 'search' && movie && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  שלב 3: חיפוש כתוביות
                </CardTitle>
                <CardDescription>
                  חפש כתוביות עבור {movie.title} {movie.year && `(${movie.year})`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>בחר שפות לחיפוש</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    {LANGUAGES.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={searchLanguages.includes(lang.code) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSearchLanguages((prev) =>
                            prev.includes(lang.code)
                              ? prev.filter((l) => l !== lang.code)
                              : [...prev, lang.code]
                          );
                        }}
                      >
                        {lang.flag} {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSearchSubtitles} 
                  disabled={isSearching || searchLanguages.length === 0}
                  className="w-full"
                >
                  {isSearching ? 'מחפש...' : 'חפש כתוביות'}
                </Button>
              </CardContent>
            </Card>

            {/* Search Results */}
            {Object.keys(searchResults).length > 0 && (
              <div className="grid gap-4">
                {Object.entries(searchResults).map(([lang, results]) => (
                  <Card key={lang}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {LANGUAGES.find((l) => l.code === lang)?.flag}{' '}
                        {LANGUAGES.find((l) => l.code === lang)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">{result.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                ⭐ {result.rating.toFixed(1)} • 
                                ⬇️ {result.download_count.toLocaleString()} הורדות
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadSubtitle(result)}
                              disabled={isDownloading}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              הורד
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Manage & Translate */}
        {step === 'manage' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                שלב 4: ניהול ותרגום כתוביות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={fetchSubtitles} variant="outline">
                רענן רשימת כתוביות
              </Button>

              {subtitles.length > 0 ? (
                <div className="space-y-4">
                  {subtitles.map((sub) => (
                    <div key={sub.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Badge variant={sub.is_translated ? 'secondary' : 'default'}>
                            {LANGUAGES.find((l) => l.code === sub.language)?.flag}{' '}
                            {LANGUAGES.find((l) => l.code === sub.language)?.name}
                          </Badge>
                          {sub.is_translated && (
                            <Badge variant="outline" className="mr-2">
                              מתורגם מ-{sub.source_language}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={selectedSubtitle?.id === sub.id ? 'default' : 'outline'}
                          onClick={() => setSelectedSubtitle(sub)}
                        >
                          {selectedSubtitle?.id === sub.id ? 'נבחר' : 'בחר להדבקה'}
                        </Button>
                      </div>

                      {!sub.is_translated && (
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label>תרגם לשפה</Label>
                            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {LANGUAGES.filter((l) => l.code !== sub.language).map((lang) => (
                                  <SelectItem key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={() => handleTranslateSubtitle(sub)}
                            disabled={isTranslating}
                          >
                            תרגם
                          </Button>
                        </div>
                      )}

                      {isTranslating && translationProgress > 0 && (
                        <Progress value={translationProgress} className="mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  אין כתוביות זמינות. חזור לשלב החיפוש.
                </p>
              )}

              <Separator />

              <Button onClick={() => setStep('export')} className="w-full" disabled={!selectedSubtitle}>
                המשך להדבקה וייצוא
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Export */}
        {step === 'export' && selectedSubtitle && (
          <Card>
            <CardHeader>
              <CardTitle>שלב 5: הדבקה וייצוא</CardTitle>
              <CardDescription>התאם את הגדרות הכתוביות ויצא את הסרט</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>גופן</Label>
                  <Select value={fontName} onValueChange={setFontName}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Tahoma">Tahoma</SelectItem>
                      <SelectItem value="Courier">Courier</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>גודל גופן</Label>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
                    min={16}
                    max={48}
                  />
                </div>

                <div>
                  <Label>צבע</Label>
                  <Select value={fontColor} onValueChange={setFontColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">לבן</SelectItem>
                      <SelectItem value="yellow">צהוב</SelectItem>
                      <SelectItem value="black">שחור</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>מיקום</Label>
                  <Select value={position} onValueChange={(v: any) => setPosition(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">למעלה</SelectItem>
                      <SelectItem value="middle">באמצע</SelectItem>
                      <SelectItem value="bottom">למטה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {ffmpegLoading && (
                <div className="space-y-2">
                  <Label>מעבד וידאו...</Label>
                  <Progress value={ffmpegProgress} />
                  <p className="text-sm text-muted-foreground text-center">
                    {ffmpegProgress}% הושלם
                  </p>
                </div>
              )}

              <Button
                onClick={handleBurnSubtitles}
                disabled={ffmpegLoading}
                className="w-full"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                הדבק כתוביות ויצא סרט
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}