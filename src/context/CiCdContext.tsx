import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Pipeline,
  BuildRun,
  AgentNode,
  SecretItem,
  DoraMetrics,
  StageStatus,
  LogEntry,
  BuildArtifact,
  FreestyleJob,
  FreestyleRun,
} from '../types/cicd';
import {
  INITIAL_PIPELINES,
  INITIAL_RUNS,
  INITIAL_AGENTS,
  INITIAL_SECRETS,
  INITIAL_DORA_METRICS,
  INITIAL_FREESTYLE_JOBS,
  INITIAL_FREESTYLE_RUNS,
  AVATAR_ALEX,
  AVATAR_ELENA,
  AVATAR_MARCUS,
} from '../mockData/initialData';

export type AppView =
  | 'pipelines'
  | 'pipeline-detail'
  | 'freestyle-jobs'
  | 'freestyle-detail'
  | 'runs-history'
  | 'pipeline-editor'
  | 'agent-nodes'
  | 'secrets'
  | 'metrics'
  | 'webhooks';

interface CiCdContextType {
  view: AppView;
  setView: (view: AppView) => void;
  lang: 'ru' | 'en';
  setLang: (lang: 'ru' | 'en') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  pipelines: Pipeline[];
  selectedPipeline: Pipeline | null;
  setSelectedPipeline: (pipeline: Pipeline | null) => void;
  runs: BuildRun[];
  selectedRun: BuildRun | null;
  setSelectedRun: (run: BuildRun | null) => void;
  freestyleJobs: FreestyleJob[];
  selectedFreestyleJob: FreestyleJob | null;
  setSelectedFreestyleJob: (job: FreestyleJob | null) => void;
  freestyleRuns: FreestyleRun[];
  selectedFreestyleRun: FreestyleRun | null;
  setSelectedFreestyleRun: (run: FreestyleRun | null) => void;
  triggerFreestyleJob: (jobId: string, params: Record<string, string | boolean>) => void;
  saveFreestyleJob: (job: FreestyleJob) => void;
  deleteFreestyleJob: (id: string) => void;
  agents: AgentNode[];
  secrets: SecretItem[];
  doraMetrics: DoraMetrics;
  isRunModalOpen: boolean;
  setIsRunModalOpen: (open: boolean) => void;
  pipelineToRun: Pipeline | null;
  openRunModal: (pipe: Pipeline) => void;
  triggerBuild: (pipelineId: string, branch: string, env?: Record<string, string>) => void;
  cancelBuild: (runId: string) => void;
  approveStage: (runId: string, stageId: string, notes?: string) => void;
  rejectStage: (runId: string, stageId: string, notes?: string) => void;
  reRunBuild: (runId: string) => void;
  savePipeline: (updated: Pipeline) => void;
  deletePipeline: (id: string) => void;
  addSecret: (secret: Omit<SecretItem, 'id' | 'updatedAt'>) => void;
  deleteSecret: (id: string) => void;
  toggleAgentStatus: (agentId: string) => void;
  simulateWebhookPush: (repo: string, branch: string) => void;
}

const CiCdContext = createContext<CiCdContextType | undefined>(undefined);

