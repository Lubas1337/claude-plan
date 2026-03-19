---
description: "Настройка Obsidian vault, переключение backend, миграция .plan/ → Obsidian"
---

# /claude-plan:obsidian — Obsidian Backend

## Инструкции

> При вопросах пользователю — используй `AskUserQuestion` tool с опциями (селектор), а не текстовые вопросы.

Управление Obsidian backend: setup vault, переключение режимов, миграция данных. Skill "plan" содержит форматы Obsidian файлов и конвенции. Используй его как справку.

### Входные данные

Аргумент: `$ARGUMENTS` — субкоманда.
- `/claude-plan:obsidian setup` — создать vault scaffolding
- `/claude-plan:obsidian toggle` — переключить backend (local ↔ obsidian)
- `/claude-plan:obsidian migrate` — мигрировать .plan/ → Obsidian vault
- `/claude-plan:obsidian migrate --dry-run` — предпросмотр миграции
- `/claude-plan:obsidian status` — показать текущий режим и конфигурацию

### Субкоманда: setup

Создаёт Obsidian vault scaffolding и конфигурацию.

#### 1. Спроси vault path

Спроси через `AskUserQuestion` с текстовым вводом (Other):
"Укажи путь к Obsidian vault (например `/Users/name/Obsidian/MyProject`):"

#### 2. Проверь vault path

1. Проверь что путь существует (`ls <vault_path>`)
2. Если не существует — спроси через `AskUserQuestion`:
   - "Создать директорию" → создай `mkdir -p <vault_path>`
   - "Указать другой путь" → вернись к шагу 1

#### 3. Создай config.json

Создай `.plan/config.json` (создай `.plan/` если нет):

```json
{
  "backend": "obsidian",
  "obsidian": {
    "vault_path": "<vault_path>",
    "rest_api": {
      "enabled": false,
      "port": 27124,
      "api_key": ""
    }
  }
}
```

#### 4. Создай vault scaffolding

Используй структуру из секции "Obsidian Vault Scaffolding" в SKILL.md.

Создай файлы (не перезаписывай существующие):

1. **`_templates/Plan Template.md`**:
```markdown
---
type: plan
status: active
created: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
progress: "0/0"
version: "v0.0.0"
tags:
  - plan/active
aliases:
  - {{title}}
---
# {{title}}

## Vision

## Goals
1.

## Parts
| # | Part | Status | Depends | Parallel | Size | Agent |
|---|------|--------|---------|----------|------|-------|

## Constraints
## Out of Scope
```

2. **`_templates/Part Template.md`**:
```markdown
---
type: part
plan: ""
part_number: ""
status: ready
dependencies: []
parallel: "-"
delegatable: true
agent: auto
size: M
branch: ""
created: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
tags:
  - part/ready
  - size/M
---
# Part: {{title}}

## Goal

## Files Affected

## Tasks
| # | Task | Status |
|---|------|--------|

## Notes
```

3. **`_templates/Task Template.md`**:
```markdown
---
type: task
plan: ""
part: ""
task_number: ""
status: ready
created: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
tags:
  - task/ready
---
# Task: {{title}}

## Action

## Acceptance Criteria
- [ ]

## Verification

## Files Affected

## Result
```

4. **`_templates/Research Template.md`**:
```markdown
---
type: research
plan: ""
created: {{date:YYYY-MM-DD}}
tags: [research]
---
# Research: {{title}}

## Вопрос
## Находки
## Решение
## Ссылки
```

5. **`_templates/ADR Template.md`**:
```markdown
---
type: adr
status: accepted
plan: ""
created: {{date:YYYY-MM-DD}}
tags: [adr/accepted]
---
# ADR-000: {{title}}

## Context
## Decision
## Consequences
## Alternatives
```

6. **`Dashboard.md`** — по формату из SKILL.md (секция "Dashboard.md (Dataview)")

7. **`Plans/Plans MOC.md`** — по формату из SKILL.md (секция "Plans MOC")

8. **`Architecture/Architecture.canvas`**:
```json
{
  "nodes": [],
  "edges": []
}
```

9. **`Architecture/ADR MOC.md`**:
```markdown
---
type: moc
tags: [moc, adr]
---
# Architecture Decision Records

\```dataview
TABLE status, plan, created
FROM "" WHERE type = "adr"
SORT created DESC
\```
```

#### 5. Вывод

```
Obsidian vault настроен:
→ Vault: <vault_path>
→ Config: .plan/config.json
→ Backend: obsidian

Создано:
  _templates/ (5 шаблонов)
  Dashboard.md (Dataview)
  Plans/Plans MOC.md
  Architecture/ (Canvas + ADR MOC)

⚠️  Рекомендуется установить плагин Dataview в Obsidian для полноценных дашбордов.

Следующий шаг: /claude-plan:init для создания плана в Obsidian vault
```

### Субкоманда: toggle

