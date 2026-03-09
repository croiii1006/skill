import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Video,
  Sparkles,
  Loader2,
  Play,
  X,
  Copy,
  Check,
  Plus,
  Link,
  ArrowUp,
  ArrowLeft,
  Flame,
  Bookmark,
  FolderOpen,
  Maximize2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History } from
'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from
'@/components/ui/sheet';
import { useTikTokInspiration } from '@/contexts/TikTokInspirationContext';
import { useReplicatePrefill } from '@/contexts/ReplicatePrefillContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/* ─── Field Contract Types (DO NOT MODIFY) ─── */

export type VideoStatus = 'queued' | 'processing' | 'success' | 'failed';

export interface ReplicateSettings {
  motionLevel: number;
  outputResolution: '720p' | '1080p' | '2k_hdr';
  aspectRatio: '16:9' | '9:16';
}

export interface GeneratedVideo {
  videoId: string;
  videoUrl: string;
  createdAt: string;
  status: VideoStatus;
}

export interface ExtractPayload {
  styleVideoFile: File | null;
  sellingPoints: string[];
  settings: ReplicateSettings;
}

export interface ReplicatePayload {
  promptText: string;
  settings: ReplicateSettings;
  projectLibraryId: string | null;
}

/* ─── Default settings ─── */
const DEFAULT_SETTINGS: ReplicateSettings = {
  motionLevel: 0.5,
  outputResolution: '1080p',
  aspectRatio: '16:9'
};

/* ─── History helpers ─── */
interface ReplicateHistoryItem {
  id: string;
  tiktokLink: string;
  sellingPoints: string[];
  videoName: string;
  date: string;
  promptText: string;
  inspirationVideo?: InspirationVideo | null;
}

const REPLICATE_HISTORY_KEY = 'replicate-workspace-history';

