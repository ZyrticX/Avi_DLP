import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import ytdl from "https://deno.land/x/ytdl_core@v0.1.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, quality = 'highest' } = await req.json();
    
    if (!videoId) {
      throw new Error('Missing videoId parameter');
    }

    console.log(`Downloading YouTube video: ${videoId} with quality: ${quality}`);

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Get video info
    const info = await ytdl.getInfo(videoUrl);
    
    // Get the best format
    const format = ytdl.chooseFormat(info.formats, { quality });
    
    console.log(`Selected format: ${format.qualityLabel || format.quality}`);

    // Download the video
    const videoStream = ytdl.downloadFromInfo(info, { format });
    
    // Convert stream to array buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of videoStream) {
      chunks.push(chunk);
    }
    
    const videoData = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    
    let offset = 0;
    for (const chunk of chunks) {
      videoData.set(chunk, offset);
      offset += chunk.length;
    }
    
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
