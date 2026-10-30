import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import {
  Webhook,
  Send,
  GitPullRequest,
  GitCommit,
  Check,
  Copy,
  Server,
  Box,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Code,
  FileCheck,
  Cpu,
} from 'lucide-react';

export const WebhookSimulatorView: React.FC = () => {
  const { pipelines, triggerBuild, lang } = useCiCd();
  const [selectedPipelineId, setSelectedPipelineId] = useState(pipelines[0]?.id || '');
  const [eventType, setEventType] = useState<'gitlab_push' | 'gitlab_mr' | 'github_push'>('gitlab_push');
  const [branch, setBranch] = useState('main');
  const [authorName, setAuthorName] = useState('Senior DevOps Engineer');
  const [commitMsg, setCommitMsg] = useState('feat(core): release production v2.4 build with optimized bundle');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const targetPipe = pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];
  const webhookUrl = `https://ci.zigzag.io/api/v1/webhooks/gitlab?project=${targetPipe?.name}`;
  const secretToken = 'glpat_sec_zigzag_89a4412ef9012bb490c';

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    triggerBuild(selectedPipelineId, branch);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3500);
  };

  const copyToClipboard = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const samplePayload = {
    object_kind: eventType === 'gitlab_mr' ? 'merge_request' : 'push',
    event_type: eventType === 'gitlab_mr' ? 'merge_request' : 'push',
    user_name: authorName,
    user_email: 'senior.dev@company.com',
    project: {
      id: 42109,
      name: targetPipe?.name,
      git_http_url: `https://${targetPipe?.repository}.git`,
      default_branch: 'main',
    },
    ref: `refs/heads/${branch}`,
    checkout_sha: '9a4d8c72e401bc3b9a5f78c001',
    commits: [
      {
        id: '9a4d8c72e401bc3b9a5f78c001',
        message: commitMsg,
        timestamp: new Date().toISOString(),
        url: `https://${targetPipe?.repository}/commit/9a4d8c7`,
        author: {
          name: authorName,
          email: 'senior.dev@company.com',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Webhook className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {lang === 'ru'
                ? 'Интеграция с GitLab и публикация артефактов'
                : 'GitLab / GitHub Integration & Artifact Flow'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            {lang === 'ru'
              ? 'Да! Зигзаг CI работает по той же классической и гибкой философии, что и Jenkins: он выступает центральным сервером автоматизации, принимает вебхуки от GitLab, собирает код на изолированных раннерах и автоматически сохраняет артефакты в хранилище Зигзаг CI, отправляя обратный статус в GitLab.'
              : 'Yes! Zigzag CI operates on the exact same architecture as Jenkins: it receives webhooks from GitLab, builds on runners, stores artifacts in Zigzag CI, and reports commit statuses back to GitLab.'}
          </p>
        </div>
      </div>

      {/* Visual Architectural Flowchart (GitLab -> Webhook -> Zigzag CI -> Artifacts) */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {lang === 'ru'
              ? 'Архитектурный цикл: от Git Push до хранилища артефактов Зигзаг CI'
              : 'End-to-End Delivery Cycle: Push to Zigzag Artifact Store'}
          </span>
          <span className="text-xs text-slate-500 font-mono">GitLab · Webhook · CI Orchestrator</span>
        </div>

        {/* 5-step visual pipeline flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {/* Step 1 */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-mono text-amber-400 font-bold">01</span>
                <GitCommit className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xs font-bold text-white">
                {lang === 'ru' ? 'Сеньор пушит код' : 'Senior Dev Push'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'ru' ? 'git push в репозиторий GitLab (main или Merge Request)' : 'Push to GitLab repository'}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-mono text-amber-400 font-bold">02</span>
                <Webhook className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xs font-bold text-white">
                {lang === 'ru' ? 'GitLab шлет Webhook' : 'Webhook Trigger'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono text-[10px]">
                POST /api/v1/webhooks/gitlab + токен аутентификации
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-mono text-amber-400 font-bold">03</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-white">
                {lang === 'ru' ? 'Зигзаг CI Runner' : 'Zigzag CI Runner'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'ru' ? 'Изолированный агент запускает тесты, линтеры и сборку' : 'Worker builds & tests code'}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-slate-950 border border-amber-500/40 bg-amber-950/15 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-mono text-amber-400 font-bold">04</span>
                <Box className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs font-bold text-amber-200">
                {lang === 'ru' ? 'Сборка в Зигзаг CI' : 'Zigzag Artifact Hub'}
              </div>
              <p className="text-[11px] text-amber-300/80 mt-1">
                {lang === 'ru'
                  ? 'Артефакт (tar.gz, jar, docker) выкладывается в Зигзаг CI'
                  : 'Binary / image hosted in Zigzag CI'}
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-mono text-amber-400 font-bold">05</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-white">
                {lang === 'ru' ? 'Статус в GitLab' : 'GitLab Commit Status'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'ru' ? 'Зеленая галочка в GitLab с ссылкой на скачивание' : 'Green badge in GitLab MR'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GitLab Webhook Settings Card */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'ru'
              ? 'Настройки для вставки в GitLab (Settings → Webhooks)'
              : 'GitLab Webhook Configuration'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Webhook URL (вставить в поле URL в GitLab):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-amber-300 font-mono select-all focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl, 'url')}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                title="Копировать URL"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Secret Token (для валидации заголовка X-Gitlab-Token):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={secretToken}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 font-mono select-all focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(secretToken, 'token')}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                title="Копировать токен"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* How to publish artifacts into Zigzag CI */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              {lang === 'ru'
                ? 'Как настроить выгрузку артефакта в Зигзаг CI:'
                : 'How artifacts are saved in Zigzag CI:'}
            </span>
            <span className="text-[11px] font-mono text-emerald-400">archiveArtifacts / built-in</span>
          </div>
          <div className="text-xs text-slate-400 leading-relaxed">
            {lang === 'ru' ? (
              <>
                В пайплайне или во фристайл-джобе Зигзаг CI вы просто указываете маску файлов в блоке пост-билда (например:{' '}
                <code className="text-amber-300 font-mono">dist/*.tar.gz</code> или{' '}
                <code className="text-amber-300 font-mono">target/*.jar</code>). Зигзаг CI автоматически забирает файлы из
                рабочей папки раннера, индексирует их хэши и выкладывает на вкладку <strong>«Артефакты сборки»</strong> и{' '}
                <strong>«Workspace»</strong> для моментального скачивания всей командой.
              </>
            ) : (
              <>
                In Zigzag CI pipelines or freestyle jobs, specify artifact paths (e.g.{' '}
                <code className="text-amber-300 font-mono">dist/*.tar.gz</code>). Zigzag CI automatically collects the binaries,
                publishes them to the build run, and hosts them with download links.
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Webhook Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trigger form */}
        <form
          onSubmit={handleSimulate}
          className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">
              {lang === 'ru' ? 'Тестовая отправка вебхука из GitLab' : 'Simulate GitLab Webhook'}
            </h3>
            <span className="text-xs text-slate-500 font-mono">HTTP POST simulation</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ru' ? 'Целевой пайплайн Зигзаг CI' : 'Target Pipeline'}
            </label>
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.repository})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ru' ? 'Тип события GitLab' : 'GitLab Event Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEventType('gitlab_push')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  eventType === 'gitlab_push'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                GitLab Push Event
              </button>
              <button
                type="button"
                onClick={() => setEventType('gitlab_mr')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  eventType === 'gitlab_mr'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Merge Request Hook
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ru' ? 'Ветка в GitLab (Git Branch)' : 'Branch'}
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ru' ? 'Сообщение коммита (Commit Message)' : 'Commit Message'}
            </label>
            <input
              type="text"
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'ru' ? 'Автор коммита (GitLab User)' : 'Author'}
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>
                {lang === 'ru'
                  ? 'Сэмулировать пуш из GitLab и собрать артефакт'
                  : 'Dispatch GitLab Webhook & Build'}
              </span>
            </button>
          </div>

          {sentSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'ru'
                  ? 'Вебхук успешно принят (HTTP 200 OK)! Запущена сборка и сбор артефактов в Зигзаг CI.'
                  : 'Webhook successfully accepted (HTTP 200 OK)! Build started and artifacts will be collected.'}
              </span>
            </div>
          )}
        </form>

        {/* JSON Payload Inspector */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">
              {lang === 'ru' ? 'JSON полезной нагрузки из GitLab (Payload)' : 'HTTP Request Payload Preview'}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">POST /api/v1/webhooks/gitlab</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-x-auto flex-1 font-mono text-xs text-amber-300/90 leading-relaxed">
            <pre>
              <code>{JSON.stringify(samplePayload, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