export const CiCdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<AppView>('pipelines');
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [pipelines, setPipelines] = useState<Pipeline[]>(INITIAL_PIPELINES);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(INITIAL_PIPELINES[0]);
  
  const [runs, setRuns] = useState<BuildRun[]>(INITIAL_RUNS);
  const [selectedRun, setSelectedRun] = useState<BuildRun | null>(INITIAL_RUNS[0]);
  
  const [agents, setAgents] = useState<AgentNode[]>(INITIAL_AGENTS);
  const [secrets, setSecrets] = useState<SecretItem[]>(INITIAL_SECRETS);
  const [doraMetrics] = useState<DoraMetrics>(INITIAL_DORA_METRICS);

  const [freestyleJobs, setFreestyleJobs] = useState<FreestyleJob[]>(INITIAL_FREESTYLE_JOBS);
  const [selectedFreestyleJob, setSelectedFreestyleJob] = useState<FreestyleJob | null>(INITIAL_FREESTYLE_JOBS[0]);
  const [freestyleRuns, setFreestyleRuns] = useState<FreestyleRun[]>(INITIAL_FREESTYLE_RUNS);
  const [selectedFreestyleRun, setSelectedFreestyleRun] = useState<FreestyleRun | null>(INITIAL_FREESTYLE_RUNS[0]);

  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [pipelineToRun, setPipelineToRun] = useState<Pipeline | null>(null);

  const openRunModal = useCallback((pipe: Pipeline) => {
    setPipelineToRun(pipe);
    setIsRunModalOpen(true);
  }, []);

  // Save pipeline
  const savePipeline = useCallback((updated: Pipeline) => {
    setPipelines((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });
    setSelectedPipeline(updated);
  }, []);

  const deletePipeline = useCallback((id: string) => {
    setPipelines((prev) => prev.filter((p) => p.id !== id));
    if (selectedPipeline?.id === id) {
      setSelectedPipeline(null);
      setView('pipelines');
    }
  }, [selectedPipeline]);

  // Cancel build
  const cancelBuild = useCallback((runId: string) => {
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id !== runId) return r;
        return {
          ...r,
          status: 'canceled',
          finishedAt: new Date().toISOString(),
          stages: r.stages.map((stg) =>
            stg.status === 'running' || stg.status === 'pending'
              ? { ...stg, status: 'skipped' as StageStatus }
              : stg
          ),
          logs: [
            ...r.logs,
            {
              id: 'log-cancel-' + Date.now(),
              timestamp: new Date().toLocaleTimeString('ru-RU'),
              level: 'warn',
              stageId: 'sys',
              stageName: 'Система',
              text: 'Сборка принудительно остановлена пользователем.',
            },
          ],
        };
      })
    );
  }, []);

  // Approve a stage gate
  const approveStage = useCallback((runId: string, stageId: string, notes?: string) => {
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id !== runId) return r;
        const updatedStages = r.stages.map((stg) => {
          if (stg.id === stageId) {
            return {
              ...stg,
              status: 'success' as StageStatus,
              approvedBy: 'Alexei Smirnov (DevOps Lead)',
              approvalNotes: notes || 'Release gate approved for deployment.',
              durationMs: 4500,
            };
          }
          return stg;
        });

        const hasRemainingWaiting = updatedStages.some((s) => s.status === 'waiting_approval');
        const hasFailed = updatedStages.some((s) => s.status === 'failed');

        return {
          ...r,
          status: hasRemainingWaiting ? 'paused' : hasFailed ? 'failed' : 'success',
          finishedAt: !hasRemainingWaiting ? new Date().toISOString() : r.finishedAt,
          stages: updatedStages,
          logs: [
            ...r.logs,
            {
              id: 'log-appr-' + Date.now(),
              timestamp: new Date().toLocaleTimeString('ru-RU'),
              level: 'success',
              stageId,
              stageName: 'Production Deploy',
              text: `Ручное одобрение подтверждено пользователем: ${notes || 'Развертывание согласовано'}. Helm release переведен в статус Deployed.`,
            },
          ],
        };
      })
    );
  }, []);

  // Reject a stage gate
  const rejectStage = useCallback((runId: string, stageId: string, notes?: string) => {
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id !== runId) return r;
        const updatedStages = r.stages.map((stg) => {
          if (stg.id === stageId) {
            return {
              ...stg,
              status: 'failed' as StageStatus,
              approvedBy: 'Alexei Smirnov',
              approvalNotes: `Отклонено: ${notes || 'Не прошло ревью релиза'}`,
            };
          }
          return stg;
        });
        return {
          ...r,
          status: 'failed',
          finishedAt: new Date().toISOString(),
          stages: updatedStages,
          logs: [
            ...r.logs,
            {
              id: 'log-rej-' + Date.now(),
              timestamp: new Date().toLocaleTimeString('ru-RU'),
              level: 'error',
              stageId,
              stageName: 'Production Deploy',
              text: `Релиз отклонен: ${notes || 'Релиз отменен инженером'}. Пайплайн завершен с ошибкой.`,
            },
          ],
        };
      })
    );
  }, []);

  // Trigger build execution simulation
  const triggerBuild = useCallback(
    (pipelineId: string, branch: string, envOverrides?: Record<string, string>) => {
      const pipe = pipelines.find((p) => p.id === pipelineId);
      if (!pipe) return;

      const newRunNumber = (pipe.totalRuns || 100) + 1;
      const runId = `run-${pipe.id.replace('pipe-', '')}-${newRunNumber}`;

      // Pick an agent
      const availableAgent = agents.find((a) => a.status === 'online') || agents[0];

      // Prepare stages
      const initialStages = pipe.stagesConfig.map((sc, idx) => ({
        id: sc.id,
        name: sc.name,
        status: idx === 0 ? ('running' as StageStatus) : ('pending' as StageStatus),
        steps: sc.commands.map((cmd, cIdx) => ({
          id: `step-${sc.id}-${cIdx}`,
          name: cmd.split(' ')[0] || `Step ${cIdx + 1}`,
          command: cmd,
          status: idx === 0 && cIdx === 0 ? ('running' as StageStatus) : ('pending' as StageStatus),
          durationMs: 0,
          logLines: [],
        })),
        durationMs: 0,
        requiresApproval: sc.requiresApproval,
      }));

      const newRun: BuildRun = {
        id: runId,
        pipelineId: pipe.id,
        pipelineName: pipe.name,
        runNumber: newRunNumber,
        status: 'running',
        branch: branch || pipe.defaultBranch,
        commit: {
          hash: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 18),
          shortHash: Math.random().toString(16).substring(2, 9),
          message: `ci(pipeline): trigger run #${newRunNumber} [automated workflow execution]`,
          author: {
            name: 'Alexei Smirnov',
            email: 'alexei.dev@organization.com',
            avatarUrl: AVATAR_ALEX,
          },
          branch: branch || pipe.defaultBranch,
        },
        triggeredBy: 'manual',
        runnerNode: availableAgent.name,
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
        stages: initialStages,
        logs: [
          {
            id: `log-${Date.now()}-0`,
            timestamp: new Date().toLocaleTimeString('ru-RU'),
            level: 'info',
            stageId: initialStages[0].id,
            stageName: initialStages[0].name,
            text: `[Зигзаг CI] Инициализация пайплайна "${pipe.name}" на ноде ${availableAgent.name} (Любой билд взлетит!)`,
          },
          {
            id: `log-${Date.now()}-1`,
            timestamp: new Date().toLocaleTimeString('ru-RU'),
            level: 'cmd',
            stageId: initialStages[0].id,
            stageName: initialStages[0].name,
            text: `$ git fetch --depth=1 origin ${branch || pipe.defaultBranch} && git checkout FETCH_HEAD`,
          },
        ],
        artifacts: [],
        envOverrides,
      };

      // Add to runs and select it
      setRuns((prev) => [newRun, ...prev]);
      setSelectedRun(newRun);
      setSelectedPipeline(pipe);
      setView('pipeline-detail');
      setIsRunModalOpen(false);

      // Update pipeline stats
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === pipe.id
            ? {
                ...p,
                totalRuns: p.totalRuns + 1,
                lastRun: {
                  id: newRun.id,
                  runNumber: newRun.runNumber,
                  status: 'running',
                  finishedAt: 'Just now',
                  durationSeconds: 0,
                  branch: newRun.branch,
                },
              }
            : p
        )
      );

      // Simulate step-by-step asynchronous execution
      let stageIndex = 0;
      const stageCount = initialStages.length;

      const runInterval = setInterval(() => {
        setRuns((currentRuns) => {
          const run = currentRuns.find((r) => r.id === runId);
          if (!run || run.status === 'canceled' || run.status === 'paused') {
            clearInterval(runInterval);
            return currentRuns;
          }

          const currentStage = run.stages[stageIndex];
          if (!currentStage) {
            clearInterval(runInterval);
            return currentRuns;
          }

          // If current stage requires manual approval
          if (currentStage.requiresApproval && currentStage.status !== 'success') {
            clearInterval(runInterval);
            const pausedStages = run.stages.map((stg, sIdx) =>
              sIdx === stageIndex ? { ...stg, status: 'waiting_approval' as StageStatus } : stg
            );
            const approvalLog: LogEntry = {
              id: `log-${Date.now()}-appr`,
              timestamp: new Date().toLocaleTimeString('ru-RU'),
              level: 'warn',
              stageId: currentStage.id,
              stageName: currentStage.name,
              text: `⚠️ Внимание: Стадия "${currentStage.name}" требует ручного подтверждения (Manual Approval Gate). Сборка приостановлена.`,
            };
            return currentRuns.map((r) =>
              r.id === runId
                ? {
                    ...r,
                    status: 'paused',
                    stages: pausedStages,
                    logs: [...r.logs, approvalLog],
                  }
                : r
            );
          }

          // Mark stage completed
          const updatedStages = run.stages.map((stg, sIdx) => {
            if (sIdx === stageIndex) {
              return {
                ...stg,
                status: 'success' as StageStatus,
                durationMs: Math.floor(Math.random() * 8000) + 4000,
                steps: stg.steps.map((st) => ({
                  ...st,
                  status: 'success' as StageStatus,
                  durationMs: Math.floor(Math.random() * 3000) + 1200,
                  exitCode: 0,
                })),
              };
            }
            if (sIdx === stageIndex + 1) {
              return {
                ...stg,
                status: 'running' as StageStatus,
                steps: stg.steps.map((st, i) =>
                  i === 0 ? { ...st, status: 'running' as StageStatus } : st
                ),
              };
            }
            return stg;
          });

          // Generate stage log entries
          const nowStr = new Date().toLocaleTimeString('ru-RU');
          const newLogs: LogEntry[] = [
            {
              id: `log-${Date.now()}-success`,
              timestamp: nowStr,
              level: 'success',
              stageId: currentStage.id,
              stageName: currentStage.name,
              text: `✓ Стадия "${currentStage.name}" успешно завершена (Код возврата 0)`,
            },
          ];

          // If next stage exists, add next stage intro log
          if (stageIndex + 1 < stageCount) {
            const nextStage = updatedStages[stageIndex + 1];
            newLogs.push({
              id: `log-${Date.now()}-next`,
              timestamp: nowStr,
              level: 'cmd',
              stageId: nextStage.id,
              stageName: nextStage.name,
              text: `$ ${nextStage.steps[0]?.command || 'executing stage payload'}`,
            });
            newLogs.push({
              id: `log-${Date.now()}-exec`,
              timestamp: nowStr,
              level: 'info',
              stageId: nextStage.id,
              stageName: nextStage.name,
              text: `Выполнение шагов стадии [${nextStage.name}] в контейнере runner...`,
            });
            stageIndex++;

            return currentRuns.map((r) =>
              r.id === runId
                ? {
                    ...r,
                    durationSeconds: r.durationSeconds + 6,
                    stages: updatedStages,
                    logs: [...r.logs, ...newLogs],
                  }
                : r
            );
          } else {
            // All stages finished successfully!
            clearInterval(runInterval);
            const finalArtifacts: BuildArtifact[] = [
              {
                id: `art-${Date.now()}-1`,
                name: `${pipe.name}-build-${newRunNumber}.tar.gz`,
                sizeBytes: 18450000,
                type: 'Production Artifact',
                path: `/artifacts/${pipe.name}/${newRunNumber}/dist.tar.gz`,
                createdStage: currentStage.name,
              },
              {
                id: `art-${Date.now()}-2`,
                name: `junit-report-${newRunNumber}.xml`,
                sizeBytes: 42000,
                type: 'Test Report',
                path: `/artifacts/${pipe.name}/${newRunNumber}/junit.xml`,
                createdStage: currentStage.name,
              },
            ];

            const completedRun: BuildRun = {
              ...run,
              status: 'success',
              finishedAt: new Date().toISOString(),
              durationSeconds: run.durationSeconds + 5,
              stages: updatedStages,
              artifacts: finalArtifacts,
              testResults: {
                total: 142,
                passed: 142,
                failed: 0,
                skipped: 0,
                durationMs: 24000,
                coveragePercent: 91.8,
              },
              logs: [
                ...run.logs,
                ...newLogs,
                {
                  id: `log-${Date.now()}-done`,
                  timestamp: new Date().toLocaleTimeString('ru-RU'),
                  level: 'success',
                  stageId: currentStage.id,
                  stageName: currentStage.name,
                  text: `🎉 Сборка #${newRunNumber} успешно завершена! Создано 2 артефакта, покрытие тестами: 91.8%.`,
                },
              ],
            };

            // Update pipeline last run
            setPipelines((prevPipes) =>
              prevPipes.map((p) =>
                p.id === pipe.id
                  ? {
                      ...p,
                      lastRun: {
                        id: completedRun.id,
                        runNumber: completedRun.runNumber,
                        status: 'success',
                        finishedAt: 'Just now',
                        durationSeconds: completedRun.durationSeconds,
                        branch: completedRun.branch,
                      },
                    }
                  : p
              )
            );

            return currentRuns.map((r) => (r.id === runId ? completedRun : r));
          }
        });
      }, 2400);
    },
    [pipelines, agents]
  );

  const reRunBuild = useCallback(
    (runId: string) => {
      const run = runs.find((r) => r.id === runId);
      if (run) {
        triggerBuild(run.pipelineId, run.branch, run.envOverrides);
      }
    },
    [runs, triggerBuild]
  );

  const addSecret = useCallback((secret: Omit<SecretItem, 'id' | 'updatedAt'>) => {
    const newSec: SecretItem = {
      ...secret,
      id: `sec-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setSecrets((prev) => [newSec, ...prev]);
  }, []);

  const deleteSecret = useCallback((id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleAgentStatus = useCallback((agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        const newStatus = a.status === 'online' ? 'offline' : 'online';
        return { ...a, status: newStatus };
      })
    );
  }, []);

  const simulateWebhookPush = useCallback(
    (repo: string, branch: string) => {
      const matched = pipelines.find((p) => p.repository.includes(repo) || repo.includes(p.name)) || pipelines[0];
      if (matched) {
        triggerBuild(matched.id, branch);
      }
    },
    [pipelines, triggerBuild]
  );

  const saveFreestyleJob = useCallback((job: FreestyleJob) => {
    setFreestyleJobs((prev) => {
      const idx = prev.findIndex((j) => j.id === job.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = job;
        return updated;
      }
      return [job, ...prev];
    });
    setSelectedFreestyleJob(job);
  }, []);

  const deleteFreestyleJob = useCallback((id: string) => {
    setFreestyleJobs((prev) => prev.filter((j) => j.id !== id));
    if (selectedFreestyleJob?.id === id) {
      setSelectedFreestyleJob(null);
      setView('freestyle-jobs');
    }
  }, [selectedFreestyleJob]);

  const triggerFreestyleJob = useCallback(
    (jobId: string, params: Record<string, string | boolean>) => {
      const job = freestyleJobs.find((j) => j.id === jobId);
      if (!job) return;

      const newRunNumber = (job.totalRuns || 10) + 1;
      const runId = `frun-${job.id.replace('fjob-', '')}-${newRunNumber}`;
      const nowStr = new Date().toLocaleTimeString('ru-RU');

      const initialSteps = job.buildSteps
        .filter((bs) => bs.enabled)
        .map((bs, idx) => ({
          id: bs.id,
          name: bs.name,
          command: bs.command,
          status: idx === 0 ? ('running' as StageStatus) : ('pending' as StageStatus),
          durationMs: 0,
        }));

      const newRun: FreestyleRun = {
        id: runId,
        jobId: job.id,
        jobName: job.name,
        runNumber: newRunNumber,
        status: 'running',
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
        paramsUsed: params,
        steps: initialSteps,
        logs: [
          {
            id: `flog-${Date.now()}-0`,
            timestamp: nowStr,
            level: 'info',
            stageId: initialSteps[0]?.id || 'step-1',
            stageName: 'Init',
            text: `[Зигзаг CI] Запуск Freestyle джобы "${job.name}" #${newRunNumber} на узле ${job.runnerNode}`,
          },
          {
            id: `flog-${Date.now()}-params`,
            timestamp: nowStr,
            level: 'info',
            stageId: initialSteps[0]?.id || 'step-1',
            stageName: 'Params',
            text: `Параметры запуска: ${JSON.stringify(params)}`,
          },
          {
            id: `flog-${Date.now()}-cmd`,
            timestamp: nowStr,
            level: 'cmd',
            stageId: initialSteps[0]?.id || 'step-1',
            stageName: initialSteps[0]?.name || 'Шаг 1',
            text: `$ ${initialSteps[0]?.command || 'echo "Running step"'}`,
          },
        ],
        artifacts: [],
      };

      setFreestyleRuns((prev) => [newRun, ...prev]);
      setSelectedFreestyleRun(newRun);
      setSelectedFreestyleJob(job);
      setView('freestyle-detail');

      setFreestyleJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
                ...j,
                totalRuns: j.totalRuns + 1,
                lastRun: {
                  id: newRun.id,
                  runNumber: newRun.runNumber,
                  status: 'running',
                  durationSeconds: 0,
                  finishedAt: 'Just now',
                },
              }
            : j
        )
      );

      let stepIdx = 0;
      const stepCount = initialSteps.length;

      const interval = setInterval(() => {
        setFreestyleRuns((current) => {
          const r = current.find((item) => item.id === runId);
          if (!r || r.status !== 'running') {
            clearInterval(interval);
            return current;
          }

          const curStep = r.steps[stepIdx];
          if (!curStep) {
            clearInterval(interval);
            return current;
          }

          const updatedSteps = r.steps.map((st, i) => {
            if (i === stepIdx) {
              return { ...st, status: 'success' as StageStatus, durationMs: 2500, exitCode: 0 };
            }
            if (i === stepIdx + 1) {
              return { ...st, status: 'running' as StageStatus };
            }
            return st;
          });

          const timeString = new Date().toLocaleTimeString('ru-RU');
          const stepLogs: LogEntry[] = [
            {
              id: `flog-${Date.now()}-ok`,
              timestamp: timeString,
              level: 'success',
              stageId: curStep.id,
              stageName: curStep.name,
              text: `✓ Шаг "${curStep.name}" завершен с кодом возврата 0`,
            },
          ];

          if (stepIdx + 1 < stepCount) {
            const nextStep = updatedSteps[stepIdx + 1];
            stepLogs.push({
              id: `flog-${Date.now()}-nextcmd`,
              timestamp: timeString,
              level: 'cmd',
              stageId: nextStep.id,
              stageName: nextStep.name,
              text: `$ ${nextStep.command}`,
            });
            stepIdx++;
            return current.map((runItem) =>
              runItem.id === runId
                ? {
                    ...runItem,
                    durationSeconds: runItem.durationSeconds + 3,
                    steps: updatedSteps,
                    logs: [...runItem.logs, ...stepLogs],
                  }
                : runItem
            );
          } else {
            clearInterval(interval);
            const finishedRun: FreestyleRun = {
              ...r,
              status: 'success',
              finishedAt: new Date().toISOString(),
              durationSeconds: r.durationSeconds + 4,
              steps: updatedSteps,
              artifacts: [
                {
                  id: `fart-${Date.now()}`,
                  name: `${job.name}-output-${newRunNumber}.log`,
                  sizeBytes: 24500,
                  type: 'Execution Log',
                  path: `/workspace/${job.name}/${newRunNumber}/output.log`,
                  createdStage: 'Post-Build',
                },
              ],
              logs: [
                ...r.logs,
                ...stepLogs,
                {
                  id: `flog-${Date.now()}-finish`,
                  timestamp: timeString,
                  level: 'success',
                  stageId: 'post',
                  stageName: 'Post-Build',
                  text: `🎉 Freestyle джоба #${newRunNumber} успешно завершена! Все шаги выполнены.`,
                },
              ],
            };

            setFreestyleJobs((allJobs) =>
              allJobs.map((j) =>
                j.id === job.id
                  ? {
                      ...j,
                      lastRun: {
                        id: finishedRun.id,
                        runNumber: finishedRun.runNumber,
                        status: 'success',
                        durationSeconds: finishedRun.durationSeconds,
                        finishedAt: 'Just now',
                      },
                    }
                  : j
              )
            );

            return current.map((runItem) => (runItem.id === runId ? finishedRun : runItem));
          }
        });
      }, 2000);
    },
    [freestyleJobs]
  );

  // Keep selectedRun in sync if updated
  useEffect(() => {
    if (selectedRun) {
      const fresh = runs.find((r) => r.id === selectedRun.id);
      if (fresh) setSelectedRun(fresh);
    }
  }, [runs, selectedRun]);

  return (
    <CiCdContext.Provider
      value={{
        view,
        setView,
        lang,
        setLang,
        searchQuery,
        setSearchQuery,
        pipelines,
        selectedPipeline,
        setSelectedPipeline,
        runs,
        selectedRun,
        setSelectedRun,
        freestyleJobs,
        selectedFreestyleJob,
        setSelectedFreestyleJob,
        freestyleRuns,
        selectedFreestyleRun,
        setSelectedFreestyleRun,
        triggerFreestyleJob,
        saveFreestyleJob,
        deleteFreestyleJob,
        agents,
        secrets,
        doraMetrics,
        isRunModalOpen,
        setIsRunModalOpen,
        pipelineToRun,
        openRunModal,
        triggerBuild,
        cancelBuild,
        approveStage,
        rejectStage,
        reRunBuild,
        savePipeline,
        deletePipeline,
        addSecret,
        deleteSecret,
        toggleAgentStatus,
        simulateWebhookPush,
      }}
    >
      {children}
    </CiCdContext.Provider>
  );
};

export const useCiCd = () => {
  const context = useContext(CiCdContext);
  if (!context) {
    throw new Error('useCiCd must be used within a CiCdProvider');
  }
  return context;
};
