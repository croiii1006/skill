import { Bell, Settings, ChevronDown, BarChart3, MessageSquare, Wand2, Globe, Database } from 'lucide-react';
import logoDark from '@/assets/logo_dark.svg';
import { useModule } from '@/contexts/ModuleContext';
import { MODULES, ModuleType } from '@/types/modules';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { MemoryLibraryDrawer } from '@/components/modules/memory/MemoryLibraryDrawer';
import { useMemory } from '@/contexts/MemoryContext';

const moduleIcons: Record<ModuleType, React.ReactNode> = {
  'geo-insights': <BarChart3 className="w-4 h-4" />,
  'llm-console': <MessageSquare className="w-4 h-4" />,
  'ai-toolbox': <Wand2 className="w-4 h-4" />
};

const moduleKeys: Record<ModuleType, string> = {
  'geo-insights': 'geoInsights',
  'llm-console': 'llmConsole',
  'ai-toolbox': 'aiToolbox'
};

export function TopNav() {
  const { activeModule, setActiveModule } = useModule();
  const { t, i18n } = useTranslation();
  const { drawerOpen, setDrawerOpen } = useMemory();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
    <header className="h-14 border-b border-border/10 bg-background/20 backdrop-blur-xl flex items-center justify-between px-4 top-0 z-50 fixed left-0 w-screen">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <img src={logoDark} alt="Oran Gen" className="w-6 h-6 object-fill" />
        <span className="text-lg font-normal">Oran Gen</span>
      </div>

      {/* Center: Module Switcher */}

      {/* Right: User Actions */}
      <div className="flex items-center gap-2">
        {/* Memory Library */}
        <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/10 flex items-center gap-1.5"
            onClick={() => setDrawerOpen(true)}>
            
          <Database className="w-4 h-4" />
          <span className="text-xs font-medium">{t('common.memoryLibrary')}</span>
        </Button>

        {/* Language Switcher */}
        <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/10 flex items-center gap-1"
            onClick={toggleLanguage}>
            
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium">{i18n.language === 'zh' ? '中文' : 'EN'}</span>
        </Button>

        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 hover:bg-foreground/10">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>{t('common.billing')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t('common.logout')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    <MemoryLibraryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>);

}