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

    // Format quality for yt-dlp
    let formatString = 'best';
    if (quality === '720p') {
      formatString = 'bestvideo[height<=720]+bestaudio/best[height<=720]';
    } else if (quality === '480p') {
      formatString = 'bestvideo[height<=480]+bestaudio/best[height<=480]';
    } else if (quality === '360p') {
      formatString = 'bestvideo[height<=360]+bestaudio/best[height<=360]';
    } else if (quality === 'best') {
      formatString = 'bestvideo+bestaudio/best';
    }

    // Use yt-dlp to download the video
    const ytDlpCommand = new Deno.Command("yt-dlp", {
      args: [
        "-f", formatString,
        "--merge-output-format", "mp4",
        "-o", "-",
        `https://www.youtube.com/watch?v=${videoId}`
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const process = ytDlpCommand.spawn();
    
    // Collect stdout data
    const chunks: Uint8Array[] = [];
    const reader = process.stdout.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Wait for process to complete
    const status = await process.status;
    
    if (!status.success) {
      const errorReader = process.stderr.getReader();
      const errorChunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await errorReader.read();
        if (done) break;
        errorChunks.push(value);
      }
      const errorText = new TextDecoder().decode(
        new Uint8Array(errorChunks.flatMap(chunk => Array.from(chunk)))
      );
      console.error('yt-dlp error:', errorText);
      throw new Error(`Failed to download video: ${errorText}`);
    }

    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const videoData = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      videoData.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`Successfully downloaded video. Size: ${videoData.length} bytes`);

    return new Response(videoData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Length': videoData.length.toString(),
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
