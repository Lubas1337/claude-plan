# Changelog

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
