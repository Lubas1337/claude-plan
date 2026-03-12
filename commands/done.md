---
description: "Пометить часть как done, каскадно обновить blocked→ready, записать в CHANGELOG"
---

# /claude-plan:done — Завершение части

## Инструкции

Помечает часть как `done`, каскадно разблокирует зависимые части, пишет CHANGELOG. Skill "plan" содержит форматы и каскадную логику. Используй его как справку.

### Входные данные

Аргумент: `$ARGUMENTS` — план и номер части.
- `/claude-plan:done ai-features 03` — завершить часть 03
- `/claude-plan:done ai-features` — завершить текущую in_progress часть

### Алгоритм

#### 1. Проверки

1. Прочитай META.md части
2. Проверь что все задачи `done` или `skipped`
3. Если есть незавершённые задачи — предупреди и спроси подтверждение

#### 2. Обновление статуса

1. META.md: `Status: done`
2. MASTER.md: обнови статус в таблице

#### 3. Каскадное разблокирование

Для каждой `blocked` части:
1. Проверь все её зависимости
2. Если ВСЕ зависимости `done` (или `skipped`) → смени на `ready`
3. Обнови META.md разблокированной части
4. Обнови MASTER.md

#### 4. CHANGELOG

Добавь запись в начало CHANGELOG.md:

```markdown
## v0.N.0 — YYYY-MM-DD
### Part NN: Name — done
- Краткое описание что сделано (из task results)
- Ссылки на ADR если есть
```

Номер версии = количество done частей.

#### 5. Обновление дашбордов

1. STATUS.md — пересчитай прогресс
2. INDEX.md — обнови строку плана

#### 6. Проверка завершения плана

Если ВСЕ части `done` или `skipped`:
1. INDEX.md: статус плана → `completed`
2. CHANGELOG.md: версия `v1.0.0`
3. Поздравь пользователя

### Вывод

```
✅ Part 03: API Layer — done

Unblocked:
  → 05-monitoring (ready)
  → 06-deployment (ready)

Changelog: v0.3.0 added

Progress: 3/7 done (43%)
▓▓▓▓░░░░░░ 43%

Next ready: 04-workers (S), 05-monitoring (M)
```
