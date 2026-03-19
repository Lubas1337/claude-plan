# Changelog

## v1.8.0 — 2026-03-19

### Obsidian Backend

- `/claude-plan:obsidian` — новая команда (setup, toggle, migrate, status)
- Два режима через `.plan/config.json`: `backend: "local"` (default) или `"obsidian"`
- **YAML frontmatter** как source of truth для метаданных в Obsidian mode
- **Wikilinks** для связей между планами, частями и задачами
- **Dataview дашборды** — Dashboard.md, Status.md, Plans MOC, ADR MOC
- **Шаблоны** — _templates/ для Plan, Part, Task, Research, ADR
- **Canvas** — Architecture.canvas шаблон для диаграмм
- **Миграция** — однонаправленная `.plan/` → Obsidian vault (`--dry-run` для предпросмотра)
- **Step 0: Detect Backend** — все команды автоматически определяют режим работы
- **Web Parser** — поддержка Obsidian vault в Kanban dashboard API
- Обратная совместимость: без config.json всё работает как раньше

## v1.7.0 — 2026-03-14

### Project Vision & Roadmap

- `/claude-plan:project` — новая команда для определения проектного контекста (миссия, vision, стратегические цели, roadmap)
- `.plan/PROJECT.md` — опциональный файл, объединяющий все планы в единую стратегию
- Интерактивное создание в 3 раунда (Mission/Vision → Goals → Roadmap/Constraints)
- Режим обновления: точечные правки или синхронизация Roadmap из INDEX.md
- **Alignment check в init** — проверка соответствия нового плана стратегическим целям и constraints
- **Roadmap update в done** — автообновление статусов фаз при завершении планов
- **Roadmap в list** — показ проектного контекста и фаз перед таблицей планов
- **Project context в status** — строка с проектом и стратегической целью
- **Web Dashboard** — Project Overview с roadmap timeline, кликабельными бейджами планов и стратегическими целями
- Процедура "Project Vision Context" в SKILL.md для alignment при создании планов
- Полная обратная совместимость: проекты без PROJECT.md работают как раньше

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
