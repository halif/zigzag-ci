import React, { useState } from 'react';
import { useCiCd } from '../../context/CiCdContext';
import { KeyRound, Plus, Trash2, Shield, Eye, EyeOff, Lock, Check } from 'lucide-react';

export const SecretsVaultView: React.FC = () => {
  const { secrets, addSecret, deleteSecret, lang } = useCiCd();
  const [showModal, setShowModal] = useState(false);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<'global' | 'project'>('global');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;

    addSecret({
      key: key.trim().toUpperCase(),
      maskedValue: value.length > 8 ? `${value.substring(0, 4)}••••••••${value.substring(value.length - 4)}` : '••••••••',
      description: description.trim() || 'CI/CD pipeline encrypted token',
      scope,
    });

    setKey('');
    setValue('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ru' ? 'Сейф секретов и переменных (Secrets Vault)' : 'Secrets & Credentials Vault'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ru'
              ? 'Зашифрованные токены, ключи реестров и приватные сертификаты для безопасной сборки и деплоя'
              : 'AES-256 encrypted access tokens, deployment SSH keys, and registry credentials'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Добавить секрет' : 'New Secret'}</span>
        </button>
      </div>

      {/* Secrets List Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 select-none">
              <tr>
                <th className="py-3 px-4">Имя переменной / Ключ</th>
                <th className="py-3 px-4">Значение</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Область видимости</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {secrets.map((sec) => {
                const isRevealed = revealedIds[sec.id];
                return (
                  <tr key={sec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{sec.key}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{isRevealed ? 'sec_live_98a44b1029c' : sec.maskedValue}</span>
                        <button
                          onClick={() => toggleReveal(sec.id)}
                          className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-sm truncate">
                      {sec.description}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 capitalize">
                        {sec.scope}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteSecret(sec.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Secret Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAdd}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4"
          >
            <h3 className="text-base font-bold text-white">
              {lang === 'ru' ? 'Добавление нового секрета' : 'Add New Secret'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'ru' ? 'Имя переменной (uppercase snake_case)' : 'Variable Key'}
              </label>
              <input
                type="text"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. AWS_SECRET_ACCESS_KEY"
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'ru' ? 'Значение секрета' : 'Secret Value'}
              </label>
              <input
                type="password"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="••••••••••••••••"
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'ru' ? 'Описание' : 'Description'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Staging Kubernetes cluster token"
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'ru' ? 'Область видимости' : 'Scope'}
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="global">{lang === 'ru' ? 'Глобально (все пайплайны)' : 'Global'}</option>
                <option value="project">{lang === 'ru' ? 'Проектный уровень' : 'Project Scope'}</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'ru' ? 'Сохранить секрет' : 'Save Secret'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
