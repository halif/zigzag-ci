import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { PipelineGraph } from './PipelineGraph';
import { TerminalLogViewer } from './TerminalLogViewer';
import {
  GitCommit,
  GitBranch,
  Clock,
  RotateCcw,
  StopCircle,
  Play,
  Download,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  ArrowLeft,
  Share2,
  Layers,
  Box,
} from 'lucide-react';

export const PipelineDetail: React.FC = () => {
  const {
    selectedPipeline,
    selectedRun,
    runs,
    setSelectedRun,
    setView,
    reRunBuild,
    cancelBuild,
    approveStage,
    rejectStage,
    openRunModal,
    lang,
  } = useCiCd();

  const [activeTab, setActiveTab] = useState<'logs' | 'artifacts' | 'tests' | 'yaml'>('logs');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  if (!selectedPipeline) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>{lang === 'ru' ? 'Пайплайн не выбран' : 'No pipeline selected'}</p>
        <button
          onClick={() => setView('pipelines')}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded text-xs"
        >
          {lang === 'ru' ? 'Вернуться к списку' : 'Return to list'}
        </button>
      </div>
    );
  }

  // Find latest or selected run
  const pipelineRuns = runs.filter((r) => r.pipelineId === selectedPipeline.id);
  const currentRun =
    (selectedRun && selectedRun.pipelineId === selectedPipeline.id ? selectedRun : null) ||
    pipelineRuns[0];

  const handleApprove = (stageId: string, notes?: string) => {
    if (currentRun) {
      approveStage(currentRun.id, stageId, notes);
    }
  };

  const handleReject = (stageId: string, notes?: string) => {
    if (currentRun) {
      rejectStage(currentRun.id, stageId, notes);
    }
  };

  const isCurrentRunActive = currentRun?.status === 'running';

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Breadcrumb & Run Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button
            onClick={() => setView('pipelines')}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Пайплайны' : 'Pipelines'}</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-white">{selectedPipeline.name}</span>
          {currentRun && (
            <>
              <span>/</span>
              <span className="font-mono text-indigo-400 font-bold">
                #{currentRun.runNumber}
              </span>
            </>
          )}
        </div>

        {/* Run Selector dropdown if multiple runs */}
        <div className="flex items-center gap-3">
          {pipelineRuns.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">{lang === 'ru' ? 'История запусков:' : 'Run:'}</span>
              <select
                value={currentRun?.id || ''}
                onChange={(e) => {
                  const target = pipelineRuns.find((r) => r.id === e.target.value);
                  if (target) setSelectedRun(target);
                }}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
              >
                {pipelineRuns.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.runNumber} - {r.branch} ({r.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => openRunModal(selectedPipeline)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'ru' ? 'Собрать снова' : 'Build Now'}</span>
          </button>
        </div>
      </div>

      {/* Run Metadata Card */}
      {currentRun ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-4 border-b border-slate-800/80">
            {/* Left: Commit info & Author */}
            <div className="flex items-start gap-4">
              <img
                src={currentRun.commit.author.avatarUrl}
                alt={currentRun.commit.author.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-base font-bold text-white">
                    {currentRun.commit.message}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">
                    {currentRun.commit.author.name}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-indigo-400">
                    <GitBranch className="w-3.5 h-3.5" />
                    {currentRun.branch}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <GitCommit className="w-3.5 h-3.5" />
                    {currentRun.commit.shortHash}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Server className="w-3.5 h-3.5" />
                    {currentRun.runnerNode}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Status and Timing Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex flex-col items-start lg:items-end gap-1">
                <div className="flex items-center gap-2">
                  {currentRun.status === 'success' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/80 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Сборка успешна' : 'Build Succeeded'}</span>
                    </span>
                  )}
                  {currentRun.status === 'failed' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/50 border border-rose-800/80 px-2.5 py-1 rounded-md">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Сборка провалена' : 'Build Failed'}</span>
                    </span>
                  )}
                  {currentRun.status === 'running' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/50 border border-indigo-700 px-2.5 py-1 rounded-md">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'ru' ? 'Сборка выполняется' : 'Executing Stages'}</span>
                    </span>
                  )}
                  {currentRun.status === 'paused' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/50 border border-amber-700 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Ожидает одобрения' : 'Approval Gate'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono tabular-nums">
                  <Clock className="w-3 h-3" />
                  <span>
                    {currentRun.durationSeconds}s duration
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {isCurrentRunActive ? (
                  <button
                    onClick={() => cancelBuild(currentRun.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Остановить' : 'Cancel'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => reRunBuild(currentRun.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Перезапустить' : 'Re-run'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DAG Pipeline Stages Visualization */}
          <div className="pt-4">
            <PipelineGraph
              stages={currentRun.stages}
              selectedStageId={selectedStageId}
              onSelectStage={(id) => setSelectedStageId(id)}
              onApprove={handleApprove}
              onReject={handleReject}
              lang={lang}
            />
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400">
          <p>{lang === 'ru' ? 'Для этого пайплайна еще нет запусков.' : 'No runs recorded for this pipeline yet.'}</p>
          <button
            onClick={() => openRunModal(selectedPipeline)}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded text-xs font-semibold cursor-pointer"
          >
            {lang === 'ru' ? 'Запустить первую сборку' : 'Start First Build'}
          </button>
        </div>
      )}

      {/* Tabs: Logs / Artifacts / Tests / YAML */}
      {currentRun && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Консольные логи' : 'Console Logs'}</span>
              <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                ({currentRun.logs.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('artifacts')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'artifacts'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Артефакты сборки' : 'Artifacts'}</span>
              <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                ({currentRun.artifacts.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tests'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Отчет о тестах' : 'Test Report'}</span>
              {currentRun.testResults && (
                <span className="font-mono text-[10px] text-emerald-400 tabular-nums">
                  ({currentRun.testResults.passed}/{currentRun.testResults.total})
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('yaml')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'yaml'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Конфигурация Pipeline' : 'Pipelinefile'}</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'logs' && (
            <TerminalLogViewer
              logs={currentRun.logs}
              stageFilter={selectedStageId}
              onClearStageFilter={() => setSelectedStageId(null)}
              lang={lang}
              isRunning={currentRun.status === 'running'}
            />
          )}

          {activeTab === 'artifacts' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              {currentRun.artifacts.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {lang === 'ru' ? 'В этой сборке еще не было сгенерировано артефактов' : 'No artifacts created in this run'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-slate-400 font-medium">
                    {lang === 'ru' ? 'Сгенерированные бинарные файлы и отчеты' : 'Generated bin files and test packages'}
                  </div>
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                    {currentRun.artifacts.map((art) => (
                      <div
                        key={art.id}
                        className="flex items-center justify-between p-3.5 hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Box className="w-4 h-4 text-indigo-400" />
                          <div>
                            <div className="text-xs font-semibold text-white font-mono">
                              {art.name}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span>{art.type}</span>
                              <span>·</span>
                              <span>{art.createdStage}</span>
                              <span>·</span>
                              <span className="font-mono">{art.path}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono tabular-nums text-slate-400">
                            {formatFileSize(art.sizeBytes)}
                          </span>
                          <button
                            onClick={() => {
                              alert(`Загрузка артефакта: ${art.name}`);
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{lang === 'ru' ? 'Скачать' : 'Download'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              {currentRun.testResults ? (
                <div className="flex flex-col gap-6">
                  {/* Test metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400">Всего тестов</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">
                        {currentRun.testResults.total}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400">Успешно пройдено</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        {currentRun.testResults.passed}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400">Провалено</div>
                      <div
                        className={`text-xl font-bold font-mono mt-1 ${
                          currentRun.testResults.failed > 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {currentRun.testResults.failed}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="text-[11px] text-slate-400">Покрытие кода (Coverage)</div>
                      <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                        {currentRun.testResults.coveragePercent}%
                      </div>
                    </div>
                  </div>

                  {/* Coverage Progress Bar */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Statement Code Coverage</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {currentRun.testResults.coveragePercent}% (Threshold: 80%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${currentRun.testResults.coveragePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {lang === 'ru' ? 'Результаты тестов отсутствуют' : 'No test results available'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'yaml' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
              <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                <code>{selectedPipeline.yamlConfig}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
