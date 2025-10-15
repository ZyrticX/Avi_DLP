import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistId } = await req.json();
    
    if (!playlistId) {
      throw new Error('Missing playlistId parameter');
    }

    console.log(`Exporting playlist: ${playlistId}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all segments for this playlist
    const { data: segments, error: segmentsError } = await supabase
      .from('segments')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('sort_order', { ascending: true });

    if (segmentsError) {
      throw new Error(`Failed to fetch segments: ${segmentsError.message}`);
    }

    if (!segments || segments.length === 0) {
      throw new Error('No segments found for this playlist');
    }

    console.log(`Found ${segments.length} segments to export`);

    // Create ZIP file
    const zip = new JSZip();
    let successCount = 0;
    let failCount = 0;

    for (const segment of segments) {
      try {
        if (!segment.file_path) {
          console.log(`Skipping segment ${segment.id}: no file_path`);
          failCount++;
          continue;
        }

        // Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('temp-media')
          .download(segment.file_path);

        if (downloadError || !fileData) {
          console.error(`Failed to download ${segment.file_path}:`, downloadError);
          failCount++;
          continue;
        }

        // Create filename: "Artist - Title.ext" or "Track_XX.ext"
        const extension = segment.file_path.split('.').pop() || 'mp3';
        let filename: string;
        
        if (segment.artist && segment.title) {
          // Sanitize filename
          const sanitizedArtist = segment.artist.replace(/[<>:"/\\|?*]/g, '');
          const sanitizedTitle = segment.title.replace(/[<>:"/\\|?*]/g, '');
          filename = `${sanitizedArtist} - ${sanitizedTitle}.${extension}`;
        } else if (segment.title) {
          const sanitizedTitle = segment.title.replace(/[<>:"/\\|?*]/g, '');
          filename = `${sanitizedTitle}.${extension}`;
        } else {
          const trackNumber = String(segment.sort_order + 1).padStart(2, '0');
          filename = `Track_${trackNumber}.${extension}`;
        }

        // Convert Blob to ArrayBuffer
        const arrayBuffer = await fileData.arrayBuffer();
        
        // Add to ZIP
        zip.file(filename, arrayBuffer);
        successCount++;
        
        console.log(`Added to ZIP: ${filename}`);
        
      } catch (error) {
        console.error(`Error processing segment ${segment.id}:`, error);
        failCount++;
      }
    }

    if (successCount === 0) {
      throw new Error('No files could be added to the ZIP archive');
    }

    console.log(`ZIP creation complete: ${successCount} files added, ${failCount} failed`);

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ 
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    return new Response(zipBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="playlist.zip"',
        'Content-Length': zipBlob.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error in export-playlist function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
