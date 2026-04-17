import { Database, Tag, FolderOpen, Users } from 'lucide-react';
import { SessionSetup } from './useSkillsEngine';
import { MOCK_CREATORS } from './CreatorSelectionDialog';

interface SetupSummaryProps {
  setup: SessionSetup;
}

export function SetupSummary({ setup }: SetupSummaryProps) {
  const selectedCreators = (setup.selectedCreatorIds || [])
    .map(id => MOCK_CREATORS.find(c => c.id === id))
    .filter(Boolean) as typeof MOCK_CREATORS;

  return (
    <div className="rounded-xl border border-border/20 bg-muted/20 px-4 py-3 flex items-center gap-4 flex-wrap text-sm">
      {setup.image && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-border/30 overflow-hidden">
            <img src={setup.image} alt="Product" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs text-muted-foreground/60 truncate max-w-[80px]">{setup.imageName}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <FolderOpen className="w-3.5 h-3.5 text-muted-foreground/50" />
        <span className="text-xs text-foreground/70">{setup.category}</span>
      </div>
      {setup.sellingPoints && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3.5 h-3.5 text-muted-foreground/50" />
          {setup.sellingPoints.split('\n').filter(Boolean).map((sp, i) => (
            <span key={i} className="inline-flex h-5 items-center rounded-full bg-foreground/5 border border-border/30 px-2 text-[10px] text-foreground/70">{sp}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5 text-muted-foreground/50" />
        <span className="text-xs text-foreground/70">
          {setup.memoryEnabled ? `记忆库 (${setup.selectedMemoryIds.length})` : '记忆库关闭'}
        </span>
      </div>
      {selectedCreators.length > 0 && (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
          <div className="flex -space-x-1.5">
            {selectedCreators.slice(0, 4).map(c => (
              <div key={c.id} className="w-5 h-5 rounded-full overflow-hidden border border-background ring-1 ring-border/40" title={c.name}>
                <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-xs text-foreground/70">{selectedCreators.length} 位达人</span>
        </div>
      )}
    </div>
  );
}
