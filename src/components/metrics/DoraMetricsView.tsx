import React from 'react';
import { useCiCd } from '../../context/CiCdContext';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Zap,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const DoraMetricsView: React.FC = () => {
  const { doraMetrics, pipelines, lang } = useCiCd();

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ru' ? 'Метрики DORA и надежность CI/CD' : 'DORA Metrics & Engineering Velocity'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ru'
              ? 'Стандарты эффективности DevOps: частота релизов, скорость прохождения пайплайнов и стабильность'
              : 'Industry-standard delivery performance: Deployment Frequency, Lead Time, MTTR, and Failure Rate'}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'ru' ? 'За последние 30 дней' : 'Last 30 Days'}</span>
        </div>
      </div>

      {/* 4 DORA KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Deployment Frequency */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{lang === 'ru' ? 'Частота деплоев' : 'Deployment Frequency'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                {doraMetrics.deploymentFrequency.rating}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-2">
              {doraMetrics.deploymentFrequency.value}
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 mt-4 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{doraMetrics.deploymentFrequency.delta}</span>
          </div>
        </div>

        {/* 2. Lead Time for Changes */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{lang === 'ru' ? 'Время доставки изменений' : 'Lead Time for Changes'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                {doraMetrics.leadTimeForChanges.rating}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-2">
              {doraMetrics.leadTimeForChanges.value}
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 mt-4 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{doraMetrics.leadTimeForChanges.delta}</span>
          </div>
        </div>

        {/* 3. Change Failure Rate */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{lang === 'ru' ? 'Доля сбойных сборок' : 'Change Failure Rate'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                {doraMetrics.changeFailureRate.rating}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-2">
              {doraMetrics.changeFailureRate.value}
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 mt-4 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{doraMetrics.changeFailureRate.delta}</span>
          </div>
        </div>

        {/* 4. Mean Time to Recovery */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{lang === 'ru' ? 'Время восстановления (MTTR)' : 'Mean Time to Recovery'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                {doraMetrics.meanTimeToRecovery.rating}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-2">
              {doraMetrics.meanTimeToRecovery.value}
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 mt-4 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{doraMetrics.meanTimeToRecovery.delta}</span>
          </div>
        </div>
      </div>

      {/* Visual Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Duration Distribution */}
        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'ru' ? 'Распределение времени выполнения' : 'Execution Duration Distribution'}</span>
            </h3>
            <span className="text-xs text-slate-500">P50: 89s · P95: 180s</span>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {pipelines.map((pipe) => {
              const maxSec = 240;
              const percent = Math.min(100, (pipe.avgDurationSec / maxSec) * 100);
              return (
                <div key={pipe.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{pipe.name}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {pipe.avgDurationSec}s avg
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flaky Tests & Reliability Warning */}
        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ru' ? 'Анализ стабильности и Flaky тестов' : 'Reliability & Flaky Tests'}</span>
            </h3>
            <span className="text-xs text-emerald-400 font-medium">99.1% Pass Rate</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-slate-200 font-semibold">
                  tests/test_embedding_batch.py::test_fp16_large_tensor
                </div>
                <div className="text-[11px] text-rose-400 mt-0.5">
                  1 failure in last 24h · CUDA OOM on worker-gpu
                </div>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">embedding-engine</span>
            </div>

            <div className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-slate-200 font-semibold">
                  e2e/payment-checkout.spec.ts::shouldValidate3DSecure
                </div>
                <div className="text-[11px] text-amber-400 mt-0.5">
                  Flaky (2 retries needed) · Gateway timeout
                </div>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">payment-ledger</span>
            </div>

            <div className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-slate-200 font-semibold">
                  auth/session_test.go::TestSessionRevocationWithRedis
                </div>
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  100% стабилен (140 запусков без сбоев)
                </div>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">auth-gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
