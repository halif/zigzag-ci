import { Pipeline, BuildRun, AgentNode, SecretItem, DoraMetrics, FreestyleJob, FreestyleRun } from '../types/cicd';

export const AVATAR_ALEX = '/src/assets/images/avatar_dev_alex_1792796215099.jpg';
export const AVATAR_ELENA = '/src/assets/images/avatar_dev_elena_1792796215794.jpg';
export const AVATAR_MARCUS = '/src/assets/images/avatar_dev_marcus_1792796215413.jpg';

export const INITIAL_PIPELINES: Pipeline[] = [
  {
    id: 'pipe-auth-service',
    name: 'auth-gateway-service',
    description: 'High-throughput OAuth2 & JWT session manager in Go with Redis caching and Docker container publishing.',
    repository: 'github.com/organization/auth-gateway',
    defaultBranch: 'main',
    category: 'microservice',
    tags: ['Go', 'Docker', 'Kubernetes', 'Security'],
    yamlConfig: `pipeline:
  agent:
    label: linux-x86-worker
  stages:
    - stage: Checkout
      steps:
        - name: Git Clone
          run: git clone https://github.com/organization/auth-gateway.git .
        - name: Verify Signature
          run: git verify-commit HEAD

    - stage: Lint & Security
      parallel:
        - name: GolangCI-Lint
          run: golangci-lint run --timeout 3m
        - name: Gosec SAST Audit
          run: gosec -fmt=json -out=sast-results.json ./...

    - stage: Unit & Integration Tests
      steps:
        - name: Setup Redis Test Container
          run: docker run -d -p 6379:6379 redis:7-alpine
        - name: Run Test Suite
          run: go test -v -race -coverprofile=coverage.out ./...
        - name: Codecov Upload
          run: bash <(curl -s https://codecov.io/bash) -f coverage.out

    - stage: Build Docker Image
      steps:
        - name: Build Container
          run: docker build -t cr.io/internal/auth-gateway:\${BUILD_TAG} .
        - name: Push Container
          run: docker push cr.io/internal/auth-gateway:\${BUILD_TAG}

    - stage: Deploy Staging
      steps:
        - name: Helm Upgrade Staging
          run: helm upgrade --install auth-staging ./charts/auth-gateway -n staging

    - stage: Production Approval
      approval:
        required: true
        roles: ["devops-lead", "sec-ops"]
      steps:
        - name: Production Helm Release
          run: helm upgrade --install auth-prod ./charts/auth-gateway -n prod`,
    stagesConfig: [
      {
        id: 'stg-1',
        name: 'Checkout & Verify',
        commands: ['git clone https://github.com/organization/auth-gateway.git .', 'git verify-commit HEAD'],
      },
      {
        id: 'stg-2',
        name: 'Lint & SAST Audit',
        parallelGroupId: 'code-quality',
        commands: ['golangci-lint run --timeout 3m', 'gosec -fmt=json -out=sast-results.json ./...'],
      },
      {
        id: 'stg-3',
        name: 'Unit & Race Tests',
        commands: ['docker run -d -p 6379:6379 redis:7-alpine', 'go test -v -race -coverprofile=coverage.out ./...'],
      },
      {
        id: 'stg-4',
        name: 'Docker Build & Push',
        commands: ['docker build -t cr.io/internal/auth-gateway:${BUILD_TAG} .', 'docker push cr.io/internal/auth-gateway:${BUILD_TAG}'],
      },
      {
        id: 'stg-5',
        name: 'Deploy Staging',
        commands: ['helm upgrade --install auth-staging ./charts/auth-gateway -n staging'],
      },
      {
        id: 'stg-6',
        name: 'Deploy Production',
        requiresApproval: true,
        commands: ['helm upgrade --install auth-prod ./charts/auth-gateway -n prod --set image.tag=${BUILD_TAG}'],
      },
    ],
    triggers: {
      onPush: true,
      onPr: true,
      cronSchedule: '0 2 * * *',
    },
    totalRuns: 284,
    successRate: 98.2,
    avgDurationSec: 134,
    lastRun: {
      id: 'run-auth-284',
      runNumber: 284,
      status: 'success',
      finishedAt: '12 minutes ago',
      durationSeconds: 128,
      branch: 'main',
    },
    environmentVars: [
      { key: 'DOCKER_REGISTRY', value: 'cr.io/internal', isSecret: false },
      { key: 'HELM_TIMEOUT', value: '300s', isSecret: false },
      { key: 'KUBE_CONFIG', value: '***MASKED***', isSecret: true },
    ],
    updatedAt: '2026-10-23T14:30:00Z',
  },
  {
    id: 'pipe-web-frontend',
    name: 'cloud-portal-frontend',
    description: 'React SPA customer web dashboard with Vite, Tailwind CSS, TypeScript, and Playwright E2E browser tests.',
    repository: 'github.com/organization/portal-web',
    defaultBranch: 'main',
    category: 'frontend',
    tags: ['React', 'TypeScript', 'Playwright', 'CDN'],
    yamlConfig: `pipeline:
  agent:
    label: highmem-runner
  stages:
    - stage: Dependencies & Audit
      steps:
        - name: Install Node Modules
          run: npm ci --prefer-offline
        - name: Check Vulnerabilities
          run: npm audit --audit-level=high

    - stage: Typecheck & Lint
      parallel:
        - name: TypeScript Compiler
          run: tsc --noEmit
        - name: ESLint Check
          run: eslint src/**/*.{ts,tsx}

    - stage: Unit Tests & Coverage
      steps:
        - name: Vitest Runner
          run: npm run test:unit -- --coverage

    - stage: Production Bundle
      steps:
        - name: Vite Build
          run: npm run build
        - name: Bundle Size Limit
          run: npx size-limit

    - stage: Cloudflare Pages Deploy
      steps:
        - name: Deploy Preview
          run: wrangler pages deploy dist --project-name=portal`,
    stagesConfig: [
      {
        id: 'stg-fe-1',
        name: 'Install & Audit',
        commands: ['npm ci --prefer-offline', 'npm audit --audit-level=high'],
      },
      {
        id: 'stg-fe-2',
        name: 'Typecheck & Lint',
        parallelGroupId: 'fe-verify',
        commands: ['tsc --noEmit', 'eslint src/**/*.{ts,tsx}'],
      },
      {
        id: 'stg-fe-3',
        name: 'Vitest & Coverage',
        commands: ['npm run test:unit -- --coverage'],
      },
      {
        id: 'stg-fe-4',
        name: 'Vite Production Build',
        commands: ['npm run build', 'npx size-limit'],
      },
      {
        id: 'stg-fe-5',
        name: 'Deploy CDN & Edge',
        commands: ['wrangler pages deploy dist --project-name=portal'],
      },
    ],
    triggers: {
      onPush: true,
      onPr: true,
    },
    totalRuns: 412,
    successRate: 95.8,
    avgDurationSec: 92,
    lastRun: {
      id: 'run-fe-412',
      runNumber: 412,
      status: 'success',
      finishedAt: '38 minutes ago',
      durationSeconds: 89,
      branch: 'main',
    },
    environmentVars: [
      { key: 'NODE_ENV', value: 'production', isSecret: false },
      { key: 'VITE_API_ENDPOINT', value: 'https://api.cloudportal.io', isSecret: false },
      { key: 'CLOUDFLARE_API_TOKEN', value: '***MASKED***', isSecret: true },
    ],
    updatedAt: '2026-10-23T13:45:00Z',
  },
  {
    id: 'pipe-ai-inference',
    name: 'embedding-vector-engine',
    description: 'Python FastAPI microservice for LLM vector retrieval and FAISS similarity indexing with GPU acceleration.',
    repository: 'github.com/organization/vector-engine',
    defaultBranch: 'main',
    category: 'ai_data',
    tags: ['Python', 'FastAPI', 'PyTorch', 'GPU-Worker'],
    yamlConfig: `pipeline:
  agent:
    label: gpu-accelerated-builder
  stages:
    - stage: Environment Setup
      steps:
        - name: Poetry Install
          run: poetry install --no-root
    - stage: Ruff Lint & Mypy
      steps:
        - name: Ruff Check
          run: poetry run ruff check .
        - name: Mypy Static Type
          run: poetry run mypy app/
    - stage: Model Benchmark & Tests
      steps:
        - name: Pytest Suite
          run: poetry run pytest tests/ -k "not slow"
    - stage: CUDA Container Build
      steps:
        - name: Build GPU Image
          run: docker build -f Dockerfile.gpu -t internal-registry/vector-engine:latest .`,
    stagesConfig: [
      {
        id: 'stg-ai-1',
        name: 'Setup & Dependencies',
        commands: ['poetry install --no-root'],
      },
      {
        id: 'stg-ai-2',
        name: 'Ruff & Mypy Typecheck',
        commands: ['poetry run ruff check .', 'poetry run mypy app/'],
      },
      {
        id: 'stg-ai-3',
        name: 'Pytest Suite & Benchmark',
        commands: ['poetry run pytest tests/ -k "not slow"'],
      },
      {
        id: 'stg-ai-4',
        name: 'Docker CUDA Container',
        commands: ['docker build -f Dockerfile.gpu -t internal-registry/vector-engine:latest .'],
      },
    ],
    triggers: {
      onPush: true,
      onPr: true,
    },
    totalRuns: 167,
    successRate: 91.5,
    avgDurationSec: 210,
    lastRun: {
      id: 'run-ai-167',
      runNumber: 167,
      status: 'failed',
      finishedAt: '2 hours ago',
      durationSeconds: 145,
      branch: 'feature/fp16-quantization',
    },
    environmentVars: [
      { key: 'CUDA_VISIBLE_DEVICES', value: '0,1', isSecret: false },
      { key: 'HUGGINGFACE_TOKEN', value: '***MASKED***', isSecret: true },
    ],
    updatedAt: '2026-10-23T11:20:00Z',
  },
  {
    id: 'pipe-billing-core',
    name: 'payment-ledger-pipeline',
    description: 'Mission-critical financial transactions engine with double-entry ledger audits and PCI-DSS compliance checks.',
    repository: 'github.com/organization/payment-ledger',
    defaultBranch: 'main',
    category: 'backend',
    tags: ['Java', 'Spring-Boot', 'Postgres', 'PCI-DSS'],
    yamlConfig: `pipeline:
  agent:
    label: secure-hardened-node
  stages:
    - stage: Maven Verify & Dependency Check
      steps:
        - name: OWASP Dependency Check
          run: mvn org.owasp:dependency-check-maven:check
    - stage: Unit & ArchUnit Tests
      steps:
        - name: Run Spring Boot Tests
          run: mvn test -Dtest=*UnitTest
    - stage: Security Penetration Scan
      steps:
        - name: SonarQube Scanner
          run: mvn sonar:sonar -Dsonar.projectKey=payment-ledger
    - stage: Release Canary
      requiresApproval: true
      steps:
        - name: Deploy Canary 5%
          run: kubectl apply -f k8s/canary-deployment.yaml`,
    stagesConfig: [
      {
        id: 'stg-bl-1',
        name: 'OWASP Dependency Audit',
        commands: ['mvn org.owasp:dependency-check-maven:check'],
      },
      {
        id: 'stg-bl-2',
        name: 'JUnit 5 & ArchUnit Tests',
        commands: ['mvn test -Dtest=*UnitTest'],
      },
      {
        id: 'stg-bl-3',
        name: 'SonarQube Quality Gate',
        commands: ['mvn sonar:sonar -Dsonar.projectKey=payment-ledger'],
      },
      {
        id: 'stg-bl-4',
        name: 'Canary Deployment (5%)',
        requiresApproval: true,
        commands: ['kubectl apply -f k8s/canary-deployment.yaml'],
      },
    ],
    triggers: {
      onPush: true,
      onPr: false,
      cronSchedule: '0 4 * * 1-5',
    },
    totalRuns: 512,
    successRate: 99.4,
    avgDurationSec: 180,
    lastRun: {
      id: 'run-bl-512',
      runNumber: 512,
      status: 'success',
      finishedAt: '3 hours ago',
      durationSeconds: 172,
      branch: 'main',
    },
    environmentVars: [
      { key: 'STRIPE_WEBHOOK_SECRET', value: '***MASKED***', isSecret: true },
      { key: 'DATABASE_URL', value: 'postgresql://postgres-primary:5432/ledger', isSecret: false },
    ],
    updatedAt: '2026-10-23T09:15:00Z',
  },
];

