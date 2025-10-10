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
    
    console.log('Got video info for cutting');

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

    console.log('Downloading video for cutting...');

    // Download the full video
    const videoResponse = await fetch(videoUrl);
    
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
