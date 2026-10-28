/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CiCdProvider, useCiCd } from './context/CiCdContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PipelineList } from './components/pipelines/PipelineList';
import { PipelineDetail } from './components/pipelines/PipelineDetail';
import { PipelineEditor } from './components/pipelines/PipelineEditor';
import { RunsHistory } from './components/runs/RunsHistory';
import { AgentNodesView } from './components/agents/AgentNodesView';
import { SecretsVaultView } from './components/settings/SecretsVaultView';
import { DoraMetricsView } from './components/metrics/DoraMetricsView';
import { WebhookSimulatorView } from './components/settings/WebhookSimulatorView';
import { FreestyleJobList } from './components/freestyle/FreestyleJobList';
import { FreestyleJobDetail } from './components/freestyle/FreestyleJobDetail';
import { RunModal } from './components/pipelines/RunModal';

const AppContent: React.FC = () => {
  const { view } = useCiCd();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Bar Contract Compliant Header */}
      <Header />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {view === 'pipelines' && <PipelineList />}
          {view === 'pipeline-detail' && <PipelineDetail />}
          {view === 'pipeline-editor' && <PipelineEditor />}
          {view === 'freestyle-jobs' && <FreestyleJobList />}
          {view === 'freestyle-detail' && <FreestyleJobDetail />}
          {view === 'runs-history' && <RunsHistory />}
          {view === 'agent-nodes' && <AgentNodesView />}
          {view === 'secrets' && <SecretsVaultView />}
          {view === 'metrics' && <DoraMetricsView />}
          {view === 'webhooks' && <WebhookSimulatorView />}
        </main>
      </div>

      {/* Parameterized Launch Modal */}
      <RunModal />
    </div>
  );
};

export default function App() {
  return (
    <CiCdProvider>
      <AppContent />
    </CiCdProvider>
  );
}
