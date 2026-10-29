import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { AgentNode } from '../../types/cicd';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Plus,
  Power,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
} from 'lucide-react';

export const AgentNodesView: React.FC = () => {
  const { agents, toggleAgentStatus, lang } = useCiCd();
  const [showAddModal, setShowAddModal] = useState(false);
  const [agentType, setAgentType] = useState<'docker' | 'ssh' | 'k8s'>('docker');

  const totalExecutors = agents.reduce((acc, a) => acc + a.totalExecutors, 0);
  const usedExecutors = agents.reduce((acc, a) => acc + a.usedExecutors, 0);
  const onlineAgents = agents.filter((a) => a.status === 'online').length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Title & Cluster Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            {lang === 'ru' ? 'Агенты сборки и пулы исполнителей (Runners)' : 'Build Agent Fleet & Executors'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ru'
              ? 'Управление распределенными воркер-нодами, контейнеризированными runner-агентами и слотами выполнения'
              : 'Orchestrate distributed worker instances, Docker runners, and Kubernetes executor pools'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Подключить агента' : 'Connect New Agent'}</span>
        </button>
      </div>

      {/* Cluster Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Активные ноды' : 'Active Nodes'}</span>
            <Server className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {onlineAgents} / {agents.length}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {lang === 'ru' ? 'Все системы в штатном режиме' : 'All systems operational'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Слоты исполнителей (Executors)' : 'Executor Slots'}</span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {usedExecutors} / {totalExecutors}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {Math.round((usedExecutors / (totalExecutors || 1)) * 100)}% {lang === 'ru' ? 'загрузка пула' : 'pool capacity'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Средняя нагрузка CPU' : 'Avg Cluster CPU'}</span>
            <Cpu className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            24.2%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lang === 'ru' ? 'Запас масштабирования: высокий' : 'Headroom available'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Архитектуры' : 'Architectures'}</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-sm font-semibold font-mono text-slate-200 mt-1">
            x86_64 · arm64 · K8s Pod
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {lang === 'ru' ? 'Поддержка CUDA GPU & macOS' : 'CUDA GPU & macOS supported'}
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const isOnline = agent.status === 'online';
          const executorRatio = (agent.usedExecutors / agent.totalExecutors) * 100;

          return (
            <div
              key={agent.id}
              className={`bg-slate-900/80 border rounded-xl p-5 flex flex-col gap-4 transition-all ${
                isOnline ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-60'
              }`}
            >
              {/* Top Row: Name, OS, Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${
                      isOnline
                        ? 'bg-slate-950 text-indigo-400 border-slate-800'
                        : 'bg-slate-950 text-slate-600 border-slate-800'
                    }`}
                  >
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm font-mono">
                        {agent.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                          isOnline
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                      <span>{agent.hostname}</span>
                      <span>·</span>
                      <span>{agent.ipAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Power toggle */}
                <button
                  onClick={() => toggleAgentStatus(agent.id)}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    isOnline
                      ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800 border-slate-800'
                      : 'text-emerald-400 hover:bg-emerald-950/40 border-emerald-900'
                  }`}
                  title={isOnline ? 'Drain / Pause Node' : 'Activate Node'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Executors Bar */}
              <div className="flex flex-col gap-1.5 bg-slate-950 border border-slate-800/80 p-3 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {lang === 'ru' ? 'Занято исполнителей:' : 'Executors busy:'}
                  </span>
                  <span className="font-mono text-indigo-400 font-semibold tabular-nums">
                    {agent.usedExecutors} / {agent.totalExecutors}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${executorRatio}%` }}
                  />
                </div>
              </div>

              {/* CPU & Memory gauges */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg">
                  <div className="text-slate-400 text-[11px] flex items-center justify-between">
                    <span>CPU</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {agent.cpuUsage}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${agent.cpuUsage}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg">
                  <div className="text-slate-400 text-[11px] flex items-center justify-between">
                    <span>RAM</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {agent.memoryUsage}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${agent.memoryUsage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Labels & Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500 mr-1">Labels:</span>
                {agent.labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300"
                  >
                    {lbl}
                  </span>
                ))}
              </div>

              {/* Active builds indicator */}
              {agent.activeBuilds.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-indigo-950/30 border border-indigo-900/60 rounded text-[11px] text-indigo-300">
                  <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>
                    {lang === 'ru' ? 'Выполняется сборка:' : 'Active job:'}{' '}
                    <span className="font-semibold text-white">
                      {agent.activeBuilds[0].pipelineName} #{agent.activeBuilds[0].runNumber}
                    </span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connect Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-2">
              {lang === 'ru' ? 'Подключение нового Runner-агента' : 'Connect New Runner Node'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'ru'
                ? 'Выберите тип подключения и выполните команду запуска на целевом сервере.'
                : 'Select executor provider type and run launch daemon command.'}
            </p>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1 mb-4 text-xs">
              <button
                onClick={() => setAgentType('docker')}
                className={`flex-1 py-1.5 rounded transition-colors ${
                  agentType === 'docker' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                Docker Runner
              </button>
              <button
                onClick={() => setAgentType('k8s')}
                className={`flex-1 py-1.5 rounded transition-colors ${
                  agentType === 'k8s' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                Kubernetes Pod
              </button>
              <button
                onClick={() => setAgentType('ssh')}
                className={`flex-1 py-1.5 rounded transition-colors ${
                  agentType === 'ssh' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                SSH Daemon
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-indigo-300 break-all mb-4">
              {agentType === 'docker' &&
                'docker run -d --restart=always --name pipelineforge-agent -v /var/run/docker.sock:/var/run/docker.sock -e SERVER_URL=https://ci.internal -e AGENT_SECRET=sec_98f... cr.io/pipelineforge/runner:latest'}
              {agentType === 'k8s' &&
                'helm upgrade --install pf-runners ./helm/k8s-runner-pool -n ci-executors --set runnerPool.maxScale=50'}
              {agentType === 'ssh' &&
                'curl -sSL https://get.pipelineforge.io/agent.sh | bash -s -- --token=tok_41a8e9'}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'ru' ? 'Понятно / Закрыть' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
