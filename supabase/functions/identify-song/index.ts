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
    const { audioBlob } = await req.json();
    
    if (!audioBlob) {
      throw new Error('Missing audioBlob parameter');
    }

    console.log('Identifying song from audio blob...');

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    // Convert base64 audio to binary
    const audioData = Uint8Array.from(atob(audioBlob), c => c.charCodeAt(0));

    // Call Shazam API via RapidAPI
    const response = await fetch('https://shazam.p.rapidapi.com/songs/v2/detect', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
        'Content-Type': 'text/plain',
      },
      body: audioData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shazam API error:', response.status, errorText);
      throw new Error(`Shazam API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Shazam response:', JSON.stringify(data));

    // Extract song information
    if (data.track) {
      const songInfo = {
        title: data.track.title,
        artist: data.track.subtitle,
        album: data.track.sections?.[0]?.metadata?.find((m: any) => m.title === 'Album')?.text,
        artwork: data.track.images?.coverart,
        shazamUrl: data.track.url,
      };

      return new Response(JSON.stringify(songInfo), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'Song not recognized' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in identify-song function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
