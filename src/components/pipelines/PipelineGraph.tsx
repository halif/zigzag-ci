import React, { useState } from 'react';
import { PipelineStage, StageStatus } from '../../types/cicd';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Check,
  X,
  Play,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface PipelineGraphProps {
  stages: PipelineStage[];
  selectedStageId?: string | null;
  onSelectStage: (stageId: string | null) => void;
  onApprove?: (stageId: string, notes?: string) => void;
  onReject?: (stageId: string, notes?: string) => void;
  lang?: 'ru' | 'en';
}

export const PipelineGraph: React.FC<PipelineGraphProps> = ({
  stages,
  selectedStageId,
  onSelectStage,
  onApprove,
  onReject,
  lang = 'ru',
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const getStatusIcon = (status: StageStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />;
      case 'waiting_approval':
        return <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'skipped':
        return <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  const getStatusBadgeClass = (status: StageStatus, isSelected: boolean) => {
    const base = 'border transition-all duration-200 cursor-pointer rounded-lg p-3.5 text-left relative ';
    const selectedRing = isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 ' : '';

    switch (status) {
      case 'running':
        return base + selectedRing + 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/50';
      case 'success':
        return base + selectedRing + 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-600/70';
      case 'failed':
        return base + selectedRing + 'bg-rose-950/30 border-rose-600/80';
      case 'waiting_approval':
        return base + selectedRing + 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/50';
      case 'skipped':
        return base + selectedRing + 'bg-slate-900/40 border-slate-800 opacity-60';
      default:
        return base + selectedRing + 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700';
    }
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    const sec = (ms / 1000).toFixed(1);
    return `${sec}s`;
  };

  const waitingApprovalStage = stages.find((s) => s.status === 'waiting_approval');

  return (
    <div className="flex flex-col gap-4">
      {/* Scrollable DAG stage pipeline container */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 overflow-x-auto">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'ru' ? 'Граф стадий пайплайна (Pipeline Graph)' : 'Pipeline Stages DAG'}</span>
          </div>
          <span className="text-xs text-slate-500">
            {lang === 'ru' ? 'Кликните на стадию для просмотра детальных логов' : 'Click stage to filter console output'}
          </span>
        </div>

        {/* Stage chain */}
        <div className="flex items-center gap-3 py-3 min-w-max">
          {stages.map((stage, index) => {
            const isSelected = selectedStageId === stage.id;
            const isLast = index === stages.length - 1;

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Node Box */}
                <div
                  onClick={() => onSelectStage(isSelected ? null : stage.id)}
                  className={`w-60 ${getStatusBadgeClass(stage.status, isSelected)}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(stage.status)}
                      <span className="font-semibold text-sm text-slate-100 truncate max-w-[140px]" title={stage.name}>
                        {stage.name}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono tabular-nums text-slate-400">
                      {stage.status === 'running' ? (
                        <span className="text-indigo-400 font-medium">in progress</span>
                      ) : (
                        formatDuration(stage.durationMs)
                      )}
                    </span>
                  </div>

                  {/* Steps preview / meta */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="text-[11px]">
                      {stage.steps?.length ? `${stage.steps.length} ${lang === 'ru' ? 'шагов' : 'steps'}` : '1 command'}
                    </span>
                    <span className="text-[11px] capitalize text-slate-500">
                      {stage.requiresApproval ? (
                        <span className="text-amber-400 font-medium">Approval Gate</span>
                      ) : (
                        stage.status.replace('_', ' ')
                      )}
                    </span>
                  </div>

                  {/* Stage running progress line */}
                  {stage.status === 'running' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 overflow-hidden rounded-b">
                      <div className="w-full h-full bg-white/40 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Connector Arrow */}
                {!isLast && (
                  <div className="flex items-center justify-center text-slate-600 px-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Manual Approval Gate Interactive Prompt (if a stage is waiting for human approval) */}
      {waitingApprovalStage && onApprove && onReject && (
        <div className="bg-amber-950/30 border border-amber-600/70 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-200 text-sm">
                  {lang === 'ru' ? 'Требуется ручное подтверждение выпуска' : 'Manual Approval Gate Required'}
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  [{waitingApprovalStage.name}]
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-1 max-w-xl">
                {lang === 'ru'
                  ? 'Стадия развертывания в продуктивную среду требует авторизации инженера DevOps/Lead. Проверьте результаты тестов перед продолжением.'
                  : 'Production deployment stage requires DevOps authorization. Verify test logs before proceeding.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <input
              type="text"
              placeholder={lang === 'ru' ? 'Комментарий к релизу (опционально)...' : 'Release notes (optional)...'}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-amber-700/60 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-full sm:w-60"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onApprove(waitingApprovalStage.id, approvalNotes)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'Одобрить релиз' : 'Approve Release'}</span>
              </button>
              <button
                onClick={() => onReject(waitingApprovalStage.id, approvalNotes)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'Отклонить' : 'Reject'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