export const INITIAL_RUNS: BuildRun[] = [
  {
    id: 'run-auth-284',
    pipelineId: 'pipe-auth-service',
    pipelineName: 'auth-gateway-service',
    runNumber: 284,
    status: 'success',
    branch: 'main',
    commit: {
      hash: '9a4d8c72e401bc3b9a5f78c001',
      shortHash: '9a4d8c7',
      message: 'feat(oauth): add support for PKCE RFC 7636 token exchange and revoke endpoint',
      author: {
        name: 'Alexei Smirnov',
        email: 'alexei.dev@organization.com',
        avatarUrl: AVATAR_ALEX,
      },
      branch: 'main',
    },
    triggeredBy: 'git_push',
    runnerNode: 'worker-linux-x86-01',
    startedAt: '2026-10-23T15:40:12Z',
    finishedAt: '2026-10-23T15:42:20Z',
    durationSeconds: 128,
    stages: [
      {
        id: 'stg-1',
        name: 'Checkout & Verify',
        status: 'success',
        durationMs: 4200,
        steps: [
          {
            id: 'stp-1-1',
            name: 'Git Clone',
            command: 'git clone https://github.com/organization/auth-gateway.git .',
            status: 'success',
            durationMs: 2400,
            exitCode: 0,
            logLines: [
              'Cloning into bare repository /var/lib/runner/workspaces/auth-gateway...',
              'POST git-upload-pack (942 objects)',
              'Receiving objects: 100% (942/942), 4.12 MiB | 18.4 MiB/s, done.',
              'Resolving deltas: 100% (612/612), completed with 82 local objects.',
              'HEAD is now at 9a4d8c7 feat(oauth): add PKCE token exchange',
            ],
          },
          {
            id: 'stp-1-2',
            name: 'Verify Signature',
            command: 'git verify-commit HEAD',
            status: 'success',
            durationMs: 1800,
            exitCode: 0,
            logLines: [
              'gpg: Signature made Fri Oct 23 15:39:55 2026 MSK',
              'gpg: using RSA key 4F817B29A0E3C114',
              'gpg: Good signature from "Alexei Smirnov <alexei.dev@organization.com>" [ultimate]',
            ],
          },
        ],
      },
      {
        id: 'stg-2',
        name: 'Lint & SAST Audit',
        status: 'success',
        parallelGroupId: 'code-quality',
        durationMs: 18400,
        steps: [
          {
            id: 'stp-2-1',
            name: 'GolangCI-Lint',
            command: 'golangci-lint run --timeout 3m',
            status: 'success',
            durationMs: 9200,
            exitCode: 0,
            logLines: [
              'level=info msg="[config_reader] Config search paths: [/var/lib/runner/...]"',
              'level=info msg="[lintersdb] Active 14 linters: [errcheck gosimple govet ineffassign staticcheck typecheck unused gofmt goimports misspell unconvert unparam gocritic revive]"',
              'level=info msg="[runner] Processing 42 Go source packages..."',
              '0 issues found in 42 packages. Clean pass.',
            ],
          },
          {
            id: 'stp-2-2',
            name: 'Gosec SAST Audit',
            command: 'gosec -fmt=json -out=sast-results.json ./...',
            status: 'success',
            durationMs: 9200,
            exitCode: 0,
            logLines: [
              'Scanning 42 packages for AST security patterns...',
              'Checking for hardcoded credentials: PASS',
              'Checking for unescaped SQL: PASS',
              'Checking for insecure crypto algorithms: PASS (TLS 1.3 enforced)',
              'SAST findings: 0 High, 0 Medium, 2 Low (Informational non-blocking).',
            ],
          },
        ],
      },
      {
        id: 'stg-3',
        name: 'Unit & Race Tests',
        status: 'success',
        durationMs: 34100,
        steps: [
          {
            id: 'stp-3-1',
            name: 'Setup Redis Test Container',
            command: 'docker run -d -p 6379:6379 redis:7-alpine',
            status: 'success',
            durationMs: 3100,
            exitCode: 0,
            logLines: [
              '78e9b21fa890: Pull complete',
              'Container 78e9b21fa890 running on port 6379',
              'Ready to accept connections via TCP',
            ],
          },
          {
            id: 'stp-3-2',
            name: 'Run Test Suite',
            command: 'go test -v -race -coverprofile=coverage.out ./...',
            status: 'success',
            durationMs: 31000,
            exitCode: 0,
            logLines: [
              '=== RUN   TestOAuthTokenExchangePKCE',
              '--- PASS: TestOAuthTokenExchangePKCE (0.14s)',
              '=== RUN   TestJWTSignatureVerificationEd25519',
              '--- PASS: TestJWTSignatureVerificationEd25519 (0.08s)',
              '=== RUN   TestSessionRevocationWithRedisCluster',
              '--- PASS: TestSessionRevocationWithRedisCluster (0.32s)',
              'PASS: all 186 unit and integration test assertions passed without data race.',
              'coverage: 88.4% of statements',
            ],
          },
        ],
      },
      {
        id: 'stg-4',
        name: 'Docker Build & Push',
        status: 'success',
        durationMs: 42300,
        steps: [
          {
            id: 'stp-4-1',
            name: 'Build Multi-Stage Image',
            command: 'docker build -t cr.io/internal/auth-gateway:build-284 .',
            status: 'success',
            durationMs: 32000,
            exitCode: 0,
            logLines: [
              'Step 1/12 : FROM golang:1.24-alpine AS builder',
              'Step 2/12 : WORKDIR /app',
              'Step 3/12 : COPY go.mod go.sum ./',
              'Step 4/12 : RUN go mod download',
              'Step 5/12 : COPY . .',
              'Step 6/12 : RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o auth-server main.go',
              'Step 7/12 : FROM gcr.io/distroless/static-debian12:nonroot',
              'Step 8/12 : COPY --from=builder /app/auth-server /auth-server',
              'Step 9/12 : USER nonroot:nonroot',
              'Step 10/12 : EXPOSE 8080 9090',
              'Successfully tagged cr.io/internal/auth-gateway:build-284',
              'Image size: 28.4 MB (Distroless nonroot)',
            ],
          },
          {
            id: 'stp-4-2',
            name: 'Push Container to Registry',
            command: 'docker push cr.io/internal/auth-gateway:build-284',
            status: 'success',
            durationMs: 10300,
            exitCode: 0,
            logLines: [
              'The push refers to repository [cr.io/internal/auth-gateway]',
              '5f70bf18a086: Layer pushed',
              'build-284: digest: sha256:69b0fa81309d2bc7a3f01b1b22e11894d0e',
            ],
          },
        ],
      },
      {
        id: 'stg-5',
        name: 'Deploy Staging',
        status: 'success',
        durationMs: 14200,
        steps: [
          {
            id: 'stp-5-1',
            name: 'Helm Upgrade Staging',
            command: 'helm upgrade --install auth-staging ./charts/auth-gateway -n staging',
            status: 'success',
            durationMs: 14200,
            exitCode: 0,
            logLines: [
              'Release "auth-staging" has been upgraded. Happy Helming!',
              'NAME: auth-staging',
              'LAST DEPLOYED: Fri Oct 23 15:42:08 2026',
              'NAMESPACE: staging',
              'STATUS: deployed',
              'REVISION: 42',
              'Waiting for deployment "auth-staging" rollout to finish: 3 of 3 updated replicas are available...',
              'Deployment "auth-staging" successfully rolled out.',
            ],
          },
        ],
      },
      {
        id: 'stg-6',
        name: 'Deploy Production',
        status: 'waiting_approval',
        requiresApproval: true,
        durationMs: 0,
        steps: [
          {
            id: 'stp-6-1',
            name: 'Production Helm Release',
            command: 'helm upgrade --install auth-prod ./charts/auth-gateway -n prod --set image.tag=build-284',
            status: 'pending',
            durationMs: 0,
            logLines: [],
          },
        ],
      },
    ],
    logs: [
      { id: 'l1', timestamp: '15:40:12.102', level: 'info', stageId: 'stg-1', stageName: 'Checkout & Verify', text: 'Pipeline initialized on runner agent [worker-linux-x86-01]' },
      { id: 'l2', timestamp: '15:40:12.450', level: 'cmd', stageId: 'stg-1', stageName: 'Checkout & Verify', text: '$ git clone https://github.com/organization/auth-gateway.git .' },
      { id: 'l3', timestamp: '15:40:14.850', level: 'info', stageId: 'stg-1', stageName: 'Checkout & Verify', text: 'Checked out revision 9a4d8c72e401bc3b9a5f78c001 (branch: main)' },
      { id: 'l4', timestamp: '15:40:16.320', level: 'success', stageId: 'stg-1', stageName: 'Checkout & Verify', text: 'Commit GPG signature verified (Alexei Smirnov)' },
      { id: 'l5', timestamp: '15:40:16.600', level: 'info', stageId: 'stg-2', stageName: 'Lint & SAST Audit', text: 'Launching parallel quality checks: [GolangCI-Lint, Gosec SAST]' },
      { id: 'l6', timestamp: '15:40:25.800', level: 'cmd', stageId: 'stg-2', stageName: 'Lint & SAST Audit', text: '$ golangci-lint run --timeout 3m' },
      { id: 'l7', timestamp: '15:40:35.000', level: 'success', stageId: 'stg-2', stageName: 'Lint & SAST Audit', text: 'Static analysis passed: 0 linter violations, 0 high security vulnerabilities' },
      { id: 'l8', timestamp: '15:40:35.200', level: 'cmd', stageId: 'stg-3', stageName: 'Unit & Race Tests', text: '$ go test -v -race -coverprofile=coverage.out ./...' },
      { id: 'l9', timestamp: '15:40:48.300', level: 'info', stageId: 'stg-3', stageName: 'Unit & Race Tests', text: 'Running 186 unit tests across auth, token, session, crypto packages' },
      { id: 'l10', timestamp: '15:41:09.300', level: 'success', stageId: 'stg-3', stageName: 'Unit & Race Tests', text: 'All 186 tests passed with 88.4% code coverage' },
      { id: 'l11', timestamp: '15:41:09.500', level: 'cmd', stageId: 'stg-4', stageName: 'Docker Build & Push', text: '$ docker build -t cr.io/internal/auth-gateway:build-284 .' },
      { id: 'l12', timestamp: '15:41:41.500', level: 'info', stageId: 'stg-4', stageName: 'Docker Build & Push', text: 'Exported distroless binary (28.4 MB). Pushing layer digests...' },
      { id: 'l13', timestamp: '15:41:51.800', level: 'success', stageId: 'stg-4', stageName: 'Docker Build & Push', text: 'Image cr.io/internal/auth-gateway:build-284 published to registry' },
      { id: 'l14', timestamp: '15:41:52.000', level: 'cmd', stageId: 'stg-5', stageName: 'Deploy Staging', text: '$ helm upgrade --install auth-staging ./charts/auth-gateway -n staging' },
      { id: 'l15', timestamp: '15:42:06.200', level: 'success', stageId: 'stg-5', stageName: 'Deploy Staging', text: 'Staging rollout complete: 3/3 pods healthy in namespace [staging]' },
      { id: 'l16', timestamp: '15:42:06.500', level: 'warn', stageId: 'stg-6', stageName: 'Deploy Production', text: 'STAGE PAUSED: Requires manual approval before releasing to Production' },
    ],
    artifacts: [
      {
        id: 'art-1',
        name: 'auth-server-distroless.tar',
        sizeBytes: 29780000,
        type: 'Docker Image Archive',
        path: '/builds/artifacts/auth-server-distroless.tar',
        createdStage: 'Docker Build & Push',
      },
      {
        id: 'art-2',
        name: 'coverage.html',
        sizeBytes: 1420000,
        type: 'HTML Test Coverage Report',
        path: '/reports/coverage.html',
        createdStage: 'Unit & Race Tests',
      },
      {
        id: 'art-3',
        name: 'sast-security-report.json',
        sizeBytes: 45000,
        type: 'JSON Vulnerability Scan',
        path: '/reports/sast-security-report.json',
        createdStage: 'Lint & SAST Audit',
      },
    ],
    testResults: {
      total: 186,
      passed: 186,
      failed: 0,
      skipped: 0,
      durationMs: 31000,
      coveragePercent: 88.4,
    },
  },
  {
    id: 'run-fe-412',
    pipelineId: 'pipe-web-frontend',
    pipelineName: 'cloud-portal-frontend',
    runNumber: 412,
    status: 'success',
    branch: 'main',
    commit: {
      hash: '3f8e12b9a7101c5d992e',
      shortHash: '3f8e12b',
      message: 'fix(billing): correct VAT display in subscription upgrade modal',
      author: {
        name: 'Elena Volkova',
        email: 'elena.v@organization.com',
        avatarUrl: AVATAR_ELENA,
      },
      branch: 'main',
    },
    triggeredBy: 'pull_request',
    runnerNode: 'worker-highmem-02',
    startedAt: '2026-10-23T15:15:00Z',
    finishedAt: '2026-10-23T15:16:29Z',
    durationSeconds: 89,
    stages: [
      { id: 'stg-fe-1', name: 'Install & Audit', status: 'success', durationMs: 14000, steps: [] },
      { id: 'stg-fe-2', name: 'Typecheck & Lint', status: 'success', durationMs: 12000, steps: [] },
      { id: 'stg-fe-3', name: 'Vitest & Coverage', status: 'success', durationMs: 25000, steps: [] },
      { id: 'stg-fe-4', name: 'Vite Production Build', status: 'success', durationMs: 21000, steps: [] },
      { id: 'stg-fe-5', name: 'Deploy CDN & Edge', status: 'success', durationMs: 17000, steps: [] },
    ],
    logs: [
      { id: 'fl1', timestamp: '15:15:02.100', level: 'info', stageId: 'stg-fe-1', stageName: 'Install & Audit', text: 'npm ci completed in 13.8s. 0 vulnerabilities found.' },
      { id: 'fl2', timestamp: '15:15:16.400', level: 'cmd', stageId: 'stg-fe-2', stageName: 'Typecheck & Lint', text: '$ tsc --noEmit && eslint' },
      { id: 'fl3', timestamp: '15:15:28.900', level: 'success', stageId: 'stg-fe-3', stageName: 'Vitest & Coverage', text: '124 tests passed across 18 suites. Coverage: 92.1%' },
      { id: 'fl4', timestamp: '15:15:50.000', level: 'info', stageId: 'stg-fe-4', stageName: 'Vite Production Build', text: 'Vite v8.3.0 building for production... 412 modules transformed.' },
      { id: 'fl5', timestamp: '15:16:29.000', level: 'success', stageId: 'stg-fe-5', stageName: 'Deploy CDN & Edge', text: 'Edge deployment live at https://preview-412.portal.dev' },
    ],
    artifacts: [
      {
        id: 'art-fe-1',
        name: 'dist-production.tar.gz',
        sizeBytes: 4210000,
        type: 'Web Assets Archive',
        path: '/builds/dist-production.tar.gz',
        createdStage: 'Vite Production Build',
      },
    ],
    testResults: {
      total: 124,
      passed: 124,
      failed: 0,
      skipped: 0,
      durationMs: 24800,
      coveragePercent: 92.1,
    },
  },
  {
    id: 'run-ai-167',
    pipelineId: 'pipe-ai-inference',
    pipelineName: 'embedding-vector-engine',
    runNumber: 167,
    status: 'failed',
    branch: 'feature/fp16-quantization',
    commit: {
      hash: '7c4091a029fe883bd19e',
      shortHash: '7c4091a',
      message: 'perf(embeddings): enable bfloat16 tensor core matrix multiplication',
      author: {
        name: 'Marcus Chen',
        email: 'marcus.ai@organization.com',
        avatarUrl: AVATAR_MARCUS,
      },
      branch: 'feature/fp16-quantization',
    },
    triggeredBy: 'git_push',
    runnerNode: 'gpu-builder-a100-01',
    startedAt: '2026-10-23T13:40:00Z',
    finishedAt: '2026-10-23T13:42:25Z',
    durationSeconds: 145,
    stages: [
      { id: 'stg-ai-1', name: 'Setup & Dependencies', status: 'success', durationMs: 25000, steps: [] },
      { id: 'stg-ai-2', name: 'Ruff & Mypy Typecheck', status: 'success', durationMs: 18000, steps: [] },
      { id: 'stg-ai-3', name: 'Pytest Suite & Benchmark', status: 'failed', durationMs: 102000, steps: [] },
      { id: 'stg-ai-4', name: 'Docker CUDA Container', status: 'skipped', durationMs: 0, steps: [] },
    ],
    logs: [
      { id: 'ail1', timestamp: '13:40:02.000', level: 'info', stageId: 'stg-ai-1', stageName: 'Setup & Dependencies', text: 'Poetry environment synced with torch 2.6.0+cu124' },
      { id: 'ail2', timestamp: '13:40:27.000', level: 'success', stageId: 'stg-ai-2', stageName: 'Ruff & Mypy Typecheck', text: 'Typecheck OK: 0 errors in 68 source files' },
      { id: 'ail3', timestamp: '13:40:45.000', level: 'cmd', stageId: 'stg-ai-3', stageName: 'Pytest Suite & Benchmark', text: '$ poetry run pytest tests/' },
      { id: 'ail4', timestamp: '13:42:23.000', level: 'error', stageId: 'stg-ai-3', stageName: 'Pytest Suite & Benchmark', text: 'RuntimeError: CUDA out of memory. Tried to allocate 4.20 GiB (GPU 0; 39.56 GiB total capacity)' },
      { id: 'ail5', timestamp: '13:42:24.000', level: 'error', stageId: 'stg-ai-3', stageName: 'Pytest Suite & Benchmark', text: 'FAILED tests/test_embedding_batch.py::test_fp16_large_tensor - RuntimeError: CUDA OOM' },
      { id: 'ail6', timestamp: '13:42:25.000', level: 'warn', stageId: 'stg-ai-4', stageName: 'Docker CUDA Container', text: 'Stage skipped due to previous stage failure' },
    ],
    artifacts: [],
    testResults: {
      total: 58,
      passed: 57,
      failed: 1,
      skipped: 0,
      durationMs: 98000,
      coveragePercent: 84.2,
    },
  },
];

