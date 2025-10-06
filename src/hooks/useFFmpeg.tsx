import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from '@/hooks/use-toast';

export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg' | 'm4a';
export type VideoResolution = '480p' | '720p' | '1080p' | '1440p' | '4k' | '8k';

interface Segment {
  id: number;
  start: number;
  end: number;
  title: string;
}

export const useFFmpeg = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpeg.on('progress', ({ progress: prog }) => {
        setProgress(Math.round(prog * 100));
      });

      setIsReady(true);
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      toast({
        title: "שגיאה בטעינת FFmpeg",
        description: "לא ניתן לטעון את מנוע העיבוד. נסה לרענן את הדף.",
        variant: "destructive",
      });
    }
  };

  const cutVideo = async (
    file: File,
    segment: Segment,
    format: AudioFormat | 'mp4' | 'webm' = 'mp4',
    resolution?: VideoResolution
  ): Promise<Blob | null> => {
    if (!isReady) {
      toast({
        title: "FFmpeg לא מוכן",
        description: "אנא המתן לטעינת מנוע העיבוד",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setProgress(0);
    const ffmpeg = ffmpegRef.current;

    try {
      const inputFileName = `input.${file.name.split('.').pop()}`;
      const outputFileName = `output.${format}`;

      // Write input file
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Build FFmpeg command
      const args = [
        '-i', inputFileName,
        '-ss', segment.start.toString(),
        '-t', (segment.end - segment.start).toString(),
      ];

      // Add video quality settings
      if (format === 'mp4' || format === 'webm') {
        if (resolution) {
          const heights: Record<VideoResolution, string> = {
            '480p': '854:480',
            '720p': '1280:720',
            '1080p': '1920:1080',
            '1440p': '2560:1440',
            '4k': '3840:2160',
            '8k': '7680:4320',
          };
          args.push('-vf', `scale=${heights[resolution]}`);
        }
        args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '23');
      }

      // Add audio codec settings
      if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(format)) {
        args.push('-vn'); // No video
        
        const audioCodecs: Record<AudioFormat, string[]> = {
          mp3: ['-c:a', 'libmp3lame', '-b:a', '320k'],
          wav: ['-c:a', 'pcm_s16le'],
          flac: ['-c:a', 'flac'],
          aac: ['-c:a', 'aac', '-b:a', '320k'],
          ogg: ['-c:a', 'libvorbis', '-b:a', '320k'],
          m4a: ['-c:a', 'aac', '-b:a', '320k'],
        };
        
        args.push(...(audioCodecs[format as AudioFormat] || []));
      } else {
        args.push('-c:a', 'aac', '-b:a', '192k');
      }

      args.push(outputFileName);

      // Execute FFmpeg command
      await ffmpeg.exec(args);

      // Read output file
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data], { 
        type: format === 'mp4' ? 'video/mp4' : 
              format === 'webm' ? 'video/webm' :
              `audio/${format}` 
      });

      // Cleanup
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      setIsLoading(false);
      setProgress(0);

      toast({
        title: "החיתוך הושלם בהצלחה!",
        description: `הקובץ ${segment.title} מוכן להורדה`,
      });

      return blob;
    } catch (error) {
      console.error('FFmpeg error:', error);
      setIsLoading(false);
      setProgress(0);
      
      toast({
        title: "שגיאה בעיבוד",
        description: "לא ניתן לעבד את הקובץ. נסה שנית או בחר קובץ אחר.",
        variant: "destructive",
      });
      
      return null;
    }
  };

  const mergeSegments = async (
    file: File,
    segments: Segment[],
    format: AudioFormat | 'mp4' | 'webm' = 'mp4',
    fadeInDuration: number = 0,
    fadeOutDuration: number = 0
  ): Promise<Blob | null> => {
    if (!isReady || segments.length === 0) return null;

    setIsLoading(true);
    setProgress(0);
    const ffmpeg = ffmpegRef.current;

    try {
      const inputFileName = `input.${file.name.split('.').pop()}`;
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Create filter complex for cutting and merging
      const filterParts: string[] = [];
      
      segments.forEach((segment, index) => {
        const duration = segment.end - segment.start;
        let filter = `[0:v]trim=${segment.start}:${segment.end},setpts=PTS-STARTPTS`;
        
        if (index === 0 && fadeInDuration > 0) {
          filter += `,fade=t=in:st=0:d=${fadeInDuration}`;
        }
        
        if (index === segments.length - 1 && fadeOutDuration > 0) {
          const fadeStart = duration - fadeOutDuration;
          filter += `,fade=t=out:st=${fadeStart}:d=${fadeOutDuration}`;
        }
        
        filter += `[v${index}];`;
        filter += `[0:a]atrim=${segment.start}:${segment.end},asetpts=PTS-STARTPTS`;
        
        if (index === 0 && fadeInDuration > 0) {
          filter += `,afade=t=in:st=0:d=${fadeInDuration}`;
        }
        
        if (index === segments.length - 1 && fadeOutDuration > 0) {
          const fadeStart = duration - fadeOutDuration;
          filter += `,afade=t=out:st=${fadeStart}:d=${fadeOutDuration}`;
        }
        
        filter += `[a${index}]`;
        filterParts.push(filter);
      });

      const videoConcat = segments.map((_, i) => `[v${i}]`).join('') + `concat=n=${segments.length}:v=1:a=0[outv];`;
      const audioConcat = segments.map((_, i) => `[a${i}]`).join('') + `concat=n=${segments.length}:v=0:a=1[outa]`;
      
      const filterComplex = filterParts.join(';') + ';' + videoConcat + audioConcat;

      const outputFileName = `merged.${format}`;
      const args = [
        '-i', inputFileName,
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '[outa]',
      ];

      if (format === 'mp4' || format === 'webm') {
        args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '23');
        args.push('-c:a', 'aac', '-b:a', '192k');
      } else {
        args.push('-vn');
        args.push('-c:a', format === 'mp3' ? 'libmp3lame' : 'aac');
        args.push('-b:a', '320k');
      }

      args.push(outputFileName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data], { 
        type: format === 'mp4' ? 'video/mp4' : `audio/${format}` 
      });

      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      setIsLoading(false);
      setProgress(0);

      toast({
        title: "המיזוג הושלם בהצלחה!",
        description: `${segments.length} מקטעים אוחדו לקובץ אחד`,
      });

      return blob;
    } catch (error) {
      console.error('FFmpeg merge error:', error);
      setIsLoading(false);
      setProgress(0);
      
      toast({
        title: "שגיאה במיזוג",
        description: "לא ניתן למזג את המקטעים. נסה שנית.",
        variant: "destructive",
      });
      
      return null;
    }
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    isLoading,
    isReady,
    progress,
    cutVideo,
    mergeSegments,
    downloadBlob,
  };
};
