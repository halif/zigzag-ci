# 🧣 Зигзаг CI (Zigzag CI)

> **«Любой билд взлетит!»** — Легковесный, современный и свободный Open-Source сервер автоматизации сборок и CI/CD (альтернатива Jenkins).

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Active-emerald.svg)](#)
[![Docker](https://img.shields.io/badge/Docker-Ready-cyan.svg)](#быстрый-запуск-в-docker)
[![Node](https://img.shields.io/badge/Node-v20%2B-indigo.svg)](#)

---

## 🎯 О проекте

**Зигзаг CI** — это открытая платформа для автоматизации непрерывной интеграции и доставки (CI/CD), созданная для тех, кто ценит мощность и гибкость **Jenkins**, но хочет современный, быстрый и отзывчивый интерфейс с человеческим дизайном и поддержкой всех привычных DevOps-паттернов.

Проект полностью **бесплатен, открыт (Open Source)** и не требует подписок, лицензионных ключей или телеметрии.

---

## ✨ Ключевые возможности

### 1. 🔀 Интерактивный DAG-граф пайплайнов (Pipeline Graph)
- Наглядная визуализация цепочки стадий (*Checkout → Lint & Security → Unit Tests → Docker Build → Staging → Production*).
- **Manual Approval Gates** (шлюзы ручного подтверждения): релизные этапы могут запрашивать авторизацию с комментариями перед развертыванием в прод.
- Клик по любой стадии для мгновенной фильтрации логов.

### 2. 🛠️ Фристайл Джобы (Freestyle Projects)
- Классические задачи со свободной настройкой шагов сборки (Shell / Bash / Docker).
- **Параметризованный запуск (This project is parameterized)**: передача строковых значений, чекбоксов и выпадающих списков (*Choice, Boolean, String*).
- **Встроенный Workspace Explorer**: инспекция и скачивание файлов и артефактов из рабочей директории каждого билда.

### 3. 🖥️ Живой стриминг консоли (Live Terminal Output)
- Подсветка синтаксиса команд (`$ ...`), уровней `[INFO]`, `[WARN]`, `[ERROR]`, `[OK]`.
- Мгновенный поиск, переключение таймстемпов, автоскролл (*Follow Mode*), переход к первой ошибке и экспорт лога в файл.

### 4. 🤖 Флот агентов и распределенные раннеры (Runner Fleet)
- Управление пулом распределенных нод: Linux x86_64, macOS ARM64, GPU-ноды с CUDA, эфемерные поды Kubernetes.
- Контроль слотов исполнителей (*Executors*), мониторинг нагрузки CPU/RAM и управление состоянием нод (Active / Drain).

### 5. 🔐 Сейф секретов и переменных (Secrets Vault)
- Защищенное хранение паролей реестров, kubeconfig и токенов с маскировкой значений.
- Разделение по областям видимости: глобальные секреты и проектный уровень.

### 6. 🦊 Интеграция с GitLab, GitHub и Webhooks
- Прием событий `push`, `pull_request` и `merge_request`.
- Автоматический сбор и хранение артефактов (`.tar.gz`, `.jar`, HTML-отчеты) прямо в Зигзаг CI с отправкой обратных статусов в Git.

### 7. 📊 Инженерные метрики DORA
- Измерение ключевых метрик эффективности разработки: *Deployment Frequency, Lead Time for Changes, Change Failure Rate, Mean Time to Recovery (MTTR)*.

---

## 🚀 Быстрый запуск в Docker

Запустите сервер Зигзаг CI одной командой на любом сервере с установленным Docker:

```bash
docker run -d \
  --name zigzag-ci \
  --restart always \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v zigzag_data:/var/lib/zigzag-ci \
  zigzagci/server:latest
```

После этого откройте в браузере: **`http://localhost:3000`**

### Вариант с `docker-compose.yml`:

```yaml
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
      - ZIGZAG_PORT=3000
      - ZIGZAG_MODE=standalone
      - ZIGZAG_AGENT_SLOTS=8

volumes:
  zigzag_data:
```

Запуск:
```bash
docker compose up -d
```

---

## 💻 Локальная разработка и сборка из исходников

Требования: **Node.js 20+**, **npm 10+**

```bash
# 1. Клонирование репозитория
git clone https://github.com/zigzagildar/zigzag-ci.git
cd zigzag-ci

# 2. Установка зависимостей
npm install

# 3. Запуск сервера разработки
npm run dev

# 4. Проверка типов и линтинг
npm run lint

# 5. Сборка продакшн-бандла
npm run build
```

---

## 📝 Пример конфигурации пайплайна (`Pipelinefile`)

```yaml
pipeline:
  agent:
    label: linux-x86-worker
  stages:
    - stage: Checkout
      steps:
        - name: Git Clone
          run: git clone https://github.com/organization/app.git .

    - stage: Lint & Test
      steps:
        - name: Run Tests
          run: npm ci && npm test -- --coverage

    - stage: Build Artifact
      steps:
        - name: Create Bundle
          run: npm run build && tar -czvf dist.tar.gz ./dist

    - stage: Production Approval
      approval:
        required: true
        roles: ["devops-lead"]
      steps:
        - name: Helm Deploy
          run: helm upgrade --install my-app ./charts/my-app -n prod

  post_build:
    archive:
      - "dist.tar.gz"
      - "reports/junit.xml"
```

---

## 🤝 Вклад в развитие (Contributing)

Мы горячо приветствуем любой вклад сообщества!
1. Сделайте **Fork** проекта.
2. Создайте свою feature-ветку: `git checkout -b feature/amazing-idea`.
3. Зафиксируйте изменения: `git commit -m 'feat: add amazing feature'`.
4. Отправьте ветку: `git push origin feature/amazing-idea`.
5. Откройте **Pull Request** на GitHub.

---

## 📜 Лицензия

Этот проект распространяется под свободной лицензией **[MIT](LICENSE)**.  
Вы можете свободно использовать, модифицировать, распространять и запускать его в личных или коммерческих целях без каких-либо ограничений.
