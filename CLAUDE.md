# Project

## Overview
<!-- Описание проекта -->

## .plan/ — Автономное планирование

> Плагин: `claude plugin marketplace add Lubas1337/claude-plan && claude plugin install claude-plan`

### Когда предлагать .plan/

- Пользователь описывает фичу/задачу с 3-10 отдельными частями
- Части имеют зависимости или могут выполняться параллельно
- Нужен трекинг прогресса между сессиями
- НЕ использовать для: правок 1-2 файлов (прямое редактирование), 10+ фаз (GSD)

### Автономный workflow

1. **Инициация**: при описании средней задачи → предложи `/claude-plan:init`
2. **Выполнение**: после создания плана → `/claude-plan:next <plan>`
3. **Завершение**: после выполнения всех задач части → `/claude-plan:done`
4. **Прогресс**: при возврате к проекту → `/claude-plan:status` или `/claude-plan:list`

### Правила автономности

- При `/claude-plan:next` — выполняй задачи последовательно, обновляй статусы
- После `/claude-plan:done` — покажи разблокированные части и предложи следующую
- Если есть параллельные ready части — предложи worktree
- При ошибке в задаче — не пропускай молча, спроси пользователя
- Между сессиями — читай STATUS.md и MASTER.md для восстановления контекста

### Восстановление контекста между сессиями

При начале новой сессии, если в проекте есть `.plan/`:
1. Прочитай `.plan/PROJECT.md` (если есть) — проектный контекст и roadmap
2. Прочитай `.plan/INDEX.md` — какие планы активны
3. Для active плана — прочитай `STATUS.md` и `MASTER.md`
4. Найди `in_progress` части — предложи продолжить
5. Если нет `in_progress` — предложи `/claude-plan:next`

### Decision tree

```
Пользователь описывает задачу:
├── 1-2 файла → прямое редактирование
├── 3-10 частей → /claude-plan:init
├── Хочет Obsidian vault → /claude-plan:obsidian
├── Нужен дизайн/исследование подхода → /claude-plan:brainstorm
├── Хочет определить стратегию → /claude-plan:project
└── 10+ фаз, research-heavy → GSD workflow

Пользователь возвращается к проекту:
├── Есть .plan/ с active планом → /claude-plan:status
├── Есть in_progress часть → продолжить выполнение
└── Нет .plan/ → работай как обычно
```

### Команды

| Команда | Описание |
|---------|----------|
| `/claude-plan:init` | Создать план |
| `/claude-plan:next` | Выполнить следующую часть (--yolo для автоцикла) |
| `/claude-plan:done` | Завершить часть, каскадно разблокировать |
| `/claude-plan:status` | Дашборд плана |
| `/claude-plan:list` | Все планы |
| `/claude-plan:add-part` | Добавить часть |
| `/claude-plan:research` | Research note / ADR |
| `/claude-plan:project` | Проектный контекст, vision, roadmap |
| `/claude-plan:brainstorm` | Brainstorming — от идеи до design spec |
| `/claude-plan:obsidian` | Настройка Obsidian vault, toggle backend |
| `/claude-plan:setup` | Эта секция (инструкции в CLAUDE.md) |
