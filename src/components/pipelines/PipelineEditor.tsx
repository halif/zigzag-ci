import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { Pipeline } from '../../types/cicd';
import {
  Save,
  Play,
  Layers,
  Code,
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const PipelineEditor: React.FC = () => {
  const { selectedPipeline, savePipeline, triggerBuild, setView, lang } = useCiCd();

  const [mode, setMode] = useState<'visual' | 'yaml'>('visual');

  // Form states
  const [name, setName] = useState(selectedPipeline?.name || 'new-service-pipeline');
  const [description, setDescription] = useState(
    selectedPipeline?.description || 'Automated build, test and deployment workflow.'
  );
  const [repository, setRepository] = useState(
    selectedPipeline?.repository || 'github.com/organization/new-service'
  );
  const [branch, setBranch] = useState(selectedPipeline?.defaultBranch || 'main');
  const [category, setCategory] = useState<Pipeline['category']>(
    selectedPipeline?.category || 'microservice'
  );

  const [stages, setStages] = useState(
    selectedPipeline?.stagesConfig || [
      {
        id: 'stg-1',
        name: 'Checkout & Setup',
        commands: ['git clone https://github.com/organization/repo.git .', 'npm ci'],
      },
      {
        id: 'stg-2',
        name: 'Lint & Typecheck',
        commands: ['npm run lint', 'tsc --noEmit'],
      },
      {
        id: 'stg-3',
        name: 'Unit Tests',
        commands: ['npm test -- --coverage'],
      },
      {
        id: 'stg-4',
        name: 'Build Container',
        commands: ['docker build -t app:latest .'],
      },
      {
        id: 'stg-5',
        name: 'Production Deploy',
        requiresApproval: true,
        commands: ['kubectl apply -f deploy.yaml'],
      },
    ]
  );

  const [yamlConfig, setYamlConfig] = useState(
    selectedPipeline?.yamlConfig ||
      `pipeline:
  agent:
    label: linux-x86-worker
  stages:
    - stage: Checkout & Setup
      steps:
        - name: Git Clone
          run: git clone https://github.com/organization/repo.git .
        - name: Install
          run: npm ci
    - stage: Lint & Test
      steps:
        - name: Test Suite
          run: npm test
    - stage: Production Deploy
      approval:
        required: true
      steps:
        - name: Deploy
          run: kubectl apply -f deploy.yaml`
  );

  const [savedAlert, setSavedAlert] = useState(false);

  // Template loader
  const loadTemplate = (tmpl: 'node' | 'go' | 'python' | 'docker') => {
    if (tmpl === 'node') {
      setName('web-frontend-pipeline');
      setCategory('frontend');
      setStages([
        { id: 's1', name: 'Install Dependencies', commands: ['npm ci'] },
        { id: 's2', name: 'Lint & Typecheck', commands: ['npm run lint', 'tsc --noEmit'] },
        { id: 's3', name: 'Test Suite', commands: ['npm run test -- --coverage'] },
        { id: 's4', name: 'Vite Production Build', commands: ['npm run build'] },
        { id: 's5', name: 'Deploy CDN', requiresApproval: false, commands: ['wrangler pages deploy dist'] },
      ]);
    } else if (tmpl === 'go') {
      setName('go-microservice-pipeline');
      setCategory('microservice');
      setStages([
        { id: 's1', name: 'Verify & Mod', commands: ['go mod verify', 'go mod download'] },
        { id: 's2', name: 'GolangCI-Lint', commands: ['golangci-lint run'] },
        { id: 's3', name: 'Go Test Suite', commands: ['go test -v -race ./...'] },
        { id: 's4', name: 'Docker Build & Push', commands: ['docker build -t cr.io/app:${BUILD_ID} .'] },
        { id: 's5', name: 'Production Deploy', requiresApproval: true, commands: ['helm upgrade --install app ./charts'] },
      ]);
    } else if (tmpl === 'python') {
      setName('ai-fastapi-pipeline');
      setCategory('ai_data');
      setStages([
        { id: 's1', name: 'Poetry Install', commands: ['poetry install --no-root'] },
        { id: 's2', name: 'Ruff & Mypy', commands: ['poetry run ruff check .', 'poetry run mypy .'] },
        { id: 's3', name: 'Pytest Suite', commands: ['poetry run pytest tests/'] },
        { id: 's4', name: 'Deploy Model Endpoint', requiresApproval: true, commands: ['kubectl apply -f k8s/'] },
      ]);
    }
  };

  const handleAddStage = () => {
    const newId = `stg-${Date.now()}`;
    setStages([
      ...stages,
      {
        id: newId,
        name: `New Stage ${stages.length + 1}`,
        commands: ['echo "executing step"'],
        requiresApproval: false,
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleAddCommand = (stageIndex: number) => {
    const updated = [...stages];
    updated[stageIndex].commands.push('echo "additional step"');
    setStages(updated);
  };

  const handleRemoveCommand = (stageIndex: number, cmdIndex: number) => {
    const updated = [...stages];
    updated[stageIndex].commands.splice(cmdIndex, 1);
    setStages(updated);
  };

  const handleSave = (andRun: boolean = false) => {
    const newPipeline: Pipeline = {
      id: selectedPipeline?.id || `pipe-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name,
      description,
      repository,
      defaultBranch: branch,
      category,
      yamlConfig,
      tags: [category.toUpperCase(), 'CI/CD', 'Automated'],
      stagesConfig: stages,
      triggers: {
        onPush: true,
        onPr: true,
      },
      totalRuns: selectedPipeline?.totalRuns || 0,
      successRate: selectedPipeline?.successRate || 100,
      avgDurationSec: selectedPipeline?.avgDurationSec || 120,
      environmentVars: selectedPipeline?.environmentVars || [
        { key: 'ENV', value: 'production', isSecret: false },
      ],
      updatedAt: new Date().toISOString(),
    };

    savePipeline(newPipeline);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);

    if (andRun) {
      triggerBuild(newPipeline.id, branch);
    } else {
      setView('pipeline-detail');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('pipelines')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">
              {selectedPipeline
                ? `${lang === 'ru' ? 'Редактирование:' : 'Edit:'} ${selectedPipeline.name}`
                : lang === 'ru'
                ? 'Создание нового пайплайна'
                : 'Create New Pipeline'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'ru'
                ? 'Визуальный конструктор стадий и декларативный синтаксис Jenkinsfile / YAML'
                : 'Visual stages DAG builder & declarative Jenkinsfile/YAML config'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {savedAlert && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Сохранено!' : 'Saved!'}</span>
            </span>
          )}

          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Сохранить' : 'Save'}</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'ru' ? 'Сохранить и запустить' : 'Save & Run'}</span>
          </button>
        </div>
      </div>

      {/* Templates strip */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <span className="text-xs text-slate-400 font-medium mr-2">
          {lang === 'ru' ? 'Быстрые шаблоны:' : 'Quick Presets:'}
        </span>
        <button
          onClick={() => loadTemplate('node')}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white transition-colors"
        >
          Node.js & Vite SPA
        </button>
        <button
          onClick={() => loadTemplate('go')}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white transition-colors"
        >
          Go Microservice & Docker
        </button>
        <button
          onClick={() => loadTemplate('python')}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white transition-colors"
        >
          Python AI & FastAPI
        </button>
      </div>

      {/* Basic Settings Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">
            {lang === 'ru' ? 'Имя пайплайна' : 'Pipeline Name'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">
            {lang === 'ru' ? 'Репозиторий Git' : 'Git Repository'}
          </label>
          <input
            type="text"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">
            {lang === 'ru' ? 'Ветка по умолчанию' : 'Default Branch'}
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Visual vs YAML mode switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setMode('visual')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Визуальный конструктор' : 'Visual Builder'}</span>
          </button>
          <button
            onClick={() => setMode('yaml')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'yaml' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Конфиг YAML' : 'YAML Editor'}</span>
          </button>
        </div>

        {mode === 'visual' && (
          <button
            onClick={handleAddStage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Добавить стадию' : 'Add Stage'}</span>
          </button>
        )}
      </div>

      {/* Editor Content */}
      {mode === 'visual' ? (
        <div className="flex flex-col gap-4">
          {stages.map((stage, stageIdx) => (
            <div
              key={stage.id || stageIdx}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-mono text-xs font-bold">
                    {stageIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => {
                      const updated = [...stages];
                      updated[stageIdx].name = e.target.value;
                      setStages(updated);
                    }}
                    placeholder="Stage Name"
                    className="font-bold text-white text-sm bg-slate-950 border border-slate-800 rounded px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  {/* Manual Approval Gate Toggle */}
                  <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!stage.requiresApproval}
                      onChange={(e) => {
                        const updated = [...stages];
                        updated[stageIdx].requiresApproval = e.target.checked;
                        setStages(updated);
                      }}
                      className="rounded border-amber-600 text-amber-500 focus:ring-0"
                    />
                    <span>{lang === 'ru' ? 'Ручное подтверждение (Approval Gate)' : 'Requires Manual Approval'}</span>
                  </label>

                  {/* Remove Stage */}
                  <button
                    onClick={() => handleRemoveStage(stageIdx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title="Удалить стадию"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Commands List */}
              <div className="flex flex-col gap-2 pl-9">
                <div className="text-xs text-slate-400 font-medium">
                  {lang === 'ru' ? 'Команды выполнения (Bash/Shell steps):' : 'Execution Commands:'}
                </div>

                {stage.commands.map((cmd, cmdIdx) => (
                  <div key={cmdIdx} className="flex items-center gap-2">
                    <span className="text-slate-600 font-mono text-xs">$</span>
                    <input
                      type="text"
                      value={cmd}
                      onChange={(e) => {
                        const updated = [...stages];
                        updated[stageIdx].commands[cmdIdx] = e.target.value;
                        setStages(updated);
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. npm test or docker build"
                    />
                    <button
                      onClick={() => handleRemoveCommand(stageIdx, cmdIdx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Удалить команду"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => handleAddCommand(stageIdx)}
                  className="self-start flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{lang === 'ru' ? 'Добавить шаг/команду' : 'Add Command'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <textarea
            value={yamlConfig}
            onChange={(e) => setYamlConfig(e.target.value)}
            rows={20}
            className="w-full bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed"
            placeholder="pipeline:\n  stages:\n..."
          />
        </div>
      )}
    </div>
  );
};
