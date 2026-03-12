---
description: "Показать все планы с прогрессом"
---

# /claude-plan:list — Список всех планов

## Инструкции

Показывает все планы в `.plan/` с их прогрессом. Skill "plan" содержит форматы файлов и конвенции. Используй его как справку.

### Алгоритм

1. **Проверь существование** `.plan/` директории. Если нет — сообщи и предложи `/claude-plan:init`.

2. **Найди все планы**: директории в `.plan/` содержащие `MASTER.md` (исключая `research/`).

3. **Для каждого плана** прочитай:
   - MASTER.md: vision, количество частей
   - Все META.md: статусы частей

4. **Собери таблицу**:

```markdown
# Plans

| # | Plan | Vision | Progress | Status | Next Part | Updated |
|---|------|--------|----------|--------|-----------|---------|
| 1 | ai-features | AI-powered recommendations | ▓▓▓▓░░ 3/7 | active | 04-workers | 2026-03-12 |
| 2 | lms-integration | LMS sync with Moodle | ▓░░░░░ 1/4 | paused | 02-api | 2026-03-10 |
| 3 | devops-setup | CI/CD pipeline | ▓▓▓▓▓▓ 3/3 | completed | - | 2026-03-08 |

Total: 3 plans, 7/14 parts done (50%)
```

5. **Обнови INDEX.md** с актуальными данными.

### Детальный режим

Если `$ARGUMENTS` содержит `--detail`:
- Показать части каждого плана с их статусами
- Показать блокеры

### Вывод

Таблица планов + общая статистика. Без дополнительных пояснений.

Если нет планов:
```
No plans found in .plan/
Use /claude-plan:init to create your first plan.
```
