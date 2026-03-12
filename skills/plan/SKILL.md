---
name: plan
description: Lightweight multi-plan project planning system (.plan/) — structure, conventions, statuses, file formats, parallelism rules, and next-part selection logic.
origin: custom
---

# Lightweight Planning System (.plan/)

Лёгкая система планирования проектов с поддержкой мульти-планов, исследований, ADR и отслеживания прогресса.

## When to Activate

- Работа с `/claude-plan:init`, `/claude-plan:status`, `/claude-plan:next`, `/claude-plan:add-part`, `/claude-plan:research`, `/claude-plan:done`, `/claude-plan:list`
- Создание или обновление файлов в `.plan/`
- Планирование проекта средней сложности (между plan mode и GSD)

## Структура директории

```
.plan/
├── INDEX.md                     # Индекс всех планов, общий дашборд
├── research/                    # Общие исследования (не привязанные к плану)
│   └── 001-topic.md
├── <plan-name>/                 # ← Один план
│   ├── MASTER.md                # Обзор, таблица частей, цели
│   ├── STATUS.md                # Авто-генерируемый дашборд
│   ├── CHANGELOG.md             # Версионирование, суммари выполненных тасков
│   ├── research/                # Исследования по этому плану
│   │   ├── 001-topic.md
│   │   └── adr/
│   │       └── 001-decision.md
│   └── parts/
│       └── NN-slug/
│           ├── META.md          # Метаданные: статус, зависимости, параллельность
│           ├── 01-task.md
│           └── 02-task.md
```

## Статусы

Единая система статусов для частей и задач:

| Статус | Значение |
|--------|----------|
| `draft` | Черновик, ещё не готов к работе |
| `ready` | Готов к выполнению (все зависимости done) |
| `in_progress` | В работе |
| `done` | Завершён |
| `blocked` | Заблокирован невыполненной зависимостью |
| `skipped` | Пропущен (осознанно) |

## Форматы файлов

### INDEX.md

```markdown
# Plans

| Plan | Status | Progress | Updated |
|------|--------|----------|---------|
| [ai-features](ai-features/MASTER.md) | active | 3/7 done | 2026-03-12 |
| [lms-integration](lms-integration/MASTER.md) | paused | 1/4 done | 2026-03-10 |
```

Статусы плана: `active`, `paused`, `completed`, `archived`.

### MASTER.md

```markdown
# Plan: <Name>

## Vision
Одно предложение — что этот план достигает.

## Goals
1. ...
2. ...

## Parts

| # | Part | Status | Depends | Parallel | Size |
|---|------|--------|---------|----------|------|
| 01 | Foundation | done | - | - | S |
| 02 | Domain | in_progress | 01 | - | M |
| 03 | API Layer | ready | 01 | with 04 | M |
| 04 | Workers | blocked | 02 | with 03 | L |

## Constraints
- ...

## Out of Scope
- ...
```

### META.md (per part)

```markdown
# Part NN: Name

- **Status**: ready
- **Dependencies**: 01-foundation
- **Parallel**: with 04-workers
- **Delegatable**: yes
- **Size**: M
- **Branch**: feat/api-layer

## Goal
Одно предложение — что эта часть достигает.

## Files Affected
- internal/application/commands/
- internal/infrastructure/http/

## Tasks

| # | Task | Status |
|---|------|--------|
| 01 | Create order command | ready |
| 02 | Add HTTP handler | ready |
| 03 | Integration tests | ready |

## Notes
```

### Task file (NN-task.md)

```markdown
# Task: Name

## Action
Что нужно сделать — конкретные шаги.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Verification
Как проверить что задача выполнена.

## Status: ready

## Result
(заполняется после выполнения)
```

### Research note

```markdown
# Research: Topic

## Вопрос
Что исследуем и зачем.

## Находки
- ...

## Решение
Что выбрали и почему.

## Ссылки
- ...
```

### ADR (Architecture Decision Record)

```markdown
# ADR-NNN: Title

## Статус
accepted | superseded | deprecated

## Контекст
Проблема или ситуация, требующая решения.

## Решение
Что решили делать.

## Последствия
Плюсы, минусы, trade-offs.

## Альтернативы
Что рассматривали и почему отвергли.
```

### CHANGELOG.md

```markdown
# Changelog

## v0.3.0 — 2026-03-12
### Part 03: API Layer — done
- Реализованы REST endpoints для orders
- Добавлены integration tests (coverage 87%)
- ADR-002: выбран chi вместо gin

## v0.2.0 — 2026-03-10
### Part 02: Domain — done
- Entities: Order, User, Product
- Domain services: OrderService, PricingService
```

## Логика выбора следующей части

При `/claude-plan:next` выбирай часть в порядке приоритета:

