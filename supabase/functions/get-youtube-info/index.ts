import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// YouTube Downloader API URL
const YOUTUBE_API_URL = Deno.env.get('YOUTUBE_API_URL') || 'http://localhost:8000';
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, videoId } = await req.json();
    
    if (!url && !videoId) {
      throw new Error('Missing url or videoId parameter');
    }

    console.log(`Getting video info for: ${url || videoId}`);

    const apiHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (YOUTUBE_API_KEY) {
      apiHeaders['X-API-Key'] = YOUTUBE_API_KEY;
    }

    const infoResponse = await fetch(`${YOUTUBE_API_URL}/info?${videoId ? `video_id=${videoId}` : `url=${encodeURIComponent(url)}`}`, {
      method: 'GET',
      headers: apiHeaders,
    });

    if (!infoResponse.ok) {
      const errorText = await infoResponse.text();
      throw new Error(`API error: ${infoResponse.status} - ${errorText}`);
    }

    const videoInfo = await infoResponse.json();
    
    console.log(`Video info retrieved: ${videoInfo.title}`);

    return new Response(JSON.stringify(videoInfo), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in get-youtube-info function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});




