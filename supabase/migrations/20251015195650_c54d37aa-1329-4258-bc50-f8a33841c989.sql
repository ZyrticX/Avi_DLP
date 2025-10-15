-- ========================================
-- שלב 1: טבלאות לניהול קבצים וסגמנטים
-- ========================================

-- טבלה לניהול קבצים זמניים עם מחיקה אוטומטית אחרי 24 שעות
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  original_filename TEXT,
  youtube_video_id TEXT,
  youtube_title TEXT,
  youtube_description TEXT,
  youtube_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- טבלה לניהול playlists
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES public.uploaded_files(id) ON DELETE CASCADE NOT NULL,
  has_auto_detected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- טבלה לניהול סגמנטים (קטעים חתוכים)
CREATE TABLE IF NOT EXISTS public.segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  start_time DECIMAL(10,3) NOT NULL,
  end_time DECIMAL(10,3) NOT NULL,
  title TEXT,
  artist TEXT,
  status TEXT DEFAULT 'pending',
  file_path TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- אינדקסים לביצועים
-- ========================================

CREATE INDEX IF NOT EXISTS idx_uploaded_files_expires_at ON public.uploaded_files(expires_at);
CREATE INDEX IF NOT EXISTS idx_playlists_file_id ON public.playlists(file_id);
CREATE INDEX IF NOT EXISTS idx_segments_playlist_id ON public.segments(playlist_id);
CREATE INDEX IF NOT EXISTS idx_segments_sort_order ON public.segments(playlist_id, sort_order);

-- ========================================
-- RLS Policies
-- ========================================

-- הפעלת RLS
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

-- Policies לגישה ציבורית (כל אחד יכול לראות ולהוסיף)
CREATE POLICY "Allow public read access to uploaded_files"
ON public.uploaded_files FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to uploaded_files"
ON public.uploaded_files FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public delete expired files"
ON public.uploaded_files FOR DELETE
USING (expires_at < NOW());

CREATE POLICY "Allow public read access to playlists"
ON public.playlists FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to playlists"
ON public.playlists FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update playlists"
ON public.playlists FOR UPDATE
USING (true);

CREATE POLICY "Allow public read access to segments"
ON public.segments FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to segments"
ON public.segments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update segments"
ON public.segments FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete segments"
ON public.segments FOR DELETE
USING (true);

-- ========================================
-- Storage Bucket
-- ========================================

-- יצירת bucket לקבצים זמניים
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temp-media',
  'temp-media',
  false,
  524288000,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/mp4', 'audio/x-m4a']
)
ON CONFLICT (id) DO NOTHING;

-- Policies ל-Storage
CREATE POLICY "Allow public uploads to temp-media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'temp-media');

CREATE POLICY "Allow public read from temp-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'temp-media');

CREATE POLICY "Allow public delete from temp-media"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'temp-media');