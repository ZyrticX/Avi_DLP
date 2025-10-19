-- Create enum for streaming service providers
CREATE TYPE streaming_provider AS ENUM ('spotify', 'apple_music', 'soundcloud', 'youtube_music');

-- Create table for connected streaming services
CREATE TABLE connected_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider streaming_provider NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  user_display_name TEXT,
  user_email TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table for imported playlists
CREATE TABLE imported_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES connected_services(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  track_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_synced BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table for imported tracks
CREATE TABLE imported_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES imported_playlists(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration_seconds INTEGER,
  cover_image_url TEXT,
  youtube_video_id TEXT,
  youtube_search_query TEXT,
  download_status TEXT DEFAULT 'pending',
  file_path TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE connected_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connected_services
CREATE POLICY "Allow public read access to connected_services"
  ON connected_services FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to connected_services"
  ON connected_services FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update connected_services"
  ON connected_services FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete connected_services"
  ON connected_services FOR DELETE
  USING (true);

-- RLS Policies for imported_playlists
CREATE POLICY "Allow public read access to imported_playlists"
  ON imported_playlists FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to imported_playlists"
  ON imported_playlists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update imported_playlists"
  ON imported_playlists FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete imported_playlists"
  ON imported_playlists FOR DELETE
  USING (true);

-- RLS Policies for imported_tracks
CREATE POLICY "Allow public read access to imported_tracks"
  ON imported_tracks FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to imported_tracks"
  ON imported_tracks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update imported_tracks"
  ON imported_tracks FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete imported_tracks"
  ON imported_tracks FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_connected_services_provider ON connected_services(provider);
CREATE INDEX idx_imported_playlists_service_id ON imported_playlists(service_id);
CREATE INDEX idx_imported_tracks_playlist_id ON imported_tracks(playlist_id);
CREATE INDEX idx_imported_tracks_download_status ON imported_tracks(download_status);