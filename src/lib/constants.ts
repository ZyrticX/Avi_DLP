/**
 * Application Constants
 * Centralized constants for the application
 */

export const VIDEO_CONFIG = {
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
  DEFAULT_FADE_DURATION: 2, // seconds
  DEFAULT_QUALITY: 'best' as const,
} as const;

export const AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'] as const;
export const VIDEO_RESOLUTIONS = ['480p', '720p', '1080p', '1440p', '4k', '8k'] as const;

export const STORAGE_KEYS = {
  PROJECT_NAME: 'yt-cutter-project-name',
  SEGMENTS: 'yt-cutter-segments',
  VIDEO_ID: 'yt-cutter-video-id',
} as const;

export const YOUTUBE_URL_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

/**
 * Extract YouTube video ID from URL
 * Supports multiple URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

