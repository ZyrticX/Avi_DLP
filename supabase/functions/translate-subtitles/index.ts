import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SubtitleBlock {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

interface TranslateRequest {
  movieId: string;
  sourceSubtitleId: string;
  targetLanguage: string;
}

const LANGUAGE_NAMES: { [key: string]: string } = {
  'en': 'English',
  'he': 'Hebrew',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ru': 'Russian',
  'uk': 'Ukrainian',
  'es': 'Spanish',
  'de': 'German',
  'fr': 'French',
  'it': 'Italian',
};

// Parse SRT file into structured blocks
function parseSRT(srtText: string): SubtitleBlock[] {
  const blocks: SubtitleBlock[] = [];
  const lines = srtText.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Look for index number
    if (line && /^\d+$/.test(line)) {
      const index = parseInt(line);
      i++;
      
      // Next line should be timing
      const timingLine = lines[i]?.trim();
      if (timingLine && timingLine.includes('-->')) {
        const [startTime, endTime] = timingLine.split('-->').map(t => t.trim());
        i++;
        
        // Collect text lines until empty line
        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i].trim());
          i++;
        }
        
        if (textLines.length > 0) {
          blocks.push({
            index,
            startTime,
            endTime,
            text: textLines.join('\n'),
          });
        }
      }
    }
    i++;
  }
  
  return blocks;
}

// Convert blocks back to SRT format
function generateSRT(blocks: SubtitleBlock[]): string {
  return blocks.map(block => {
    return `${block.index}\n${block.startTime} --> ${block.endTime}\n${block.text}\n`;
  }).join('\n');
}

// Translate text using Lovable AI
async function translateText(text: string, targetLang: string, sourceLang: string): Promise<string> {
  const targetLanguageName = LANGUAGE_NAMES[targetLang] || targetLang;
  const sourceLanguageName = LANGUAGE_NAMES[sourceLang] || sourceLang;
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `You are a professional subtitle translator. Translate the following subtitle text from ${sourceLanguageName} to ${targetLanguageName}. \n
CRITICAL RULES:
1. Preserve line breaks exactly as they appear
2. Return ONLY the translated text, no explanations or metadata
3. Keep the same number of lines
4. Maintain timing-appropriate text length
5. Preserve formatting characters like dashes for dialogue
6. Keep proper names unchanged unless they have standard translations`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`Translation failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieId, sourceSubtitleId, targetLanguage }: TranslateRequest = await req.json();

    console.log('Translating subtitles:', { movieId, sourceSubtitleId, targetLanguage });

    if (!movieId || !sourceSubtitleId || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: movieId, sourceSubtitleId, targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Lovable AI key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get source subtitle info
    const { data: sourceSubtitle, error: fetchError } = await supabase
      .from('subtitles')
      .select('*')
      .eq('id', sourceSubtitleId)
      .single();

    if (fetchError || !sourceSubtitle) {
      console.error('Failed to fetch source subtitle:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Source subtitle not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Source subtitle:', sourceSubtitle.file_path, 'Language:', sourceSubtitle.language);

    // Download source subtitle from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('movie-subtitles')
      .download(sourceSubtitle.file_path);

    if (downloadError || !fileData) {
      console.error('Failed to download subtitle file:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download source subtitle file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const srtText = await fileData.text();
    console.log('Subtitle file loaded, size:', srtText.length, 'chars');

    // Parse SRT
    const blocks = parseSRT(srtText);
    console.log('Parsed', blocks.length, 'subtitle blocks');

    if (blocks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No subtitle blocks found in source file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Translate in batches of 10 blocks
    const batchSize = 10;
    const translatedBlocks: SubtitleBlock[] = [];

    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);
      const batchText = batch.map(b => b.text).join('\n---\n');
      
      console.log(`Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(blocks.length / batchSize)}`);
      
      try {
        const translatedBatchText = await translateText(
          batchText, 
          targetLanguage, 
          sourceSubtitle.language
        );
        
        const translatedTexts = translatedBatchText.split('\n---\n');
        
        for (let j = 0; j < batch.length; j++) {
          translatedBlocks.push({
            ...batch[j],
            text: translatedTexts[j] || batch[j].text, // Fallback to original if split fails
          });
        }
      } catch (error) {
        console.error('Translation batch failed:', error);
        // On error, keep original text for this batch
        translatedBlocks.push(...batch);
      }
    }

    console.log('Translation complete, generating SRT');

    // Generate translated SRT
    const translatedSRT = generateSRT(translatedBlocks);

    // Upload translated subtitle to storage
    const targetStoragePath = `${movieId}/${targetLanguage}_translated.srt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('movie-subtitles')
      .upload(targetStoragePath, translatedSRT, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload translated subtitle', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Upload successful:', uploadData.path);

    // Create record in subtitles table
    const { data: subtitleRecord, error: dbError } = await supabase
      .from('subtitles')
      .insert({
        movie_id: movieId,
        language: targetLanguage,
        file_path: targetStoragePath,
        format: 'srt',
        is_translated: true,
        source_language: sourceSubtitle.language,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create translated subtitle record', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Translation complete:', subtitleRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        subtitle: subtitleRecord,
        file_path: targetStoragePath,
        blocks_translated: translatedBlocks.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in translate-subtitles function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
