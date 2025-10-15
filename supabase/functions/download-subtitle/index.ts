import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENSUBTITLES_API_KEY = Deno.env.get('OPENSUBTITLES_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface DownloadRequest {
  movieId: string;
  fileId: string; // OpenSubtitles file_id
  language: string;
  fileName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieId, fileId, language, fileName }: DownloadRequest = await req.json();

    console.log('Downloading subtitle:', { movieId, fileId, language, fileName });

    if (!movieId || !fileId || !language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: movieId, fileId, language' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENSUBTITLES_API_KEY) {
      console.error('OPENSUBTITLES_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'OpenSubtitles API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download subtitle from OpenSubtitles
    const downloadUrl = 'https://api.opensubtitles.com/api/v1/download';
    console.log('Requesting download for file_id:', fileId);

    const downloadResponse = await fetch(downloadUrl, {
      method: 'POST',
      headers: {
        'Api-Key': OPENSUBTITLES_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: parseInt(fileId),
      }),
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error('OpenSubtitles download error:', downloadResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to download subtitle', 
          details: errorText,
          status: downloadResponse.status 
        }),
        { status: downloadResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const downloadData = await downloadResponse.json();
    const subtitleFileUrl = downloadData.link;

    if (!subtitleFileUrl) {
      console.error('No download link in response:', downloadData);
      return new Response(
        JSON.stringify({ error: 'No download link received from OpenSubtitles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Downloading subtitle content from:', subtitleFileUrl);

    // Fetch the actual subtitle file
    const subtitleResponse = await fetch(subtitleFileUrl);
    if (!subtitleResponse.ok) {
      console.error('Failed to fetch subtitle content:', subtitleResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subtitle content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subtitleContent = await subtitleResponse.arrayBuffer();
    
    // Validate it's a text file (SRT)
    const textDecoder = new TextDecoder('utf-8');
    const subtitleText = textDecoder.decode(subtitleContent);
    
    if (!subtitleText.includes('-->')) {
      console.error('Downloaded file does not appear to be a valid SRT file');
      return new Response(
        JSON.stringify({ error: 'Invalid subtitle format - not an SRT file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subtitle validated, size:', subtitleContent.byteLength, 'bytes');

    // Upload to Supabase Storage
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const storagePath = `${movieId}/${language}_original.srt`;

    console.log('Uploading to storage:', storagePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('movie-subtitles')
      .upload(storagePath, subtitleContent, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload subtitle to storage', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Upload successful:', uploadData.path);

    // Create record in subtitles table
    const { data: subtitleRecord, error: dbError } = await supabase
      .from('subtitles')
      .insert({
        movie_id: movieId,
        language: language,
        file_path: storagePath,
        format: 'srt',
        is_translated: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subtitle record', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subtitle record created:', subtitleRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        subtitle: subtitleRecord,
        file_path: storagePath,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in download-subtitle function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});