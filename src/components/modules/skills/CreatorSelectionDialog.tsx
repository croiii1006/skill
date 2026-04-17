import { Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface CreatorItem {
  id: string;
  name: string;
  avatar: string;
  tiktokHandle: string;
  followers: string;
  region: string;
  niche: string;
  avgViews: string;
}

interface CreatorSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CreatorItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
}

export function CreatorSelectionDialog({
  open,
  onOpenChange,
  items,
  selectedIds,
  onToggle,
  className,
}: CreatorSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-lg rounded-2xl', className)}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            选择达人
          </DialogTitle>
        </DialogHeader>

        <p className="text-[11px] text-muted-foreground -mt-1">
          已选 {selectedIds.length} 位达人，将作为对标参考人物
        </p>

        <div className="grid grid-cols-1 gap-2 mt-2 max-h-[55vh] overflow-y-auto scrollbar-thin pr-1">
          {items.map(item => {
            const selected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={cn(
                  'w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3',
                  selected
                    ? 'border-orange-400/60 bg-orange-400/[0.06] ring-1 ring-orange-400/30'
                    : 'border-border/30 hover:border-border/60 bg-background'
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={cn(
                    'w-12 h-12 rounded-full overflow-hidden border-2 transition-all',
                    selected ? 'border-orange-400' : 'border-border/40'
                  )}>
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  {selected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center border-2 border-background">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground/70 shrink-0">{item.region}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{item.tiktokHandle}</div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/80">
                    <span><b className="text-foreground/80 font-semibold">{item.followers}</b> 粉丝</span>
                    <span className="w-px h-2.5 bg-border/40" />
                    <span>均播 <b className="text-foreground/80 font-semibold">{item.avgViews}</b></span>
                    <span className="w-px h-2.5 bg-border/40" />
                    <span className="truncate">{item.niche}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end mt-3">
          <Button
            onClick={() => onOpenChange(false)}
            size="sm"
            className="rounded-lg h-8 px-5 bg-foreground text-background hover:bg-foreground/90 text-xs"
          >
            确认 ({selectedIds.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import creator1 from '@/assets/creator-1.jpg';
import creator2 from '@/assets/creator-2.jpg';
import creator3 from '@/assets/creator-3.jpg';
import creator4 from '@/assets/creator-4.jpg';
import creator5 from '@/assets/creator-5.jpg';

export const MOCK_CREATORS: CreatorItem[] = [
  { id: 'c1', name: 'Mr. Chen', avatar: creator1, tiktokHandle: '@chen.lifestyle', followers: '128.4K', region: 'UK', niche: '生活好物 / 中年男性', avgViews: '32K' },
  { id: 'c2', name: 'Leo Wang', avatar: creator2, tiktokHandle: '@leo.daily', followers: '256.7K', region: 'UK', niche: '通勤穿搭 / 学生党', avgViews: '85K' },
  { id: 'c3', name: 'Kenji', avatar: creator3, tiktokHandle: '@kenji.review', followers: '512.3K', region: 'US', niche: '科技测评 / 男性向', avgViews: '142K' },
  { id: 'c4', name: 'Daniel Lin', avatar: creator4, tiktokHandle: '@daniel.streetwear', followers: '892.1K', region: 'US', niche: '街头潮流 / 复古风', avgViews: '210K' },
  { id: 'c5', name: 'Jay', avatar: creator5, tiktokHandle: '@jay.unbox', followers: '76.5K', region: 'JP', niche: '开箱测评 / Vlog', avgViews: '24K' },
];
