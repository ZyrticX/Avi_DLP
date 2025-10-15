-- ========================================
-- Phase 1: Database Schema for Movie Subtitles System
-- ========================================

-- Create movies table
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES public.uploaded_files(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  duration INTEGER, -- in seconds
  original_language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subtitles table
CREATE TABLE public.subtitles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL, -- 'en', 'he', 'zh', 'ja', 'ru', 'uk', 'es', 'de', 'fr', 'it'
  file_path TEXT NOT NULL, -- path in storage
  format TEXT DEFAULT 'srt',
  is_translated BOOLEAN DEFAULT FALSE,
  source_language TEXT, -- if translated, what was the original language
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for movies table
CREATE POLICY "Allow public read access to movies"
ON public.movies
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to movies"
ON public.movies
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update movies"
ON public.movies
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete movies"
ON public.movies
FOR DELETE
USING (true);

-- RLS Policies for subtitles table
CREATE POLICY "Allow public read access to subtitles"
ON public.subtitles
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to subtitles"
ON public.subtitles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update subtitles"
ON public.subtitles
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete subtitles"
ON public.subtitles
FOR DELETE
USING (true);

-- Create storage bucket for subtitles
INSERT INTO storage.buckets (id, name, public)
VALUES ('movie-subtitles', 'movie-subtitles', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for movie-subtitles bucket
CREATE POLICY "Public can view subtitle files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'movie-subtitles');

CREATE POLICY "Public can upload subtitle files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'movie-subtitles');

CREATE POLICY "Public can update subtitle files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'movie-subtitles');

CREATE POLICY "Public can delete subtitle files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'movie-subtitles');