export const INITIAL_AGENTS: AgentNode[] = [
  {
    id: 'agent-1',
    name: 'worker-linux-x86-01',
    hostname: 'runner-node-de-fra-01.infra.internal',
    ipAddress: '10.240.12.8',
    os: 'Linux',
    arch: 'x86_64',
    status: 'online',
    totalExecutors: 8,
    usedExecutors: 2,
    labels: ['linux', 'x86_64', 'docker', 'golang', 'helm'],
    cpuUsage: 28,
    memoryUsage: 44,
    uptime: '18 days 4 hours',
    activeBuilds: [
      { runId: 'run-auth-284', runNumber: 284, pipelineName: 'auth-gateway-service' },
    ],
  },
  {
    id: 'agent-2',
    name: 'worker-highmem-02',
    hostname: 'runner-highmem-us-east-02.infra.internal',
    ipAddress: '10.240.14.22',
    os: 'Linux',
    arch: 'x86_64',
    status: 'online',
    totalExecutors: 12,
    usedExecutors: 1,
    labels: ['linux', 'highmem', 'node', 'vite', 'playwright', 'cypress'],
    cpuUsage: 19,
    memoryUsage: 37,
    uptime: '42 days 11 hours',
    activeBuilds: [],
  },
  {
    id: 'agent-3',
    name: 'gpu-builder-a100-01',
    hostname: 'runner-gpu-a100.infra.internal',
    ipAddress: '10.240.88.5',
    os: 'Linux',
    arch: 'x86_64',
    status: 'online',
    totalExecutors: 4,
    usedExecutors: 0,
    labels: ['linux', 'cuda', 'gpu', 'a100', 'python', 'pytorch'],
    cpuUsage: 8,
    memoryUsage: 22,
    uptime: '9 days 16 hours',
    activeBuilds: [],
  },
  {
    id: 'agent-4',
    name: 'runner-macos-m3-01',
    hostname: 'mac-studio-runner-01.infra.internal',
    ipAddress: '10.240.90.12',
    os: 'macOS',
    arch: 'arm64',
    status: 'online',
    totalExecutors: 4,
    usedExecutors: 0,
    labels: ['darwin', 'arm64', 'xcode', 'ios', 'swift'],
    cpuUsage: 5,
    memoryUsage: 18,
    uptime: '3 days 1 hour',
    activeBuilds: [],
  },
  {
    id: 'agent-5',
    name: 'k8s-ephemeral-pool',
    hostname: 'k8s-ci-pool.infra.k8s.local',
    ipAddress: '10.244.0.0/16',
    os: 'Linux',
    arch: 'k8s-pod',
    status: 'online',
    totalExecutors: 32,
    usedExecutors: 4,
    labels: ['kubernetes', 'auto-scale', 'ephemeral', 'kaniko'],
    cpuUsage: 34,
    memoryUsage: 51,
    uptime: '124 days 2 hours',
    activeBuilds: [],
  },
];