1. **Sequential bottleneck** — часть, которая блокирует больше всего других частей
2. **S before L** — при прочих равных, маленькие части (`S`) перед большими (`L/XL`)
3. **Unblocks most** — часть, завершение которой разблокирует максимум `blocked` частей
4. **Lowest number** — при полном равенстве, часть с меньшим номером

Фильтр: выбираются только части со статусом `ready`.

## Правила параллельности

Части могут выполняться параллельно (через worktrees) если:
1. **Разные `Files Affected`** — нет пересечений в затрагиваемых файлах
2. **Все зависимости `done`** — обе части не зависят от незавершённых
3. **Поле `Parallel`** — явно указано `with NN` в META.md

При `/claude-plan:next` если есть параллельные части — предложи запуск через worktree.

## Интеграция с plan mode

При выполнении `/claude-plan:next`:
1. Читай MASTER.md → определи ready части
2. Читай META.md выбранной части → получи контекст
3. Читай task files последовательно (~100 строк на задачу)
4. Выполняй задачи, обновляй статусы в META.md и task files
5. После завершения всех задач → запусти `/claude-plan:done`

## Версионирование

Версия плана увеличивается при завершении каждой части:
- `v0.1.0` — первая часть done
- `v0.2.0` — вторая часть done
- `v1.0.0` — все части done (план completed)

Minor version = номер завершённой части. Major = 1 когда план завершён.

## Когда использовать .plan/

| Ситуация | Инструмент |
|----------|-----------|
| Быстрая правка, 1-2 файла | Прямое редактирование или `/gsd:quick` |
| Средний проект, 3-10 частей | **`.plan/`** |
| Большой проект, 10+ фаз, research-heavy | `/gsd:new-project` |
| Эфемерный план на одну сессию | `/plan` (plan mode) |

## Context Gathering

Команды, создающие или выполняющие план, должны учитывать контекст проекта из `.claude/` и `CLAUDE.md`.

> **Важно**: `CLAUDE.md` (проекта и персональный) уже загружены в system-reminder — НЕ читай их повторно. Используй информацию из контекста напрямую.

### Процедура: Project Context (для init, add-part)

Используй при создании нового плана или добавлении частей.

1. **Архитектура** (из CLAUDE.md в контексте):
   - Извлеки: Stack, Project Structure, Architecture, Anti-Patterns, Verification checklist
   - Учитывай при разбиении на части (domain → application → infrastructure)

2. **Project memory**:
   - Определи путь: `pwd` → замени `/` на `-` → `~/.claude/projects/<hash>/memory/MEMORY.md`
   - Если файл есть — прочитай индекс и релевантные linked файлы
   - Ищи: прошлые архитектурные решения, фидбэк по workflow, контекст проекта
   - Если файла нет — пропусти

3. **Доступные skills**:
   - `ls .claude/skills/` — запомни имена (НЕ читай содержимое)
   - Используй для аннотаций задач: `Skill hint: <name>` в Notes META.md

4. **Структура кодебазы**:
   - `ls` исходных директорий (internal/, pkg/, cmd/) — реальные пакеты
   - Используй при заполнении Files Affected

### Процедура: Execution Context (для next)

Используй перед выполнением задач части.

1. **Rules — coding conventions**:
   - Прочитай `.claude/rules/common/coding-style.md` — стиль кода, immutability, error handling
   - Прочитай `.claude/rules/common/testing.md` — TDD workflow, coverage требования
   - Прочитай `.claude/rules/common/security.md` — security checklist

2. **Language-specific rules** — определи язык из Files Affected в META.md:
   - `*.go` → `.claude/rules/golang/coding-style.md`, `.claude/rules/golang/testing.md`
   - `*.ts` → `.claude/rules/typescript/coding-style.md`, `.claude/rules/typescript/testing.md`
   - Читай максимум 3 файла для одного языка

3. **Relevant skills**:
   - `ls .claude/skills/` — проверь наличие релевантных навыков
   - Если META.md содержит `Skill hint:` — активируй указанный skill

4. **Project memory** — проверь на фидбэк (та же процедура что в Project Context, шаг 2)

### Процедура: Research Context (для research)

Используй при проведении исследований.

1. **Stack и архитектура** (из CLAUDE.md в контексте) — учитывай при выборе решений

2. **Существующие паттерны**:
   - Поиск в кодебазе: `grep` по ключевым словам в `internal/`, `pkg/`
   - Проверь зависимости в `go.mod` / `package.json`
   - Проверь `.plan/*/research/` и `adr/` — прошлые исследования по теме

3. **Skills как справка**:
   - Если тема совпадает с навыком (api-design, go-senior-developer, etc.) — прочитай его SKILL.md как reference material
   - `ls .claude/skills/` — полный список

4. **Project memory** — прошлые решения и контекст (процедура из Project Context, шаг 2)
