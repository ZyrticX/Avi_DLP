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
    const { description } = await req.json();
    
    if (!description) {
      throw new Error('Missing description parameter');
    }

    console.log('Analyzing description for playlist patterns...');

    // בדיקה ראשונית: האם יש תבניות זמן בתיאור?
    const timePatterns = [
      /\d{1,2}:\d{2}/g,           // MM:SS
      /\d{1,2}:\d{2}:\d{2}/g      // HH:MM:SS
    ];

    let hasTimeStamps = false;
    let timeMatches = 0;

    for (const pattern of timePatterns) {
      const matches = description.match(pattern);
      if (matches && matches.length >= 2) {
        hasTimeStamps = true;
        timeMatches = matches.length;
        break;
      }
    }

    if (!hasTimeStamps) {
      console.log('No playlist patterns found in description');
      return new Response(
        JSON.stringify({ hasPlaylist: false, songs: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${timeMatches} time stamps, analyzing with AI...`);

    // שליחה ל-Lovable AI לחילוץ מבני
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a playlist analyzer. Extract song information from video descriptions. Return ONLY valid JSON, no markdown formatting.'
          },
          {
            role: 'user',
            content: `נתח את התיאור הבא וחלץ רשימת שירים עם זמנים.
כל שיר צריך להיות באובייקט עם:
- time: הזמן במבנה MM:SS או HH:MM:SS
- title: שם השיר
- artist: שם האמן (אם קיים)

התיאור:
${description}

החזר JSON array בלבד במבנה הזה:
[{"time": "0:00", "title": "Song Name", "artist": "Artist Name"}]

אם אין אמן, השתמש ב-null. אם אין שירים, החזר [].`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '[]';
    
    console.log('AI response:', aiContent);

    // ניקוי התגובה (הסרת markdown אם קיים)
    let cleanContent = aiContent.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '');
    }

    let songs = [];
    try {
      songs = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Content was:', cleanContent);
      songs = [];
    }

    // ולידציה: לפחות שיר אחד עם time ו-title
    const validSongs = songs.filter((song: any) => 
      song.time && song.title
    );

    const hasPlaylist = validSongs.length >= 2;

    console.log(`Analysis complete: ${hasPlaylist ? 'Playlist detected' : 'No playlist'} with ${validSongs.length} songs`);

    return new Response(
      JSON.stringify({
        hasPlaylist,
        songs: validSongs,
        totalFound: validSongs.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-description function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
