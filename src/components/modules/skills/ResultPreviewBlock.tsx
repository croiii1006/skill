import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mockResultVideo from '@/assets/mock-result-video.jpg';

const TOTAL_DURATION = 30; // seconds

export function ResultPreviewBlock() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      clearInterval_();
    }
    return clearInterval_;
  }, [isPlaying, clearInterval_]);

  const togglePlay = () => {
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
    }
    setIsPlaying(prev => !prev);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mockResultVideo;
    link.download = '复刻视频预览.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const progress = (currentTime / TOTAL_DURATION) * 100;
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border/30">
        <h4 className="text-sm font-semibold text-foreground">复刻视频预览</h4>
      </div>

      {/* Video player */}
      <div
        className="relative aspect-video bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center overflow-hidden cursor-pointer group"
        onClick={togglePlay}
      >
        <img src={mockResultVideo} alt="复刻视频预览" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />

        {/* Play / Pause overlay */}
        <div className={`relative w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </div>

        {/* Time badge */}
        <div className="absolute bottom-3 right-3 text-[10px] bg-foreground/70 text-background px-2 py-0.5 rounded-md font-mono z-10">
          {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30">
          <div
            className="h-full bg-foreground/60 rounded-r-full transition-[width] duration-100"
            style={{ width: `${progress}%`, background: 'hsl(var(--foreground) / 0.6)' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs border-border/50" onClick={handleDownload}>
          <Download className="w-3.5 h-3.5" /> 导出下载
        </Button>
      </div>
    </div>
  );
}
