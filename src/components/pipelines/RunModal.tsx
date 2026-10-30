import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { Play, X, Server, GitBranch, Settings2 } from 'lucide-react';

export const RunModal: React.FC = () => {
  const {
    isRunModalOpen,
    setIsRunModalOpen,
    pipelineToRun,
    pipelines,
    agents,
    triggerBuild,
    lang,
  } = useCiCd();

  const [selectedPipelineId, setSelectedPipelineId] = useState(
    pipelineToRun?.id || pipelines[0]?.id || ''
  );
  const [branch, setBranch] = useState(pipelineToRun?.defaultBranch || 'main');
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.name || 'worker-linux-x86-01');
  const [customEnv, setCustomEnv] = useState('DEBUG=true\nNODE_ENV=production');

  if (!isRunModalOpen) return null;

  const currentPipe = pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];

  const handleLaunch = () => {
    // Parse env overrides
    const envOverrides: Record<string, string> = {};
    customEnv.split('\n').forEach((line) => {
      const [k, ...v] = line.split('=');
      if (k && v.length) envOverrides[k.trim()] = v.join('=').trim();
    });

    triggerBuild(selectedPipelineId, branch, envOverrides);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {lang === 'ru' ? 'Запуск сборки с параметрами' : 'Build with Parameters'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Настройте ветку и переменные окружения' : 'Configure execution branch and environment'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRunModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Target Pipeline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ru' ? 'Пайплайн' : 'Pipeline'}
            </label>
            <select
              value={selectedPipelineId}
              onChange={(e) => {
                setSelectedPipelineId(e.target.value);
                const p = pipelines.find((item) => item.id === e.target.value);
                if (p) setBranch(p.defaultBranch);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.repository})
                </option>
              ))}
            </select>
          </div>

          {/* Branch input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ru' ? 'Ветка или тег (Git Branch / Tag)' : 'Git Branch / Tag'}</span>
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              placeholder="e.g. main or feature/xyz"
            />
          </div>

          {/* Runner Agent */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ru' ? 'Воркер-агент (Build Runner Node)' : 'Build Runner Node'}</span>
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} ({a.arch}, {a.usedExecutors}/{a.totalExecutors} busy)
                </option>
              ))}
            </select>
          </div>

          {/* Custom Env Variables */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ru' ? 'Переопределение переменных (KEY=VALUE)' : 'Environment Overrides'}</span>
            </label>
            <textarea
              value={customEnv}
              onChange={(e) => setCustomEnv(e.target.value)}
              rows={3}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
          <button
            onClick={() => setIsRunModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {lang === 'ru' ? 'Отмена' : 'Cancel'}
          </button>
          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'ru' ? 'Запустить сейчас' : 'Start Build Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
