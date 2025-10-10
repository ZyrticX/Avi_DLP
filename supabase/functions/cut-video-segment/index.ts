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

    const duration = end - start;

    // Use yt-dlp to download and cut the video segment
    const ytDlpCommand = new Deno.Command("yt-dlp", {
      args: [
        "-f", "bestvideo+bestaudio/best",
        "--merge-output-format", "mp4",
        "--download-sections", `*${start}-${end}`,
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
      throw new Error(`Failed to cut video segment: ${errorText}`);
    }

    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const videoData = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      videoData.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`Successfully cut video segment. Size: ${videoData.length} bytes`);

    return new Response(videoData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${title || 'segment'}_${start}-${end}.mp4"`,
        'Content-Length': videoData.length.toString(),
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
