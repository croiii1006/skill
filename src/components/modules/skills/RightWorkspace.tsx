import { useState } from 'react';
import { X, ChevronRight, Copy, Check, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PixelProgress } from './PixelProgress';
import { PromptEditorBlock } from './PromptEditorBlock';
import { ResultPreviewBlock } from './ResultPreviewBlock';
import { VideoCandidateRow } from './VideoCandidateRow';
import type { AgentInfo } from './AgentCard';
import type { CandidateVideo, SkillTask, TaskLog } from './useSkillsEngine';

import expertMemory from '@/assets/expert-memory.png';
import expertCrawler from '@/assets/expert-crawler.png';
import expertVideo from '@/assets/expert-video.png';
import expertDesigner from '@/assets/expert-designer.png';
import expertStrategist from '@/assets/expert-strategist.png';
import expertAnalyst from '@/assets/expert-analyst.png';
import expertSearch from '@/assets/expert-search.png';
import expertAudio from '@/assets/expert-audio.png';
import pixelCheck from '@/assets/pixel-check.png';
import pixelWait from '@/assets/pixel-wait.png';

const expertAvatars: Record<string, string> = {
  memory: expertMemory,
  crawler: expertCrawler,
  video: expertVideo,
  designer: expertDesigner,
  strategist: expertStrategist,
  analyst: expertAnalyst,
  search: expertSearch,
  audio: expertAudio
};

export type RightView = 'none' | 'checklist' | 'agent-01' | 'agent-02-03' | 'agent-04' | 'read-memory';

interface RightWorkspaceProps {
  view: RightView;
  onClose: () => void;
  // Checklist data
  checklistItems?: string[];
  checklistDone?: boolean[];
  // Agent 01 data
  agent01?: AgentInfo;
  agent01Task?: SkillTask;
  candidateVideos?: CandidateVideo[];
  selectedVideoId?: string | null;
  onVideoSelect?: (video: CandidateVideo) => void;
  videoSelectDisabled?: boolean;
  // Agent 02/03 data
  agent02?: AgentInfo;
  agent03?: AgentInfo;
  agent02Task?: SkillTask;
  agent03Task?: SkillTask;
  generatedPrompt?: string;
  onPromptChange?: (val: string) => void;
  onPromptConfirm?: () => void;
  onBackToVideoSelect?: () => void;
  memoryEnabled?: boolean;
  isProcessing?: boolean;
  // Agent 04 data
  agent04?: AgentInfo;
  agent04Task?: SkillTask;
  resultVideo?: {url: string;cover: string;} | null;
  onRegenerate?: () => void;
  // Memory data
  memoryTitle?: string;
  memoryContent?: string;
  memoryCategory?: string;
}

function WorkLog({ logs, task }: {logs: TaskLog[];task?: SkillTask;}) {
  if (!logs || logs.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">工作日志</p>
      <div className="space-y-0.5 font-mono text-xs">
        {logs.map((log, i) =>
        <div key={i} className="flex items-start gap-2 py-0.5">
            <span className="text-muted-foreground/40 shrink-0">{log.time}</span>
            <span className="text-foreground/70">{log.message}</span>
          </div>
        )}
      </div>
    </div>);

}

function SubTaskList({ task }: {task: SkillTask;}) {
  if (!task || task.children.length === 0) return null;
  return (
    <div className="space-y-0">
      {task.children.map((child) => {
        const avatarSrc = child.expert ? expertAvatars[child.expert.avatar] : undefined;
        return (
          <div key={child.id} className="flex items-center gap-3 px-3 py-3 border-b border-border/10 last:border-b-0">
            {avatarSrc ?
            <div className={cn('w-6 h-6 shrink-0 transition-opacity', child.status === 'queued' && 'opacity-30')}>
                <img src={avatarSrc} alt={child.expert?.name || ''} className="w-full h-full object-contain" />
              </div> :

            <div className="w-6 h-6 shrink-0" />
            }
            <span className={cn(
              'text-sm flex-1',
              child.status === 'done' && 'text-foreground/70',
              child.status === 'running' && 'text-foreground',
              child.status === 'queued' && 'text-muted-foreground/50'
            )}>{child.title}</span>
            <div className="w-4 h-4 shrink-0">
              {child.status === 'done' ?
              <img src={pixelCheck} alt="done" className="w-full h-full object-contain" /> :
              child.status === 'running' ?
              <img src={pixelWait} alt="running" className="w-full h-full object-contain animate-pulse" /> :

              <img src={pixelWait} alt="queued" className="w-full h-full object-contain opacity-20" />
              }
            </div>
          </div>);

      })}
    </div>);

}

function CopyButton({ text }: {text: string;}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-3 p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10"
      title="复制全部内容">
      
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>);

}

