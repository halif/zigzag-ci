export type StageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'waiting_approval';

export type BuildStatus = 'queued' | 'running' | 'success' | 'failed' | 'canceled' | 'paused';

export interface StageStep {
  id: string;
  name: string;
  command: string;
  status: StageStatus;
  durationMs: number;
  exitCode?: number;
  logLines: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  status: StageStatus;
  parallelGroupId?: string;
  steps: StageStep[];
  durationMs: number;
  requiresApproval?: boolean;
  approvalNotes?: string;
  approvedBy?: string;
  agentLabel?: string;
}

export interface BuildArtifact {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  path: string;
  createdStage: string;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  coveragePercent: number;
}

export interface CommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  author: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  branch: string;
  compareUrl?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'cmd';
  stageId: string;
  stageName: string;
  text: string;
}

export interface BuildRun {
  id: string;
  pipelineId: string;
  pipelineName: string;
  runNumber: number;
  status: BuildStatus;
  branch: string;
  commit: CommitInfo;
  triggeredBy: 'git_push' | 'pull_request' | 'manual' | 'cron' | 'webhook';
  triggerUser?: string;
  runnerNode: string;
  startedAt: string;
  finishedAt?: string;
  durationSeconds: number;
  stages: PipelineStage[];
  logs: LogEntry[];
  artifacts: BuildArtifact[];
  testResults?: TestSummary;
  envOverrides?: Record<string, string>;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  repository: string;
  defaultBranch: string;
  category: 'backend' | 'frontend' | 'microservice' | 'mobile' | 'ai_data';
  yamlConfig: string;
  tags: string[];
  stagesConfig: {
    id: string;
    name: string;
    parallelGroupId?: string;
    requiresApproval?: boolean;
    agentLabel?: string;
    commands: string[];
  }[];
  triggers: {
    onPush: boolean;
    onPr: boolean;
    cronSchedule?: string;
  };
  totalRuns: number;
  successRate: number;
  avgDurationSec: number;
  lastRun?: {
    id: string;
    runNumber: number;
    status: BuildStatus;
    finishedAt: string;
    durationSeconds: number;
    branch: string;
  };
  environmentVars: { key: string; value: string; isSecret: boolean }[];
  updatedAt: string;
}

export interface AgentNode {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  os: 'Linux' | 'macOS' | 'Windows';
  arch: 'x86_64' | 'arm64' | 'k8s-pod';
  status: 'online' | 'busy' | 'offline';
  totalExecutors: number;
  usedExecutors: number;
  labels: string[];
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
  activeBuilds: { runId: string; runNumber: number; pipelineName: string }[];
}

export interface SecretItem {
  id: string;
  key: string;
  maskedValue: string;
  description: string;
  scope: 'global' | 'project';
  pipelineIds?: string[];
  updatedAt: string;
}

export interface DoraMetrics {
  deploymentFrequency: {
    value: string;
    rating: 'Elite' | 'High' | 'Medium' | 'Low';
    delta: string;
    weeklyValues: number[];
  };
  leadTimeForChanges: {
    value: string;
    rating: 'Elite' | 'High' | 'Medium' | 'Low';
    delta: string;
    trend: number[];
  };
  changeFailureRate: {
    value: string;
    rating: 'Elite' | 'High' | 'Medium' | 'Low';
    delta: string;
    trend: number[];
  };
  meanTimeToRecovery: {
    value: string;
    rating: 'Elite' | 'High' | 'Medium' | 'Low';
    delta: string;
    trend: number[];
  };
}

export type JobParamType = 'string' | 'choice' | 'boolean';

export interface JobParameter {
  id: string;
  name: string;
  type: JobParamType;
  defaultValue: string;
  description: string;
  choices?: string[];
}

export interface BuildStepItem {
  id: string;
  name: string;
  type: 'shell' | 'docker' | 'script';
  command: string;
  enabled: boolean;
}

export interface PostBuildAction {
  id: string;
  type: 'archive' | 'slack_alert' | 'trigger_job';
  label: string;
  config: Record<string, any>;
}

export interface FreestyleJob {
  id: string;
  name: string;
  description: string;
  runnerNode: string;
  parameters: JobParameter[];
  buildSteps: BuildStepItem[];
  postBuildActions: PostBuildAction[];
  totalRuns: number;
  successRate: number;
  avgDurationSec: number;
  lastRun?: {
    id: string;
    runNumber: number;
    status: BuildStatus;
    durationSeconds: number;
    finishedAt: string;
  };
  workspaceFiles?: { name: string; size: string; updatedAt: string }[];
  updatedAt: string;
}

export interface FreestyleRun {
  id: string;
  jobId: string;
  jobName: string;
  runNumber: number;
  status: BuildStatus;
  startedAt: string;
  finishedAt?: string;
  durationSeconds: number;
  paramsUsed: Record<string, string | boolean>;
  steps: {
    id: string;
    name: string;
    command: string;
    status: StageStatus;
    durationMs: number;
    exitCode?: number;
  }[];
  logs: LogEntry[];
  artifacts: BuildArtifact[];
}

