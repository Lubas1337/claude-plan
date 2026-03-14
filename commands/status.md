---
description: "Показать статус плана — обновить INDEX.md и STATUS.md"
---

# /claude-plan:status — Дашборд плана

## Инструкции

> При вопросах пользователю — используй `AskUserQuestion` tool с опциями (селектор), а не текстовые вопросы.

Показывает текущий статус плана и обновляет STATUS.md. Skill "plan" содержит форматы файлов и конвенции. Используй его как справку.

### Входные данные

Аргумент: `$ARGUMENTS` — название плана (slug). Если не указано — прочитай INDEX.md и спроси через `AskUserQuestion` с опциями — по одной на каждый план из INDEX.md.

### Алгоритм

1. **Прочитай MASTER.md** плана `.plan/<plan-name>/MASTER.md`
2. **Прочитай все META.md** из `parts/*/META.md`
3. **Собери статистику**:
   - Количество частей по статусам
   - Общий прогресс (done / total)
   - Следующие ready части
   - Блокеры (что blocked и чем)

### Вывод в консоль

Если `.plan/PROJECT.md` существует, перед блоком плана добавь:
```
Project: <name> | Goal: <strategic goal для этого плана>
```
Определи strategic goal по Roadmap таблице (найди план → фазу → goal).

```markdown
# Plan: <name>
Vision: ...

## Progress: N/M done (XX%)
▓▓▓▓▓▓░░░░ 60%

## Parts
| # | Part | Status | Size | Depends |
|---|------|--------|------|---------|
| 01 | Foundation | ✅ done | S | - |
| 02 | Domain | 🔄 in_progress | M | 01 |
| 03 | API Layer | ⏳ ready | M | 01 |
| 04 | Workers | 🔒 blocked | L | 02 |

## Next Up
→ 03-api-layer (ready, Size: M, parallel with 04 after 02 done)

## Blockers
- 04-workers blocked by 02-domain (in_progress)
```

### Обновление файлов

1. **STATUS.md** — перезаписать с актуальными данными
2. **INDEX.md** — обновить строку этого плана (progress, updated date)

### Формат STATUS.md

```markdown
# Status: <Plan Name>
Updated: YYYY-MM-DD

## Progress: N/M done (XX%)

## By Status
- done: N
- in_progress: N
- ready: N
- blocked: N
- draft: N
- skipped: N

## Parts
(таблица как в выводе)

## Blockers
(список)

## Next
(следующая ready часть)
```
