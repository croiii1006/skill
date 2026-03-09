import { cn } from '@/lib/utils';

interface PixelProgressProps {
  progress: number;
  className?: string;
}

export function PixelProgress({ progress, className }: PixelProgressProps) {
  const totalBlocks = 12;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);
  const filled = '▓'.repeat(filledBlocks);
  const empty = '░'.repeat(totalBlocks - filledBlocks);

  return (
    <span className={cn("font-pixel text-[13px] tracking-wider", className)}>
      <span className="text-emerald-500">{filled}</span>
      <span className="text-muted-foreground/20">{empty}</span>
    </span>
  );
}