export const INITIAL_SECRETS: SecretItem[] = [
  {
    id: 'sec-1',
    key: 'DOCKER_REGISTRY_TOKEN',
    maskedValue: 'dckr_pat_****************************4F9a',
    description: 'Auth token with write scope to organization internal container registry (cr.io)',
    scope: 'global',
    updatedAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'sec-2',
    key: 'PROD_KUBECONFIG_BASE64',
    maskedValue: 'YXBpVmVyc2lvbj**********************YXV0aC1wcm9k',
    description: 'Service account kubeconfig with restricted namespace deployment rights',
    scope: 'project',
    pipelineIds: ['pipe-auth-service', 'pipe-billing-core'],
    updatedAt: '2026-10-18T14:22:00Z',
  },
  {
    id: 'sec-3',
    key: 'SLACK_INCIDENT_WEBHOOK',
    maskedValue: 'https://hooks.slack.com/services/T00/***/B00/***9Z',
    description: 'Incoming webhook for build failure alerts in #devops-ci-alerts channel',
    scope: 'global',
    updatedAt: '2026-09-28T09:12:00Z',
  },
  {
    id: 'sec-4',
    key: 'SONARQUBE_AUTH_TOKEN',
    maskedValue: 'sqa_********************************88b1',
    description: 'Static application security testing and code quality token',
    scope: 'global',
    updatedAt: '2026-10-01T12:00:00Z',
  },
];

