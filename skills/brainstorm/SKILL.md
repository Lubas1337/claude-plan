---
name: brainstorm
description: Collaborative brainstorming — turning ideas into validated design specs through structured dialogue, spec review, and transition to planning.
origin: custom
---

# Brainstorming — Design Specs

Collaborative design process: от идеи до утверждённого design spec через структурированный диалог, ревью и переход к планированию.

## When to Activate

- Пользователь запускает `/claude-plan:brainstorm`
- Пользователь описывает идею, подход или фичу, требующую дизайна перед реализацией
- Нужно выбрать между несколькими архитектурными подходами
- Перед `/claude-plan:init` для сложных фич, где нужен design spec

## HARD-GATE

**НЕ писать код реализации до утверждения design spec пользователем.**

Brainstorming → Design Spec → Approval → только потом `/claude-plan:init` → код.

## Anti-patterns

- **"Too simple"** — если кажется что задача простая и можно сразу кодить → всё равно пройди хотя бы шаги 1-3. Простые задачи часто скрывают сложность.
- **Множественные вопросы** — НИКОГДА не задавай больше одного вопроса за раз. Один вопрос → один ответ → следующий вопрос.
- **Пропуск секций** — каждая секция spec должна быть показана пользователю и утверждена.
- **Бесконечные циклы** — spec review максимум 3 итерации, потом финализируй.

## Checklist (8 шагов)

### Step 1: Explore Project Context

Собери контекст перед началом диалога:

1. **Кодебаза** — `grep` по ключевым словам в `internal/`, `pkg/`, `cmd/`, `src/`
2. **Зависимости** — `go.mod` / `package.json` / `requirements.txt`
3. **Прошлые решения** — `.plan/*/research/`, `adr/`, project memory
4. **PROJECT.md** — если есть, извлеки Mission, Vision, Strategic Goals, Constraints
5. **Существующие паттерны** — как подобные задачи решены в проекте

> Не показывай все находки сразу. Используй их для формирования вопросов.

### Step 2: Ask Clarifying Questions

Задавай вопросы **по одному**, используя `AskUserQuestion` с опциями (селектор).

Типичные вопросы:
- Кто целевой пользователь / потребитель этого компонента?
- Какие ключевые constraints (performance, compatibility, timeline)?
- Есть ли preferred patterns или технологии?
- Что out of scope?

**Правила:**
- Один вопрос за раз
- Multiple choice preferred (предлагай 2-4 опции + "Другое")
- Максимум 5 вопросов (не допрашивай)
- Если контекст достаточен из Step 1 — переходи к Step 3 с 1-2 вопросами

### Step 3: Propose 2-3 Approaches

Предложи 2-3 подхода с trade-offs:

```
## Approach 1: <Name>
**Summary**: ...
**Pros**: ...
**Cons**: ...
**Best when**: ...

## Approach 2: <Name>
...

## Recommended: Approach N
**Why**: ...
```

Спроси через `AskUserQuestion`:
- Опции: названия подходов + "Комбинация" + "Другой подход"

### Step 4: Present Design — секция за секцией

Покажи дизайн **инкрементально** — одна секция за раз. После каждой секции спроси approval.

Порядок секций:
1. **Architecture** — высокоуровневая структура
2. **Components** — ключевые модули и их ответственности
3. **Data Flow** — как данные перемещаются между компонентами
4. **Error Handling** — стратегия обработки ошибок
5. **Testing Strategy** — как тестировать

Для каждой секции:
1. Покажи содержимое
2. Спроси через `AskUserQuestion`: "Утвердить" / "Изменить" / "Пропустить"
3. Если "Изменить" → прими правки, покажи обновлённую секцию

> Простые секции можно группировать (Error Handling + Testing в одном шаге).

### Step 5: Write Design Spec

Собери утверждённые секции в полный design spec и сохрани файл.

#### Процедура: Detect Backend

Выполни **Step 0: Detect Backend** из plan SKILL.md:
1. Проверь `.plan/config.json` → определи `mode` (local/obsidian) и `vaultPath`
2. Если нет файла → `mode: "local"`

#### Определи расположение файла

