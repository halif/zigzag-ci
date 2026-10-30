import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { FreestyleJob, FreestyleRun, BuildStepItem, JobParameter } from '../../types/cicd';
import { TerminalLogViewer } from '../pipelines/TerminalLogViewer';
import {
  Wrench,
  Play,
  ArrowLeft,
  Server,
  Layers,
  Sliders,
  FolderTree,
  FileCode,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react';

export const FreestyleJobDetail: React.FC = () => {
  const {
    selectedFreestyleJob,
    setSelectedFreestyleJob,
    freestyleRuns,
    selectedFreestyleRun,
    setSelectedFreestyleRun,
    triggerFreestyleJob,
    saveFreestyleJob,
    setView,
    agents,
    lang,
  } = useCiCd();

  const [activeTab, setActiveTab] = useState<'run' | 'logs' | 'workspace' | 'history' | 'configure'>('run');

  // Form states for configuration
  const [jobName, setJobName] = useState(selectedFreestyleJob?.name || 'custom-shell-task');
  const [description, setDescription] = useState(
    selectedFreestyleJob?.description || 'Custom shell execution and automation task.'
  );
  const [runnerNode, setRunnerNode] = useState(selectedFreestyleJob?.runnerNode || 'worker-linux-x86-01');
  const [buildSteps, setBuildSteps] = useState<BuildStepItem[]>(
    selectedFreestyleJob?.buildSteps || [
      {
        id: 's1',
        name: 'Echo Hello',
        type: 'shell',
        command: 'echo "Hello from Freestyle Job on node ${HOSTNAME}"',
        enabled: true,
      },
    ]
  );
  const [parameters, setParameters] = useState<JobParameter[]>(
    selectedFreestyleJob?.parameters || [
      {
        id: 'p1',
        name: 'ENVIRONMENT',
        type: 'choice',
        defaultValue: 'staging',
        description: 'Target deployment environment',
        choices: ['dev', 'staging', 'production'],
      },
    ]
  );

  // Parameter values for immediate execution
  const [executionParams, setExecutionParams] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {};
    if (selectedFreestyleJob) {
      selectedFreestyleJob.parameters.forEach((p) => {
        initial[p.name] = p.type === 'boolean' ? p.defaultValue === 'true' : p.defaultValue;
      });
    }
    return initial;
  });

  const [saveAlert, setSaveAlert] = useState(false);

  // If creating new or none selected
  const isNewJob = !selectedFreestyleJob;

  const jobRuns = freestyleRuns.filter((r) => r.jobId === selectedFreestyleJob?.id);
  const currentRun =
    (selectedFreestyleRun && selectedFreestyleRun.jobId === selectedFreestyleJob?.id
      ? selectedFreestyleRun
      : null) || jobRuns[0];

  const handleLaunch = () => {
    if (selectedFreestyleJob) {
      triggerFreestyleJob(selectedFreestyleJob.id, executionParams);
      setActiveTab('logs');
    }
  };

  const handleSaveConfig = () => {
    const updated: FreestyleJob = {
      id: selectedFreestyleJob?.id || `fjob-${jobName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: jobName,
      description,
      runnerNode,
      parameters,
      buildSteps,
      postBuildActions: selectedFreestyleJob?.postBuildActions || [],
      totalRuns: selectedFreestyleJob?.totalRuns || 0,
      successRate: selectedFreestyleJob?.successRate || 100,
      avgDurationSec: selectedFreestyleJob?.avgDurationSec || 30,
      workspaceFiles: selectedFreestyleJob?.workspaceFiles || [
        { name: 'execution.log', size: '4.2 KB', updatedAt: 'Just now' },
      ],
      updatedAt: new Date().toISOString(),
    };

    saveFreestyleJob(updated);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2000);
    setActiveTab('run');
  };

  const handleAddStep = () => {
    setBuildSteps([
      ...buildSteps,
      {
        id: `bs-${Date.now()}`,
        name: `Шаг ${buildSteps.length + 1}`,
        type: 'shell',
        command: 'echo "Executing step command"',
        enabled: true,
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setBuildSteps(buildSteps.filter((_, i) => i !== index));
  };

  const handleAddParam = () => {
    setParameters([
      ...parameters,
      {
        id: `p-${Date.now()}`,
        name: `PARAM_${parameters.length + 1}`,
        type: 'string',
        defaultValue: 'value',
        description: 'Parameter description',
      },
    ]);
  };

  const handleRemoveParam = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('freestyle-jobs')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {lang === 'ru' ? 'Фристайл Джобы' : 'Freestyle Projects'}
              </span>
              <span className="text-slate-600">/</span>
              <h2 className="text-lg font-bold text-white font-mono">
                {selectedFreestyleJob ? selectedFreestyleJob.name : 'Новая джоба'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedFreestyleJob?.description || 'Конфигурация последовательных шагов сборки'}
            </p>
          </div>
        </div>

        {selectedFreestyleJob && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunch}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'ru' ? 'Запустить сборку' : 'Build Now'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('run')}
          className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'run'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>{lang === 'ru' ? 'Запуск и Шаги' : 'Execution & Steps'}</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>{lang === 'ru' ? 'Консоль (Console Logs)' : 'Console Logs'}</span>
          {currentRun && (
            <span className="font-mono text-[10px] text-slate-500 tabular-nums">
              (#{currentRun.runNumber})
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'workspace'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>{lang === 'ru' ? 'Файлы Workspace' : 'Workspace Files'}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{lang === 'ru' ? 'История сборок' : 'Build History'}</span>
          <span className="font-mono text-[10px] text-slate-500 tabular-nums">
            ({jobRuns.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('configure')}
          className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'configure'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>{lang === 'ru' ? 'Конфигурация' : 'Configure'}</span>
        </button>
      </div>

      {/* Tab 1: Run & Steps Overview */}
      {activeTab === 'run' && selectedFreestyleJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Execution Parameters Form */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">
                    {lang === 'ru' ? 'Параметры запуска задачи' : 'Job Execution Parameters'}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Runner: {selectedFreestyleJob.runnerNode}
                </span>
              </div>

              {selectedFreestyleJob.parameters.length === 0 ? (
                <div className="py-4 text-xs text-slate-400">
                  {lang === 'ru'
                    ? 'У этой задачи нет параметров. Она будет выполнена со стандартными значениями.'
                    : 'This job has no configurable parameters.'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedFreestyleJob.parameters.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold font-mono text-amber-300">
                          {p.name}
                        </label>
                        <span className="text-[10px] uppercase font-mono text-slate-500">
                          {p.type}
                        </span>
                      </div>

                      {p.description && (
                        <p className="text-[11px] text-slate-400">{p.description}</p>
                      )}

                      {p.type === 'choice' && p.choices ? (
                        <select
                          value={String(executionParams[p.name] ?? p.defaultValue)}
                          onChange={(e) =>
                            setExecutionParams({ ...executionParams, [p.name]: e.target.value })
                          }
                          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        >
                          {p.choices.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : p.type === 'boolean' ? (
                        <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={Boolean(
                              executionParams[p.name] ?? p.defaultValue === 'true'
                            )}
                            onChange={(e) =>
                              setExecutionParams({
                                ...executionParams,
                                [p.name]: e.target.checked,
                              })
                            }
                            className="rounded border-amber-500 text-amber-500 focus:ring-0"
                          />
                          <span>{p.name} (enabled)</span>
                        </label>
                      ) : (
                        <input
                          type="text"
                          value={String(executionParams[p.name] ?? p.defaultValue)}
                          onChange={(e) =>
                            setExecutionParams({ ...executionParams, [p.name]: e.target.value })
                          }
                          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleLaunch}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{lang === 'ru' ? 'Запустить сборку прямо сейчас' : 'Trigger Execution'}</span>
                </button>
              </div>
            </div>

            {/* Build Steps sequence preview */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">
                    {lang === 'ru' ? 'Последовательность шагов (Build Steps)' : 'Build Steps'}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedFreestyleJob.buildSteps.length} steps configured
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {selectedFreestyleJob.buildSteps.map((step, idx) => (
                  <div key={step.id} className="py-2.5 flex items-start gap-3">
                    <span className="w-5 h-5 rounded bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[11px] text-amber-400 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200">{step.name}</div>
                      <div className="mt-1 p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-cyan-300 break-all">
                        $ {step.command}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Quick Status & Workspace Files Summary */}
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {lang === 'ru' ? 'Статус последней сборки' : 'Last Build Status'}
              </h4>

              {selectedFreestyleJob.lastRun ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-white">
                      #{selectedFreestyleJob.lastRun.runNumber}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedFreestyleJob.lastRun.status}</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{selectedFreestyleJob.lastRun.durationSeconds}s duration</span>
                    <span>·</span>
                    <span>{selectedFreestyleJob.lastRun.finishedAt}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  {lang === 'ru' ? 'Еще не запускалась' : 'Never executed'}
                </div>
              )}
            </div>

            {/* Quick Workspace overview */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Workspace</span>
                </h4>
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  {lang === 'ru' ? 'Открыть все' : 'View all'}
                </button>
              </div>

              <div className="divide-y divide-slate-800/80 text-xs font-mono">
                {selectedFreestyleJob.workspaceFiles?.map((f) => (
                  <div key={f.name} className="py-2 flex items-center justify-between">
                    <span className="text-slate-300 truncate max-w-[140px]">{f.name}</span>
                    <span className="text-slate-500 text-[11px] tabular-nums">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Console Logs Output */}
      {activeTab === 'logs' && (
        <div className="flex flex-col gap-4">
          {currentRun ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400">
                    Сборка #{currentRun.runNumber}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 font-mono">
                    {currentRun.durationSeconds}s duration
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentRun.status === 'running' && (
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Выполняется...</span>
                    </span>
                  )}
                  {currentRun.status === 'success' && (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Успешно завершена</span>
                    </span>
                  )}
                </div>
              </div>

              <TerminalLogViewer
                logs={currentRun.logs}
                lang={lang}
                isRunning={currentRun.status === 'running'}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 border border-slate-800 rounded-xl">
              {lang === 'ru'
                ? 'Нет данных консоли. Запустите джобу, чтобы увидеть живой стриминг выполнения.'
                : 'No console logs yet. Trigger a run to watch live execution.'}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Workspace Files */}
      {activeTab === 'workspace' && selectedFreestyleJob && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>Рабочая директория (Workspace Explorer)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                /var/lib/zigzag-runner/workspace/{selectedFreestyleJob.name}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            {selectedFreestyleJob.workspaceFiles?.map((file) => (
              <div
                key={file.name}
                className="p-3.5 flex items-center justify-between hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-mono font-semibold text-xs text-slate-200">
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Обновлен: {file.updatedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {file.size}
                  </span>
                  <button
                    onClick={() => alert(`Загрузка файла: ${file.name}`)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: History */}
      {activeTab === 'history' && (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Сборка</th>
                  <th className="py-3 px-4">Статус</th>
                  <th className="py-3 px-4">Параметры</th>
                  <th className="py-3 px-4">Время запуска</th>
                  <th className="py-3 px-4 text-right">Длительность</th>
                  <th className="py-3 px-4 text-right">Логи</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {jobRuns.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => {
                      setSelectedFreestyleRun(r);
                      setActiveTab('logs');
                    }}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      #{r.runNumber}
                    </td>
                    <td className="py-3 px-4">
                      {r.status === 'success' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Success</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                      {JSON.stringify(r.paramsUsed)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(r.startedAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {r.durationSeconds}s
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700">
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Configuration Editor */}
      {activeTab === 'configure' && (
        <div className="flex flex-col gap-6">
          {/* General settings */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm">
              {lang === 'ru' ? 'Основные свойства проекта' : 'General Configuration'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'ru' ? 'Имя джобы' : 'Job Name'}
                </label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'ru' ? 'Runner Агент' : 'Assigned Runner'}
                </label>
                <select
                  value={runnerNode}
                  onChange={(e) => setRunnerNode(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.arch})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'ru' ? 'Описание' : 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>

          {/* Parameters configuration */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  {lang === 'ru' ? 'Параметры сборки (This project is parameterized)' : 'Parameters'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ru'
                    ? 'Задайте переменные, которые можно выбирать перед каждым запуском'
                    : 'Configure parameters customizable before every run'}
                </p>
              </div>

              <button
                onClick={handleAddParam}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить параметр</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {parameters.map((param, pIdx) => (
                <div
                  key={param.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
                >
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => {
                      const updated = [...parameters];
                      updated[pIdx].name = e.target.value;
                      setParameters(updated);
                    }}
                    placeholder="PARAM_NAME"
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                  />

                  <select
                    value={param.type}
                    onChange={(e) => {
                      const updated = [...parameters];
                      updated[pIdx].type = e.target.value as any;
                      setParameters(updated);
                    }}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                  >
                    <option value="string">String Parameter</option>
                    <option value="choice">Choice Parameter</option>
                    <option value="boolean">Boolean Checkbox</option>
                  </select>

                  <input
                    type="text"
                    value={param.defaultValue}
                    onChange={(e) => {
                      const updated = [...parameters];
                      updated[pIdx].defaultValue = e.target.value;
                      setParameters(updated);
                    }}
                    placeholder="Default Value"
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                  />

                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => handleRemoveParam(pIdx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Build steps builder */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  {lang === 'ru' ? 'Шаги сборки (Build Steps - Execute Shell / Script)' : 'Build Steps'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ru'
                    ? 'Команды bash/shell, которые последовательно выполняются в окружении раннера'
                    : 'Shell instructions executed sequentially in runner workspace'}
                </p>
              </div>

              <button
                onClick={handleAddStep}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить Shell шаг</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {buildSteps.map((step, sIdx) => (
                <div
                  key={step.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        Step {sIdx + 1}:
                      </span>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => {
                          const updated = [...buildSteps];
                          updated[sIdx].name = e.target.value;
                          setBuildSteps(updated);
                        }}
                        className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-semibold"
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveStep(sIdx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-mono">
                      Command (Shell script):
                    </label>
                    <textarea
                      value={step.command}
                      onChange={(e) => {
                        const updated = [...buildSteps];
                        updated[sIdx].command = e.target.value;
                        setBuildSteps(updated);
                      }}
                      rows={2}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-cyan-300 font-mono focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-end gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            {saveAlert && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Сохранено!</span>
              </span>
            )}
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Сохранить конфигурацию джобы' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
