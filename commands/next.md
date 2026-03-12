---
description: "Взять следующую ready часть плана, выполнить задачи, обновить статусы"
---

# /claude-plan:next — Выполнение следующей части

## Инструкции

Берёт следующую `ready` часть плана и выполняет её задачи. Skill "plan" содержит логику выбора частей и форматы. Используй его как справку.

### Входные данные

Аргумент: `$ARGUMENTS` — название плана и/или номер части.
- `/claude-plan:next ai-features` — следующая ready часть плана ai-features
- `/claude-plan:next ai-features 03` — конкретная часть 03
- `/claude-plan:next` — спросить какой план

### Алгоритм

#### 1. Выбор части

Прочитай MASTER.md → найди все `ready` части → выбери по приоритету:
1. Sequential bottleneck (блокирует больше всего)
2. S before L (маленькие первыми)
3. Unblocks most (разблокирует максимум blocked)
4. Lowest number (при равенстве)

Если есть параллельные ready части — предложи:
```
Ready parts:
→ 03-api-layer (S, unblocks: 05, 06)
  04-workers (M, parallel with 03)

Запустить 03 здесь, а 04 через worktree? (y/n)
```

#### 2. Подготовка

1. Обнови META.md: `Status: ready` → `Status: in_progress`
2. Обнови MASTER.md: статус части в таблице
3. Прочитай все task files части

#### 3. Выполнение задач

Для каждой задачи в порядке номера:
1. Прочитай task file
2. Выполни Action
3. Проверь Acceptance Criteria
4. Обнови task file: `Status: done`, заполни `Result`
5. Обнови META.md: статус задачи в таблице

#### 4. Завершение части

После выполнения всех задач:
1. Обнови META.md: `Status: in_progress` → `Status: done`
2. **Каскадное обновление**: проверь все `blocked` части — если все их зависимости теперь `done`, смени на `ready`
3. Обнови MASTER.md: таблицу частей
4. Запиши в CHANGELOG.md новую версию
5. Обнови STATUS.md и INDEX.md

### Каскадная логика (blocked → ready)

```
Part 04 depends on [02, 03]
  02 = done, 03 = done → 04: blocked → ready ✅
  02 = done, 03 = in_progress → 04 stays blocked ❌
```

Проверяй ВСЕ зависимости. Часть разблокируется только когда ВСЕ зависимости done.

### При ошибке

Если задача не может быть выполнена:
1. Запиши причину в task file `Result`
2. Статус задачи: `blocked`
3. Статус части: оставь `in_progress`
4. Предложи: skip задачу, исследовать проблему, или остановиться

### Вывод

В начале:
```
Starting Part 03: API Layer (3 tasks)
```

После каждой задачи:
```
✓ Task 01: Create order command — done
✓ Task 02: Add HTTP handler — done
✓ Task 03: Integration tests — done

Part 03: API Layer — DONE
Unblocked: 05-monitoring, 06-deployment
Next ready: 04-workers
```
