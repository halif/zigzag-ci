import React, { useState } from 'react';
import { useCiCd } from '../context/CiCdContext';
import { PilotScarfLogo } from './common/PilotScarfLogo';
import { OpenSourceModal } from './common/OpenSourceModal';
import { Play, Globe, Github } from 'lucide-react';

export const Header: React.FC = () => {
  const { view, setView, lang, setLang, openRunModal, pipelines, selectedPipeline } = useCiCd();
  const [isOpenSourceModalOpen, setIsOpenSourceModalOpen] = useState(false);

  const navItems = [
    { id: 'pipelines', labelRu: 'Пайплайны', labelEn: 'Pipelines' },
    { id: 'freestyle-jobs', labelRu: 'Фристайл', labelEn: 'Freestyle' },
    { id: 'runs-history', labelRu: 'История сборок', labelEn: 'Build Runs' },
    { id: 'agent-nodes', labelRu: 'Агенты', labelEn: 'Runners' },
    { id: 'metrics', labelRu: 'Метрики', labelEn: 'Metrics' },
  ] as const;

  const handlePrimaryAction = () => {
    const target = selectedPipeline || pipelines[0];
    if (target) {
      openRunModal(target);
    }
  };

  const brandName = lang === 'ru' ? 'Зигзаг CI' : 'Zigzag CI';

  return (
    <>
      <header className="flex items-center justify-between gap-8 px-6 py-3 bg-slate-900 border-b border-slate-800 shrink-0 select-none">
        {/* Zone 1: Brand Wordmark with Pilot Scarf Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setView('pipelines')}
            className="text-lg font-bold tracking-tight text-white hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-0.5 shadow-sm shadow-amber-500/10 group-hover:border-amber-400/50 transition-colors">
              <PilotScarfLogo className="w-6 h-6" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold">{brandName}</span>
              <span className="text-[11px] font-mono text-amber-400/90 font-medium">flight</span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive =
              view === item.id || (item.id === 'pipelines' && view === 'pipeline-detail');
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  isActive
                    ? 'text-amber-300 border-b-2 border-amber-500 font-semibold'
                    : 'hover:text-white text-slate-400'
                }`}
              >
                {lang === 'ru' ? item.labelRu : item.labelEn}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: GitHub Open Source + Language switcher + Primary Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsOpenSourceModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            title="Open Source & GitHub"
          >
            <Github className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">GitHub</span>
          </button>

          <button
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-slate-400 hover:text-amber-200 bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            title={lang === 'ru' ? 'Сменить язык' : 'Change language'}
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          <button
            onClick={handlePrimaryAction}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 transition-all active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'ru' ? 'Запустить сборку' : 'Trigger Run'}</span>
          </button>
        </div>
      </header>

      {/* Open Source Modal */}
      <OpenSourceModal
        isOpen={isOpenSourceModalOpen}
        onClose={() => setIsOpenSourceModalOpen(false)}
        lang={lang}
      />
    </>
  );
};
