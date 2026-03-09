import { Play, Heart, MessageSquare } from 'lucide-react';
import logoDark from '@/assets/logo_dark.svg';

export interface ShowcaseCardData {
  title: string;
  desc: string;
  hoverText: string;
  image: string;
  miniTitle: string;
  targetId: string;
  category: string;
}

export function ShowcaseCard({
  card,
  onClick,
}: {
  card: ShowcaseCardData;
  onClick: () => void;
}) {
  return (
    <div
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* Shadow */}
      <div
        className="absolute -right-3 -bottom-3 h-[70%] w-[70%] rounded-[50px] bg-[radial-gradient(60%_60%_at_100%_100%,rgba(0,0,0,0.14),rgba(0,0,0,0))] blur-[12px] z-0"
        aria-hidden="true"
      />

      {/* Main card */}
      <div className="relative overflow-hidden bg-muted/40 dark:bg-muted/20 rounded-[16px] backdrop-blur-[5px] z-10 border border-border/20">
        {/* Floating mini report card */}
        <div className="absolute flex items-center justify-center right-[-10px] top-[2px] w-[90px] z-10 transition-transform duration-300 ease-out group-hover:translate-x-[-6px] group-hover:translate-y-[-4px]">
          <div className="flex-none rotate-[-6deg] transition-transform duration-300 ease-out group-hover:rotate-[-4deg]">
            <div className="bg-background overflow-hidden rounded-[4px] shadow-[0px_2px_16px_0px_rgba(35,35,35,0.18)] w-[80px] h-[104px] relative">
              {/* Window dots */}
              <div className="flex items-center gap-[2px] px-[5px] py-[3px]">
                <div className="w-[2.5px] h-[2.5px] rounded-full bg-destructive" />
                <div className="w-[2.5px] h-[2.5px] rounded-full bg-amber-400" />
                <div className="w-[2.5px] h-[2.5px] rounded-full bg-emerald-400" />
              </div>
              {/* Title area */}
              <div className="flex items-start gap-[3px] px-[5px] pt-[1px] pb-[3px]">
                <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                  <p className="font-semibold leading-normal line-clamp-1 text-[5px] text-foreground">
                    {card.miniTitle}
                  </p>
                  <div className="flex items-center gap-[2px]">
                    <div className="w-[6px] h-[6px] rounded-full overflow-hidden bg-muted">
                      <img alt="OranAI" src={logoDark} className="w-full h-full object-contain" />
                    </div>
                    <p className="font-medium leading-normal text-[4px] text-muted-foreground truncate">
                      OranAI
                    </p>
                  </div>
                  <div className="flex items-center gap-[2px]">
                    <div className="flex items-center gap-px">
                      <Play className="w-[3.5px] h-[3.5px] text-muted-foreground fill-muted-foreground" />
                      <p className="font-medium text-[3.5px] text-muted-foreground">1080w</p>
                    </div>
                    <div className="flex items-center gap-px">
                      <Heart className="w-[3.5px] h-[3.5px] text-muted-foreground" />
                      <p className="font-medium text-[3.5px] text-muted-foreground">28w</p>
                    </div>
                    <div className="flex items-center gap-px">
                      <MessageSquare className="w-[3.5px] h-[3.5px] text-muted-foreground" />
                      <p className="font-medium text-[3.5px] text-muted-foreground">12w</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Thumbnail */}
              <div className="relative h-[70px] rounded-[3px] mx-[5px] mb-[5px] overflow-hidden">
                <img
                  alt=""
                  className="absolute inset-0 max-w-none object-cover w-full h-full"
                  src={card.image}
                />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-muted to-transparent" />
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[16px] bg-foreground/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-background text-[11px] leading-[1.4] font-medium">
            {card.hoverText}
          </p>
        </div>

        {/* Bottom text area */}
        <div className="relative h-[130px]">
          <div className="absolute left-0 bottom-0 flex flex-col gap-[4px] items-start justify-end p-[14px] py-[12px] w-full">
            <div className="relative shrink-0 w-[65%] whitespace-pre-wrap mb-0 group-hover:opacity-0 transition-opacity duration-200">
              <p className="font-medium leading-[1.35] text-[13px] text-foreground">
                {card.title}
              </p>
              <p className="mt-[6px] font-normal leading-[1.35] text-[10px] text-muted-foreground line-clamp-2">
                {card.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SHOWCASE_CARDS: ShowcaseCardData[] = [
  // 市场洞察
  { title: '海飞丝市场洞察深度报告', desc: '整合宏观趋势、全球化市场、人群画像、和竞品分析', hoverText: '点击查看市场洞察报告案例', image: '/haifeisi.jpg', miniTitle: '海飞丝市场洞察深度报告', targetId: 'brand-health', category: 'market' },
  { title: '护肤品赛道趋势分析', desc: '消费者偏好变化与新兴品牌竞争格局', hoverText: '点击查看市场洞察报告案例', image: '/placeholder.svg', miniTitle: '护肤品赛道趋势分析', targetId: 'brand-health', category: 'market' },
  { title: '饮料行业消费者画像', desc: '年轻消费群体购买行为与偏好深度洞察', hoverText: '点击查看市场洞察报告案例', image: '/placeholder.svg', miniTitle: '饮料行业消费者画像', targetId: 'brand-health', category: 'market' },
  { title: '母婴品类竞品监测', desc: '头部品牌营销策略与市场份额对比分析', hoverText: '点击查看市场洞察报告案例', image: '/placeholder.svg', miniTitle: '母婴品类竞品监测', targetId: 'brand-health', category: 'market' },
  { title: '3C数码品牌声量追踪', desc: '主流社交平台品牌提及量与情感分析', hoverText: '点击查看市场洞察报告案例', image: '/placeholder.svg', miniTitle: '3C数码品牌声量追踪', targetId: 'brand-health', category: 'market' },
  { title: '食品行业新品机会挖掘', desc: '基于消费趋势发现蓝海品类与创新方向', hoverText: '点击查看市场洞察报告案例', image: '/placeholder.svg', miniTitle: '食品行业新品机会挖掘', targetId: 'brand-health', category: 'market' },
  { title: '宠物经济市场全景分析', desc: '宠物消费升级趋势与细分赛道机会', hoverText: '点击查看市场洞察报告案例', image: '/placeholder.svg', miniTitle: '宠物经济市场全景分析', targetId: 'brand-health', category: 'market' },
  { title: '运动户外品牌对比研究', desc: '头部运动品牌定位策略与用户心智分析', hoverText: '点击查看市场洞察报告案例', image: '/placeholder.svg', miniTitle: '运动户外品牌对比研究', targetId: 'brand-health', category: 'market' },
  // 策划方案
  { title: 'TikTok 爆款方案实战', desc: '从选题到脚本到素材清单，完整可执行方案', hoverText: '点击查看策划方案案例', image: '/placeholder.svg', miniTitle: 'TikTok 爆款方案实战', targetId: 'campaign-planner', category: 'campaign' },
  { title: '双十一整合营销方案', desc: '全渠道联动的促销策略与执行排期', hoverText: '点击查看策划方案案例', image: '/placeholder.svg', miniTitle: '双十一整合营销方案', targetId: 'campaign-planner', category: 'campaign' },
  { title: '新品上市推广计划', desc: '从预热到引爆的完整上市营销节奏', hoverText: '点击查看策划方案案例', image: '/placeholder.svg', miniTitle: '新品上市推广计划', targetId: 'campaign-planner', category: 'campaign' },
  { title: 'KOL 合作投放方案', desc: '达人筛选、内容共创与效果追踪一体化', hoverText: '点击查看策划方案案例', image: '/placeholder.svg', miniTitle: 'KOL 合作投放方案', targetId: 'campaign-planner', category: 'campaign' },
  { title: '品牌联名策划方案', desc: '跨界联名从选品到落地的完整执行手册', hoverText: '点击查看策划方案案例', image: '/placeholder.svg', miniTitle: '品牌联名策划方案', targetId: 'campaign-planner', category: 'campaign' },
  { title: '私域流量运营方案', desc: '从引流到转化的私域全链路运营策略', hoverText: '点击查看策划方案案例', image: '/placeholder.svg', miniTitle: '私域流量运营方案', targetId: 'campaign-planner', category: 'campaign' },
  { title: '节日营销活动策划', desc: '春节/中秋/圣诞等节点的创意营销方案', hoverText: '点击查看策划方案案例', image: '/placeholder.svg', miniTitle: '节日营销活动策划', targetId: 'campaign-planner', category: 'campaign' },
  { title: '直播带货策划方案', desc: '直播间选品、话术、节奏与复盘全流程', hoverText: '点击查看策划方案案例', image: '/placeholder.svg', miniTitle: '直播带货策划方案', targetId: 'campaign-planner', category: 'campaign' },
  // 图片生成
  { title: '电商场景图批量生成', desc: '一键生成多尺寸封面图、场景图与风格化素材', hoverText: '点击查看图片生成案例', image: '/placeholder.svg', miniTitle: '电商场景图批量生成', targetId: 'text-to-image', category: 'image' },
  { title: '社交媒体配图生成', desc: '适配各平台尺寸的品牌风格化配图', hoverText: '点击查看图片生成案例', image: '/placeholder.svg', miniTitle: '社交媒体配图生成', targetId: 'text-to-image', category: 'image' },
  { title: '产品主图风格迁移', desc: '参考竞品风格快速生成同系列产品图', hoverText: '点击查看图片生成案例', image: '/placeholder.svg', miniTitle: '产品主图风格迁移', targetId: 'text-to-image', category: 'image' },
  { title: '广告 Banner 智能设计', desc: '输入文案自动生成多版本广告横幅', hoverText: '点击查看图片生成案例', image: '/placeholder.svg', miniTitle: '广告 Banner 智能设计', targetId: 'text-to-image', category: 'image' },
  { title: '品牌视觉物料生成', desc: '名片、海报、宣传册等品牌物料批量生成', hoverText: '点击查看图片生成案例', image: '/placeholder.svg', miniTitle: '品牌视觉物料生成', targetId: 'text-to-image', category: 'image' },
  { title: '节日主题素材生成', desc: '春节/618/双11等节日风格素材自动生成', hoverText: '点击查看图片生成案例', image: '/placeholder.svg', miniTitle: '节日主题素材生成', targetId: 'text-to-image', category: 'image' },
  { title: 'AI 模特换装生成', desc: '同一产品搭配不同模特与场景的换装图', hoverText: '点击查看图片生成案例', image: '/placeholder.svg', miniTitle: 'AI 模特换装生成', targetId: 'text-to-image', category: 'image' },
  { title: '详情页图文排版', desc: '自动生成符合平台规范的详情页图文', hoverText: '点击查看图片生成案例', image: '/placeholder.svg', miniTitle: '详情页图文排版', targetId: 'text-to-image', category: 'image' },
  // 视频生成
  { title: '短视频素材智能生成', desc: '从脚本到分镜到成片，AI 辅助视频全流程', hoverText: '点击查看视频生成案例', image: '/placeholder.svg', miniTitle: '短视频素材智能生成', targetId: 'reference-to-video', category: 'video' },
  { title: '产品展示视频生成', desc: '商品 360° 展示与卖点解说视频', hoverText: '点击查看视频生成案例', image: '/placeholder.svg', miniTitle: '产品展示视频生成', targetId: 'reference-to-video', category: 'video' },
  { title: '口播视频脚本转片', desc: '输入文案自动生成带字幕的口播视频', hoverText: '点击查看视频生成案例', image: '/placeholder.svg', miniTitle: '口播视频脚本转片', targetId: 'reference-to-video', category: 'video' },
  { title: '爆款视频风格复刻', desc: '参考热门视频风格快速生成同类内容', hoverText: '点击查看视频生成案例', image: '/placeholder.svg', miniTitle: '爆款视频风格复刻', targetId: 'reference-to-video', category: 'video' },
  { title: '产品开箱视频生成', desc: '自动生成产品开箱与体验分享视频', hoverText: '点击查看视频生成案例', image: '/placeholder.svg', miniTitle: '产品开箱视频生成', targetId: 'reference-to-video', category: 'video' },
  { title: '品牌故事视频制作', desc: '将品牌理念转化为感染力短视频', hoverText: '点击查看视频生成案例', image: '/placeholder.svg', miniTitle: '品牌故事视频制作', targetId: 'reference-to-video', category: 'video' },
  { title: '教程类视频自动生成', desc: '产品使用教程与技巧分享视频', hoverText: '点击查看视频生成案例', image: '/placeholder.svg', miniTitle: '教程类视频自动生成', targetId: 'reference-to-video', category: 'video' },
  { title: '多语言视频本地化', desc: '一键将视频翻译配音适配多个市场', hoverText: '点击查看视频生成案例', image: '/placeholder.svg', miniTitle: '多语言视频本地化', targetId: 'reference-to-video', category: 'video' },
];
