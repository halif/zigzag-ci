import React from 'react';
import { useCiCd } from '../context/CiCdContext';
import { PilotScarfLogo } from './common/PilotScarfLogo';
import {
  Layers,
  History,
  Server,
  KeyRound,
  BarChart3,
  FileCode,
  Webhook,
  Activity,
  Compass,
  Wrench,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { view, setView, runs, agents, freestyleJobs, setSelectedPipeline, setSelectedFreestyleJob, lang } = useCiCd();

  const runningCount = runs.filter((r) => r.status === 'running').length;
  const waitingApprovalCount = runs.filter((r) => r.status === 'paused').length;

  interface SidebarMenuItem {
    id: string;
    labelRu: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }

  const menuItems: SidebarMenuItem[] = [
    {
      id: 'pipelines',
      labelRu: 'Пайплайны',
      labelEn: 'Pipelines',
      icon: Layers,
    },
    {
      id: 'freestyle-jobs',
      labelRu: 'Фристайл Джобы',
      labelEn: 'Freestyle Jobs',
      icon: Wrench,
      badge: freestyleJobs.length,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    {
      id: 'runs-history',
      labelRu: 'История сборок',
      labelEn: 'Build Runs',
      icon: History,
      badge: runningCount > 0 ? runningCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'agent-nodes',
      labelRu: 'Агенты сборки',
      labelEn: 'Runners / Nodes',
      icon: Server,
    },
    {
      id: 'secrets',
      labelRu: 'Сейф секретов',
      labelEn: 'Secrets Vault',
      icon: KeyRound,
    },
    {
      id: 'metrics',
      labelRu: 'Метрики DORA',
      labelEn: 'DORA Metrics',
      icon: BarChart3,
    },
    {
      id: 'pipeline-editor',
      labelRu: 'Редактор пайплайнов',
      labelEn: 'Pipeline Editor',
      icon: FileCode,
    },
    {
      id: 'webhooks',
      labelRu: 'Вебхуки и Git',
      labelEn: 'Webhooks & Git',
      icon: Webhook,
    },
  ];

  const totalExecutors = agents.reduce((acc, a) => acc + a.totalExecutors, 0);
  const usedExecutors = agents.reduce((acc, a) => acc + a.usedExecutors, 0);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none hidden md:flex">
      {/* Navigation menu */}
      <div className="p-4 flex flex-col gap-1">
        {/* Pilot Aviator badge header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <img
            src="/src/assets/images/zigzag_pilot_scarf_emblem_1792796892247.jpg"
            alt="Зигзаг Авиатор Шарф"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-lg object-cover border border-amber-500/30 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>{lang === 'ru' ? 'Зигзаг CI' : 'Zigzag CI'}</span>
              <span className="text-[10px] font-mono text-amber-400 font-semibold">v2.4</span>
            </div>
            <div className="text-[10px] text-amber-300/80 truncate">
              {lang === 'ru' ? 'Любой билд взлетит!' : 'Ready for takeoff'}
            </div>
          </div>
        </div>

        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5">
          {lang === 'ru' ? 'Навигация полетов' : 'Flight Deck'}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            view === item.id || (item.id === 'pipelines' && view === 'pipeline-detail');

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'pipeline-editor' && view !== 'pipeline-editor') {
                  setSelectedPipeline(null);
                }
                setView(item.id as any);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-amber-500/15 text-white border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>{lang === 'ru' ? item.labelRu : item.labelEn}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border tabular-nums ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {waitingApprovalCount > 0 && (
          <div className="mt-2 mx-1 p-2.5 bg-amber-950/40 border border-amber-600/50 rounded-lg text-xs text-amber-200">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{lang === 'ru' ? `Ожидает одобрения (${waitingApprovalCount})` : `Approval Gate (${waitingApprovalCount})`}</span>
            </div>
            <p className="text-[11px] text-amber-300/80 mt-1">
              {lang === 'ru' ? 'Шлюз ручного подтверждения релиза' : 'Manual release gate pending authorization'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom cluster telemetry info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-3 rounded-xl border">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-slate-300">
              {lang === 'ru' ? 'Пул воркеров' : 'Runner Fleet'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400">
            {agents.length} {lang === 'ru' ? 'нод' : 'nodes'}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Исполнители:</span>
            <span className="text-slate-300 tabular-nums font-semibold">
              {usedExecutors} / {totalExecutors}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${(usedExecutors / (totalExecutors || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-3 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <span>Зигзаг CI · Aviator</span>
          <span className="text-emerald-400">К взлету готов</span>
        </div>
      </div>
    </aside>
  );
};
