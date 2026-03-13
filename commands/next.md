---
description: "Взять следующую ready часть плана, выполнить задачи, обновить статусы"
---

# /claude-plan:next — Выполнение следующей части

## Инструкции

> При вопросах пользователю — используй `AskUserQuestion` tool с опциями (селектор), а не текстовые вопросы.

Берёт следующую `ready` часть плана и выполняет её задачи. Skill "plan" содержит логику выбора частей и форматы. Используй его как справку.

### Входные данные

Аргумент: `$ARGUMENTS` — название плана и/или номер части.
- `/claude-plan:next ai-features` — следующая ready часть плана ai-features
- `/claude-plan:next ai-features 03` — конкретная часть 03
- `/claude-plan:next` — спросить какой план (через `AskUserQuestion` с опциями — список планов из INDEX.md)
- `/claude-plan:next ai-features --yolo` — автоцикл: выполнять части подряд пока есть ready
- `/claude-plan:next ai-features 03 --yolo` — начать с части 03, потом продолжить цикл

### Режим --yolo (автоцикл)

Если `$ARGUMENTS` содержит `--yolo`:

1. **Авто-выбор плана**: если план не указан — бери первый `active` из INDEX.md (не спрашивай)
2. **Параллельные части**: авто-делегировать агентам (если Agent != none), иначе "Только одну"
3. **Agent launch**: авто-запуск без подтверждения
4. **Цикл**: после завершения части → автоматически переходи к шагу 1
5. **СТОП-условия** (прерывают цикл немедленно):
   - Ошибка выполнения задачи
   - Незавершённые задачи при попытке закрыть часть
   - Нет ready частей (все done или blocked)
   - ВСЕ части плана done (план завершён)

Без `--yolo` — всё работает как раньше.

### Алгоритм

#### 1. Выбор части

Прочитай MASTER.md → найди все `ready` части → выбери по приоритету:
1. Sequential bottleneck (блокирует больше всего)
2. S before L (маленькие первыми)
3. Unblocks most (разблокирует максимум blocked)
4. Lowest number (при равенстве)

Если есть параллельные ready части:

**Без --yolo:** покажи их список и спроси через `AskUserQuestion` с опциями:
- "Выполнить здесь + делегировать" — выполнить приоритетную часть здесь, параллельные делегировать агентам в worktrees
- "Делегировать все" — делегировать все ready части агентам параллельно в worktrees
- "Только одну" — выполнить только приоритетную часть здесь (последовательно)

**С --yolo:** если параллельные части имеют `Agent:` != `none` → автоматически "Выполнить здесь + делегировать", иначе → "Только одну"

#### 2. Подготовка

1. Обнови META.md: `Status: ready` → `Status: in_progress`
2. Обнови MASTER.md: статус части в таблице
3. Прочитай все task files части
4. **Загрузи контекст** — выполни процедуру **"Execution Context"** из SKILL.md:
   - Прочитай `.claude/rules/common/coding-style.md`, `testing.md`, `security.md`
   - Определи язык из Files Affected → прочитай `.claude/rules/<lang>/` (макс. 3 файла)
   - Проверь project memory на релевантный фидбэк

#### 2.5 Проверка делегирования

Прочитай поле `Agent:` из META.md (и `Delegatable:`):

**Если Agent: none (или отсутствует) И Delegatable: нет:**
→ Переходи к шагу 3 (inline execution, текущее поведение)

**Если Agent: <тип> ИЛИ Delegatable: yes:**
1. Определи агента — процедура **"Select Agent"** из SKILL.md
2. Если результат `none` → переходи к шагу 3 (inline)
3. Построй prompt — процедура **"Build Agent Prompt"** из SKILL.md
4. Запусти агента — процедура **"Launch Agent"** из SKILL.md
5. Обработай результат — процедура **"Handle Agent Result"** из SKILL.md
6. Пропусти шаг 3, переходи к шагу 4 (агент уже выполнил задачи)

**Если есть параллельные ready части с Agent: != none:**
→ Процедура **"Parallel Agent Launch"** из SKILL.md

#### 3. Выполнение задач

Для каждой задачи в порядке номера:
1. Прочитай task file
2. Выполни Action (соблюдай загруженные правила: TDD, coding style, security checklist)
3. Если META.md содержит `Skill hint:` — активируй указанный skill при выполнении
4. Проверь Acceptance Criteria
5. Обнови task file: `Status: done`, заполни `Result`
6. Обнови META.md: статус задачи в таблице

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

**С --yolo:** немедленно останови цикл, выведи:
```
⛔ YOLO stopped: {причина ошибки}
Part {NN}: {Name} — in_progress
Failed task: {task_number}: {task_name}
Progress: {done}/{total} ({percent}%)
```

**Без --yolo:**
1. Запиши причину в task file `Result`
2. Статус задачи: `blocked`
3. Статус части: оставь `in_progress`
4. Спроси через `AskUserQuestion` с опциями:
   - "Пропустить задачу" — skip задачу и перейти к следующей
   - "Исследовать проблему" — провести research перед повторной попыткой
   - "Остановиться" — оставить часть in_progress и остановить выполнение

#### 5. Yolo-цикл (только с --yolo)

Пропусти если НЕ в режиме --yolo.

1. Проверь СТОП-условия:
   - Нет ready → все done? → план завершён, поздравление, стоп
   - Нет ready, есть blocked → "YOLO paused: no ready parts", стоп

2. Вывод прогресса:
```
───────────────────────────────────────
🔄 YOLO {N}/{total} — {done_count} done ({percent}%)
Next: Part {NN}: {Name} ({Size})
───────────────────────────────────────
```

3. Вернись к шагу 1 с тем же планом и --yolo

По завершении цикла:
```
✅ YOLO complete — {completed_count} parts done
Progress: {done}/{total} ({percent}%)
```

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
