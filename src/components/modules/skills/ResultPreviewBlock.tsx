import { Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mockResultVideo from '@/assets/mock-result-video.jpg';

export function ResultPreviewBlock() {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border/30">
        <h4 className="text-sm font-semibold text-foreground">复刻视频预览</h4>
      </div>
      
      {/* Mock video player */}
      <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center overflow-hidden">
        <img src={mockResultVideo} alt="复刻视频预览" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors">
          <Play className="w-8 h-8 text-white ml-1" />
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] bg-foreground/70 text-background px-2 py-0.5 rounded-md font-mono z-10">
          0:30
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30">
          <div className="h-full w-0 bg-foreground/60 rounded-r-full" />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs border-border/50">
          <Download className="w-3.5 h-3.5" /> 导出下载
        </Button>
      </div>
    </div>
  );
}
