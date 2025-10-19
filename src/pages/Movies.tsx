import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Download, RefreshCw, Trash2, Loader2, CheckCircle, XCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConnectedService {
  id: string;
  provider: 'spotify' | 'apple_music' | 'soundcloud' | 'youtube_music';
  user_display_name: string | null;
  user_email: string | null;
  connected_at: string;
  last_synced_at: string | null;
  is_active: boolean;
}

interface ImportedPlaylist {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  track_count: number;
  cover_image_url: string | null;
  is_synced: boolean;
  imported_at: string;
}

interface ImportedTrack {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration_seconds: number | null;
  download_status: string;
  youtube_video_id: string | null;
}

const STREAMING_SERVICES = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎵',
    color: 'bg-green-500',
    description: 'חבר את חשבון Spotify שלך',
  },
  {
    id: 'apple_music',
    name: 'Apple Music',
    icon: '🍎',
    color: 'bg-red-500',
    description: 'חבר את חשבון Apple Music שלך',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: '☁️',
    color: 'bg-orange-500',
    description: 'חבר את חשבון SoundCloud שלך',
  },
  {
    id: 'youtube_music',
    name: 'YouTube Music',
    icon: '📺',
    color: 'bg-red-600',
    description: 'חבר את חשבון YouTube Music שלך',
  },
];

export default function Movies() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([]);
  const [playlists, setPlaylists] = useState<ImportedPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<ImportedPlaylist | null>(null);
  const [tracks, setTracks] = useState<ImportedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    fetchConnectedServices();
    fetchPlaylists();
  }, []);

  const fetchConnectedServices = async () => {
    const { data, error } = await supabase
      .from('connected_services')
      .select('*')
      .eq('is_active', true)
      .order('connected_at', { ascending: false });

    if (!error && data) {
      setConnectedServices(data);
    }
  };

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from('imported_playlists')
      .select('*')
      .order('imported_at', { ascending: false });

    if (!error && data) {
      setPlaylists(data);
    }
  };

  const fetchTracks = async (playlistId: string) => {
    const { data, error } = await supabase
      .from('imported_tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('imported_at', { ascending: false });

    if (!error && data) {
      setTracks(data);
    }
  };

  const handleConnectService = async (serviceId: string) => {
    toast({
      title: 'בקרוב!',
      description: `חיבור ל-${STREAMING_SERVICES.find(s => s.id === serviceId)?.name} יהיה זמין בקרוב`,
    });
    
    // TODO: Implement OAuth flow for each service
    // For now, showing the user that this feature is coming soon
  };

  const handleSyncPlaylists = async (serviceId: string) => {
    setIsLoading(true);
    setSyncProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setSyncProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // TODO: Call edge function to sync playlists
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(interval);
      setSyncProgress(100);

      toast({
        title: 'סנכרון הושלם!',
        description: 'הפלייליסטים שלך עודכנו',
      });

      await fetchPlaylists();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'שגיאה בסנכרון',
        description: 'נסה שוב מאוחר יותר',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setSyncProgress(0);
    }
  };

  const handleDownloadPlaylist = async (playlist: ImportedPlaylist) => {
    setSelectedPlaylist(playlist);
    await fetchTracks(playlist.id);

    toast({
      title: 'מתחיל הורדה',
      description: `מוריד ${playlist.track_count} שירים מ-${playlist.name}`,
    });

    // TODO: Implement download logic
  };

  const handleDisconnectService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('connected_services')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: 'שירות נותק',
        description: 'השירות נותק בהצלחה',
      });

      await fetchConnectedServices();
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לנתק את השירות',
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
                <Music className="h-8 w-8" />
                Streaming Services
              </h1>
              <p className="text-muted-foreground mt-1">
                חבר את שירותי הסטרימינג שלך וייבא את כל השירים
              </p>
            </div>
          </div>
        </div>

        {/* Connected Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">שירותים מחוברים</h2>
          {connectedServices.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  עדיין לא חיברת אף שירות. התחל בחיבור שירות ראשון למטה 👇
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {connectedServices.map((service) => {
                const serviceInfo = STREAMING_SERVICES.find((s) => s.id === service.provider);
                return (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{serviceInfo?.icon}</span>
                          <CardTitle className="text-lg">{serviceInfo?.name}</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          מחובר
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {service.user_display_name || service.user_email || 'משתמש'}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSyncPlaylists(service.id)}
                          disabled={isLoading}
                        >
                          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                          סנכרן
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDisconnectService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sync Progress */}
        {isLoading && syncProgress > 0 && (
          <Card className="mb-8">
            <CardContent className="py-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>מסנכרן פלייליסטים...</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Services to Connect */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">חבר שירותים חדשים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STREAMING_SERVICES.filter(
              (service) => !connectedServices.some((cs) => cs.provider === service.id)
            ).map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{service.icon}</span>
                    <CardTitle>{service.name}</CardTitle>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => handleConnectService(service.id)}
                  >
                    חבר עכשיו
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Imported Playlists */}
        {playlists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">הפלייליסטים שלי</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleDownloadPlaylist(playlist)}
                >
                  <CardHeader>
                    {playlist.cover_image_url && (
                      <img
                        src={playlist.cover_image_url}
                        alt={playlist.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{playlist.name}</span>
                      {playlist.is_synced && (
                        <Badge variant="secondary">
                          <Download className="h-3 w-3 mr-1" />
                          הורד
                        </Badge>
                      )}
                    </CardTitle>
                    {playlist.description && (
                      <CardDescription className="line-clamp-2">
                        {playlist.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{playlist.track_count} שירים</span>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        הורד הכל
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Selected Playlist Tracks */}
        {selectedPlaylist && tracks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              שירים מ-{selectedPlaylist.name}
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-muted-foreground w-8 text-right">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {track.artist} {track.album && `• ${track.album}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {track.duration_seconds && (
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(track.duration_seconds / 60)}:
                            {(track.duration_seconds % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                        <Badge
                          variant={
                            track.download_status === 'completed'
                              ? 'default'
                              : track.download_status === 'downloading'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {track.download_status === 'completed' && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {track.download_status === 'downloading' && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {track.download_status === 'failed' && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {track.download_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {connectedServices.length === 0 && playlists.length === 0 && (
          <Card className="mt-8">
            <CardContent className="py-16 text-center">
              <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">התחל עכשיו!</h3>
              <p className="text-muted-foreground mb-6">
                חבר את שירותי הסטרימינג שלך כדי להתחיל לייבא את המוזיקה שלך
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
