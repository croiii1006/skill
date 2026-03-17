import { useState, useRef } from 'react';
import { Play, Pause, ExternalLink, Copy, Volume2, VolumeX, Eye, Heart, ShoppingCart, TrendingUp, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CandidateVideo } from './useSkillsEngine';
import { cn } from '@/lib/utils';

interface VideoCandidateRowProps {
  videos: CandidateVideo[];
  onSelect: (video: CandidateVideo) => void;
  onPreview?: (video: CandidateVideo) => void;
  selectedVideoId?: string | null;
  disabled?: boolean;
}

const coverColors = [
  'from-violet-200 to-violet-100',
  'from-blue-200 to-blue-100',
  'from-amber-200 to-amber-100',
  'from-emerald-200 to-emerald-100',
  'from-rose-200 to-rose-100',
];

export function VideoCandidateRow({ videos, onSelect, onPreview, selectedVideoId, disabled }: VideoCandidateRowProps) {
  const [detailVideo, setDetailVideo] = useState<CandidateVideo | null>(null);
  const [detailIndex, setDetailIndex] = useState(0);

  const displayVideos = videos.slice(0, 4);

  const openDetail = (video: CandidateVideo, idx: number) => {
    setDetailVideo(video);
    setDetailIndex(idx);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {displayVideos.map((video, i) => (
          <div
            key={video.id}
            className="rounded-xl border border-border/30 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => openDetail(video, i)}
          >
            {/* Cover */}
            <div
              className={`relative aspect-[9/14] bg-gradient-to-br ${coverColors[i % coverColors.length]} flex items-center justify-center`}
            >
              <Play className="w-7 h-7 text-foreground/15" />
              <div className="absolute bottom-2 left-2 bg-foreground/75 text-background text-[10px] font-mono px-1.5 py-0.5 rounded-md">
                {video.duration}
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-foreground/20 flex items-center justify-center">
                <Volume2 className="w-3 h-3 text-background" />
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2.5">
              {/* Title - no likes */}
              <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">{video.title}</p>

              {video.strategy && (
                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                  策略:{video.strategy}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] text-foreground/80">{video.views}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] text-foreground/80">{video.salesCount ?? 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] text-foreground/80">{video.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] text-foreground/80">{video.growthRate ?? '0%'}</span>
                </div>
              </div>

              {/* Selling point hit rate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-muted-foreground">卖点命中率</span>
                  <span className="text-[11px] font-semibold text-foreground">{video.sellingPointHitRate ?? 0}%</span>
                </div>
                <Progress value={video.sellingPointHitRate ?? 0} className="h-1" />
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 pt-0.5">
                {video.tiktokUrl && (
                  <a
                    href={video.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-8 rounded-full border border-border/50 flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    原链接
                  </a>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); if (!disabled) onSelect(video); }}
                  disabled={disabled && selectedVideoId !== video.id}
                  className={cn(
                    'flex-1 h-8 rounded-full flex items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                    selectedVideoId === video.id
                      ? 'bg-muted text-foreground'
                      : disabled
                        ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                        : 'bg-foreground text-background hover:bg-foreground/90'
                  )}
                >
                  <Copy className="w-3 h-3" />
                  {selectedVideoId === video.id ? '已选择' : '复刻'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailVideo} onOpenChange={(open) => !open && setDetailVideo(null)}>
        <DialogContent className="max-w-3xl p-0 rounded-2xl overflow-hidden [&>button]:hidden border-border/30 shadow-2xl">
          {detailVideo && (
            <VideoDetailDialog
              video={detailVideo}
              colorIndex={detailIndex}
              selectedVideoId={selectedVideoId}
              onSelect={(v) => { onSelect(v); setDetailVideo(null); }}
              onClose={() => setDetailVideo(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
