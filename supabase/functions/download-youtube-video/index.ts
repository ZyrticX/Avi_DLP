import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of Invidious instances to try
const invidiousInstances = [
  'https://invidious.fdn.fr',
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
  'https://yewtu.be'
];

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

    let videoData = null;
    let lastError = null;

    // Try each Invidious instance until one works
    for (const instance of invidiousInstances) {
      try {
        console.log(`Trying instance: ${instance}`);
        
        // Get video info from Invidious
        const infoResponse = await fetch(`${instance}/api/v1/videos/${videoId}`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!infoResponse.ok) {
          console.log(`Instance ${instance} returned ${infoResponse.status}`);
          continue;
        }

        const videoInfo = await infoResponse.json();
        
        // Get the best quality video URL
        const formats = videoInfo.adaptiveFormats || videoInfo.formatStreams || [];
        
        // Try to find a format with both video and audio
        let bestFormat = formats.find((f: any) => 
          f.type?.includes('video') && f.type?.includes('audio')
        );
        
        // If no combined format, get the best video-only format
        if (!bestFormat) {
          const videoFormats = formats.filter((f: any) => f.type?.includes('video'));
          bestFormat = videoFormats.sort((a: any, b: any) => 
            (b.qualityLabel || '0p').localeCompare(a.qualityLabel || '0p')
          )[0];
        }

        if (!bestFormat || !bestFormat.url) {
          console.log(`No suitable format found in ${instance}`);
          continue;
        }

        console.log(`Found format: ${bestFormat.qualityLabel || bestFormat.quality}`);

        // Download the video
        const videoResponse = await fetch(bestFormat.url);
        
        if (!videoResponse.ok) {
          console.log(`Failed to download from ${instance}: ${videoResponse.statusText}`);
          continue;
        }

        videoData = await videoResponse.arrayBuffer();
        console.log(`Successfully downloaded video. Size: ${videoData.byteLength} bytes`);
        
        // Success! Break the loop
        break;
        
      } catch (error) {
        console.log(`Error with instance ${instance}:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!videoData) {
      throw new Error(`Failed to download video from all instances. Last error: ${lastError?.message}`);
    }

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
