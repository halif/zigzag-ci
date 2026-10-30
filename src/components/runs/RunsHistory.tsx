import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { BuildRun, BuildStatus } from '../../types/cicd';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  GitBranch,
  GitCommit,
  RotateCcw,
  Search,
  Filter,
  ArrowUpRight,
  Server,
  StopCircle,
} from 'lucide-react';

export const RunsHistory: React.FC = () => {
  const { runs, pipelines, setSelectedRun, setSelectedPipeline, setView, reRunBuild, cancelBuild, lang } =
    useCiCd();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pipelineFilter, setPipelineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRuns = runs.filter((run) => {
    if (statusFilter !== 'all' && run.status !== statusFilter) return false;
    if (pipelineFilter !== 'all' && run.pipelineId !== pipelineFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        run.pipelineName.toLowerCase().includes(q) ||
        run.commit.message.toLowerCase().includes(q) ||
        run.commit.shortHash.toLowerCase().includes(q) ||
        run.commit.author.name.toLowerCase().includes(q) ||
        run.runNumber.toString().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: BuildStatus) => {
    switch (status) {
      case 'success':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Running</span>
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Waiting Approval</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const handleOpenRun = (run: BuildRun) => {
    setSelectedRun(run);
    const matchedPipeline = pipelines.find((p) => p.id === run.pipelineId) || null;
    setSelectedPipeline(matchedPipeline);
    setView('pipeline-detail');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            {lang === 'ru' ? 'История запусков и сборок' : 'Build Runs History'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ru'
              ? 'Полный аудит логов, результатов тестирования и артефактов всех пайплайнов'
              : 'Complete run audit logs, test outcomes, and artifact registry'}
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={lang === 'ru' ? 'Поиск по коммиту, автору, номеру...' : 'Search runs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-60 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Pipeline filter */}
          <select
            value={pipelineFilter}
            onChange={(e) => setPipelineFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="all">{lang === 'ru' ? 'Все пайплайны' : 'All Pipelines'}</option>
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'success' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'failed' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Failed
            </button>
            <button
              onClick={() => setStatusFilter('running')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'running' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-indigo-400'
              }`}
            >
              Running
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono tabular-nums">
          {filteredRuns.length} {lang === 'ru' ? 'записей' : 'runs found'}
        </span>
      </div>

      {/* High-density Runs Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 select-none">
              <tr>
                <th className="py-3 px-4">Сборка</th>
                <th className="py-3 px-4">Пайплайн</th>
                <th className="py-3 px-4">Статус</th>
                <th className="py-3 px-4">Коммит / Ветка</th>
                <th className="py-3 px-4">Автор</th>
                <th className="py-3 px-4">Нода</th>
                <th className="py-3 px-4 text-right">Длительность</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredRuns.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => handleOpenRun(run)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Run number */}
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400 tabular-nums">
                    #{run.runNumber}
                  </td>

                  {/* Pipeline name */}
                  <td className="py-3 px-4 font-semibold text-white">
                    {run.pipelineName}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">{getStatusBadge(run.status)}</td>

                  {/* Commit message & branch */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-slate-200 truncate font-medium">
                      {run.commit.message}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <GitBranch className="w-3 h-3" />
                        {run.branch}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">
                        {run.commit.shortHash}
                      </span>
                    </div>
                  </td>

                  {/* Author */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={run.commit.author.avatarUrl}
                        alt={run.commit.author.name}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span className="text-slate-300 truncate max-w-[110px]">
                        {run.commit.author.name}
                      </span>
                    </div>
                  </td>

                  {/* Runner Node */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3 text-slate-500" />
                      {run.runnerNode}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {run.durationSeconds}s
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {run.status === 'running' ? (
                        <button
                          onClick={() => cancelBuild(run.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded border border-rose-900 transition-colors"
                          title="Остановить"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => reRunBuild(run.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded border border-slate-800 transition-colors"
                          title="Перезапустить"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenRun(run)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                      >
                        <span>Логи</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
