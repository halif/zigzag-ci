import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { FreestyleJob, BuildStatus } from '../../types/cicd';
import {
  Wrench,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Search,
  Server,
  Layers,
  FileText,
  Sliders,
  ArrowUpRight,
  FolderTree,
} from 'lucide-react';

export const FreestyleJobList: React.FC = () => {
  const {
    freestyleJobs,
    setSelectedFreestyleJob,
    setView,
    triggerFreestyleJob,
    searchQuery,
    setSearchQuery,
    lang,
  } = useCiCd();

  const [activeParamJob, setActiveParamJob] = useState<FreestyleJob | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string | boolean>>({});

  const filteredJobs = freestyleJobs.filter((job) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        job.name.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.runnerNode.toLowerCase().includes(q)
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
        return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleOpenParamModal = (job: FreestyleJob) => {
    const defaults: Record<string, string | boolean> = {};
    job.parameters.forEach((p) => {
      defaults[p.name] = p.type === 'boolean' ? p.defaultValue === 'true' : p.defaultValue;
    });
    setParamValues(defaults);
    setActiveParamJob(job);
  };

  const handleLaunchWithParams = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeParamJob) {
      triggerFreestyleJob(activeParamJob.id, paramValues);
      setActiveParamJob(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {lang === 'ru' ? 'Фристайл Джобы (Freestyle Projects)' : 'Freestyle Jobs & Tasks'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ru'
              ? 'Классические настраиваемые задачи в стиле Jenkins и GitHub: последовательные shell-шаги, параметры сборки, работа с артефактами и пост-билд действиями.'
              : 'Classic configurable tasks: sequential shell build steps, custom parameters, workspace inspection, and post-build actions.'}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedFreestyleJob(null);
            setView('freestyle-detail'); // will trigger new job form
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Создать Freestyle Джобу' : 'New Freestyle Job'}</span>
        </button>
      </div>

      {/* Search and summary strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={lang === 'ru' ? 'Поиск джоб по имени или воркеру...' : 'Search freestyle jobs...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="tabular-nums font-mono">
            {filteredJobs.length} {lang === 'ru' ? 'джоб настроено' : 'jobs configured'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-medium">100% shell & script support</span>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex flex-col gap-3">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl">
            <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-300 font-medium text-sm">
              {lang === 'ru' ? 'Фристайл джобы не найдены' : 'No freestyle jobs found'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {lang === 'ru'
                ? 'Создайте первую задачу для выполнения shell-скриптов, бэкапов или миграций.'
                : 'Create your first job to execute shell commands, backups, or migrations.'}
            </div>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const lastRun = job.lastRun;
            return (
              <div
                key={job.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 transition-all shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 group"
              >
                {/* Left job info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <button
                      onClick={() => {
                        setSelectedFreestyleJob(job);
                        setView('freestyle-detail');
                      }}
                      className="text-base font-bold text-white hover:text-amber-300 transition-colors text-left truncate cursor-pointer font-mono"
                    >
                      {job.name}
                    </button>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <Server className="w-3 h-3" />
                        {job.runnerNode}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                    {job.description}
                  </p>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                      <Sliders className="w-3 h-3 text-amber-400" />
                      <span>
                        {job.parameters.length} {lang === 'ru' ? 'параметров' : 'parameters'}
                      </span>
                    </span>

                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>
                        {job.buildSteps.length} {lang === 'ru' ? 'шагов сборки' : 'build steps'}
                      </span>
                    </span>

                    {job.workspaceFiles && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                        <FolderTree className="w-3 h-3 text-emerald-400" />
                        <span>
                          {job.workspaceFiles.length} {lang === 'ru' ? 'файлов в workspace' : 'files in workspace'}
                        </span>
                      </span>
                    )}

                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-[11px] tabular-nums font-mono">
                      {job.totalRuns} {lang === 'ru' ? 'запусков' : 'runs'}
                    </span>
                  </div>
                </div>

                {/* Center / Status */}
                <div className="flex items-center gap-6 py-2 lg:py-0 border-t lg:border-t-0 border-slate-800/80">
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(lastRun?.status)}
                      <span className="text-xs font-semibold text-slate-200">
                        {lastRun ? `#${lastRun.runNumber}` : 'Idle'}
                      </span>
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

                  <div className="hidden sm:flex flex-col gap-1 text-right min-w-[90px]">
                    <span className="text-xs text-slate-500">Успешность</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-emerald-400">
                      {job.successRate}%
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/80">
                  <button
                    onClick={() => handleOpenParamModal(job)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'ru' ? 'Собрать с параметрами' : 'Build with Parameters'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFreestyleJob(job);
                      setView('freestyle-detail');
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700/70 transition-colors cursor-pointer"
                  >
                    <span>{lang === 'ru' ? 'Workspace & Конфиг' : 'Workspace'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Parameterized Launch Modal */}
      {activeParamJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleLaunchWithParams}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base font-mono">
                  {activeParamJob.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'ru' ? 'Параметры выполнения задачи (Jenkins-style Build)' : 'Execution Parameters'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveParamJob(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 py-1 max-h-96 overflow-y-auto">
              {activeParamJob.parameters.map((param) => (
                <div key={param.id} className="flex flex-col gap-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <label className="text-xs font-bold text-slate-200 font-mono">
                    {param.name}
                  </label>
                  {param.description && (
                    <span className="text-[11px] text-slate-400 mb-1">
                      {param.description}
                    </span>
                  )}

                  {param.type === 'choice' && param.choices ? (
                    <select
                      value={String(paramValues[param.name] ?? param.defaultValue)}
                      onChange={(e) =>
                        setParamValues({ ...paramValues, [param.name]: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    >
                      {param.choices.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : param.type === 'boolean' ? (
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(paramValues[param.name] ?? param.defaultValue === 'true')}
                        onChange={(e) =>
                          setParamValues({ ...paramValues, [param.name]: e.target.checked })
                        }
                        className="rounded border-amber-500 text-amber-500 focus:ring-0"
                      />
                      <span>Включить опцию</span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={String(paramValues[param.name] ?? param.defaultValue)}
                      onChange={(e) =>
                        setParamValues({ ...paramValues, [param.name]: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveParamJob(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'ru' ? 'Запустить сейчас' : 'Start Build'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
