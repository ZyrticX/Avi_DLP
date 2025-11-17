/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

export const API_CONFIG = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  },
  youtube: {
    // Custom YouTube downloader API (yt-dlp server)
    baseUrl: import.meta.env.VITE_YOUTUBE_API_URL || '',
    apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
    // Fallback to Supabase Edge Function if custom API not configured
    useCustomApi: !!import.meta.env.VITE_YOUTUBE_API_URL,
  },
} as const;

/**
 * Get the YouTube downloader endpoint URL
 */
export const getYouTubeDownloaderUrl = (): string => {
  console.log('[getYouTubeDownloaderUrl] API_CONFIG:', {
    useCustomApi: API_CONFIG.youtube.useCustomApi,
    baseUrl: API_CONFIG.youtube.baseUrl,
    supabaseUrl: API_CONFIG.supabase.url
  });
  
  if (API_CONFIG.youtube.useCustomApi && API_CONFIG.youtube.baseUrl) {
    const url = `${API_CONFIG.youtube.baseUrl}/download`;
    console.log('[getYouTubeDownloaderUrl] Using custom API:', url);
    return url;
  }
  // Fallback to Supabase Edge Function
  const url = `${API_CONFIG.supabase.url}/functions/v1/download-youtube-video`;
  console.log('[getYouTubeDownloaderUrl] Using Supabase fallback:', url);
  return url;
};

/**
 * Get YouTube video info endpoint URL
 */
export const getYouTubeInfoUrl = (videoId?: string, url?: string): string => {
  if (API_CONFIG.youtube.useCustomApi && API_CONFIG.youtube.baseUrl) {
    const params = videoId ? `video_id=${videoId}` : `url=${encodeURIComponent(url || '')}`;
    return `${API_CONFIG.youtube.baseUrl}/info?${params}`;
  }
  // Fallback to Supabase Edge Function
  return `${API_CONFIG.supabase.url}/functions/v1/get-youtube-info`;
};

/**
 * Get authorization headers for API requests
 */
export const getAuthHeaders = (includeSupabaseAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_CONFIG.youtube.useCustomApi && API_CONFIG.youtube.apiKey) {
    headers['X-API-Key'] = API_CONFIG.youtube.apiKey;
  } else if (includeSupabaseAuth) {
    headers['Authorization'] = `Bearer ${API_CONFIG.supabase.anonKey}`;
  }

  return headers;
};

