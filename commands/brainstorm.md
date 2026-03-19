---
description: "Brainstorming — превращение идей в design specs через collaborative dialogue"
---

# /claude-plan:brainstorm — Brainstorming

## Инструкции

> При вопросах пользователю — используй `AskUserQuestion` tool с опциями (селектор), а не текстовые вопросы.

Превращает идеи в валидированные design specs через структурированный диалог. Skill "brainstorm" содержит полный workflow, форматы и checklist. Используй его как справку.

### Входные данные

Аргумент: `$ARGUMENTS` — опциональные plan name и тема.

- `/claude-plan:brainstorm` — новый brainstorm без привязки к плану
- `/claude-plan:brainstorm ai-features` — brainstorm привязанный к плану `ai-features`
- `/claude-plan:brainstorm ai-features "Caching strategy"` — с темой

Парсинг:
1. Первое слово без кавычек → `planName` (проверь что `.plan/<planName>/MASTER.md` существует)
2. Строка в кавычках → `topic`
3. Если `planName` не существует как план → считай что это `topic`, plan = none

### Step 0: Detect Backend

Выполни процедуру **"Detect Backend"** из plan SKILL.md:
1. Проверь `.plan/config.json` → определи `mode` (local/obsidian) и `vaultPath`
2. Если `mode === "local"` → local paths
3. Если `mode === "obsidian"` → obsidian paths с frontmatter

### Step 1: Определи контекст

1. **Если указан план** → прочитай `.plan/<plan>/MASTER.md`, проверь `research/`
2. **Если нет плана** → общий brainstorm
3. **Если указана тема** → используй как starting point для Step 2
4. Выполни **Step 1: Explore Project Context** из brainstorm SKILL.md:
   - grep по ключевым словам в кодебазе
   - Проверь зависимости
   - Прочитай прошлые исследования и ADR
   - Проверь PROJECT.md

### Step 2: Запусти brainstorming workflow

Следуй checklist из brainstorm SKILL.md (8 шагов):

1. **Explore Project Context** — уже выполнено в Step 1
2. **Ask Clarifying Questions** — по одному, через `AskUserQuestion`
3. **Propose 2-3 Approaches** — trade-offs + рекомендация
4. **Present Design** — по секциям, approval после каждой
5. **Write Design Spec** — сохрани файл (Step 3 ниже)
6. **Spec Review Loop** — subagent, макс 3 итерации
7. **User Reviews Spec** — gate перед реализацией
8. **Transition** — предложи следующий шаг (Step 4 ниже)

**HARD-GATE**: не переходить к реализации до утверждения spec.

### Step 3: Сохрани spec

Определи путь по backend mode и наличию плана:

**Local mode:**
- С планом: `.plan/<plan>/research/NNN-design-spec-<slug>.md`
- Без плана: `.plan/research/NNN-design-spec-<slug>.md`

**Obsidian mode:**
- С планом: `<vault>/Plans/<Plan Name>/Research/NNN - Design Spec - <Topic>.md`
- Без плана: `<vault>/Research/NNN - Design Spec - <Topic>.md`

Номер NNN — следующий в директории research/. Slug из темы: lowercase, дефисы, до 40 символов.

После сохранения — закоммить spec файл.

### Step 4: Предложи следующий шаг

Спроси через `AskUserQuestion`:
- **"Создать план"** → предложи `/claude-plan:init` с контекстом из spec (vision, goals, structure)
- **"Добавить часть в план"** → `/claude-plan:add-part` (если план уже существует)
- **"Готово"** → остановиться

### Правила

- Следуй HARD-GATE: никакого кода до утверждения spec
- Один вопрос за раз, multiple choice preferred
- Максимум 5 clarifying questions
- Spec review максимум 3 итерации
- Slug из темы: lowercase, дефисы, до 40 символов
- При наличии плана — ссылайся на spec из MASTER.md research секции

### Вывод

```
Created: .plan/<plan>/research/NNN-design-spec-<slug>.md

Design Spec: <Topic>
Status: approved
Approach: <Chosen Approach Name>

Next: /claude-plan:init или /claude-plan:add-part
```
