import { Check, Users, MapPin, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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
      <DialogContent className={cn('sm:max-w-2xl rounded-2xl', className)}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            选择达人
          </DialogTitle>
        </DialogHeader>

        <p className="text-[11px] text-muted-foreground -mt-1">
          已选 {selectedIds.length} 位达人，将作为对标参考人物
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 max-h-[55vh] overflow-y-auto scrollbar-thin pr-1">
          {items.map(item => {
            const selected = selectedIds.includes(item.id);
            return (
              <HoverCard key={item.id} openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => onToggle(item.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 relative',
                      selected
                        ? 'border-orange-400/60 bg-orange-400/[0.06] ring-1 ring-orange-400/30'
                        : 'border-border/30 hover:border-border/60 bg-background'
                    )}
                  >
                    {/* Selection indicator */}
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center border-2 border-background">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={cn(
                        'w-16 h-16 rounded-full overflow-hidden border-2 transition-all',
                        selected ? 'border-orange-400' : 'border-border/40'
                      )}>
                        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Basic Info - Always visible */}
                    <div className="flex flex-col items-center text-center min-w-0 w-full">
                      <span className="font-medium text-sm text-foreground truncate w-full">{item.name}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">{item.tiktokHandle}</span>
                      <span className="text-[11px] text-orange-500/80 font-medium mt-1">
                        {item.followers} 粉丝
                      </span>
                    </div>
                  </button>
                </HoverCardTrigger>

                {/* Hover content - Additional info */}
                <HoverCardContent 
                  side="top" 
                  align="center"
                  sideOffset={8}
                  className="w-48 p-3 rounded-xl bg-background border border-border/50 shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>均播 {item.avgViews}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Tag className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item.niche}</span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
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