function loadReplicateHistory(): ReplicateHistoryItem[] {
  try {
    const raw = localStorage.getItem(REPLICATE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {return [];}
}

function saveReplicateHistory(items: ReplicateHistoryItem[]) {
  localStorage.setItem(REPLICATE_HISTORY_KEY, JSON.stringify(items));
}

/* ─── Mock trending data ─── */
interface InspirationVideo {
  id: string;
  title: string;
  views: string;
  likes: string;
  coverGradient: string;
  source: 'trending' | 'saved';
}

const MOCK_TRENDING: InspirationVideo[] = [
{ id: 't1', title: '夏日防晒喷雾使用技巧', views: '120万', likes: '8.5万', coverGradient: 'from-rose-500/60 to-orange-400/60', source: 'trending' },
{ id: 't2', title: '厨房收纳神器开箱', views: '89万', likes: '6.2万', coverGradient: 'from-blue-500/60 to-cyan-400/60', source: 'trending' },
{ id: 't3', title: '运动耳机防水测试', views: '156万', likes: '12万', coverGradient: 'from-violet-500/60 to-purple-400/60', source: 'trending' },
{ id: 't4', title: '宠物自动喂食器评测', views: '67万', likes: '4.8万', coverGradient: 'from-emerald-500/60 to-green-400/60', source: 'trending' },
{ id: 't5', title: '手机支架桌面新玩法', views: '98万', likes: '7.1万', coverGradient: 'from-amber-500/60 to-yellow-400/60', source: 'trending' },
{ id: 't6', title: '美白精华28天打卡', views: '210万', likes: '15万', coverGradient: 'from-pink-500/60 to-rose-400/60', source: 'trending' }];


interface ReplicateWorkspaceProps {
  onNavigate?: (itemId: string) => void;
}

export function ReplicateWorkspace({ onNavigate }: ReplicateWorkspaceProps) {
  const { t } = useTranslation();
  const { savedVideos, unsaveVideo } = useTikTokInspiration();
  const { consumePrefill } = useReplicatePrefill();

  /* ── Input Side ── */
  const [styleVideoFile, setStyleVideoFile] = useState<File | null>(null);
  const [styleVideoUrl, setStyleVideoUrl] = useState<string | null>(null);
  const [inspirationVideo, setInspirationVideo] = useState<InspirationVideo | null>(null);
  const [settings] = useState<ReplicateSettings>(DEFAULT_SETTINGS);

  /* ── UI-only state ── */
  const [tiktokLink, setTiktokLink] = useState('');
  const [sellingPoints, setSellingPoints] = useState<string[]>([]);
  const [spInput, setSpInput] = useState('');

  /* ── History ── */
  const [history, setHistory] = useState<ReplicateHistoryItem[]>(loadReplicateHistory);

  /* ── Action & Status ── */
  const hasVideoSource = !!(styleVideoFile || inspirationVideo || tiktokLink.trim());
  const canSend = hasVideoSource && sellingPoints.length > 0;
  const [isExtracting, setIsExtracting] = useState(false);
  const [viewMode, setViewMode] = useState<'composer' | 'conversation'>('composer');

  /* ── Output Side ── */
  const [extractedPromptText, setExtractedPromptText] = useState<string>('');
  const [promptCopied, setPromptCopied] = useState(false);

  /* ── Refs ── */
  const videoInputRef = useRef<HTMLInputElement>(null);
  const spInputRef = useRef<HTMLInputElement>(null);
  const prefillConsumed = useRef(false);

  /* ── Consume prefill from TikTok report ── */
  useEffect(() => {
    if (prefillConsumed.current) return;
    const data = consumePrefill();
    if (!data) return;
    prefillConsumed.current = true;
    if (data.tiktokLink) setTiktokLink(data.tiktokLink);
    if (data.sellingPoints.length > 0) setSellingPoints(data.sellingPoints);
    if (data.autoStart) {
      // Defer to next tick so state is set
      setTimeout(() => {
        setViewMode('conversation');
        setIsExtracting(true);
        setExtractedPromptText('');
        setPromptCopied(false);
        setTimeout(() => {
          const mockPrompt = `产品特写镜头，柔和暖色灯光，缓慢推拉运镜，背景虚化，商品居中展示。\n\n核心卖点融入：${data.sellingPoints.join('、')}。\n\n电商广告风格，高清画质，节奏紧凑，适合 TikTok 短视频传播。`;
          setExtractedPromptText(mockPrompt);
          setIsExtracting(false);
          toast.success('复刻 Prompt 已生成');
        }, 2500);
      }, 0);
    }
  }, [consumePrefill]);

  /* ── Handlers ── */
  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('请上传视频文件');
      return;
    }
    const url = URL.createObjectURL(file);
    setStyleVideoFile(file);
    setStyleVideoUrl(url);
    setInspirationVideo(null);
    setTiktokLink('');
    toast.success('对标视频已上传');
    e.target.value = '';
  }, []);

  const handleSend = useCallback(async () => {
    if (!canSend) return;

    const mockPrompt = `产品特写镜头，柔和暖色灯光，缓慢推拉运镜，背景虚化，商品居中展示。\n\n核心卖点融入：${sellingPoints.join('、')}。\n\n电商广告风格，高清画质，节奏紧凑，适合 TikTok 短视频传播。`;

    // Save to history (with prompt)
    const newItem: ReplicateHistoryItem = {
      id: crypto.randomUUID(),
      tiktokLink: tiktokLink || '',
      sellingPoints,
      videoName: styleVideoFile?.name || inspirationVideo?.title || tiktokLink || '',
      date: new Date().toISOString(),
      promptText: mockPrompt,
      inspirationVideo: inspirationVideo || null,
    };
    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    saveReplicateHistory(updated);

    setViewMode('conversation');
    setIsExtracting(true);
    setExtractedPromptText('');
    setPromptCopied(false);

    const extractPayload: ExtractPayload = { styleVideoFile, sellingPoints, settings };
    console.log('ExtractPayload:', extractPayload);

    await new Promise((r) => setTimeout(r, 2500));

    setExtractedPromptText(mockPrompt);
    setIsExtracting(false);
    toast.success('复刻 Prompt 已生成');
  }, [canSend, styleVideoFile, sellingPoints, settings, tiktokLink, inspirationVideo, history]);

  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(extractedPromptText);
    setPromptCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setPromptCopied(false), 2000);
  }, [extractedPromptText]);

  const addSellingPoint = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !sellingPoints.includes(trimmed)) {
      setSellingPoints((prev) => [...prev, trimmed]);
    }
    setSpInput('');
  };

  const handleSpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (spInput.trim()) {
        addSellingPoint(spInput);
      } else if (canSend) {
        handleSend();
      }
    }
  };

  const handleInspirationSelect = (video: InspirationVideo) => {
    setInspirationVideo(video);
    setStyleVideoFile(null);
    setStyleVideoUrl(null);
    setTiktokLink('');
    toast.success(`已将「${video.title}」设为对标视频`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestoreHistory = (item: ReplicateHistoryItem) => {
    setTiktokLink(item.inspirationVideo ? '' : item.tiktokLink);
    setSellingPoints(item.sellingPoints);
    setStyleVideoFile(null);
    setStyleVideoUrl(null);
    setInspirationVideo(item.inspirationVideo || null);
    setPromptCopied(false);

    const prompt = item.promptText || `产品特写镜头，柔和暖色灯光，缓慢推拉运镜，背景虚化，商品居中展示。\n\n核心卖点融入：${item.sellingPoints.join('、')}。\n\n电商广告风格，高清画质，节奏紧凑，适合 TikTok 短视频传播。`;
    setExtractedPromptText(prompt);
    setIsExtracting(false);
    setViewMode('conversation');
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveReplicateHistory(updated);
  };

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
        <div className="mt-4 space-y-3">
          {history.map((item) =>
        <button
          key={item.id}
          onClick={() => handleRestoreHistory(item)}
          className="w-full text-left p-3 rounded-xl border border-border/30 hover:border-border/60 hover:bg-muted/20 transition-all group relative">
          
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground truncate max-w-[180px]">{item.videoName || '未命名'}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(item.date).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {item.sellingPoints.map((p) =>
            <span key={p} className="text-[10px] bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-full">{p}</span>
            )}
              </div>
              <button
            onClick={(e) => {e.stopPropagation();handleDeleteHistory(item.id);}}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted/40 transition-all">
                <X className="w-3.5 h-3.5 text-muted-foreground/50" />
              </button>
            </button>
        )}
          {history.length === 0 &&
        <p className="text-sm text-muted-foreground text-center py-8">暂无历史记录</p>
        }
        </div>
      </SheetContent>
    </Sheet>;


  if (viewMode === 'conversation') {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
        {/* ── Top bar with back button ── */}
        <div className="shrink-0 px-6 py-3 border-b border-border/20 flex items-center gap-2">
          <button
            onClick={() => {setViewMode('composer');setExtractedPromptText('');setTiktokLink('');setSellingPoints([]);setStyleVideoFile(null);setStyleVideoUrl(null);setInspirationVideo(null);}}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            
            <ArrowLeft className="w-3.5 h-3.5" />
            返回
          </button>
        </div>
        {/* ── Output area (scrollable, fills space above input) ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
            {/* Setup summary */}
            <div className="rounded-xl border border-border/20 bg-muted/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Video className="w-3.5 h-3.5" />
                <span>对标视频：{styleVideoFile?.name || inspirationVideo?.title || tiktokLink || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground">卖点：</span>
                {sellingPoints.map((p) =>
                <span key={p} className="inline-flex h-5 items-center rounded-full bg-muted/40 border border-border/20 px-2 text-[11px] text-foreground/70">{p}</span>
                )}
              </div>
            </div>

            {/* Loading */}
            {isExtracting &&
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在分析视频风格，生成复刻 Prompt...</span>
              </div>
            }

            {/* Generated prompt */}
            {extractedPromptText && !isExtracting &&
            <div className="rounded-xl border border-border/30 bg-card/60 p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>复刻 Prompt</span>
                  </div>
                  <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors">
                  
                    {promptCopied ?
                  <><Check className="w-3.5 h-3.5" />已复制</> :

                  <><Copy className="w-3.5 h-3.5" />复制</>
                  }
                  </button>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line select-all">{extractedPromptText}</p>
              </div>
            }
          </div>
        </div>

        {/* ── Bottom input bar ── */}
        <div className="shrink-0 border-t border-border/20 bg-background">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="relative rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm">
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Video thumbnail */}
                  <div className="shrink-0">
                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    {styleVideoUrl ?
                    <div className="relative w-[80px] h-[60px] rounded-lg overflow-hidden border border-border/40 bg-muted/30 group">
                        <video src={styleVideoUrl} className="w-full h-full object-cover" />
                        <button
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                        onClick={() => {setStyleVideoFile(null);setStyleVideoUrl(null);}}>
                        
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div> :

                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="w-[80px] h-[60px] border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-foreground/20 hover:bg-muted/20 transition-colors">
                      
                        <Plus className="w-4 h-4 text-muted-foreground/60" />
                        <span className="text-[9px] text-muted-foreground/60">换视频</span>
                      </button>
                    }
                  </div>

                  {/* Selling points */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
                    {sellingPoints.map((point) =>
                    <span key={point} className="inline-flex items-center gap-1 h-6 rounded-full bg-muted/40 border border-border/20 px-2 text-xs text-foreground/80">
                        {point}
                        <button onClick={() => setSellingPoints((prev) => prev.filter((p) => p !== point))} className="hover:text-foreground transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    <input
                      ref={spInputRef}
                      value={spInput}
                      onChange={(e) => setSpInput(e.target.value)}
                      onKeyDown={handleSpKeyDown}
                      onBlur={() => {if (spInput.trim()) addSellingPoint(spInput);}}
                      placeholder="添加卖点..."
                      className="flex-1 min-w-[100px] h-7 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
                    
                  </div>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={!canSend || isExtracting}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all self-center shrink-0',
                      canSend && !isExtracting ?
                      'bg-foreground text-background hover:bg-foreground/90' :
                      'bg-muted/60 text-muted-foreground/40 cursor-not-allowed'
                    )}>
                    
                    {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {/* Link row */}
              <div className="flex items-center px-4 py-2 border-t border-border/20">
                {tiktokLink.trim() ?
                <div className="flex items-center gap-1.5 h-6 rounded-full bg-accent/10 border border-accent/20 px-2.5">
                    <Link className="w-3 h-3 text-accent" />
                    <span className="text-[11px] text-accent font-medium max-w-[180px] truncate">{tiktokLink}</span>
                    <button onClick={() => setTiktokLink('')} className="hover:text-accent/80 transition-colors">
                      <X className="w-3 h-3 text-accent/60" />
                    </button>
                  </div> :

                <div className="flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <input
                    value={tiktokLink}
                    onChange={(e) => setTiktokLink(e.target.value)}
                    placeholder="粘贴 TikTok 链接..."
                    className="w-[160px] h-6 text-[11px] bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
                  
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>);

  }

  // ── Composer view (initial) ──
  return (
    <div className="relative h-full">
      <div className="absolute top-4 right-4 z-20">
        {historySheet}
      </div>
    <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-8 py-[80px]">
      <div className="w-full max-w-2xl animate-fade-in my-[18px]">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-normal text-foreground tracking-tight">
            复刻视频
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            上传对标视频或复制Tiktok链接，输入卖点，AI 生成复刻 Prompt
          </p>
        </div>

        {/* ─── Composer Card ─── */}
        <div className="relative rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm shadow-sm transition-shadow hover:shadow-md">
          <div className="p-5">
            <div className="flex gap-4">
              {/* ── LEFT: Video Upload / TK Link ── */}
              <div className="shrink-0">
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                {styleVideoUrl ?
                  <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border border-border/40 bg-muted/30 group">
                    <video src={styleVideoUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <button
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                      onClick={() => {setStyleVideoFile(null);setStyleVideoUrl(null);}}>
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5 text-[10px] text-white truncate">
                      {styleVideoFile?.name}
                    </div>
                  </div> :
                  inspirationVideo ?
                  <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border border-border/40 group">
                    <div className={cn("absolute inset-0 bg-gradient-to-br", inspirationVideo.coverGradient)} />
                    <button
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => setInspirationVideo(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div> :

                  <button
                    onClick={() => !tiktokLink.trim() && videoInputRef.current?.click()}
                    disabled={!!tiktokLink.trim()}
                    className={cn(
                      "w-[120px] h-[100px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors",
                      tiktokLink.trim() ?
                      "border-border/20 bg-muted/10 cursor-not-allowed opacity-40" :
                      "border-border/40 hover:border-foreground/20 hover:bg-muted/20"
                    )}>
                    <Plus className="w-5 h-5 text-muted-foreground/60" />
                    <span className="text-[11px] text-muted-foreground/60 leading-tight text-center px-1">
                      上传对标视频
                    </span>
                  </button>
                  }
              </div>

              {/* ── RIGHT: Selling Points ── */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <label className="text-xs font-medium text-muted-foreground mb-1.5">产品卖点</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {sellingPoints.map((point) =>
                    <span
                      key={point}
                      className="inline-flex items-center gap-1 h-6 rounded-full bg-muted/40 border border-border/20 px-2 text-xs text-foreground/80">
                    
                      {point}
                      <button
                        onClick={() => setSellingPoints((prev) => prev.filter((p) => p !== point))}
                        className="hover:text-foreground transition-colors">
                      
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                    )}
                  <input
                      ref={spInputRef}
                      value={spInput}
                      onChange={(e) => setSpInput(e.target.value)}
                      onKeyDown={handleSpKeyDown}
                      onBlur={() => {if (spInput.trim()) addSellingPoint(spInput);}}
                      placeholder={sellingPoints.length === 0 ? '输入商品卖点，回车添加...' : '添加更多卖点...'}
                      className="flex-1 min-w-[140px] h-7 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
                  
                </div>
              </div>
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/20">
            <div className="flex items-center gap-2">
              {tiktokLink.trim() ?
                <div className="flex items-center gap-1.5 h-7 rounded-full bg-accent/10 border border-accent/20 px-3">
                  <Link className="w-3 h-3 text-accent" />
                  <span className="text-[11px] text-accent font-medium max-w-[200px] truncate">{tiktokLink}</span>
                  <button onClick={() => setTiktokLink('')} className="hover:text-accent/80 transition-colors">
                    <X className="w-3 h-3 text-accent/60" />
                  </button>
                </div> :

                <div className={cn(
                  "flex items-center gap-1.5 transition-opacity",
                  styleVideoFile || inspirationVideo ? "opacity-40 pointer-events-none" : ""
                )}>
                  <Link className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <input
                    value={tiktokLink}
                    onChange={(e) => setTiktokLink(e.target.value)}
                    disabled={!!(styleVideoFile || inspirationVideo)}
                    placeholder={styleVideoFile || inspirationVideo ? "已选择视频，链接不可用" : "粘贴 TikTok 链接..."}
                    className="w-[160px] h-7 text-[11px] bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none disabled:cursor-not-allowed" />
                
                </div>
                }
            </div>
            <div className="flex items-center gap-3">
              
              <button
                  onClick={handleSend}
                  disabled={!canSend || isExtracting}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                    canSend && !isExtracting ?
                    'bg-foreground text-background hover:bg-foreground/90' :
                    'bg-muted/60 text-muted-foreground/40 cursor-not-allowed'
                  )}>
                
                {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        
      </div>

      {/* ─── Inspiration Library ─── */}
      <div className="w-full max-w-2xl mt-10">
        <Tabs defaultValue="trending" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-foreground">灵感库</h2>
            <TabsList className="h-8 bg-muted/30 p-0.5 rounded-lg">
              <TabsTrigger value="trending" className="h-7 text-xs rounded-md px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Flame className="w-3.5 h-3.5" />
                近期热门
              </TabsTrigger>
              <TabsTrigger value="saved" className="h-7 text-xs rounded-md px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Bookmark className="w-3.5 h-3.5" />
                我的灵感库
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trending" className="mt-0">
            <PaginatedInspirationGrid videos={MOCK_TRENDING} onSelect={handleInspirationSelect} />
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            {savedVideos.length > 0 ?
              <PaginatedInspirationGrid
                videos={savedVideos.map((sv) => ({ id: sv.id, title: sv.title, views: sv.views, likes: sv.likes, coverGradient: sv.coverGradient, source: 'saved' as const }))}
                onSelect={handleInspirationSelect}
                renderOverlay={(video) => {
                  const sv = savedVideos.find((s) => s.id === video.id);
                  if (!sv) return null;
                  return (
                    <button
                      onClick={(e) => {e.stopPropagation();unsaveVideo(sv.videoId);toast.success('已从灵感库移除');}}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-[5]">
                    
                    <X className="w-3 h-3" />
                  </button>);

                }} /> :

              <div className="text-center py-12 text-sm text-muted-foreground">
                <Bookmark className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p>暂无保存的灵感视频</p>
                <p className="text-xs text-muted-foreground/50 mt-1">在 TikTok 爆款报告中保存视频，即可同步到此处</p>
              </div>
              }
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </div>);

}

/* ─── Inspiration Card Sub-component ─── */
const INSPO_PER_PAGE = 3;

function PaginatedInspirationGrid({
  videos,
  onSelect,
  renderOverlay




}: {videos: InspirationVideo[];onSelect: (video: InspirationVideo) => void;renderOverlay?: (video: InspirationVideo) => React.ReactNode;}) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(videos.length / INSPO_PER_PAGE);
  const previewVideos = videos.slice(0, INSPO_PER_PAGE);
  const pagedVideos = videos.slice(page * INSPO_PER_PAGE, (page + 1) * INSPO_PER_PAGE);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {previewVideos.map((video) =>
        <div key={video.id} className="relative">
            <InspirationCard video={video} onSelect={onSelect} />
            {renderOverlay?.(video)}
          </div>
        )}
      </div>

      {expanded &&
      <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {pagedVideos.map((video) =>
          <div key={video.id} className="relative">
                <InspirationCard video={video} onSelect={onSelect} />
                {renderOverlay?.(video)}
              </div>
          )}
          </div>
          {totalPages > 1 &&
        <div className="flex items-center justify-center gap-3 mt-4">
              <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-md border border-border/40 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
              <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-1.5 rounded-md border border-border/40 text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
        }
        </div>
      }

      {videos.length > INSPO_PER_PAGE &&
      <button
        onClick={() => {setExpanded(!expanded);setPage(0);}}
        className="flex items-center gap-1 mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors">
        
          {expanded ? '收起' : '查看更多'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      }
    </div>);

}

function InspirationCard({
  video,
  onSelect
}: {video: InspirationVideo;onSelect: (video: InspirationVideo) => void;}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => onSelect(video)}
        className="group rounded-xl border border-border/30 bg-card/60 overflow-hidden cursor-pointer hover:shadow-md transition-all">
        
        <div className={cn('aspect-video bg-gradient-to-br flex items-center justify-center relative', video.coverGradient)}>
          <Play className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
          <button
            onClick={(e) => {e.stopPropagation();setPreviewOpen(true);}}
            className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-[5]"
            title="预览视频">
            
            <Maximize2 className="w-3 h-3" />
          </button>
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] text-white">{video.views}</span>
          </div>
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-foreground/80 truncate">{video.title}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <span>👍 {video.likes}</span>
            <span>👁 {video.views}</span>
          </div>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{video.title}</DialogTitle>
          <div className="flex flex-col">
            <div className={cn('aspect-video bg-gradient-to-br flex items-center justify-center', video.coverGradient)}>
              <div className="flex flex-col items-center gap-3">
                <Play className="w-16 h-16 text-white/80" />
                <span className="text-white/60 text-sm">视频预览</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-foreground">{video.title}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>👍 {video.likes}</span>
                <span>👁 {video.views}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>);

}