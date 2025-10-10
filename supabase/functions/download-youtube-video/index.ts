import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, quality = 'best' } = await req.json();
    
    if (!videoId) {
      throw new Error('Missing videoId parameter');
    }

    console.log(`Downloading YouTube video: ${videoId} with quality: ${quality}`);

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // Use YTStream API from RapidAPI
    const response = await fetch(
      `https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'ytstream-download-youtube-videos.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get video info: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('Got video info:', data);

    // Get the best quality video URL from formats
    let videoUrl = null;
    if (data.formats && data.formats.length > 0) {
      // Find the best video format (with both video and audio)
      const videoWithAudio = data.formats.find((f: any) => 
        f.mimeType?.includes('video') && f.mimeType?.includes('audio')
      );
      
      if (videoWithAudio) {
        videoUrl = videoWithAudio.url;
      } else {
        // Fallback to highest quality video
        const sortedFormats = data.formats
          .filter((f: any) => f.mimeType?.includes('video'))
          .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
        
        if (sortedFormats.length > 0) {
          videoUrl = sortedFormats[0].url;
        }
      }
    }

    if (!videoUrl) {
      throw new Error('No video URL found in response');
    }

    console.log('Downloading video from URL...');

    // Download the video
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoData = await videoResponse.arrayBuffer();
    
    console.log(`Successfully downloaded video. Size: ${videoData.byteLength} bytes`);

    return new Response(videoData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${videoId}.mp4"`,
        'Content-Length': videoData.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error in download-youtube-video function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
