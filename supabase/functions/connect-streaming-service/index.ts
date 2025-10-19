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
    const { provider, authCode, redirectUri } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log(`Connecting to ${provider}...`);

    let accessToken = '';
    let refreshToken = '';
    let userInfo: any = {};

    switch (provider) {
      case 'spotify':
        const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID');
        const spotifyClientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

        if (!spotifyClientId || !spotifyClientSecret) {
          throw new Error('Spotify credentials not configured');
        }

        // Exchange auth code for tokens
        const spotifyTokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: redirectUri,
          }),
        });

        const spotifyTokenData = await spotifyTokenResponse.json();
        accessToken = spotifyTokenData.access_token;
        refreshToken = spotifyTokenData.refresh_token;

        // Get user profile
        const spotifyUserResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        userInfo = await spotifyUserResponse.json();
        break;

      case 'apple_music':
        // Apple Music uses MusicKit JS on client side
        // This would handle server-side token validation
        accessToken = authCode; // MusicKit provides token directly
        
        const appleMusicResponse = await fetch('https://api.music.apple.com/v1/me/storefront', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Music-User-Token': authCode,
          },
        });

        userInfo = await appleMusicResponse.json();
        break;

      case 'soundcloud':
        const soundcloudClientId = Deno.env.get('SOUNDCLOUD_CLIENT_ID');
        const soundcloudClientSecret = Deno.env.get('SOUNDCLOUD_CLIENT_SECRET');

        if (!soundcloudClientId || !soundcloudClientSecret) {
          throw new Error('SoundCloud credentials not configured');
        }

        const soundcloudTokenResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: authCode,
            client_id: soundcloudClientId,
            client_secret: soundcloudClientSecret,
            redirect_uri: redirectUri,
          }),
        });

        const soundcloudTokenData = await soundcloudTokenResponse.json();
        accessToken = soundcloudTokenData.access_token;
        refreshToken = soundcloudTokenData.refresh_token;

        const soundcloudUserResponse = await fetch(`https://api.soundcloud.com/me?oauth_token=${accessToken}`);
        userInfo = await soundcloudUserResponse.json();
        break;

      case 'youtube_music':
        // YouTube Music uses YouTube Data API
        const youtubeClientId = Deno.env.get('YOUTUBE_CLIENT_ID');
        const youtubeClientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');

        if (!youtubeClientId || !youtubeClientSecret) {
          throw new Error('YouTube credentials not configured');
        }

        const youtubeTokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: authCode,
            client_id: youtubeClientId,
            client_secret: youtubeClientSecret,
            redirect_uri: redirectUri,
          }),
        });

        const youtubeTokenData = await youtubeTokenResponse.json();
        accessToken = youtubeTokenData.access_token;
        refreshToken = youtubeTokenData.refresh_token;

        const youtubeUserResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const youtubeUserData = await youtubeUserResponse.json();
        userInfo = youtubeUserData.items?.[0]?.snippet || {};
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Store connection in database
    const { data: service, error: insertError } = await supabaseClient
      .from('connected_services')
      .insert({
        provider,
        access_token: accessToken,
        refresh_token: refreshToken,
        user_display_name: userInfo.display_name || userInfo.title || userInfo.username || null,
        user_email: userInfo.email || null,
        metadata: userInfo,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        service,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Connection error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to connect service',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
