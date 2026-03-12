# claude-plan

Lightweight project planning system for Claude Code.

## Установка

```bash
# 1. Добавить marketplace
claude plugin marketplace add Lubas1337/claude-plan

# 2. Установить плагин
claude plugin install claude-plan
```

## Команды (8)

| Команда | Описание |
|---------|----------|
| `/claude-plan:init` | Создать новый план в `.plan/` с MASTER.md и начальными частями |
| `/claude-plan:status` | Показать статус плана — обновить INDEX.md и STATUS.md |
| `/claude-plan:next` | Взять следующую ready часть плана, выполнить задачи, обновить статусы |
| `/claude-plan:add-part` | Добавить новую часть в существующий план |
| `/claude-plan:research` | Создать research note или ADR в плане |
| `/claude-plan:done` | Пометить часть как done, каскадно обновить blocked->ready, записать в CHANGELOG |
| `/claude-plan:list` | Показать все планы с прогрессом |
| `/claude-plan:setup` | Добавить инструкции для AI в CLAUDE.md проекта |

## Когда использовать

| Ситуация | Инструмент |
|----------|-----------|
| Быстрая правка, 1-2 файла | Прямое редактирование |
| Средний проект, 3-10 частей | **`.plan/`** (этот плагин) |
| Большой проект, 10+ фаз | GSD workflow |
| Эфемерный план на одну сессию | Plan mode |

## Workflow

```
1. /claude-plan:init my-project       # Создать план
2. /claude-plan:next my-project       # Взять следующую часть
3. /claude-plan:done my-project 01    # Пометить часть как done
4. /claude-plan:status my-project     # Проверить прогресс
```

## Структура .plan/

```
.plan/
├── INDEX.md                     # Индекс всех планов
├── research/                    # Общие исследования
├── <plan-name>/
│   ├── MASTER.md                # Обзор, таблица частей, цели
│   ├── STATUS.md                # Авто-генерируемый дашборд
│   ├── CHANGELOG.md             # Версионирование
│   ├── research/
│   │   └── adr/                 # Architecture Decision Records
│   └── parts/
│       └── NN-slug/
│           ├── META.md          # Метаданные: статус, зависимости
│           ├── 01-task.md
│           └── 02-task.md
```

## Возможности

- **Мульти-планы** — несколько планов одновременно с общим INDEX.md
- **Dependency tracking** — зависимости между частями, автоматический blocked/ready
- **Cascade unblocking** — завершение части автоматически разблокирует зависимые
- **Параллельность** — части без пересечений файлов можно выполнять через worktrees
- **Research & ADR** — исследования и Architecture Decision Records привязаны к планам
- **Версионирование** — автоматический CHANGELOG при завершении частей

## License

MIT
