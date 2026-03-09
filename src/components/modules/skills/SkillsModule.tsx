import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useMemory } from '@/contexts/MemoryContext';
import { useSkillsEngine, CandidateVideo, SessionSetup, SkillsState } from './useSkillsEngine';
import { SetupSummary } from './SetupSummary';
import { ChecklistCard } from './ChecklistCard';
import { VideoCandidateCollapsible } from './VideoCandidateCollapsible';
import { VideoCandidateRow } from './VideoCandidateRow';
import { PromptEditorBlock } from './PromptEditorBlock';
import { ResultPreviewBlock } from './ResultPreviewBlock';
import { TaskDetailPanel } from './TaskDetailPanel';

import { ChatInputBar } from './ChatInputBar';
import { Loader2, Zap, CheckCircle2, SkipForward, RefreshCw, ArrowLeft, Clapperboard, PartyPopper, Search, ListChecks, Check, ChevronRight, X, History } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from
'@/components/ui/sheet';

/* ─── History helpers ─── */
interface SkillsHistoryItem {
  id: string;
  category: string;
  sellingPoints: string;
  image: string | null;
  memoryEnabled: boolean;
  selectedMemoryIds: string[];
  date: string;
  /** Full state snapshot for instant restore */
  snapshot: SkillsState;
}

const SKILLS_HISTORY_KEY = 'skills-solution-history-v2';

