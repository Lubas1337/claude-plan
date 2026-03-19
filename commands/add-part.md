---
description: "Добавить новую часть в существующий план"
---

# /claude-plan:add-part — Добавление части в план

## Инструкции

> При вопросах пользователю — используй `AskUserQuestion` tool с опциями (селектор), а не текстовые вопросы.

Добавляет новую часть в существующий план. Skill "plan" содержит форматы файлов и конвенции. Используй его как справку.

### Step 0: Detect Backend

Выполни процедуру **"Detect Backend"** из SKILL.md:
1. Проверь `.plan/config.json` → определи `mode` (local/obsidian) и `vaultPath`
2. Если `mode === "local"` → текущее поведение без изменений
3. Если `mode === "obsidian"`:
   - MASTER.md → `<vault>/Plans/<Plan Name>/<Plan Name>.md`
   - Создай Part note: `<vault>/Plans/<Plan Name>/Parts/NN - Name/NN - Name.md` с YAML frontmatter
   - В таблице Parts Plan Overview используй wikilinks: `[[NN - Name]]`

### Входные данные

Аргумент: `$ARGUMENTS` — название плана и описание части.
- `/claude-plan:add-part ai-features "Caching layer" --depends 02,03 --size M`
- `/claude-plan:add-part ai-features` — интерактивный режим

### Алгоритм

#### 1. Определи номер

Прочитай MASTER.md → найди последний номер части → новый = последний + 1.

#### 2. Собери информацию

Перед сбором информации загрузи структуру проекта:
- `ls internal/` (и подкаталоги при необходимости) — для точного заполнения Files Affected
- Учитывай архитектурные слои из CLAUDE.md (domain → application → infrastructure)

Если не указано в аргументах, собери информацию через `AskUserQuestion`:

1. Спроси через текстовый ввод (AskUserQuestion с "Other"):
   - **Название** части и **Goal** — что часть достигает

2. Спроси через `AskUserQuestion` с опциями-зависимостями (список существующих частей из MASTER.md):
   - **Dependencies** — `multiSelect: true`, опции = существующие части + "Нет зависимостей"

3. Спроси через `AskUserQuestion`:
   - **Size** — опции: "S (1-2 задачи)", "M (3-5 задач)", "L (6-10 задач)", "XL (10+ задач)"

4. Остальное (Parallel, Files Affected, Задачи) — определи автоматически из контекста или спроси если неочевидно

#### 3. Создай файлы

1. Создай директорию `parts/NN-slug/`
2. Создай META.md с заполненными полями
3. Создай task files если задачи указаны
4. Определи статус:
   - Все зависимости `done` → `ready`
   - Есть незавершённые зависимости → `blocked`
   - Нет зависимостей → `ready`

#### 4. Обнови существующие файлы

1. **MASTER.md** — добавь строку в таблицу Parts
2. **STATUS.md** — пересчитай прогресс
3. **INDEX.md** — обнови прогресс плана

### Правила

- Slug: lowercase из названия, дефисы (`Caching Layer` → `caching-layer`)
- Не создавай часть с дублирующим названием
- Проверь что зависимости существуют
- Если зависимость `skipped` — считай как `done`

### Вывод

```
Added Part 05: Caching Layer (M, blocked by 02-domain, 03-api-layer)
Files: parts/05-caching-layer/META.md

Plan progress: 2/5 done (was 2/4)
```
