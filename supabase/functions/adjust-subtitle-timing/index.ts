import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubtitleBlock {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

function parseTime(timeStr: string): number {
  // Parse HH:MM:SS,mmm to milliseconds
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + parseInt(ms);
}

function formatTime(ms: number): string {
  // Format milliseconds to HH:MM:SS,mmm
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

function parseSRT(content: string): SubtitleBlock[] {
  const blocks = content.trim().split(/\n\s*\n/);
  const subtitles: SubtitleBlock[] = [];
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    
    const index = parseInt(lines[0]);
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    
    if (!timeMatch) continue;
    
    subtitles.push({
      index,
      startTime: timeMatch[1],
      endTime: timeMatch[2],
      text: lines.slice(2).join('\n'),
    });
  }
  
  return subtitles;
}

function adjustSubtitleTiming(subtitles: SubtitleBlock[], offsetMs: number): SubtitleBlock[] {
  return subtitles.map(sub => {
    let newStartMs = parseTime(sub.startTime) + offsetMs;
    let newEndMs = parseTime(sub.endTime) + offsetMs;
    
    // Ensure times don't go negative
    newStartMs = Math.max(0, newStartMs);
    newEndMs = Math.max(0, newEndMs);
    
    // Ensure end time is after start time
    if (newEndMs <= newStartMs) {
      newEndMs = newStartMs + 1000; // Add 1 second minimum duration
    }
    
    return {
      ...sub,
      startTime: formatTime(newStartMs),
      endTime: formatTime(newEndMs),
    };
  });
}

function generateSRT(subtitles: SubtitleBlock[]): string {
  return subtitles
    .map(sub => `${sub.index}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}`)
    .join('\n\n') + '\n';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { subtitleId, offsetSeconds } = await req.json();

    if (!subtitleId || offsetSeconds === undefined) {
      throw new Error('Missing required parameters: subtitleId, offsetSeconds');
    }

    console.log(`Adjusting subtitle timing - ID: ${subtitleId}, Offset: ${offsetSeconds}s`);

    // Get subtitle record
    const { data: subtitle, error: subtitleError } = await supabase
      .from('subtitles')
      .select('*')
      .eq('id', subtitleId)
      .single();

    if (subtitleError || !subtitle) {
      throw new Error(`Subtitle not found: ${subtitleError?.message}`);
    }

    // Download the SRT file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('movie-subtitles')
      .download(subtitle.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download subtitle file: ${downloadError?.message}`);
    }

    const srtContent = await fileData.text();
    console.log('Downloaded SRT file, size:', srtContent.length);

    // Parse and adjust timing
    const subtitles = parseSRT(srtContent);
    console.log(`Parsed ${subtitles.length} subtitle blocks`);

    const offsetMs = offsetSeconds * 1000;
    const adjustedSubtitles = adjustSubtitleTiming(subtitles, offsetMs);

    // Generate new SRT content
    const newSrtContent = generateSRT(adjustedSubtitles);

    // Create new file path with offset indicator
    const pathParts = subtitle.file_path.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const fileNameWithoutExt = fileName.replace('.srt', '');
    const offsetLabel = offsetSeconds >= 0 ? `+${offsetSeconds}` : offsetSeconds;
    const newFileName = `${fileNameWithoutExt}_offset${offsetLabel}s.srt`;
    const newFilePath = [...pathParts.slice(0, -1), newFileName].join('/');

    // Upload adjusted SRT
    const { error: uploadError } = await supabase.storage
      .from('movie-subtitles')
      .upload(newFilePath, new Blob([newSrtContent], { type: 'text/plain' }), {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload adjusted subtitle: ${uploadError.message}`);
    }

    console.log('Uploaded adjusted subtitle to:', newFilePath);

    // Create new subtitle record
    const { data: newSubtitle, error: insertError } = await supabase
      .from('subtitles')
      .insert({
        movie_id: subtitle.movie_id,
        language: subtitle.language,
        file_path: newFilePath,
        format: 'srt',
        source_language: subtitle.source_language,
        is_translated: subtitle.is_translated,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create subtitle record: ${insertError.message}`);
    }

    console.log('Created new subtitle record with adjusted timing');

    return new Response(
      JSON.stringify({
        success: true,
        subtitle: newSubtitle,
        offsetApplied: offsetSeconds,
        message: `Timing adjusted by ${offsetSeconds} seconds`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error adjusting subtitle timing:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
