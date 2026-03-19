---
description: "Создать research note или ADR в плане"
---

# /claude-plan:research — Исследование

## Инструкции

> При вопросах пользователю — используй `AskUserQuestion` tool с опциями (селектор), а не текстовые вопросы.

Создаёт research note или ADR (Architecture Decision Record) в плане. Skill "plan" содержит форматы файлов и конвенции. Используй его как справку.

### Step 0: Detect Backend

Выполни процедуру **"Detect Backend"** из SKILL.md:
1. Проверь `.plan/config.json` → определи `mode` (local/obsidian) и `vaultPath`
2. Если `mode === "local"` → текущее поведение без изменений
3. Если `mode === "obsidian"`:
   - Research: `<vault>/Plans/<Plan Name>/Research/NNN - Topic.md` с frontmatter `type: research`
   - ADR: `<vault>/Plans/<Plan Name>/Research/ADR/ADR-NNN - Decision.md` с frontmatter `type: adr`
   - Общий research: `<vault>/Research/NNN - Topic.md`
   - Используй wikilinks: `plan: "[[Plan Name]]"`

### Входные данные

Аргумент: `$ARGUMENTS` — тема и опции.
- `/claude-plan:research ai-features "Выбор message broker"` — research note
- `/claude-plan:research ai-features "Выбор message broker" --adr` — ADR
- `/claude-plan:research "Общая тема"` — в общий research/ (не привязан к плану)

### Алгоритм

#### Research Note

1. **Определи номер**: следующий в `research/` директории (001, 002, ...)
2. **Создай файл**: `research/NNN-slug.md`
3. **Проведи исследование** — выполни процедуру **"Research Context"** из SKILL.md:
   - Поиск в кодебазе: grep по ключевым словам в `internal/`, `pkg/`
   - Проверь зависимости в `go.mod` / `package.json`
   - Проверь `.plan/*/research/` и `adr/` — прошлые исследования
   - Проверь project memory — прошлые решения
   - Если тема совпадает с навыком из `.claude/skills/` — прочитай его SKILL.md как reference
   - Web search при необходимости (учитывай Stack из CLAUDE.md)
   - Анализ альтернатив
4. **Agent-Assisted Research** (для сложных тем):

   Если research topic охватывает 3+ домена или требует исследования 10+ файлов:

   - **Exploration кодебазы** — запусти Agent tool:
     - `subagent_type: "Explore"`
     - prompt: поиск по ключевым словам в кодебазе, паттерны, существующие реализации
     - `model: "sonnet"`

   - **Архитектурный анализ** (для --adr) — запусти Agent tool:
     - `subagent_type: "architect"`
     - prompt: анализ альтернатив, trade-offs, рекомендация
     - `model: "opus"`

   Используй результаты агентов для заполнения research note / ADR.
   Для простых тем (1-2 домена, < 10 файлов) — выполняй inline.

5. **Заполни**: вопрос, находки, решение, ссылки

#### ADR (--adr)

1. **Определи номер**: следующий в `research/adr/` (001, 002, ...)
2. **Создай файл**: `research/adr/NNN-slug.md`
3. **Заполни формат ADR**: контекст, решение, последствия, альтернативы
4. **Статус**: `accepted`

### Расположение файлов

```
# Research привязанный к плану
.plan/<plan-name>/research/001-message-broker.md
.plan/<plan-name>/research/adr/001-chose-nats.md

# Общий research (без плана)
.plan/research/001-auth-approaches.md
```

### Правила

- Slug из темы: lowercase, дефисы, до 40 символов
- Research note: фокус на находках и решении
- ADR: фокус на контексте решения и trade-offs
- Если research приводит к решению — предложи создать ADR
- Ссылайся на research/ADR из META.md затронутых частей

### Вывод

```
Created: .plan/ai-features/research/002-message-broker.md

Summary:
- Рассмотрены: Kafka, NATS, RabbitMQ
- Решение: NATS (простота, Go-native, достаточная производительность)

Спроси пользователя через `AskUserQuestion` с опциями:
- "Создать ADR" — создать Architecture Decision Record
- "Пропустить" — не создавать ADR
```
