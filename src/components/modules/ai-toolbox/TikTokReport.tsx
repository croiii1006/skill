import { useState } from 'react';
import { TikTokReportComposer } from './TikTokReportComposer';
import { TikTokReportResults } from './TikTokReportResults';
import { useTikTokInspiration } from '@/contexts/TikTokInspirationContext';
import { useReplicatePrefill } from '@/contexts/ReplicatePrefillContext';
import { History, X } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';

interface TikTokReportProps {
  onNavigate?: (itemId: string) => void;
}

export function TikTokReport({ onNavigate }: TikTokReportProps) {
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('');
  const [sellingPoints, setSellingPoints] = useState<string[]>([]);
  const { reportHistory, addReportHistory, deleteReportHistory } = useTikTokInspiration();
  const { setPrefill } = useReplicatePrefill();

  const handleSubmit = (payload: { category: string; sellingPoints: string[] }) => {
    setCategory(payload.category);
    setSellingPoints(payload.sellingPoints);
    addReportHistory({
      category: payload.category,
      sellingPoints: payload.sellingPoints,
      videoCount: 6,
    });
    setSubmitted(true);
  };

  const handleBack = () => {
    setCategory('');
    setSellingPoints([]);
    setSubmitted(false);
  };

  const handleReplicate = (videoId: string) => {
    setPrefill({
      tiktokLink: `https://www.tiktok.com/video/${videoId}`,
      sellingPoints,
      autoStart: true,
    });
    onNavigate?.('replicate-video');
  };

  const handleRestoreHistory = (item: { category: string; sellingPoints: string[] }) => {
    setCategory(item.category);
    setSellingPoints(item.sellingPoints);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <TikTokReportResults
        category={category}
        sellingPoints={sellingPoints}
        onBack={handleBack}
        onReplicate={handleReplicate}
      />
    );
  }

  const historySheet = (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/40">
          <History className="w-3.5 h-3.5" />
          <span>历史记录</span>
        </button>
      </SheetTrigger>
      <SheetContent className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="text-base font-medium">历史记录</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {reportHistory.map(item => (
            <button
              key={item.id}
              onClick={() => handleRestoreHistory(item)}
              className="w-full text-left p-3 rounded-xl border border-border/30 hover:border-border/60 hover:bg-muted/20 transition-all group relative"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{item.category}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {item.sellingPoints.map(p => (
                  <span key={p} className="text-[10px] bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground/50 mt-1.5">{item.videoCount} 个视频</div>
              <button
                onClick={e => { e.stopPropagation(); deleteReportHistory(item.id); }}
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted/40 transition-all"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground/50" />
              </button>
            </button>
          ))}
          {reportHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">暂无历史记录</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="relative min-h-full flex flex-col">
      <div className="absolute top-4 right-4 z-20">
        {historySheet}
      </div>
      <TikTokReportComposer onSubmit={handleSubmit} />
    </div>
  );
}
