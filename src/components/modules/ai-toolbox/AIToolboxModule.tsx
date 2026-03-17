import { useEffect, useMemo, useState } from 'react';
import { TextToImage } from './TextToImage';
import { AppPlaza } from './AppPlaza';
import { BrandHealth } from './BrandHealth';
import { VideoReplication } from './VideoReplication';
import { ReplicateWorkspace } from './ReplicateWorkspace';
import { SkillsModule } from '@/components/modules/skills/SkillsModule';
import { TikTokReport } from './TikTokReport';
import { CampaignPlanner } from './CampaignPlanner';

interface AIToolboxModuleProps {
  activeItem: string;
  onNavigate: (itemId: string) => void;
}

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center py-20 animate-fade-in">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export function AIToolboxModule({ activeItem, onNavigate }: AIToolboxModuleProps) {
  const [keepSkillsMounted, setKeepSkillsMounted] = useState(false);

  useEffect(() => {
    if (activeItem === 'skills') setKeepSkillsMounted(true);
  }, [activeItem]);

  const mainView = useMemo(() => {
    switch (activeItem) {
      case 'app-plaza':
        return <AppPlaza onNavigate={onNavigate} />;
      case 'brand-health':
        return <BrandHealth onNavigate={onNavigate} />;
      case 'campaign-planner':
        return <CampaignPlanner />;
      case 'text-to-image':
        return <TextToImage onNavigate={onNavigate} />;
      case 'text-to-video':
        return <PlaceholderPage title="文生视频" description="根据文字描述生成短视频。" />;
      case 'replicate-video':
        return <ReplicateWorkspace onNavigate={onNavigate} />;
      case 'reference-to-video':
        return <VideoReplication onNavigate={onNavigate} />;
      case 'tiktok-report':
        return <TikTokReport onNavigate={onNavigate} />;
      case 'skills':
        return null;
      default:
        return <AppPlaza onNavigate={onNavigate} />;
    }
  }, [activeItem, onNavigate]);

  const showSkills = activeItem === 'skills';

  return (
    <>
      {!showSkills && mainView}
      {(keepSkillsMounted || showSkills) && (
        <div className={showSkills ? 'block' : 'hidden'} aria-hidden={!showSkills}>
          <SkillsModule />
        </div>
      )}
    </>
  );
}
