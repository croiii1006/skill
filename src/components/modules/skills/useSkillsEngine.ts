import { useState, useCallback, useRef } from 'react';

export type TaskStatus = 'queued' | 'running' | 'done' | 'skipped';

export interface TaskLog {
  time: string;
  message: string;
}

export interface SkillTask {
  id: string;
  title: string;
  status: TaskStatus;
  progress: number;
  startAt?: string;
  endAt?: string;
  logs: TaskLog[];
  children: SkillTask[];
  input?: string;
  output?: string;
  moduleChain?: string[];
  expert?: {
    name: string;
    avatar: string; // import path key
    role: string;
  };
}

export interface CandidateVideo {
  id: string;
  cover: string;
  title: string;
  duration: string;
  tags: string[];
  views: string;
  likes: string;
  comments?: string;
  shares?: string;
  salesCount?: number;
  growthRate?: string;
  analysis?: string;
  strategy?: string;
  sellingPointHitRate?: number;
  tiktokUrl?: string;
}

export interface SessionSetup {
  image: string | null;
  imageName: string | null;
  memoryEnabled: boolean;
  selectedMemoryIds: string[];
  sellingPoints: string;
  category: string;
}

export type UIMode = 'single' | 'split';

export interface StreamMessage {
  id: string;
  type: 'text' | 'setup-summary' | 'checklist' | 'video-candidates' | 'prompt-editor' | 'result-preview' | 'task-subtask-list' | 'video-gen-status';
  content: string;
  isStreaming?: boolean;
}

export interface SkillsState {
  sessionId: string;
  setupCompleted: boolean;
  setup: SessionSetup;
  uiMode: UIMode;
  activeTaskId: string | null;
  tasks: SkillTask[];
  messages: StreamMessage[];
  candidateVideos: CandidateVideo[];
  selectedVideo: CandidateVideo | null;
  generatedPrompt: string;
  resultVideo: { url: string; cover: string } | null;
  isProcessing: boolean;
}

const MEMORY_ITEMS = [
  { id: 'mem-1', name: '品牌视觉资产库', desc: '包含品牌色、字体、Logo 使用规范', tag: '视觉' },
  { id: 'mem-2', name: '爆款文案模板', desc: '历史高转化文案合集', tag: '文案' },
  { id: 'mem-3', name: '竞品分析报告', desc: '近30天竞品投放素材分析', tag: '竞品' },
  { id: 'mem-4', name: '用户画像数据', desc: '目标人群兴趣与行为标签', tag: '用户' },
  { id: 'mem-5', name: '产品卖点文档', desc: '核心功能与差异化卖点', tag: '产品' },
];

const CATEGORIES = ['美妆个护', '3C数码', '服饰鞋包', '家居日用', '食品饮料', '母婴用品', '其它'];

const mockVideos = (): CandidateVideo[] => [
  { id: `v-${Date.now()}-1`, cover: '', title: 'These come in handy daily! @MINISO #translationearbuds', duration: '0:43', tags: ['美妆', '种草'], views: '28.0M', likes: '1.1M', comments: '12.3K', shares: '8.5K', salesCount: 268, growthRate: '0.0%', analysis: '视频解析', strategy: '开场直击跑步场景痛点，展现佩戴稳固与运动舒适。', sellingPointHitRate: 0, tiktokUrl: 'https://www.tiktok.com/@miniso' },
  { id: `v-${Date.now()}-2`, cover: '', title: '沉浸式开箱ASMR｜超治愈解压', duration: '0:45', tags: ['开箱', 'ASMR'], views: '15.2M', likes: '890K', comments: '6.7K', shares: '4.2K', salesCount: 1520, growthRate: '12.3%', analysis: '视频解析', strategy: '利用ASMR声效配合近景展示产品细节，引发感官共鸣。', sellingPointHitRate: 35, tiktokUrl: 'https://www.tiktok.com/' },
  { id: `v-${Date.now()}-3`, cover: '', title: '日常妆容教程｜通勤必备5分钟出门', duration: '1:02', tags: ['教程', '日常'], views: '42.1M', likes: '2.3M', comments: '18.9K', shares: '15.1K', salesCount: 3890, growthRate: '8.7%', analysis: '视频解析', strategy: '以通勤场景切入，展示快速上妆流程，突出便携性。', sellingPointHitRate: 72, tiktokUrl: 'https://www.tiktok.com/' },
  { id: `v-${Date.now()}-4`, cover: '', title: '产品对比测评TOP3｜真实体验分享', duration: '0:58', tags: ['测评', '对比'], views: '8.9M', likes: '520K', comments: '9.1K', shares: '3.8K', salesCount: 756, growthRate: '5.2%', analysis: '视频解析', strategy: '横向对比同类产品，通过数据和实测突出性价比优势。', sellingPointHitRate: 45, tiktokUrl: 'https://www.tiktok.com/' },
  { id: `v-${Date.now()}-5`, cover: '', title: '一分钟get氛围感穿搭｜秋冬必入', duration: '0:28', tags: ['穿搭', '氛围'], views: '31.2M', likes: '1.8M', comments: '14.2K', shares: '11.3K', salesCount: 2340, growthRate: '15.6%', analysis: '视频解析', strategy: '快节奏换装展示多套搭配，突出单品百搭特性。', sellingPointHitRate: 58, tiktokUrl: 'https://www.tiktok.com/' },
];