Переключает backend между local и obsidian.

#### 1. Прочитай текущий config

Прочитай `.plan/config.json`:
- Если нет → текущий backend = `local`
- Если есть → текущий = значение `backend`

#### 2. Переключи

- Если текущий `local`:
  - Проверь наличие `obsidian.vault_path` в config
  - Если нет vault_path → "Сначала выполни /claude-plan:obsidian setup"
  - Если есть → переключи `backend` на `"obsidian"`
- Если текущий `obsidian`:
  - Переключи `backend` на `"local"`

#### 3. Запиши config.json

#### 4. Вывод

```
Backend переключён: local → obsidian
Vault: <vault_path>
```

### Субкоманда: migrate

Миграция существующих планов из `.plan/` в Obsidian vault.

#### 1. Проверки

1. Прочитай `.plan/config.json` → убедись что `backend === "obsidian"` и vault_path задан
2. Если нет → "Сначала выполни /claude-plan:obsidian setup"
3. Прочитай `.plan/INDEX.md` → список планов для миграции

#### 2. Dry-run (если --dry-run)

Для каждого плана покажи что будет создано:
```
Dry-run миграции:

Plan: ai-features
  .plan/ai-features/MASTER.md → <vault>/Plans/AI Features/AI Features.md
  .plan/ai-features/STATUS.md → <vault>/Plans/AI Features/Status.md
  .plan/ai-features/CHANGELOG.md → <vault>/Plans/AI Features/Changelog.md
  Parts:
    01-foundation/META.md → Plans/AI Features/Parts/01 - Foundation/01 - Foundation.md
    01-foundation/01-setup.md → Plans/AI Features/Parts/01 - Foundation/01 - Setup.md
  Research:
    001-topic.md → Plans/AI Features/Research/001 - Topic.md
    adr/001-decision.md → Plans/AI Features/Research/ADR/ADR-001 - Decision.md

PROJECT.md → <vault>/Project.md

Всего: X планов, Y частей, Z задач
```

Спроси через `AskUserQuestion`:
- "Мигрировать" → продолжить
- "Отмена" → остановить

#### 3. Миграция

Для каждого плана:

1. **MASTER.md → Plan Overview**:
   - Прочитай MASTER.md → извлеки vision, goals, parts таблицу
   - Создай `Plans/<Plan Name>/<Plan Name>.md` с YAML frontmatter
   - В таблице Parts замени `[NN-slug](...)` на `[[NN - Name]]` (wikilinks)

2. **META.md → Part Notes**:
   - Для каждой части: прочитай META.md
   - Создай `Plans/<Plan Name>/Parts/NN - Name/NN - Name.md` с frontmatter
   - Конвертируй `- **Status**: ready` → frontmatter `status: ready`
   - Конвертируй `- **Dependencies**: 01-foundation` → frontmatter `dependencies: ["01"]`
   - В таблице Tasks замени на wikilinks

3. **Task files → Task Notes**:
   - Для каждой задачи: прочитай `NN-task.md`
   - Создай `Plans/<Plan Name>/Parts/NN - Name/NN - Task Name.md` с frontmatter
   - Конвертируй `## Status: ready` → frontmatter `status: ready`

4. **Research → Research Notes**:
   - Конвертируй markdown файлы в формат с frontmatter
   - ADR: добавь `type: adr` frontmatter

5. **STATUS.md, CHANGELOG.md** — скопируй с минимальной адаптацией

6. **PROJECT.md → Project.md** (корень vault):
   - Добавь frontmatter `type: project`
   - Замени markdown links на wikilinks в Roadmap таблице

7. **INDEX.md → Plans MOC.md** — уже содержит Dataview, не требует миграции данных

#### 4. НЕ удаляй `.plan/`

Оригинальные файлы остаются. Миграция — однонаправленная копия.

#### 5. Вывод

```
Миграция завершена:

Планы: X
Части: Y
Задачи: Z
Research: W
ADR: V

Vault: <vault_path>
Оригинал .plan/ — не удалён.

Откройте vault в Obsidian для проверки.
```

### Субкоманда: status

Показывает текущую конфигурацию backend.

#### Алгоритм

1. Прочитай `.plan/config.json` (или его отсутствие)
2. Покажи:

```
Backend: obsidian (active)
Vault: /Users/name/Obsidian/ProjectVault
REST API: disabled
Config: .plan/config.json

Vault contents:
  Plans: 3
  Templates: 5
  Dashboard: ✓
```

Или:

```
Backend: local (default)
Config: .plan/config.json (not found)

Для настройки Obsidian: /claude-plan:obsidian setup
```

### Правила

- `.plan/config.json` — единственный config файл, всегда в `.plan/`
- Не удаляй `.plan/` при миграции
- Не перезаписывай существующие файлы в vault при setup
- Vault path должен быть абсолютным
- При ошибках — внятные сообщения и предложения fix
