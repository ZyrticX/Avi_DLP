import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// YouTube Downloader API URL (משתנה סביבה או fallback)
const YOUTUBE_API_URL = Deno.env.get('YOUTUBE_API_URL') || 'http://localhost:8000';
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || '';

// Fallback: List of Invidious instances to try (אם שרת Python לא זמין)
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

    // ניסיון ראשון: שימוש ב-yt-dlp API (שרת Python)
    try {
      console.log(`Trying yt-dlp API: ${YOUTUBE_API_URL}`);
      
      const apiHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (YOUTUBE_API_KEY) {
        apiHeaders['X-API-Key'] = YOUTUBE_API_KEY;
      }

      const downloadResponse = await fetch(`${YOUTUBE_API_URL}/download`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          video_id: videoId,
          quality: quality,
          format: 'mp4'
        })
      });

      if (downloadResponse.ok) {
        console.log('Successfully downloaded via yt-dlp API');
        
        // קבלת metadata מה-headers או מ-info endpoint
        let title = decodeURIComponent(downloadResponse.headers.get('X-Video-Title') || '');
        let description = '';
        let duration = 0;
        let author = '';

        // אם אין metadata ב-headers, נקבל מ-info endpoint
        if (!title) {
          try {
            const infoHeaders: HeadersInit = {
              'Content-Type': 'application/json',
            };
            
            if (YOUTUBE_API_KEY) {
              infoHeaders['X-API-Key'] = YOUTUBE_API_KEY;
            }

            const infoResponse = await fetch(`${YOUTUBE_API_URL}/info?video_id=${videoId}`, {
              method: 'GET',
              headers: infoHeaders,
            });

            if (infoResponse.ok) {
              const videoInfo = await infoResponse.json();
              title = videoInfo.title || '';
              description = videoInfo.description || '';
              duration = videoInfo.duration || 0;
              author = videoInfo.uploader || '';
            }
          } catch (infoError) {
            console.log('Could not fetch video info:', infoError);
          }
        } else {
          // יש title ב-headers, ננסה לקבל את השאר
          description = decodeURIComponent(downloadResponse.headers.get('X-Video-Description') || '');
          duration = parseInt(downloadResponse.headers.get('X-Video-Duration') || '0');
          author = decodeURIComponent(downloadResponse.headers.get('X-Video-Author') || '');
        }
        
        // העברת הווידאו הלאה
        const videoData = await downloadResponse.arrayBuffer();
        
        return new Response(videoData, {
          headers: {
            ...corsHeaders,
            'Content-Type': downloadResponse.headers.get('Content-Type') || 'video/mp4',
            'Content-Disposition': downloadResponse.headers.get('Content-Disposition') || `attachment; filename="${videoId}.mp4"`,
            'Content-Length': videoData.byteLength.toString(),
            'X-Video-Title': encodeURIComponent(title),
            'X-Video-Description': encodeURIComponent(description),
            'X-Video-Duration': duration.toString(),
            'X-Video-Author': encodeURIComponent(author),
          },
        });
      } else {
        console.log(`yt-dlp API returned ${downloadResponse.status}, falling back to Invidious`);
      }
    } catch (apiError) {
      console.log(`yt-dlp API error: ${apiError.message}, falling back to Invidious`);
    }

    // Fallback: שימוש ב-Invidious (אם שרת Python לא זמין)
    console.log('Using Invidious fallback...');
    let videoData = null;
    let videoMetadata = null;
    let lastError = null;

    for (const instance of invidiousInstances) {
      try {
        console.log(`Trying instance: ${instance}`);
        
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
        
        videoMetadata = {
          title: videoInfo.title || '',
          description: videoInfo.description || '',
          duration: videoInfo.lengthSeconds || 0,
          author: videoInfo.author || '',
        };
        
        console.log(`Video metadata: ${videoMetadata.title} (${videoMetadata.duration}s)`);
        
        const formats = videoInfo.adaptiveFormats || videoInfo.formatStreams || [];
        
        let bestFormat = formats.find((f: any) => 
          f.type?.includes('video') && f.type?.includes('audio')
        );
        
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

        const videoResponse = await fetch(bestFormat.url);
        
        if (!videoResponse.ok) {
          console.log(`Failed to download from ${instance}: ${videoResponse.statusText}`);
          continue;
        }

        videoData = await videoResponse.arrayBuffer();
        console.log(`Successfully downloaded video. Size: ${videoData.byteLength} bytes`);
        
        break;
        
      } catch (error) {
        console.log(`Error with instance ${instance}:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!videoData) {
      throw new Error(`Failed to download video. Last error: ${lastError?.message}`);
    }

    return new Response(videoData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${videoId}.mp4"`,
        'Content-Length': videoData.byteLength.toString(),
        'X-Video-Title': encodeURIComponent(videoMetadata?.title || ''),
        'X-Video-Description': encodeURIComponent(videoMetadata?.description || ''),
        'X-Video-Duration': (videoMetadata?.duration || 0).toString(),
        'X-Video-Author': encodeURIComponent(videoMetadata?.author || ''),
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