function now() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

export function useSkillsEngine() {
  const [state, setState] = useState<SkillsState>({
    sessionId: `session-${Date.now()}`,
    setupCompleted: false,
    setup: {
      image: null,
      imageName: null,
      memoryEnabled: true,
      selectedMemoryIds: [],
      sellingPoints: '',
      category: '',
    },
    uiMode: 'single',
    activeTaskId: null,
    tasks: [],
    messages: [],
    candidateVideos: [],
    selectedVideo: null,
    generatedPrompt: '',
    resultVideo: null,
    isProcessing: false,
  });

  const streamTimers = useRef<number[]>([]);

  const clearTimers = () => {
    streamTimers.current.forEach(clearTimeout);
    streamTimers.current = [];
  };

  const addMessage = useCallback((msg: Omit<StreamMessage, 'id'>) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { ...msg, id }],
    }));
    return id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<StreamMessage>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  }, []);

  const streamText = useCallback((text: string, onDone?: () => void) => {
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { id: msgId, type: 'text', content: '', isStreaming: true }],
    }));

    const chars = text.split('');
    let i = 0;
    const tick = () => {
      if (i < chars.length) {
        const batch = chars.slice(i, i + 3).join('');
        i += 3;
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m =>
            m.id === msgId ? { ...m, content: m.content + batch } : m
          ),
        }));
        const timer = window.setTimeout(tick, 30 + Math.random() * 20);
        streamTimers.current.push(timer);
      } else {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m =>
            m.id === msgId ? { ...m, isStreaming: false } : m
          ),
        }));
        onDone?.();
      }
    };
    tick();
    return msgId;
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<SkillTask>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
    }));
  }, []);

  const addTaskLog = useCallback((taskId: string, message: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId
          ? { ...t, logs: [...t.logs, { time: now(), message }] }
          : t
      ),
    }));
  }, []);

  // Flow 0: Complete setup
  const completeSetup = useCallback((setup: SessionSetup) => {
    setState(prev => ({ ...prev, setup, setupCompleted: true, isProcessing: true }));

    // Add setup summary message
    const summaryId = `msg-summary-${Date.now()}`;
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        { id: summaryId, type: 'setup-summary', content: JSON.stringify(setup) },
      ],
    }));

    // Create initial tasks — merge generate-list into crawl
    const tasks: SkillTask[] = [
      {
        id: 'task-memory', title: '调用记忆库',
        status: setup.memoryEnabled ? 'queued' : 'skipped',
        progress: 0, logs: [], children: [
          { id: 'task-memory-connect', title: '连接记忆库', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '记忆专家', avatar: 'memory', role: '记忆管理专家' } },
          { id: 'task-memory-retrieve', title: '检索相关记忆', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '检索专家', avatar: 'search', role: '信息检索专家' } },
          { id: 'task-memory-context', title: '构建上下文向量', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '数据专家', avatar: 'analyst', role: '数据分析专家' } },
        ],
        moduleChain: ['MemoryRetriever', 'VectorDB', 'ContextBuilder'],
        input: setup.memoryEnabled ? `记忆库: ${setup.selectedMemoryIds.join(', ')}` : '已跳过',
        expert: { name: '记忆库', avatar: 'memory', role: '' },
      },
      {
        id: 'task-crawl', title: '抓取同品类 TK 爆款视频',
        status: 'queued', progress: 0, logs: [], children: [
          { id: 'task-crawl-spider', title: '启动 TikTok 爬虫', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '爬虫专家', avatar: 'crawler', role: '数据爬取专家' } },
          { id: 'task-crawl-analyze', title: '分析卖点匹配度', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '数据专家', avatar: 'analyst', role: '数据分析专家' } },
          { id: 'task-crawl-rank', title: '排序生成 Top 20', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '策略专家', avatar: 'strategist', role: '策略专家' } },
          { id: 'task-crawl-cover', title: '提取视频封面', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '视频专家', avatar: 'video', role: '视频制作专家' } },
          { id: 'task-crawl-meta', title: '提取元数据', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '数据专家', avatar: 'analyst', role: '数据分析专家' } },
        ],
        moduleChain: ['TikTokCrawler', 'ContentAnalyzer', 'RankingEngine', 'ThumbnailGen', 'MetadataExtractor'],
        input: `品类: ${setup.category}, 卖点: ${setup.sellingPoints.slice(0, 50)}`,
        expert: { name: '爬虫', avatar: 'crawler', role: '' },
      },
      {
        id: 'task-wait-select', title: '等待用户选择参考视频',
        status: 'queued', progress: 0, logs: [], children: [],
        expert: { name: '策略', avatar: 'strategist', role: '' },
      },
      {
        id: 'task-reverse-prompt', title: '反推提示词（Reverse Prompt）',
        status: 'queued', progress: 0, logs: [], children: [
          { id: 'rp-frame', title: '视频帧分析', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '视频专家', avatar: 'video', role: '视频制作专家' } },
          { id: 'rp-style', title: '风格特征提取', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '设计专家', avatar: 'designer', role: '创意制作专家' } },
          { id: 'rp-prompt', title: '提示词生成', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '策略专家', avatar: 'strategist', role: '策略专家' } },
        ],
        moduleChain: ['VideoAnalyzer', 'PromptExtractor', 'StyleMatcher'],
        expert: { name: '提示词', avatar: 'video', role: '' },
      },
      {
        id: 'task-generate-video', title: '爆款视频正在生成',
        status: 'queued', progress: 0, logs: [], children: [
          { id: 'sub-scene', title: '设计专家正在渲染场景', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '设计专家', avatar: 'designer', role: '创意制作专家' } },
          { id: 'sub-audio', title: '音频合成', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '音频专家', avatar: 'audio', role: '音频制作专家' } },
          { id: 'sub-compose', title: '视频合成', status: 'queued', progress: 0, logs: [], children: [], expert: { name: '视频专家', avatar: 'video', role: '视频制作专家' } },
        ],
        moduleChain: ['SceneRenderer', 'AudioSynthesizer', 'VideoComposer', 'QualityChecker'],
        expert: { name: '视频', avatar: 'designer', role: '' },
      },
    ];

    // Add checklist message
    const checklistId = `msg-checklist-${Date.now()}`;
    // Persistent status message that overwrites throughout the flow
    const statusMsgId = `msg-status-${Date.now()}`;

    // Helper to update a child task
    const updateChild = (parentId: string, childId: string, updates: Partial<SkillTask>) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === parentId ? {
          ...t,
          children: t.children.map(c => c.id === childId ? { ...c, ...updates } : c),
        } : t),
      }));
    };

    // Delay helpers
    const randDelay = () => {
      const ms = 1500 + Math.random() * 2000;
      return new Promise<void>(r => {
        const t = window.setTimeout(r, ms);
        streamTimers.current.push(t);
      });
    };
    const subDelay = () => {
      const ms = 1000 + Math.random() * 1000;
      return new Promise<void>(r => {
        const t = window.setTimeout(r, ms);
        streamTimers.current.push(t);
      });
    };
    const backendDelay = () => {
      const ms = 3000 + Math.random() * 3000;
      return new Promise<void>(r => {
        const t = window.setTimeout(r, ms);
        streamTimers.current.push(t);
      });
    };
    const pause = (ms = 600) => new Promise<void>(r => {
      const t = window.setTimeout(r, ms);
      streamTimers.current.push(t);
    });

    // Helper: set status (always moves to end of messages)
    const setStatus = (content: string) => {
      setState(prev => {
        const filtered = prev.messages.filter(m => m.id !== statusMsgId);
        return { ...prev, messages: [...filtered, { id: statusMsgId, type: 'video-gen-status' as const, content }] };
      });
    };

    const submittedAt = now();

    (async () => {
      // ─── Phase 0: Build checklist one by one ───
      addMessage({ type: 'video-gen-status', content: '正在为您编写待办清单...' });
      await pause(800);

      // Show checklist container first (empty)
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { id: checklistId, type: 'checklist', content: '' }],
      }));

      // Add tasks one by one with delay
      for (let i = 0; i < tasks.length; i++) {
        setState(prev => ({
          ...prev,
          tasks: [...prev.tasks, tasks[i]],
        }));
        await pause(400);
      }
      await pause(400);

      // ─── Task 1: Memory ───
      if (setup.memoryEnabled) {
        // Permanent intro message
        addMessage({ type: 'video-gen-status', content: '正在为您调用记忆库.....' });

        // Show subtask list
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, { id: `msg-subtasks-memory-${Date.now()}`, type: 'task-subtask-list' as const, content: 'task-memory' }],
        }));

        updateTask('task-memory', { status: 'running', startAt: submittedAt });

        // Sub 1: Connect
        await pause(400);
        updateChild('task-memory', 'task-memory-connect', { status: 'running', title: '记忆专家正在连接记忆库' });
        addTaskLog('task-memory', '记忆专家正在连接记忆库...');
        await subDelay();
        updateChild('task-memory', 'task-memory-connect', { status: 'done', progress: 100, title: '记忆专家完成连接记忆库' });
        addTaskLog('task-memory', '记忆专家完成连接记忆库 → 已建立安全连接');

        // Sub 2: Retrieve
        updateChild('task-memory', 'task-memory-retrieve', { status: 'running', title: '检索专家正在检索相关记忆' });
        addTaskLog('task-memory', '检索专家正在检索相关记忆...');
        await subDelay();
        const memoryCount = setup.selectedMemoryIds.length || 4;
        updateChild('task-memory', 'task-memory-retrieve', { status: 'done', progress: 100, title: '检索专家完成检索相关记忆' });
        addTaskLog('task-memory', `检索专家完成检索相关记忆 → 命中 ${memoryCount} 条相关记忆`);

        // Sub 3: Context
        updateChild('task-memory', 'task-memory-context', { status: 'running', title: '数据专家正在构建上下文向量' });
        addTaskLog('task-memory', '数据专家正在构建上下文向量...');
        await subDelay();
        updateChild('task-memory', 'task-memory-context', { status: 'done', progress: 100, title: '数据专家完成构建上下文向量' });
        addTaskLog('task-memory', '数据专家完成构建上下文向量 → 生成 512 维特征向量');

        const memEndAt = now();
        updateTask('task-memory', { status: 'done', progress: 100, endAt: memEndAt, output: `已检索 ${memoryCount} 条记忆，构建上下文完成` });
        // Permanent completion message
        addMessage({ type: 'video-gen-status', content: `✅ 我已经完成了记忆库调用，共检索到 ${memoryCount} 条相关记忆并构建了上下文。现在让我为你抓取同品类的 TikTok 爆款视频。` });
        await pause(800);
      } else {
        addMessage({ type: 'video-gen-status', content: '⏭️ 记忆库已关闭，跳过此步骤。现在让我为你抓取同品类的 TikTok 爆款视频。' });
        updateTask('task-memory', { status: 'skipped', endAt: now() });
        await pause(800);
      }

      // ─── Task 2: Crawl (merged with generate-list) ───
      const crawlStartAt = now();
      updateTask('task-crawl', { status: 'running', startAt: crawlStartAt });
      addTaskLog('task-crawl', '爬虫专家启动 TikTok 爬虫...');

      // Show crawl subtask list
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { id: `msg-subtasks-crawl-${Date.now()}`, type: 'task-subtask-list' as const, content: 'task-crawl' }],
      }));

      // Sub 1: Spider — backend dependent
      updateChild('task-crawl', 'task-crawl-spider', { status: 'running', title: '爬虫专家正在启动 TikTok 爬虫' });
      
      await backendDelay();
      updateChild('task-crawl', 'task-crawl-spider', { status: 'done', progress: 100, title: '爬虫专家完成启动 TikTok 爬虫' });
      addTaskLog('task-crawl', '爬虫专家完成抓取 → 共获取 142 条视频数据');
      

      // Sub 2: Analyze — backend dependent
      updateChild('task-crawl', 'task-crawl-analyze', { status: 'running', title: '数据专家正在分析卖点匹配度' });
      addTaskLog('task-crawl', '数据专家正在分析卖点匹配度...');
      await backendDelay();
      updateChild('task-crawl', 'task-crawl-analyze', { status: 'done', progress: 100, title: '数据专家完成分析卖点匹配度' });
      addTaskLog('task-crawl', '数据专家完成分析 → 平均匹配度 73.2%，高匹配 28 条');
      

      // Sub 3: Rank — fixed step
      updateChild('task-crawl', 'task-crawl-rank', { status: 'running', title: '策略专家正在排序生成 Top 20' });
      addTaskLog('task-crawl', '策略专家正在按匹配度排序...');
      await randDelay();
      updateChild('task-crawl', 'task-crawl-rank', { status: 'done', progress: 100, title: '策略专家完成排序生成 Top 20' });
      addTaskLog('task-crawl', '策略专家完成排序 → Top 20 候选已生成');
      

      // Sub 4: Cover — fixed step
      updateChild('task-crawl', 'task-crawl-cover', { status: 'running', title: '视频专家正在提取视频封面' });
      addTaskLog('task-crawl', '视频专家正在提取视频封面...');
      await randDelay();
      updateChild('task-crawl', 'task-crawl-cover', { status: 'done', progress: 100, title: '视频专家完成提取视频封面' });
      addTaskLog('task-crawl', '视频专家完成封面提取 → 20 张高清封面已缓存');
      

      // Sub 5: Meta — fixed step
      updateChild('task-crawl', 'task-crawl-meta', { status: 'running', title: '数据专家正在提取元数据' });
      addTaskLog('task-crawl', '数据专家正在提取元数据...');
      await subDelay();
      updateChild('task-crawl', 'task-crawl-meta', { status: 'done', progress: 100, title: '数据专家完成提取元数据' });
      addTaskLog('task-crawl', '数据专家完成元数据提取 → 含播放量、点赞、评论、转发等维度');

      updateTask('task-crawl', { status: 'done', progress: 100, endAt: now(), output: '抓取 142 条，Top 20 已排序' });
      setStatus('✅ 我已经完成了爆款视频抓取，从 142 条视频中筛选出 Top 20。现在让我为你生成候选视频预览列表。');
      await pause(1500);

      addMessage({ type: 'video-gen-status', content: '✅ 我已经完成了候选视频预览列表的生成。现在请你从以下视频中选择一条作为复刻参考：' });

      // Show video candidates
      const videos = mockVideos();
      setState(prev => ({
        ...prev,
        candidateVideos: videos,
        messages: [
          ...prev.messages,
          { id: `msg-videos-${Date.now()}`, type: 'video-candidates', content: '' },
        ],
      }));

      // Task 3: Wait for user
      updateTask('task-wait-select', { status: 'running', startAt: now() });
      addTaskLog('task-wait-select', '等待用户选择参考视频...');

      setState(prev => ({ ...prev, isProcessing: false }));
    })();
  }, [streamText, updateTask, addTaskLog]);

  // Refresh candidates
  const refreshCandidates = useCallback(() => {
    setState(prev => ({ ...prev, isProcessing: true }));
    const newVideos = mockVideos();
    
    // Add sub-task
    const subTaskId = `task-refresh-${Date.now()}`;
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, {
        id: subTaskId, title: '已刷新一批候选视频',
        status: 'running', progress: 50, logs: [{ time: now(), message: '正在刷新候选集...' }],
        children: [], startAt: now(),
      }],
    }));

    const timer = window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        candidateVideos: newVideos,
        isProcessing: false,
        tasks: prev.tasks.map(t => t.id === subTaskId ? { ...t, status: 'done' as TaskStatus, progress: 100, endAt: now(), logs: [...t.logs, { time: now(), message: '候选集已更新' }] } : t),
      }));
      streamText('🔄 已更新候选视频列表，请重新选择。', () => {});
    }, 1500);
    streamTimers.current.push(timer);
  }, [streamText]);

  // Select a video -> Flow C
  const selectVideo = useCallback((video: CandidateVideo) => {
    // Detect if this is a re-selection (reverse-prompt task was already done)
    const isReselect = state.tasks.find(t => t.id === 'task-reverse-prompt')?.status === 'done';

    // Reset reverse-prompt task and children to queued state, remove old related messages
    setState(prev => ({
      ...prev,
      selectedVideo: video,
      isProcessing: true,
      generatedPrompt: '',
      // Remove old reverse-prompt related messages on re-select
      messages: isReselect
        ? prev.messages.filter(m => {
            // Remove "现在为你反推提示词" / "现在为你重新反推提示词"
            if (m.type === 'video-gen-status' && m.content.includes('反推提示词') && !m.content.startsWith('✅')) return false;
            // Remove reverse-prompt subtask list
            if (m.type === 'task-subtask-list' && m.content === 'task-reverse-prompt') return false;
            // Remove prompt editor
            if (m.type === 'prompt-editor') return false;
            // Remove the completion status for reverse prompt
            if (m.type === 'video-gen-status' && m.content.includes('完成了提示词反推')) return false;
            return true;
          })
        : prev.messages,
      tasks: prev.tasks.map(t => {
        if (t.id === 'task-reverse-prompt') {
          return {
            ...t,
            status: 'queued' as TaskStatus,
            progress: 0,
            startAt: undefined,
            endAt: undefined,
            logs: [],
            output: undefined,
            children: t.children.map(c => ({
              ...c,
              status: 'queued' as TaskStatus,
              progress: 0,
              title: c.id === 'rp-frame' ? '视频帧分析' : c.id === 'rp-style' ? '风格特征提取' : '提示词生成',
            })),
          };
        }
        return t;
      }),
    }));
    updateTask('task-wait-select', { status: 'done', progress: 100, endAt: now(), output: `已选择: ${video.title}` });

    // Persistent status message for this phase
    const statusMsgId = `msg-select-status-${Date.now()}`;

    const setStatus = (content: string) => {
      setState(prev => {
        const filtered = prev.messages.filter(m => m.id !== statusMsgId);
        return { ...prev, messages: [...filtered, { id: statusMsgId, type: 'video-gen-status' as const, content }] };
      });
    };

    setStatus(`✅ 我已经记录了你的选择「${video.title}」。`);

    // Permanent message before subtask list
    const addPermanentMsg = (content: string) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { id: `msg-${Date.now()}-${Math.random()}`, type: 'video-gen-status' as const, content }],
      }));
    };
    addPermanentMsg(isReselect ? '现在为你重新反推提示词' : '现在为你反推提示词');

    // Update existing reverse prompt task to running
    const rpTaskId = 'task-reverse-prompt';
    updateTask(rpTaskId, {
      status: 'running', startAt: now(),
      logs: [{ time: now(), message: '开始分析视频内容...' }],
      input: `视频: ${video.title}`,
    });

    const randDelay = () => new Promise<void>(r => {
      const t = window.setTimeout(r, 1500 + Math.random() * 2000);
      streamTimers.current.push(t);
    });
    const backendDelay = () => new Promise<void>(r => {
      const t = window.setTimeout(r, 3000 + Math.random() * 3000);
      streamTimers.current.push(t);
    });
    const pause = (ms = 600) => new Promise<void>(r => {
      const t = window.setTimeout(r, ms);
      streamTimers.current.push(t);
    });

    const updateRPChild = (childId: string, updates: Partial<SkillTask>) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === rpTaskId ? {
          ...t, children: t.children.map(c => c.id === childId ? { ...c, ...updates } : c),
        } : t),
      }));
    };

    (async () => {
      await pause(800);

      // Show subtask list immediately
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { id: `msg-subtasks-rp-${Date.now()}`, type: 'task-subtask-list' as const, content: 'task-reverse-prompt' }],
      }));

      // Frame analysis — fixed step
      await pause(400);
      updateRPChild('rp-frame', { status: 'running', title: '视频专家正在分析视频帧' });
      
      await randDelay();
      updateRPChild('rp-frame', { status: 'done', progress: 100, title: '视频专家完成视频帧分析' });
      addTaskLog(rpTaskId, '视频专家完成视频帧分析 → 提取 48 个关键帧，识别 5 个场景段');
      

      // Style extraction — fixed step
      updateRPChild('rp-style', { status: 'running', title: '设计专家正在提取风格特征' });
      await randDelay();
      updateRPChild('rp-style', { status: 'done', progress: 100, title: '设计专家完成风格特征提取' });
      addTaskLog(rpTaskId, '设计专家完成风格特征提取 → 暖色调、近景特写、快节奏剪辑');
      

      // Prompt generation — backend dependent
      updateRPChild('rp-prompt', { status: 'running', title: '策略专家正在生成提示词' });
      await backendDelay();
      updateRPChild('rp-prompt', { status: 'done', progress: 100, title: '策略专家完成提示词生成' });
      addTaskLog(rpTaskId, '策略专家完成提示词生成 → 包含镜头、节奏、结构等 6 个维度');

      updateTask(rpTaskId, { status: 'done', progress: 100, endAt: now(), output: '提示词生成完成' });

      const mockPrompt = `【爆款复刻 Prompt】\n\n镜头风格：近景特写 + 俯拍切换，暖色调滤镜\n节奏：快节奏剪辑，BGM 节拍同步\n内容结构：\n1. 开场 - 产品白底展示，旋转 360°（0-3s）\n2. 使用场景 - 手部特写展示质感（3-8s）\n3. 效果对比 - 使用前后对比（8-15s）\n4. 口播种草 - 真人出镜，口述卖点（15-25s）\n5. 结尾 CTA - 点击链接，限时优惠（25-30s）\n\n关键词：${state.setup.sellingPoints.slice(0, 30)}\n品类：${state.setup.category}\n参考来源：${video.title}`;

      setStatus(isReselect ? '✅ 我已经重新完成了提示词反推。你可以编辑后点击「确认并生成」，让我为你制作复刻视频：' : '✅ 我已经完成了提示词反推。你可以编辑后点击「确认并生成」，让我为你制作复刻视频：');
      await pause(500);

      setState(prev => ({
        ...prev,
        generatedPrompt: mockPrompt,
        isProcessing: false,
        messages: [
          ...prev.messages,
          { id: `msg-prompt-${Date.now()}`, type: 'prompt-editor', content: mockPrompt },
        ],
      }));
    })();
  }, [state.setup, state.tasks, streamText, updateTask, addTaskLog]);

  // Update prompt
  const updatePrompt = useCallback((prompt: string) => {
    setState(prev => ({ ...prev, generatedPrompt: prompt }));
  }, []);

  // Confirm generate -> Flow D
  const confirmGenerate = useCallback(() => {
    setState(prev => ({ ...prev, isProcessing: true }));

    const genTaskId = 'task-generate-video';
    // Update existing task to running with first child running
    updateTask(genTaskId, {
      status: 'running', startAt: now(),
      logs: [{ time: now(), message: '开始渲染视频...' }],
    });
    // Set first child to running
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === genTaskId ? {
        ...t,
        children: t.children.map((c, i) => i === 0 ? { ...c, status: 'running' } : c),
      } : t),
    }));

    // Status message ID for replacing in place
    const statusMsgId = `msg-gen-status-${Date.now()}`;

    // Add initial status message and checklist subtask list
    streamText('🎬 开始生成复刻视频，3 个子任务将依次执行...', () => {});

    const randDelay = () => new Promise<void>(r => {
      const t = window.setTimeout(r, 1500 + Math.random() * 2000);
      streamTimers.current.push(t);
    });
    const backendDelay = () => new Promise<void>(r => {
      const t = window.setTimeout(r, 3000 + Math.random() * 3000);
      streamTimers.current.push(t);
    });
    const pause = (ms = 600) => new Promise<void>(r => {
      const t = window.setTimeout(r, ms);
      streamTimers.current.push(t);
    });

    const updateGenChild = (childId: string, updates: Partial<SkillTask>) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === genTaskId ? {
          ...t, children: t.children.map(c => c.id === childId ? { ...c, ...updates } : c),
        } : t),
      }));
    };

    (async () => {
      await pause(800);

      // Add subtask list for the generate task
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { id: `msg-subtasks-gen-${Date.now()}`, type: 'task-subtask-list' as const, content: 'task-generate-video' }],
      }));


      // Scene rendering — backend dependent (video generation)
      await backendDelay();
      addTaskLog(genTaskId, '设计专家渲染场景 1/5...');
      await pause(800);
      addTaskLog(genTaskId, '设计专家渲染场景 2/5...');
      await pause(800);
      addTaskLog(genTaskId, '设计专家渲染场景 3/5...');
      await pause(600);
      updateGenChild('sub-scene', { status: 'done', progress: 100, title: '设计专家完成渲染场景' });
      addTaskLog(genTaskId, '设计专家完成场景渲染 → 5 个场景段，总时长 30s');

      // Replace status: scene done
      updateMessage(statusMsgId, { content: '✅ 我已经完成了场景渲染。现在让我为你合成音频。' });

      // Audio synthesis — fixed step
      updateGenChild('sub-audio', { status: 'running', title: '音频专家正在合成音频' });
      addTaskLog(genTaskId, '音频专家正在合成音频...');
      await randDelay();
      updateGenChild('sub-audio', { status: 'done', progress: 100, title: '音频专家完成合成音频' });
      addTaskLog(genTaskId, '音频专家完成音频合成 → BGM 节拍同步，时长 30s');

      // Replace status: audio done
      updateMessage(statusMsgId, { content: '✅ 我已经完成了音频合成。现在让我为你进行最终的视频合成。' });

      // Video compose — backend dependent
      updateGenChild('sub-compose', { status: 'running', title: '视频专家正在合成视频' });
      addTaskLog(genTaskId, '视频专家正在合成视频...');
      await backendDelay();
      updateGenChild('sub-compose', { status: 'done', progress: 100, title: '视频专家完成合成视频' });
      addTaskLog(genTaskId, '视频专家完成视频合成 → 1080p，30s，质量检测通过');
      addTaskLog(genTaskId, '质量检测通过 → 画面清晰度 98%，音画同步率 99.2%');

      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === genTaskId ? {
          ...t, status: 'done' as TaskStatus, progress: 100, endAt: now(),
          output: '视频生成完成，时长 30s',
        } : t),
      }));

      // Replace status: all done
      updateMessage(statusMsgId, { content: '🎉 我已经完成了所有任务！复刻视频已生成，你可以预览或下载。' });

      await pause(400);

      setState(prev => ({
        ...prev,
        resultVideo: { url: '', cover: '' },
        isProcessing: false,
        messages: [
          ...prev.messages,
          { id: `msg-result-${Date.now()}`, type: 'result-preview', content: '' },
        ],
      }));
    })();
  }, [streamText, addTaskLog]);

  // Regenerate: reset video generation task and result, then re-run confirmGenerate
  const regenerate = useCallback(() => {
    clearTimers();
    setState(prev => ({
      ...prev,
      resultVideo: null,
      isProcessing: false,
      messages: prev.messages.filter(m =>
        m.type !== 'result-preview' &&
        !(m.type === 'task-subtask-list' && m.content === 'task-generate-video') &&
        !(m.type === 'video-gen-status') &&
        !(m.type === 'text' && (m.content.includes('开始生成复刻视频') || m.content.includes('已经完成了')))
      ),
      tasks: prev.tasks.map(t => t.id === 'task-generate-video' ? {
        ...t,
        status: 'pending' as TaskStatus,
        progress: 0,
        startAt: null,
        endAt: null,
        output: null,
        logs: [],
        children: t.children.map(c => ({ ...c, status: 'pending' as TaskStatus, progress: 0 })),
      } : t),
    }));
    const timer = window.setTimeout(() => {
      confirmGenerate();
    }, 300);
    streamTimers.current.push(timer);
  }, [confirmGenerate]);

  // UI mode
  const setUIMode = useCallback((mode: UIMode) => {
    setState(prev => ({ ...prev, uiMode: mode }));
  }, []);

  const setActiveTaskId = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      activeTaskId: id,
      uiMode: id ? 'split' : 'single',
    }));
  }, []);

  // Handle user chat input
  const handleUserInput = useCallback((text: string) => {
    // Add user message
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { id: `msg-user-${Date.now()}`, type: 'text', content: `👤 ${text}` }],
    }));

    const lower = text.toLowerCase();
    if (lower.includes('换一批') || lower.includes('refresh')) {
      refreshCandidates();
    } else if (lower.includes('重选') || lower.includes('返回')) {
      streamText('🔙 好的，请重新从候选视频中选择一条参考。', () => {});
    } else {
      streamText(`收到指令「${text}」，正在处理中...`, () => {
        const timer = window.setTimeout(() => {
          streamText('✅ 已完成处理。还有其他需要调整的吗？', () => {});
        }, 1500);
        streamTimers.current.push(timer);
      });
    }
  }, [refreshCandidates, streamText]);

  // Back to video selection: clear prompt, generated video, and related tasks/messages
  const backToVideoSelect = useCallback(() => {
    clearTimers();
    setState(prev => ({
      ...prev,
      generatedPrompt: '',
      resultVideo: null,
      selectedVideo: null,
      isProcessing: false,
      messages: prev.messages.filter(m =>
        m.type !== 'prompt-editor' &&
        m.type !== 'result-preview' &&
        !(m.type === 'task-subtask-list' && (m.content === 'task-reverse-prompt' || m.content === 'task-generate-video')) &&
        !(m.type === 'video-gen-status')
      ),
      tasks: prev.tasks.map(t => {
        if (t.id === 'task-reverse-prompt' || t.id === 'task-generate-video') {
          return { ...t, status: 'queued' as TaskStatus, progress: 0, startAt: undefined, endAt: undefined, output: undefined, logs: [], children: t.children.map(c => ({ ...c, status: 'queued' as TaskStatus, progress: 0 })) };
        }
        if (t.id === 'task-wait-select') {
          return { ...t, status: 'running' as TaskStatus, progress: 0, endAt: undefined, output: undefined };
        }
        return t;
      }),
    }));
  }, []);

  // Reset session
  const resetSession = useCallback(() => {
    clearTimers();
    setState({
      sessionId: `session-${Date.now()}`,
      setupCompleted: false,
      setup: { image: null, imageName: null, memoryEnabled: true, selectedMemoryIds: [], sellingPoints: '', category: '' },
      uiMode: 'single',
      activeTaskId: null,
      tasks: [],
      messages: [],
      candidateVideos: [],
      selectedVideo: null,
      generatedPrompt: '',
      resultVideo: null,
      isProcessing: false,
    });
  }, []);

  // Restore a previously saved full state snapshot (for history)
  const restoreState = useCallback((snapshot: SkillsState) => {
    clearTimers();
    setState({ ...snapshot, isProcessing: false });
  }, []);

  return {
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
    restoreState,
  };
}
