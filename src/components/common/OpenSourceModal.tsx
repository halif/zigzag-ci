import React from 'react';
import {
  Github,
  X,
  Heart,
  Terminal,
  Shield,
  Star,
  GitFork,
  BookOpen,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { useState } from 'react';

interface OpenSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ru' | 'en';
}

export const OpenSourceModal: React.FC<OpenSourceModalProps> = ({
  isOpen,
  onClose,
  lang = 'ru',
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const dockerComposeSnippet = `# Запуск Зигзаг CI в 1 команду
version: '3.8'
services:
  zigzag-ci:
    image: zigzagci/server:latest
    container_name: zigzag-ci
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - zigzag_data:/var/lib/zigzag-ci
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - ZIGZAG_MODE=community_free
      - ZIGZAG_AGENT_SLOTS=8

volumes:
  zigzag_data:`;

  const copyDockerCommand = () => {
    navigator.clipboard.writeText('docker run -d -p 3000:3000 --name zigzag-ci -v /var/run/docker.sock:/var/run/docker.sock zigzagci/server:latest');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  {lang === 'ru' ? 'Зигзаг CI на GitHub — Свободный и Бесплатный Open Source' : 'Zigzag CI on GitHub — Free & Open Source'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-semibold">
                  MIT / Apache 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'ru'
                  ? 'Проект создан для всего сообщества: без скрытых платежей, подписок и закрытого кода'
                  : 'Free community-driven CI/CD automation server without paywalls'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why GitHub is the ideal choice */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Star className="w-4 h-4 fill-current" />
            <span>{lang === 'ru' ? 'Почему для этой цели GitHub — выбор номер 1' : 'Why GitHub is the #1 choice'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
              <div className="font-bold text-white mb-1">
                {lang === 'ru' ? 'Максимальный охват' : 'Global Reach'}
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'ru'
                  ? 'Более 100 млн разработчиков. Люди ищут альтернативы Jenkins именно на GitHub.'
                  : 'Over 100M developers discover open source alternatives on GitHub.'}
              </p>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
              <div className="font-bold text-white mb-1">
                {lang === 'ru' ? 'Звезды и форки' : 'Stars & Forks'}
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'ru'
                  ? 'Разработчики смогут контрибьютить, предлагать улучшения и распространять проект.'
                  : 'Community can star, fork, and submit Pull Requests to improve the engine.'}
              </p>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
              <div className="font-bold text-white mb-1">
                {lang === 'ru' ? '100% бесплатно' : 'Zero Cost'}
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'ru'
                  ? 'Неограниченные публичные репозитории, Issues, Discussions, Releases и бинарники.'
                  : 'Unlimited public repos, issues, discussions, and release storage.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quickstart launch command snippet */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              {lang === 'ru' ? 'Команда быстрого запуска для пользователей (Docker):' : 'One-line Docker quickstart:'}
            </span>
            <button
              onClick={copyDockerCommand}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono cursor-pointer"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd ? 'Скопировано!' : 'Копировать docker run'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300 break-all select-all">
            docker run -d -p 3000:3000 --name zigzag-ci -v /var/run/docker.sock:/var/run/docker.sock zigzagci/server:latest
          </div>
        </div>

        {/* Step by step publishing recommendation */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-2 text-xs">
          <div className="font-bold text-white mb-1">
            {lang === 'ru' ? 'Рекомендованная структура репозитория на GitHub:' : 'Recommended GitHub Setup:'}
          </div>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px]">
            <li>
              <strong>Имя репозитория:</strong> <code className="text-amber-300 font-mono">zigzag-ci</code> или <code className="text-amber-300 font-mono">zigzag-automation</code>
            </li>
            <li>
              <strong>Теги (Topics):</strong> <code className="text-slate-400 font-mono">jenkins-alternative, ci-cd, devops, pipelines, freestyle-jobs, automation</code>
            </li>
            <li>
              <strong>Лицензия:</strong> <code className="text-emerald-400 font-mono">Apache-2.0</code> или <code className="text-emerald-400 font-mono">MIT</code> — чтобы любой желающий мог свободно разворачивать у себя.
            </li>
          </ul>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Heart className="w-4 h-4 text-rose-500 fill-current" />
            <span>{lang === 'ru' ? 'Сделано для людей и свободного интернета' : 'Open for everyone'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            {lang === 'ru' ? 'Отлично, спасибо!' : 'Got it!'}
          </button>
        </div>
      </div>
    </div>
  );
};
