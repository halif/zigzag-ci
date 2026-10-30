import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { Pipeline, BuildStatus } from '../../types/cicd';
import {
  Play,
  GitBranch,
  GitCommit,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Search,
  Filter,
  FileCode,
  ArrowUpRight,
  ExternalLink,
  Tag,
} from 'lucide-react';

export const PipelineList: React.FC = () => {
  const {
    pipelines,
    setSelectedPipeline,
    setView,
    openRunModal,
    lang,
    searchQuery,
    setSearchQuery,
  } = useCiCd();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const categories = [
    { id: 'all', labelRu: 'Все', labelEn: 'All' },
    { id: 'microservice', labelRu: 'Микросервисы', labelEn: 'Microservices' },
    { id: 'frontend', labelRu: 'Фронтенд', labelEn: 'Frontend' },
    { id: 'backend', labelRu: 'Бэкенд', labelEn: 'Backend' },
    { id: 'ai_data', labelRu: 'AI & Data', labelEn: 'AI & Data' },
  ];

  const filteredPipelines = pipelines.filter((pipe) => {
    if (categoryFilter !== 'all' && pipe.category !== categoryFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'success' && pipe.lastRun?.status !== 'success') return false;
      if (statusFilter === 'failed' && pipe.lastRun?.status !== 'failed') return false;
      if (statusFilter === 'running' && pipe.lastRun?.status !== 'running') return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        pipe.name.toLowerCase().includes(q) ||
        pipe.description.toLowerCase().includes(q) ||
        pipe.repository.toLowerCase().includes(q) ||
        pipe.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusIcon = (status?: BuildStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusText = (status?: BuildStatus) => {
    switch (status) {
      case 'success':
        return lang === 'ru' ? 'Успешно' : 'Success';
      case 'failed':
        return lang === 'ru' ? 'Ошибка' : 'Failed';
      case 'running':
        return lang === 'ru' ? 'Выполняется' : 'Running';
      default:
        return lang === 'ru' ? 'Не запускался' : 'Idle';
    }
  };

  const totalPipelines = pipelines.length;
  const healthyCount = pipelines.filter((p) => p.lastRun?.status === 'success').length;
  const runningCount = pipelines.filter((p) => p.lastRun?.status === 'running').length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Banner / Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">
            {lang === 'ru' ? 'Всего пайплайнов' : 'Total Pipelines'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {totalPipelines}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {healthyCount} {lang === 'ru' ? 'стабильных' : 'healthy'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">
            {lang === 'ru' ? 'Активные сборки' : 'Active Builds'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-400 flex items-center gap-2">
            <span>{runningCount}</span>
            {runningCount > 0 && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lang === 'ru' ? 'На 5 воркер-нодах' : 'Across 5 worker nodes'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">
            {lang === 'ru' ? 'Средний Success Rate' : 'Avg Success Rate'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            96.8%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lang === 'ru' ? 'За последние 14 дней' : 'Last 14 days'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">
            {lang === 'ru' ? 'Среднее время сборки' : 'Avg Run Duration'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            2м 18с
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {lang === 'ru' ? '↓ 14% с кэшированием' : '↓ 14% with layer cache'}
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={lang === 'ru' ? 'Поиск пайплайнов по имени, репозиторию, тегу...' : 'Search pipelines...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center bg-slate-950 border border-slate-800/90 rounded-lg p-0.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === c.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ru' ? c.labelRu : c.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Action: Create New Pipeline */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPipeline(null);
              setView('pipeline-editor');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Новый пайплайн' : 'New Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Pipelines List */}
      <div className="flex flex-col gap-3">
        {filteredPipelines.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl">
            <FileCode className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-300 font-medium text-sm">
              {lang === 'ru' ? 'Пайплайны не найдены' : 'No pipelines found'}
            </div>
            <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {lang === 'ru'
                ? 'Попробуйте изменить поисковый запрос или создайте новый проект.'
                : 'Try altering your search filters or construct a new pipeline.'}
            </div>
          </div>
        ) : (
          filteredPipelines.map((pipe) => {
            const lastRun = pipe.lastRun;
            return (
              <div
                key={pipe.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 transition-all shadow-sm hover:shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 group"
              >
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <button
                      onClick={() => {
                        setSelectedPipeline(pipe);
                        setView('pipeline-detail');
                      }}
                      className="text-base font-bold text-white hover:text-indigo-400 transition-colors text-left truncate cursor-pointer"
                    >
                      {pipe.name}
                    </button>

                    {/* Unboxed clean metadata separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>·</span>
                      <span className="font-mono text-slate-400">{pipe.repository}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <GitBranch className="w-3.5 h-3.5" />
                        {pipe.defaultBranch}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                    {pipe.description}
                  </p>

                  {/* Clean unboxed tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    {pipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-[11px]">
                      {pipe.stagesConfig.length} {lang === 'ru' ? 'стадий' : 'stages'}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-[11px] tabular-nums font-mono">
                      {pipe.totalRuns} {lang === 'ru' ? 'запусков' : 'runs'}
                    </span>
                  </div>
                </div>

                {/* Center / Last Run status */}
                <div className="flex items-center gap-6 py-2 lg:py-0 border-t lg:border-t-0 border-slate-800/80">
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(lastRun?.status)}
                      <span className="text-xs font-semibold text-slate-200">
                        {getStatusText(lastRun?.status)}
                      </span>
                      {lastRun && (
                        <span className="text-xs font-mono tabular-nums text-slate-400">
                          #{lastRun.runNumber}
                        </span>
                      )}
                    </div>
                    {lastRun && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 tabular-nums font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{lastRun.durationSeconds}s</span>
                        <span>·</span>
                        <span>{lastRun.finishedAt}</span>
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 text-right min-w-[100px]">
                    <span className="text-xs text-slate-500">Success Rate</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-emerald-400">
                      {pipe.successRate}%
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/80">
                  <button
                    onClick={() => {
                      setSelectedPipeline(pipe);
                      setView('pipeline-editor');
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                    title={lang === 'ru' ? 'Редактировать YAML / Граф' : 'Edit Pipeline Config'}
                  >
                    <FileCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openRunModal(pipe)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'ru' ? 'Собрать' : 'Build'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPipeline(pipe);
                      setView('pipeline-detail');
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700/70 transition-colors cursor-pointer"
                  >
                    <span>{lang === 'ru' ? 'Детали' : 'Details'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
