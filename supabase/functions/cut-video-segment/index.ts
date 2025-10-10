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
    const { videoId, start, end, title } = await req.json();
    
    if (!videoId || start === undefined || end === undefined) {
      throw new Error('Missing required parameters: videoId, start, end');
    }

    console.log(`Cutting YouTube video: ${videoId} from ${start}s to ${end}s`);

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // First, get the download link for the full video
    const response = await fetch(
      `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get download link: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.link) {
      throw new Error('No download link received from API');
    }

    console.log('Got download link, downloading full video to cut segment...');

    // Download the full video
    const videoResponse = await fetch(data.link);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    // Return the full video with metadata about the segment to cut
    // The client will handle the actual cutting using FFmpeg
    const videoData = await videoResponse.arrayBuffer();
    
    console.log(`Successfully downloaded video for cutting. Size: ${videoData.byteLength} bytes`);

    return new Response(videoData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${title || 'segment'}_${start}-${end}.mp4"`,
        'Content-Length': videoData.byteLength.toString(),
        'X-Segment-Start': start.toString(),
        'X-Segment-End': end.toString(),
      },
    });

  } catch (error) {
    console.error('Error in cut-video-segment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
