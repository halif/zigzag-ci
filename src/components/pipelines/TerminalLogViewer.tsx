import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../../types/cicd';
import {
  Search,
  Download,
  Copy,
  Check,
  ChevronDown,
  ArrowDownToLine,
  AlertTriangle,
  Terminal,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface TerminalLogViewerProps {
  logs: LogEntry[];
  stageFilter?: string | null;
  onClearStageFilter?: () => void;
  lang?: 'ru' | 'en';
  isRunning?: boolean;
}

export const TerminalLogViewer: React.FC<TerminalLogViewerProps> = ({
  logs,
  stageFilter,
  onClearStageFilter,
  lang = 'ru',
  isRunning = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'error' | 'warn' | 'cmd'>('all');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (stageFilter && log.stageId !== stageFilter) return false;
    if (logLevelFilter === 'error' && log.level !== 'error') return false;
    if (logLevelFilter === 'warn' && log.level !== 'warn' && log.level !== 'error') return false;
    if (logLevelFilter === 'cmd' && log.level !== 'cmd') return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.text.toLowerCase().includes(term) ||
        log.stageName.toLowerCase().includes(term) ||
        log.timestamp.includes(term)
      );
    }
    return true;
  });

  const handleCopyLogs = () => {
    const rawText = filteredLogs.map((l) => `[${l.timestamp}] [${l.stageName}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const rawText = filteredLogs.map((l) => `[${l.timestamp}] [${l.stageName}] ${l.text}`).join('\n');
    const blob = new Blob([rawText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-run-console-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const jumpToFirstError = () => {
    setLogLevelFilter('error');
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const errorCount = logs.filter((l) => l.level === 'error').length;

  return (
    <div
      className={`flex flex-col bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[460px]'
      }`}
    >
      {/* Top Console Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300 font-sans font-medium text-xs">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'ru' ? 'Консоль сборки (Live Logs)' : 'Build Console Output'}</span>
          </div>

          {stageFilter && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
              <span>{lang === 'ru' ? 'Стадия:' : 'Stage:'}</span>
              <span className="font-semibold text-white">
                {logs.find((l) => l.stageId === stageFilter)?.stageName || stageFilter}
              </span>
              {onClearStageFilter && (
                <button
                  onClick={onClearStageFilter}
                  className="ml-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {errorCount > 0 && (
            <button
              onClick={jumpToFirstError}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-sans font-medium text-rose-300 bg-rose-950/70 border border-rose-800/80 rounded hover:bg-rose-900/50 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>
                {errorCount} {lang === 'ru' ? 'ошибок' : 'errors'}
              </span>
            </button>
          )}

          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-sans font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{lang === 'ru' ? 'Стриминг...' : 'Streaming...'}</span>
            </span>
          )}
        </div>

        {/* Right Tools: Search, Filter, Auto-scroll, Download, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={lang === 'ru' ? 'Поиск в логах...' : 'Filter logs...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 text-[11px] w-36 focus:w-48 focus:outline-none focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 text-[11px] font-sans">
            <button
              onClick={() => setLogLevelFilter('all')}
              className={`px-2 py-0.5 rounded ${
                logLevelFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLogLevelFilter('cmd')}
              className={`px-2 py-0.5 rounded ${
                logLevelFilter === 'cmd' ? 'bg-slate-800 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cmd
            </button>
            <button
              onClick={() => setLogLevelFilter('warn')}
              className={`px-2 py-0.5 rounded ${
                logLevelFilter === 'warn' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Warn
            </button>
            <button
              onClick={() => setLogLevelFilter('error')}
              className={`px-2 py-0.5 rounded ${
                logLevelFilter === 'error' ? 'bg-rose-950 text-rose-300 font-medium' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Err
            </button>
          </div>

          {/* Toggle Timestamps */}
          <button
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={`px-2 py-1 text-[11px] font-sans rounded border transition-colors ${
              showTimestamps
                ? 'border-slate-700 text-slate-300 bg-slate-800/80'
                : 'border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle timestamps"
          >
            00:00
          </button>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-sans rounded border transition-colors ${
              autoScroll
                ? 'border-indigo-600/70 text-indigo-300 bg-indigo-950/40'
                : 'border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Auto-scroll"
          >
            <ArrowDownToLine className="w-3 h-3" />
            <span className="hidden sm:inline">Follow</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyLogs}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded border border-slate-800 transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadLogs}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded border border-slate-800 transition-colors"
            title="Download log file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded border border-slate-800 transition-colors"
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-200"
      >
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-sans text-xs">
            {lang === 'ru' ? 'Нет строк логов, соответствующих фильтрам' : 'No log lines matching filters'}
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            let textColor = 'text-slate-300';
            let prefixBadge = null;

            if (log.level === 'cmd') {
              textColor = 'text-cyan-300 font-semibold';
            } else if (log.level === 'error') {
              textColor = 'text-rose-400 bg-rose-950/20 px-1 py-0.5 rounded';
              prefixBadge = <span className="text-rose-500 font-bold mr-1">[ERROR]</span>;
            } else if (log.level === 'warn') {
              textColor = 'text-amber-300 bg-amber-950/20 px-1 py-0.5 rounded';
              prefixBadge = <span className="text-amber-500 font-bold mr-1">[WARN]</span>;
            } else if (log.level === 'success') {
              textColor = 'text-emerald-400';
              prefixBadge = <span className="text-emerald-500 font-bold mr-1">[OK]</span>;
            }

            return (
              <div
                key={log.id || index}
                className="flex items-start gap-2 hover:bg-slate-900/60 px-1.5 py-0.5 rounded transition-colors group leading-relaxed"
              >
                {/* Line number */}
                <span className="text-slate-600 select-none text-[10px] w-7 text-right shrink-0 tabular-nums font-mono pt-0.5">
                  {index + 1}
                </span>

                {/* Timestamp */}
                {showTimestamps && (
                  <span className="text-slate-500 select-none text-[10px] shrink-0 tabular-nums font-mono pt-0.5">
                    {log.timestamp}
                  </span>
                )}

                {/* Stage Tag */}
                <span className="text-[10px] text-slate-500 select-none border border-slate-800 px-1 rounded shrink-0">
                  {log.stageName}
                </span>

                {/* Text Content */}
                <div className={`flex-1 break-all whitespace-pre-wrap ${textColor}`}>
                  {prefixBadge}
                  {log.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer Bar */}
      <div className="px-4 py-1.5 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-sans">
        <div className="flex items-center gap-3">
          <span>
            {filteredLogs.length} {lang === 'ru' ? 'строк' : 'lines'}
          </span>
          <span className="text-slate-600">·</span>
          <span>UTF-8 / bash shell</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>Esc / Ctrl+F для поиска</span>
        </div>
      </div>
    </div>
  );
};
