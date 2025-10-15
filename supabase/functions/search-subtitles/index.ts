import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENSUBTITLES_API_KEY = Deno.env.get('OPENSUBTITLES_API_KEY');
const OPENSUBTITLES_API_URL = 'https://api.opensubtitles.com/api/v1/subtitles';

interface SearchRequest {
  movieTitle: string;
  year?: number;
  languages: string[]; // ['en', 'he', 'zh', 'ja', 'ru', 'uk', 'es', 'de', 'fr', 'it']
}

interface SubtitleResult {
  id: string;
  language: string;
  file_name: string;
  download_count: number;
  rating: number;
  download_url: string;
  hearing_impaired: boolean;
  feature_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieTitle, year, languages }: SearchRequest = await req.json();

    console.log('Searching subtitles for:', { movieTitle, year, languages });

    if (!movieTitle || !languages || languages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: movieTitle and languages' }),
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

    // Build query parameters
    const params = new URLSearchParams({
      query: movieTitle,
      languages: languages.join(','),
    });

    if (year) {
      params.append('year', year.toString());
    }

    // Make request to OpenSubtitles API
    const searchUrl = `${OPENSUBTITLES_API_URL}?${params.toString()}`;
    console.log('Requesting:', searchUrl);

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Api-Key': OPENSUBTITLES_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenSubtitles API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to search subtitles', 
          details: errorText,
          status: response.status 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenSubtitles response:', { total: data.total_count });

    // Transform results to simplified format
    const results: SubtitleResult[] = (data.data || []).map((item: any) => ({
      id: item.attributes.files?.[0]?.file_id?.toString() || item.id,
      language: item.attributes.language,
      file_name: item.attributes.files?.[0]?.file_name || item.attributes.release || 'Unknown',
      download_count: item.attributes.download_count || 0,
      rating: item.attributes.ratings || 0,
      download_url: item.attributes.files?.[0]?.file_id 
        ? `https://api.opensubtitles.com/api/v1/download` 
        : '',
      hearing_impaired: item.attributes.hearing_impaired || false,
      feature_type: item.attributes.feature_details?.movie_name || movieTitle,
    }));

    // Sort by rating (highest first) and download count
    results.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.download_count - a.download_count;
    });

    // Group by language and limit to top 5 per language
    const groupedResults: { [key: string]: SubtitleResult[] } = {};
    
    for (const result of results) {
      if (!groupedResults[result.language]) {
        groupedResults[result.language] = [];
      }
      if (groupedResults[result.language].length < 5) {
        groupedResults[result.language].push(result);
      }
    }

    console.log('Returning results:', Object.keys(groupedResults).map(lang => ({
      language: lang,
      count: groupedResults[lang].length
    })));

    return new Response(
      JSON.stringify({ 
        results: groupedResults,
        total_count: data.total_count || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-subtitles function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});