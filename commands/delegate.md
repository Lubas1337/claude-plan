---
description: "Делегировать часть плана агенту Claude Code"
---

# /claude-plan:delegate — Делегирование агенту

## Инструкции

Явная делегация части плана агенту. Skill "plan" содержит процедуры оркестрации.

### Входные данные

Аргумент: `$ARGUMENTS`
- `/claude-plan:delegate ai-features 03` — делегировать часть 03
- `/claude-plan:delegate ai-features 03 --agent tdd-guide` — конкретный агент
- `/claude-plan:delegate ai-features 03 --background` — в фоне

### Алгоритм

1. Прочитай META.md указанной части
2. Проверь статус: только `ready` или `in_progress`
3. Определи агента:
   - Если `--agent` указан → использовать
   - Если META.md содержит `Agent: <тип>` → использовать
   - Иначе → процедура "Select Agent" из SKILL.md
4. Обнови META.md: Status → `in_progress`
5. Построй prompt — процедура "Build Agent Prompt" из SKILL.md
6. Запусти Agent tool:
   - `run_in_background: true` если `--background`
   - `isolation: "worktree"` если `--background`
7. Обработай результат — процедура "Handle Agent Result" из SKILL.md

### Вывод

```
Delegating Part 03: API Layer → tdd-guide (sonnet)
Files: internal/application/commands/, internal/infrastructure/http/
Tasks: 3
```