export const INITIAL_DORA_METRICS: DoraMetrics = {
  deploymentFrequency: {
    value: '18.4 / день',
    rating: 'Elite',
    delta: '+14% за последние 30 дней',
    weeklyValues: [12, 14, 15, 17, 18, 19, 21],
  },
  leadTimeForChanges: {
    value: '42 мин',
    rating: 'Elite',
    delta: '-18% (быстрее предыдущего месяца)',
    trend: [58, 52, 49, 45, 42],
  },
  changeFailureRate: {
    value: '2.4%',
    rating: 'Elite',
    delta: '-0.8% снижение сбоев',
    trend: [3.8, 3.2, 2.9, 2.6, 2.4],
  },
  meanTimeToRecovery: {
    value: '14 мин',
    rating: 'Elite',
    delta: 'Автоматический rollback за <3 мин',
    trend: [28, 22, 18, 16, 14],
  },
};

export const INITIAL_FREESTYLE_JOBS: FreestyleJob[] = [
  {
    id: 'fjob-db-migrate',
    name: 'db-schema-migration',
    description: 'Параметризованный запуск миграций базы данных PostgreSQL с проверкой доступности узла и генерацией changelog.',
    runnerNode: 'worker-linux-x86-01',
    parameters: [
      {
        id: 'p1',
        name: 'TARGET_ENVIRONMENT',
        type: 'choice',
        defaultValue: 'staging',
        description: 'Целевое окружение базы данных',
        choices: ['staging', 'qa-sandbox', 'production'],
      },
      {
        id: 'p2',
        name: 'DRY_RUN',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Выполнить в режиме dry-run без фиксации изменений',
      },
      {
        id: 'p3',
        name: 'SCHEMA_VERSION',
        type: 'string',
        defaultValue: 'latest',
        description: 'Версия миграции (latest или конкретный хэш)',
      },
    ],
    buildSteps: [
      {
        id: 'bs-1',
        name: 'Проверка сетевой доступности PostgreSQL',
        type: 'shell',
        command: 'pg_isready -h db.${TARGET_ENVIRONMENT}.infra.internal -p 5432 -U app_migrator',
        enabled: true,
      },
      {
        id: 'bs-2',
        name: 'Создание снимка перед миграцией',
        type: 'shell',
        command: 'pg_dump -s -d app_core -h db.${TARGET_ENVIRONMENT}.infra.internal -f ./pre_migration_schema.sql',
        enabled: true,
      },
      {
        id: 'bs-3',
        name: 'Выполнение Flyway / Liquibase миграций',
        type: 'shell',
        command: 'flyway migrate -url="jdbc:postgresql://db.${TARGET_ENVIRONMENT}.infra.internal:5432/app_core" -target="${SCHEMA_VERSION}"',
        enabled: true,
      },
      {
        id: 'bs-4',
        name: 'Валидация схемы и генерация отчета',
        type: 'shell',
        command: 'flyway info > ./migration_summary.txt && cat ./migration_summary.txt',
        enabled: true,
      },
    ],
    postBuildActions: [
      {
        id: 'pba-1',
        type: 'archive',
        label: 'Архивировать артефакты схемы',
        config: { files: 'pre_migration_schema.sql, migration_summary.txt' },
      },
      {
        id: 'pba-2',
        type: 'slack_alert',
        label: 'Оповещение в #db-ops',
        config: { channel: '#db-ops', notifyOnSuccess: true },
      },
    ],
    totalRuns: 64,
    successRate: 98.4,
    avgDurationSec: 45,
    lastRun: {
      id: 'frun-migrate-64',
      runNumber: 64,
      status: 'success',
      durationSeconds: 42,
      finishedAt: '1 час назад',
    },
    workspaceFiles: [
      { name: 'pre_migration_schema.sql', size: '142 KB', updatedAt: '2026-10-23 15:10' },
      { name: 'migration_summary.txt', size: '4.2 KB', updatedAt: '2026-10-23 15:11' },
      { name: 'flyway.conf', size: '1.1 KB', updatedAt: '2026-10-20 09:30' },
    ],
    updatedAt: '2026-10-23T15:11:00Z',
  },
  {
    id: 'fjob-s3-backup',
    name: 'nightly-pg-backup-s3',
    description: 'Периодическая выгрузка сжатого дампа базы данных и синхронизация с облачным хранилищем S3 / MinIO.',
    runnerNode: 'worker-highmem-02',
    parameters: [
      {
        id: 'bp-1',
        name: 'S3_BUCKET',
        type: 'string',
        defaultValue: 's3://company-prod-backups/database',
        description: 'Путь к целевой корзине S3',
      },
      {
        id: 'bp-2',
        name: 'COMPRESSION_LEVEL',
        type: 'choice',
        defaultValue: 'zstd-6',
        description: 'Алгоритм и степень сжатия архива',
        choices: ['zstd-6', 'gzip-9', 'lz4-fast'],
      },
      {
        id: 'bp-3',
        name: 'NOTIFY_SLACK',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Отправлять ли статус в Slack',
      },
    ],
    buildSteps: [
      {
        id: 'bs-b1',
        name: 'Экспорт дампа базы данных',
        type: 'shell',
        command: 'pg_dump -Fc -Z 6 -d production_db -f ./backup_$(date +%Y%m%d_%H%M%S).dump',
        enabled: true,
      },
      {
        id: 'bs-b2',
        name: 'Шифрование архива ключом GPG',
        type: 'shell',
        command: 'gpg --batch --yes --encrypt --recipient sec-ops@infra.internal ./backup_*.dump',
        enabled: true,
      },
      {
        id: 'bs-b3',
        name: 'Синхронизация с S3',
        type: 'shell',
        command: 'aws s3 cp ./backup_*.dump.gpg ${S3_BUCKET}/$(date +%Y-%m)/',
        enabled: true,
      },
      {
        id: 'bs-b4',
        name: 'Проверка целостности загрузки',
        type: 'shell',
        command: 'aws s3 ls ${S3_BUCKET}/$(date +%Y-%m)/',
        enabled: true,
      },
    ],
    postBuildActions: [
      {
        id: 'pba-b1',
        type: 'slack_alert',
        label: 'Slack notification',
        config: { channel: '#devops-backups' },
      },
    ],
    totalRuns: 198,
    successRate: 100,
    avgDurationSec: 110,
    lastRun: {
      id: 'frun-backup-198',
      runNumber: 198,
      status: 'success',
      durationSeconds: 104,
      finishedAt: 'Вчера в 03:00',
    },
    workspaceFiles: [
      { name: 'backup_20261022_030000.dump.gpg', size: '2.4 GB', updatedAt: '2026-10-22 03:02' },
      { name: 'backup_manifest.json', size: '3.1 KB', updatedAt: '2026-10-22 03:03' },
    ],
    updatedAt: '2026-10-22T03:05:00Z',
  },
  {
    id: 'fjob-runner-prune',
    name: 'agent-docker-hygiene-prune',
    description: 'Очистка дискового пространства на агентах сборки: удаление висячих образов и неиспользуемых слоев build-кэша.',
    runnerNode: 'worker-linux-x86-01',
    parameters: [
      {
        id: 'pp-1',
        name: 'PRUNE_VOLUMES',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Удалять ли неиспользуемые Docker volumes (осторожно!)',
      },
      {
        id: 'pp-2',
        name: 'KEEP_HOURS',
        type: 'choice',
        defaultValue: '48h',
        description: 'Хранить кэш сборок не старше',
        choices: ['24h', '48h', '72h', '168h (1 неделя)'],
      },
    ],
    buildSteps: [
      {
        id: 'bs-p1',
        name: 'Анализ текущего дискового пространства',
        type: 'shell',
        command: 'df -h /var/lib/docker && docker system df',
        enabled: true,
      },
      {
        id: 'bs-p2',
        name: 'Очистка завершенных контейнеров',
        type: 'shell',
        command: 'docker container prune -f --filter "until=${KEEP_HOURS}"',
        enabled: true,
      },
      {
        id: 'bs-p3',
        name: 'Очистка BuildKit кэша',
        type: 'shell',
        command: 'docker builder prune -f --filter "until=${KEEP_HOURS}"',
        enabled: true,
      },
      {
        id: 'bs-p4',
        name: 'Удаление dangling образов',
        type: 'shell',
        command: 'docker image prune -f',
        enabled: true,
      },
    ],
    postBuildActions: [],
    totalRuns: 52,
    successRate: 100,
    avgDurationSec: 32,
    lastRun: {
      id: 'frun-prune-52',
      runNumber: 52,
      status: 'success',
      durationSeconds: 28,
      finishedAt: '3 дня назад',
    },
    workspaceFiles: [
      { name: 'prune_report.log', size: '12 KB', updatedAt: '2026-10-20 04:00' },
    ],
    updatedAt: '2026-10-20T04:01:00Z',
  },
  {
    id: 'fjob-k6-loadtest',
    name: 'ad-hoc-loadtest-k6',
    description: 'Нагрузочное тестирование API эндпоинтов с генерацией метрик RPS, P95/P99 latency и HTML отчетом.',
    runnerNode: 'gpu-builder-a100-01',
    parameters: [
      {
        id: 'kp-1',
        name: 'TARGET_HOST',
        type: 'string',
        defaultValue: 'https://staging-api.internal',
        description: 'Целевой хост для нагрузочных сценариев',
      },
      {
        id: 'kp-2',
        name: 'VIRTUAL_USERS',
        type: 'choice',
        defaultValue: '100',
        description: 'Количество виртуальных пользователей (VUs)',
        choices: ['50', '100', '250', '500', '1000'],
      },
      {
        id: 'kp-3',
        name: 'DURATION',
        type: 'choice',
        defaultValue: '3m',
        description: 'Продолжительность теста',
        choices: ['1m', '3m', '5m', '10m'],
      },
    ],
    buildSteps: [
      {
        id: 'bs-k1',
        name: 'Запуск k6 нагрузочного сценария',
        type: 'shell',
        command: 'k6 run --vus ${VIRTUAL_USERS} --duration ${DURATION} --summary-export=k6-summary.json tests/load/api-stress.js',
        enabled: true,
      },
      {
        id: 'bs-k2',
        name: 'Генерация HTML отчета',
        type: 'shell',
        command: 'npx k6-html-reporter -i k6-summary.json -o k6-load-report.html',
        enabled: true,
      },
    ],
    postBuildActions: [
      {
        id: 'pba-k1',
        type: 'archive',
        label: 'Архивировать k6 отчет',
        config: { files: 'k6-load-report.html, k6-summary.json' },
      },
    ],
    totalRuns: 31,
    successRate: 93.5,
    avgDurationSec: 195,
    lastRun: {
      id: 'frun-k6-31',
      runNumber: 31,
      status: 'success',
      durationSeconds: 184,
      finishedAt: '5 часов назад',
    },
    workspaceFiles: [
      { name: 'k6-load-report.html', size: '820 KB', updatedAt: '2026-10-23 11:24' },
      { name: 'k6-summary.json', size: '14.5 KB', updatedAt: '2026-10-23 11:23' },
      { name: 'api-stress.js', size: '8.2 KB', updatedAt: '2026-10-18 14:00' },
    ],
    updatedAt: '2026-10-23T11:25:00Z',
  },
];

