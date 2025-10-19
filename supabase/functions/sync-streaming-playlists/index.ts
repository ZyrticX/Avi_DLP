import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get service details
    const { data: service, error: serviceError } = await supabaseClient
      .from('connected_services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      throw new Error('Service not found');
    }

    console.log(`Syncing playlists for ${service.provider}...`);

    let playlists: any[] = [];

    switch (service.provider) {
      case 'spotify':
        const spotifyResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
          headers: {
            'Authorization': `Bearer ${service.access_token}`,
          },
        });

        const spotifyData = await spotifyResponse.json();
        playlists = spotifyData.items?.map((item: any) => ({
          service_id: serviceId,
          external_id: item.id,
          name: item.name,
          description: item.description,
          track_count: item.tracks.total,
          cover_image_url: item.images?.[0]?.url,
          metadata: item,
        })) || [];
        break;

      case 'apple_music':
        const appleMusicResponse = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
          headers: {
            'Authorization': `Bearer ${service.access_token}`,
            'Music-User-Token': service.access_token,
          },
        });

        const appleMusicData = await appleMusicResponse.json();
        playlists = appleMusicData.data?.map((item: any) => ({
          service_id: serviceId,
          external_id: item.id,
          name: item.attributes.name,
          description: item.attributes.description?.standard,
          track_count: item.attributes.trackCount || 0,
          cover_image_url: item.attributes.artwork?.url,
          metadata: item,
        })) || [];
        break;

      case 'soundcloud':
        const soundcloudResponse = await fetch(`https://api.soundcloud.com/me/playlists?oauth_token=${service.access_token}`);
        const soundcloudData = await soundcloudResponse.json();
        
        playlists = soundcloudData.map((item: any) => ({
          service_id: serviceId,
          external_id: item.id.toString(),
          name: item.title,
          description: item.description,
          track_count: item.track_count || 0,
          cover_image_url: item.artwork_url,
          metadata: item,
        }));
        break;

      case 'youtube_music':
        // YouTube Music playlists via YouTube Data API
        const youtubeResponse = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50', {
          headers: {
            'Authorization': `Bearer ${service.access_token}`,
          },
        });

        const youtubeData = await youtubeResponse.json();
        playlists = youtubeData.items?.map((item: any) => ({
          service_id: serviceId,
          external_id: item.id,
          name: item.snippet.title,
          description: item.snippet.description,
          track_count: item.contentDetails.itemCount || 0,
          cover_image_url: item.snippet.thumbnails?.high?.url,
          metadata: item,
        })) || [];
        break;

      default:
        throw new Error(`Unsupported provider: ${service.provider}`);
    }

    // Delete existing playlists for this service
    await supabaseClient
      .from('imported_playlists')
      .delete()
      .eq('service_id', serviceId);

    // Insert new playlists
    if (playlists.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('imported_playlists')
        .insert(playlists);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    // Update last synced timestamp
    await supabaseClient
      .from('connected_services')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', serviceId);

    return new Response(
      JSON.stringify({
        success: true,
        count: playlists.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to sync playlists',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
