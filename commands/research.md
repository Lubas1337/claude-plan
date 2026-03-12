---
description: "Создать research note или ADR в плане"
---

# /claude-plan:research — Исследование

## Инструкции

Создаёт research note или ADR (Architecture Decision Record) в плане. Skill "plan" содержит форматы файлов и конвенции. Используй его как справку.

### Входные данные

Аргумент: `$ARGUMENTS` — тема и опции.
- `/claude-plan:research ai-features "Выбор message broker"` — research note
- `/claude-plan:research ai-features "Выбор message broker" --adr` — ADR
- `/claude-plan:research "Общая тема"` — в общий research/ (не привязан к плану)

### Алгоритм

#### Research Note

1. **Определи номер**: следующий в `research/` директории (001, 002, ...)
2. **Создай файл**: `research/NNN-slug.md`
3. **Проведи исследование**:
   - Поиск в кодебазе (существующие паттерны)
   - Web search при необходимости
   - Анализ альтернатив
4. **Заполни**: вопрос, находки, решение, ссылки

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
- Создать ADR? (y/n)
```