export const INITIAL_FREESTYLE_RUNS: FreestyleRun[] = [
  {
    id: 'frun-migrate-64',
    jobId: 'fjob-db-migrate',
    jobName: 'db-schema-migration',
    runNumber: 64,
    status: 'success',
    startedAt: '2026-10-23T15:10:18Z',
    finishedAt: '2026-10-23T15:11:00Z',
    durationSeconds: 42,
    paramsUsed: {
      TARGET_ENVIRONMENT: 'staging',
      DRY_RUN: false,
      SCHEMA_VERSION: 'latest',
    },
    steps: [
      {
        id: 'bs-1',
        name: 'Проверка сетевой доступности PostgreSQL',
        command: 'pg_isready -h db.staging.infra.internal -p 5432 -U app_migrator',
        status: 'success',
        durationMs: 1200,
        exitCode: 0,
      },
      {
        id: 'bs-2',
        name: 'Создание снимка перед миграцией',
        command: 'pg_dump -s -d app_core -h db.staging.infra.internal -f ./pre_migration_schema.sql',
        status: 'success',
        durationMs: 8400,
        exitCode: 0,
      },
      {
        id: 'bs-3',
        name: 'Выполнение Flyway / Liquibase миграций',
        command: 'flyway migrate -url="jdbc:postgresql://db.staging.infra.internal:5432/app_core" -target="latest"',
        status: 'success',
        durationMs: 24200,
        exitCode: 0,
      },
      {
        id: 'bs-4',
        name: 'Валидация схемы и генерация отчета',
        command: 'flyway info > ./migration_summary.txt && cat ./migration_summary.txt',
        status: 'success',
        durationMs: 3200,
        exitCode: 0,
      },
    ],
    logs: [
      { id: 'flg-1', timestamp: '15:10:18.100', level: 'info', stageId: 'bs-1', stageName: 'Шаг 1', text: '[Зигзаг CI] Запуск Freestyle джобы "db-schema-migration" #64 на ноде worker-linux-x86-01' },
      { id: 'flg-2', timestamp: '15:10:18.400', level: 'cmd', stageId: 'bs-1', stageName: 'Шаг 1', text: '$ pg_isready -h db.staging.infra.internal -p 5432 -U app_migrator' },
      { id: 'flg-3', timestamp: '15:10:19.500', level: 'success', stageId: 'bs-1', stageName: 'Шаг 1', text: 'db.staging.infra.internal:5432 - accepting connections' },
      { id: 'flg-4', timestamp: '15:10:19.700', level: 'cmd', stageId: 'bs-2', stageName: 'Шаг 2', text: '$ pg_dump -s -d app_core -h db.staging.infra.internal -f ./pre_migration_schema.sql' },
      { id: 'flg-5', timestamp: '15:10:28.100', level: 'info', stageId: 'bs-2', stageName: 'Шаг 2', text: 'Снимок схемы DDL сохранен (142 KB, 84 таблицы)' },
      { id: 'flg-6', timestamp: '15:10:28.300', level: 'cmd', stageId: 'bs-3', stageName: 'Шаг 3', text: '$ flyway migrate -url="jdbc:postgresql://db.staging.infra.internal:5432/app_core" -target="latest"' },
      { id: 'flg-7', timestamp: '15:10:32.400', level: 'info', stageId: 'bs-3', stageName: 'Шаг 3', text: 'Flyway Community Edition 10.8.2 by Redgate' },
      { id: 'flg-8', timestamp: '15:10:41.200', level: 'info', stageId: 'bs-3', stageName: 'Шаг 3', text: 'Migrating schema "public" to version "2026.10.23.01 - add_payment_idempotency_idx"' },
      { id: 'flg-9', timestamp: '15:10:52.500', level: 'success', stageId: 'bs-3', stageName: 'Шаг 3', text: 'Successfully applied 2 migrations to schema "public" (execution time 00:18.241s)' },
      { id: 'flg-10', timestamp: '15:10:52.700', level: 'cmd', stageId: 'bs-4', stageName: 'Шаг 4', text: '$ flyway info' },
      { id: 'flg-11', timestamp: '15:10:55.900', level: 'success', stageId: 'bs-4', stageName: 'Шаг 4', text: 'Schema version validated. Current: 2026.10.23.01 (State: SUCCESS)' },
      { id: 'flg-12', timestamp: '15:11:00.000', level: 'success', stageId: 'bs-4', stageName: 'Post-Build', text: '✓ Архивировано 2 файла. Оповещение отправлено в Slack [#db-ops]. Джобы завершена успешно!' },
    ],
    artifacts: [
      {
        id: 'fart-1',
        name: 'pre_migration_schema.sql',
        sizeBytes: 145000,
        type: 'SQL Schema Dump',
        path: '/workspace/pre_migration_schema.sql',
        createdStage: 'Шаг 2',
      },
      {
        id: 'fart-2',
        name: 'migration_summary.txt',
        sizeBytes: 4300,
        type: 'Flyway Log Summary',
        path: '/workspace/migration_summary.txt',
        createdStage: 'Шаг 4',
      },
    ],
  },
];

