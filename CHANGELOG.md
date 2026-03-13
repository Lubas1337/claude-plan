# Changelog

## v1.6.0 — 2026-03-13

### 3-уровневый Kanban: Dashboard, Plan Detail, Task Modal

- **Dashboard** — обзор всех планов с карточками, прогрессом и сводкой статусов
- **Plan Detail** — Kanban-доска с расширяемыми карточками и инлайн-списком задач
- **Task Modal** — модалка с деталями задачи (action, acceptance criteria, result, files affected)
- Навигация через state (dashboard → plan → task modal, кнопка назад)
- Новый API endpoint `GET /api/plans/:name/parts/:partNumber/tasks/:taskNumber`
- `parseTaskFile()` — парсинг task-файлов из part-директорий
- Header упрощён: убраны табы, добавлена кнопка назад и имя плана
- **Sidebar Sessions** — боковая панель с Claude Code сессиями по проектам
  - Группировка по директории проекта (из `~/.claude/projects/`)
  - Дата, кол-во сообщений, длительность, использованные инструменты
  - Первое сообщение как краткое описание сессии
  - Collapsible проекты, сортировка по дате
- Новый API endpoint `GET /api/sessions`
- `sessions-parser.ts` — парсинг JSONL файлов сессий

## v1.5.0 — 2026-03-13

### Автоцикл --yolo

- `/claude-plan:next --yolo` — непрерывное выполнение частей без вмешательства
- Авто-выбор плана, авто-делегирование агентам, авто-запуск после каскада
- СТОП при: ошибке задачи, отсутствии ready частей, завершении плана
- Прогресс-бар между итерациями

## v1.4.0 — 2026-03-13

### Research & Discussion фаза в init

- `/claude-plan:init` — 3 режима создания плана: "Обсудить детально", "AI решает всё", "Быстрый план"
- Режим "Обсудить детально": 3 раунда (находки → подход → структура) с итеративным обсуждением
- Режим "AI решает всё": автоматическое исследование + одно подтверждение
- Процедура Pre-Plan Research в SKILL.md — исследование кодебазы перед созданием плана
- Артефакт `000-pre-plan.md` — сохранение результатов исследования и обсуждения
- Все команды переведены на AskUserQuestion с опциями (вместо текстовых y/n)

## v1.3.0 — 2026-03-12

### Agent Orchestration

- Делегирование частей агентам Claude Code (Agent: auto/none/<type>)
- Agent Catalog: tdd-guide, code-reviewer, Explore, Plan, architect, security-reviewer
- Процедуры: Select Agent, Build Agent Prompt, Launch Agent, Handle Agent Result
- Параллельный запуск агентов через worktrees

## v1.2.0 — 2026-03-12

### Context Gathering

- Процедура Project Context — чтение CLAUDE.md, project memory, skills, структуры кодебазы
- Процедура Execution Context — rules, language-specific rules, skills
- Процедура Research Context — поиск паттернов, зависимостей, прошлых ADR

## v1.1.0 — 2026-03-12

### Kanban веб-доска

- Визуализация планов в браузере
- Drag & drop для статусов частей

## v1.0.0 — 2026-03-12

### Initial release

- 7 commands: plan-init, plan-status, plan-next, plan-add-part, plan-research, plan-done, plan-list
- Skill "plan" с форматами файлов, конвенциями и логикой выбора частей
- Мульти-планы, dependency tracking, cascade unblocking
- Research notes и Architecture Decision Records
- Параллельность через worktrees