**Если привязан к плану:**
- Local: `.plan/<plan>/research/NNN-design-spec-<slug>.md`
- Obsidian: `<vault>/Plans/<Plan Name>/Research/NNN - Design Spec - <Topic>.md`

**Если без плана:**
- Local: `.plan/research/NNN-design-spec-<slug>.md`
- Obsidian: `<vault>/Research/NNN - Design Spec - <Topic>.md`

Номер NNN — следующий в директории research/.

#### Local Format

```markdown
# Design Spec: <Topic>

- **Date**: YYYY-MM-DD
- **Status**: draft
- **Plan**: <plan-name> (или "none")

## Problem
<Описание проблемы из Step 2>

## Approaches Considered

### Approach 1: <Name>
<Summary, pros, cons из Step 3>

### Approach 2: <Name>
...

## Chosen Approach
<Выбранный подход и обоснование из Step 3>

## Design

### Architecture
<Из Step 4>

### Components
<Из Step 4>

### Data Flow
<Из Step 4>

### Error Handling
<Из Step 4>

### Testing Strategy
<Из Step 4>

## Out of Scope
<Что явно не включено>

## Open Questions
<Нерешённые вопросы, если есть>
```

#### Obsidian Format

```markdown
---
type: design-spec
status: draft
plan: "[[Plan Name]]"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - design-spec/draft
---
# Design Spec: <Topic>

## Problem
...

## Approaches Considered
### Approach 1: <Name>
...

## Chosen Approach
...

## Design
### Architecture
### Components
### Data Flow
### Error Handling
### Testing Strategy

## Out of Scope
## Open Questions
```

> Если без плана — убери поле `plan:` из frontmatter.

### Step 6: Spec Review Loop

Запусти subagent для ревью design spec. Максимум 3 итерации.

#### Spec Review Prompt

Используй Agent tool:

```
subagent_type: "general-purpose"
model: "sonnet"
prompt: |
  Review the following design spec for quality. Do NOT write code.

  <spec>
  {содержимое design spec файла}
  </spec>

  Check for:
  1. **Completeness** — are all sections filled? Any gaps?
  2. **Consistency** — do components, data flow, and error handling align?
  3. **Clarity** — can a developer implement this without ambiguity?
  4. **Scope** — is scope well-defined? Is anything missing from Out of Scope?
  5. **YAGNI** — is anything over-engineered for the stated problem?

  Return EXACTLY this format:
  STATUS: Approved | Issues Found
  ISSUES:
  - <issue 1>
  - <issue 2>
  RECOMMENDATIONS:
  - <recommendation 1>
  - <recommendation 2>
```

#### Обработка результата

- **Approved** → обнови Status в spec на `approved`, переходи к Step 7
- **Issues Found** → покажи issues пользователю, спроси:
  - "Исправить" → внеси правки в spec, повтори review (итерация += 1)
  - "Принять как есть" → обнови Status на `approved`, переходи к Step 7
  - "Отложить" → оставь Status как `draft`, остановись

> После 3-й итерации — предложи принять или отложить. Не зацикливайся.

### Step 7: User Reviews Spec

Покажи финальный spec пользователю. Спроси через `AskUserQuestion`:
- "Утверждаю" → обнови Status на `approved` (и `tags: design-spec/approved` в Obsidian), закоммить файл
- "Нужны правки" → прими правки, обнови spec, вернись к Step 6
- "Отложить" → оставь как `draft`

### Step 8: Transition

После утверждения spec предложи следующий шаг через `AskUserQuestion`:
- **"Создать план"** → подсказка: `/claude-plan:init` с контекстом из spec
- **"Добавить часть в план"** → `/claude-plan:add-part` (если план уже существует)
- **"Готово"** → остановиться, spec сохранён

## Design for Isolation

При проектировании design spec придерживайся принципов:
- **Минимальная связность** — компоненты должны быть максимально независимы
- **Чёткие интерфейсы** — определи API/контракты между компонентами
- **Тестируемость** — каждый компонент должен быть тестируем изолированно
- **Инкрементальная доставка** — дизайн должен позволять поэтапную реализацию