export function RightWorkspace(props: RightWorkspaceProps) {
  const { view, onClose } = props;
  const [agent0203Tab, setAgent0203Tab] = useState<'02' | '03'>('02');

  if (view === 'none') return null;

  const renderContent = () => {
    switch (view) {
      case 'checklist':
        return (
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground/60 mb-3">待办清单</p>
            {props.checklistItems?.map((item, i) =>
            <div key={i} className="flex items-start gap-2 py-1">
                <span className="font-pixel text-xs text-foreground/60 mt-0.5">
                  {props.checklistDone?.[i] ? '[x]' : '[ ]'}
                </span>
                <span className={cn(
                'text-sm',
                props.checklistDone?.[i] ? 'text-foreground/70' : 'text-muted-foreground/50'
              )}>{item}</span>
              </div>
            )}
          </div>);


      case 'agent-01':
        return (
          <div className="p-5 space-y-5">
            {/* Sub-tasks */}
            {props.agent01Task && <SubTaskList task={props.agent01Task} />}
            {/* Work log */}
            {props.agent01Task && <WorkLog logs={props.agent01Task.logs} />}
            {/* Video candidates */}
            {props.candidateVideos && props.candidateVideos.length > 0 &&
            <div className="space-y-3">
                <p className="text-xs font-medium text-foreground">爆款参考视频</p>
                <VideoCandidateRow
                videos={props.candidateVideos}
                onSelect={(v) => props.onVideoSelect?.(v)}
                selectedVideoId={props.selectedVideoId}
                disabled={props.videoSelectDisabled} />
              
              </div>
            }
          </div>);


      case 'agent-02-03':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-5 space-y-5">
              {agent0203Tab === '02' ?
              <>
                  {props.agent02Task && <SubTaskList task={props.agent02Task} />}
                  {props.agent02Task && <WorkLog logs={props.agent02Task.logs} />}
                </> :

              <>
                  {props.agent03Task && <SubTaskList task={props.agent03Task} />}
                  {props.agent03Task && <WorkLog logs={props.agent03Task.logs} />}
                  {/* Prompt editor */}
                  {props.generatedPrompt &&
                <PromptEditorBlock
                  prompt={props.generatedPrompt}
                  onChange={(val) => props.onPromptChange?.(val)}
                  onConfirm={() => props.onPromptConfirm?.()}
                  onBack={() => props.onBackToVideoSelect?.()}
                  memoryEnabled={props.memoryEnabled ?? false}
                  disabled={props.isProcessing} />

                }
                </>
              }
            </div>
            {/* Bottom tab switcher */}
            <div className="border-t border-border/20 px-4 py-2 flex items-center gap-2">
              <button
                onClick={() => setAgent0203Tab('02')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors',
                  agent0203Tab === '02' ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-muted/30'
                )}>
                
                <div className="w-5 h-5">
                  <img src={expertMemory} alt="记忆库专家" className="w-full h-full object-contain" />
                </div>
                <span className="font-pixel">02</span>
                <span>记忆库专家</span>
              </button>
              <button
                onClick={() => setAgent0203Tab('03')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors',
                  agent0203Tab === '03' ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-muted/30'
                )}>
                
                <div className="w-5 h-5">
                  <img src={expertStrategist} alt="Prompt专家" className="w-full h-full object-contain" />
                </div>
                <span className="font-pixel">03</span>
                <span>Prompt专家</span>
              </button>
            </div>
          </div>);


      case 'agent-04':
        return (
          <div className="p-5 space-y-5">
            {props.agent04Task && <SubTaskList task={props.agent04Task} />}
            {props.agent04Task && <WorkLog logs={props.agent04Task.logs} />}
            {props.resultVideo &&
            <ResultPreviewBlock onRegenerate={props.onRegenerate} disabled={props.isProcessing} />
            }
          </div>);


      case 'read-memory':{
          const lines = (props.memoryContent || '暂无内容').split('\n');
          return (
            <div className="flex flex-col h-full">
            {/* Document header with close button */}
            <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border/30 bg-muted/30 shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground font-normal">阅读</span>
              <span className="text-sm text-muted-foreground/40">|</span>
              <span className="text-sm truncate text-[#5c5c5c] font-normal">{props.memoryTitle || '记忆库'}.md</span>
              {props.memoryCategory &&
                <span className="ml-auto inline-block text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  {props.memoryCategory}
                </span>
                }
              <Button variant="ghost" size="icon" onClick={onClose} className={cn("h-8 w-8 shrink-0", !props.memoryCategory && "ml-auto")}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Content with line numbers and copy button */}
            <div className="flex-1 overflow-auto relative">
              <CopyButton text={props.memoryContent || '暂无内容'} />
              <div className="px-5 py-4 font-mono text-sm leading-7">
                {lines.map((line, i) =>
                  <div key={i} className="flex">
                    <span className="w-10 shrink-0 text-right pr-4 text-muted-foreground/30 select-none">{i + 1}</span>
                    <span className="text-foreground/80 whitespace-pre-wrap break-all">{line || '\u00A0'}</span>
                  </div>
                  )}
              </div>
            </div>
          </div>);

        }

      default:
        return null;
    }
  };

  const pixelTitles: Record<string, string> = {
    'agent-01': 'Agent01',
    'agent-02-03': 'Agent02-03',
    'agent-04': 'Agent04',
  };

  const viewTitles: Record<RightView, string> = {
    none: '',
    checklist: '编写待办清单',
    'agent-01': '',
    'agent-02-03': '',
    'agent-04': '',
    'read-memory': props.memoryTitle || '记忆库'
  };

  const isReadMemory = view === 'read-memory';

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - hidden for read-memory since it has its own document header */}
      {!isReadMemory &&
      <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            
            {view === 'agent-04' ?
          <span className="font-pixel text-base font-medium text-foreground">Agent04</span> :

          <span className="text-sm font-medium text-foreground">{viewTitles[view]}</span>
          }
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        </div>
      }

      <ScrollArea className="flex-1">
        {renderContent()}
      </ScrollArea>
    </div>);

}