import { cn } from '@/lib/utils';

interface PixelProgressProps {
  progress: number;
  status?: 'idle' | 'running' | 'done' | 'error';
  className?: string;
}

export function PixelProgress({ progress, status = 'running', className }: PixelProgressProps) {
  const totalBlocks = 12;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);
  const filled = '▓'.repeat(filledBlocks);
  const empty = '░'.repeat(totalBlocks - filledBlocks);

  const filledColor = status === 'error'
    ? 'text-red-500'
    : status === 'done'
      ? 'text-emerald-500'
      : 'text-emerald-500';

  return (
    <span className={cn("font-pixel text-[13px] tracking-wider", className)}>
      <span className={filledColor}>{filled}</span>
      <span className="text-muted-foreground/20">{empty}</span>
    </span>
  );
}