function loadSkillsHistory(): SkillsHistoryItem[] {
  try {
    const raw = localStorage.getItem(SKILLS_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {return [];}
}

function saveSkillsHistory(items: SkillsHistoryItem[]) {
  localStorage.setItem(SKILLS_HISTORY_KEY, JSON.stringify(items));
}

/** Derive a short summary label from the state */
function deriveStatusLabel(snapshot: SkillsState): string {
  if (snapshot.resultVideo) return '已完成';
  if (snapshot.generatedPrompt) return '提示词已生成';
  if (snapshot.selectedVideo) return '已选择视频';
  if (snapshot.candidateVideos.length > 0) return '候选视频已生成';
  const doneTasks = snapshot.tasks.filter((t) => t.status === 'done').length;
  if (doneTasks > 0) return `${doneTasks}/${snapshot.tasks.length} 任务完成`;
  return '进行中';
}

export function SkillsModule() {
  const {
    state,
    CATEGORIES,
    completeSetup,
    refreshCandidates,
    selectVideo,
    updatePrompt,
    confirmGenerate,
    regenerate,
    backToVideoSelect,
    setActiveTaskId,
    handleUserInput,
    resetSession,
    restoreState
  } = useSkillsEngine();

  const { entries } = useMemory();
  const memoryItems = useMemo(() => entries.map((e) => ({
    id: e.id,
    name: e.title,
    desc: e.content.slice(0, 60) + (e.content.length > 60 ? '...' : ''),
    tag: e.category,
    charCount: e.content.length
  })), [entries]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<SkillsHistoryItem[]>(loadSkillsHistory);
  // Track the active history item id so we can update its snapshot in real-time
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [state.messages.length]);

  // Auto-save snapshot to active history item whenever state changes meaningfully
  useEffect(() => {
    if (!activeHistoryId || !state.setupCompleted) return;
    // Only save when not processing (to avoid saving intermediate states)
    if (state.isProcessing) return;

    setHistory((prev) => {
      const updated = prev.map((h) =>
      h.id === activeHistoryId ? { ...h, snapshot: { ...state } } : h
      );
      saveSkillsHistory(updated);
      return updated;
    });
  }, [activeHistoryId, state.setupCompleted, state.isProcessing, state.tasks, state.messages, state.candidateVideos, state.selectedVideo, state.generatedPrompt, state.resultVideo]);

  const activeTask = state.tasks.find((t) => t.id === state.activeTaskId);

  const [videoPanelOpen, setVideoPanelOpen] = useState(false);
  const hasVideoCandidates = state.candidateVideos.length > 0;
  const showRightPanel = activeTask || hasVideoCandidates && videoPanelOpen;

  // Auto-expand the detail panel for the currently running parent task
  useEffect(() => {
    const runningParent = state.tasks.find((t) => t.status === 'running' && t.children.length > 0);
    if (runningParent && runningParent.id !== state.activeTaskId) {
      setActiveTaskId(runningParent.id);
    }
  }, [state.tasks, state.activeTaskId, setActiveTaskId]);

  // Auto-show video panel when candidates arrive, and clear task detail
  useEffect(() => {
    if (hasVideoCandidates) {
      setVideoPanelOpen(true);
      setActiveTaskId(null);
    }
  }, [hasVideoCandidates, setActiveTaskId]);

  const addHistory = useCallback((setup: SessionSetup) => {
    const newItem: SkillsHistoryItem = {
      id: crypto.randomUUID(),
      category: setup.category,
      sellingPoints: setup.sellingPoints,
      image: setup.image,
      memoryEnabled: setup.memoryEnabled,
      selectedMemoryIds: setup.selectedMemoryIds,
      date: new Date().toISOString(),
      snapshot: { ...state } // will be updated as flow progresses
    };
    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    saveSkillsHistory(updated);
    setActiveHistoryId(newItem.id);
    return newItem.id;
  }, [history, state]);

  const deleteHistory = useCallback((id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveSkillsHistory(updated);
    if (activeHistoryId === id) setActiveHistoryId(null);
  }, [history, activeHistoryId]);

  const handleSend = (text: string, image?: string | null, category?: string, memoryIds?: string[]) => {
    if (!state.setupCompleted && (image || text)) {
      const setup: SessionSetup = {
        image: image || null,
        imageName: image ? 'uploaded-image' : null,
        memoryEnabled: memoryIds && memoryIds.length > 0 || false,
        selectedMemoryIds: memoryIds || [],
        sellingPoints: text || '',
        category: category || '其它'
      };
      addHistory(setup);
      completeSetup(setup);
    } else {
      handleUserInput(text);
    }
  };

  const handleRestoreHistory = (item: SkillsHistoryItem) => {
    // Restore the full snapshot directly — no re-running
    restoreState(item.snapshot);
    setActiveHistoryId(item.id);
  };

  const handleVideoSelect = (video: CandidateVideo) => {
    selectVideo(video);
  };

  const handleNewSession = () => {
    resetSession();
    setActiveHistoryId(null);
  };

  const renderMessage = (msg: typeof state.messages[0]) => {
    switch (msg.type) {
      case 'setup-summary':{
          const setup = JSON.parse(msg.content);
          return <SetupSummary key={msg.id} setup={setup} />;
        }
      case 'checklist':
        return (
          <ChecklistCard
            key={msg.id}
            tasks={state.tasks}
            onTaskClick={setActiveTaskId}
            activeTaskId={state.activeTaskId} />);

      case 'task-subtask-list':{
          const parentTask = state.tasks.find((t) => t.id === msg.content);
          if (!parentTask || parentTask.children.length === 0) return null;
          return (
            <div key={msg.id} className="rounded-xl border border-border/20 bg-muted/10 overflow-hidden">
            <button
                onClick={() => setActiveTaskId(parentTask.id)}
                className="w-full px-3 py-2 border-b border-border/10 flex items-center gap-2 hover:bg-muted/20 transition-colors">
              <ListChecks className="w-3.5 h-3.5 text-foreground/50" />
              <span className="text-xs font-medium text-foreground/70">{parentTask.title}</span>
              <span className="text-[10px] text-muted-foreground/50 ml-auto">
                {parentTask.children.filter((c) => c.status === 'done').length}/{parentTask.children.length}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
            </button>
            <div className="px-3 py-1.5">
              {parentTask.children.map((child) =>
                <button
                  key={child.id}
                  onClick={() => setActiveTaskId(parentTask.id)}
                  className="w-full flex items-center gap-2 py-1.5 px-1 rounded-md hover:bg-muted/20 transition-colors">
                  {child.status === 'done' ?
                  <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-background" strokeWidth={2.5} />
                    </div> :
                  child.status === 'running' ?
                  <Loader2 className="w-4 h-4 text-foreground animate-spin shrink-0" /> :
                  <div className="w-4 h-4 rounded-full border border-border/30 shrink-0" />
                  }
                  <span className={cn(
                    'text-xs',
                    child.status === 'done' ? 'text-foreground/70' : 'text-muted-foreground/50'
                  )}>{child.title}</span>
                </button>
                )}
            </div>
          </div>);
        }
      case 'video-candidates':
        return (
          <VideoCandidateCollapsible
            key={msg.id}
            videos={state.candidateVideos}
            onShowPanel={() => {setActiveTaskId(null);setVideoPanelOpen(true);}}
            active={!activeTask && hasVideoCandidates && videoPanelOpen} />);


      case 'video-gen-status':{
          const content = msg.content;
          let icon = null;
          let cleanContent = content;
          if (content.startsWith('✅')) {
            icon = <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />;
            cleanContent = content.slice(2).trim();
          } else if (content.startsWith('🎉')) {
            icon = <PartyPopper className="w-4 h-4 text-foreground shrink-0 mt-0.5" />;
            cleanContent = content.slice(2).trim();
          }
          return (
            <div key={msg.id} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed animate-fade-in">
              {icon}
              <span>{cleanContent}</span>
            </div>);

        }
      case 'prompt-editor':
        return (
          <PromptEditorBlock
            key={msg.id}
            prompt={state.generatedPrompt}
            onChange={updatePrompt}
            onConfirm={confirmGenerate}
            onBack={() => {
              backToVideoSelect();
              setActiveTaskId(null);
              setVideoPanelOpen(true);
            }}
            memoryEnabled={state.setup.memoryEnabled}
            disabled={state.isProcessing} />);

      case 'result-preview':
        return <ResultPreviewBlock key={msg.id} onRegenerate={regenerate} disabled={state.isProcessing} />;
      case 'text':
      default:{
          const content = msg.content;
          let icon = null;
          let cleanContent = content;

          if (content.startsWith('✅')) {
            icon = <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />;
            cleanContent = content.slice(2).trim();
          } else if (content.startsWith('⏭️')) {
            icon = <SkipForward className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />;
            cleanContent = content.slice(3).trim();
          } else if (content.startsWith('🔄')) {
            icon = <RefreshCw className="w-4 h-4 text-foreground/60 shrink-0 mt-0.5" />;
            cleanContent = content.slice(2).trim();
          } else if (content.startsWith('🔙')) {
            icon = <ArrowLeft className="w-4 h-4 text-foreground/60 shrink-0 mt-0.5" />;
            cleanContent = content.slice(2).trim();
          } else if (content.startsWith('🎬')) {
            icon = <Clapperboard className="w-4 h-4 text-foreground/60 shrink-0 mt-0.5" />;
            cleanContent = content.slice(2).trim();
          } else if (content.startsWith('🎉')) {
            icon = <PartyPopper className="w-4 h-4 text-foreground shrink-0 mt-0.5" />;
            cleanContent = content.slice(2).trim();
          } else if (content.startsWith('🔍') || content.startsWith('🎯')) {
            icon = <Search className="w-4 h-4 text-foreground/60 shrink-0 mt-0.5" />;
            cleanContent = content.slice(2).trim();
          } else if (content.startsWith('📋') || content.startsWith('🌐') || content.startsWith('✏️')) {
            cleanContent = content.slice(2).trim();
          }

          return (
            <div key={msg.id} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
            {icon}
            <span className={cn(
                msg.isStreaming && 'after:inline-block after:w-1 after:h-3.5 after:bg-foreground/50 after:ml-0.5 after:animate-pulse after:rounded-sm'
              )}>
              {cleanContent}
            </span>
          </div>);
        }
    }
  };

  const isEmpty = !state.setupCompleted && state.messages.length === 0;

  const historySheet =
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
        <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-6rem)]">
          {history.map((item) => {
          const statusLabel = deriveStatusLabel(item.snapshot);
          const isActive = activeHistoryId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleRestoreHistory(item)}
              className={cn(
                "w-full text-left p-3 rounded-xl border transition-all group relative",
                isActive ?
                "border-primary/40 bg-primary/5" :
                "border-border/30 hover:border-border/60 hover:bg-muted/20"
              )}>
              
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.date).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.sellingPoints}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  statusLabel === '已完成' ?
                  "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                  "bg-muted/40 text-muted-foreground"
                )}>
                    {statusLabel}
                  </span>
                  {item.memoryEnabled &&
                <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">记忆库</span>
                }
                  {item.image &&
                <span className="text-[10px] bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-full">含图片</span>
                }
                </div>
                <button
                onClick={(e) => {e.stopPropagation();deleteHistory(item.id);}}
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted/40 transition-all">
                  <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                </button>
              </button>);

        })}
          {history.length === 0 &&
        <p className="text-sm text-muted-foreground text-center py-8">暂无历史记录</p>
        }
        </div>
      </SheetContent>
    </Sheet>;


  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation column */}
        <div className={cn(
          'flex flex-col transition-all duration-300',
          showRightPanel ? 'w-1/2 border-r border-border/20' : 'w-full'
        )}>
          {isEmpty ? (
          /* Centered composer layout */
          <div className="relative min-h-full flex flex-col items-center p-6 md:p-8 pt-[80px]">
              <div className="absolute top-4 right-4 z-20">
                {historySheet}
              </div>
              <div className="w-full max-w-2xl animate-fade-in my-[120px]">
                <div className="text-center mb-10">
                  <h1 className="text-2xl md:text-3xl font-normal text-foreground tracking-tight">
                    TikTok 解决方案
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    上传商品图开始对话，或直接输入问题
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm shadow-sm">
                  <ChatInputBar
                  onSend={handleSend}
                  disabled={state.isProcessing}
                  memoryItems={memoryItems} />
                </div>
              </div>
            </div>) :

          <>
              {/* Top bar with history + new session */}
              <div className="px-4 py-2 border-b border-border/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNewSession}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/40">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>返回</span>
                  </button>
                </div>
                <button
                  onClick={handleNewSession}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/40">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>新会话</span>
                </button>
              </div>

              {/* Messages area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="px-6 py-6">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {state.messages.map(renderMessage)}
                    {state.isProcessing && state.messages.length > 0 &&
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>正在处理中...</span>
                      </div>
                  }
                  </div>
                </div>
              </div>

              {/* Chat input */}
              <ChatInputBar
              onSend={handleSend}
              disabled={state.isProcessing}
              memoryItems={memoryItems} />
            </>
          }
        </div>

        {/* Right panel: Task detail or Video list */}
        {showRightPanel &&
        <div className="w-1/2 animate-in slide-in-from-right-4 duration-300">
            {activeTask ?
          <TaskDetailPanel
            task={activeTask}
            onClose={() => {setActiveTaskId(null);setVideoPanelOpen(false);}}
            selectedVideoId={state.selectedVideo?.id}
            onVideoSelect={handleVideoSelect} /> :

          hasVideoCandidates ?
          <div className="h-full flex flex-col bg-background">
                <div className="px-5 py-4 border-b border-border/20 flex items-center justify-between shrink-0">
                  <span className="text-sm font-medium text-foreground">爆款参考视频</span>
                  <button
                onClick={() => setVideoPanelOpen(false)}
                className="p-1 rounded-md hover:bg-muted/30 transition-colors">
                
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <VideoCandidateRow
                videos={state.candidateVideos}
                onSelect={handleVideoSelect}
                selectedVideoId={state.selectedVideo?.id}
                disabled={!!state.selectedVideo} />
                </div>
              </div> :
          null}
          </div>
        }
      </div>
    </div>);
}