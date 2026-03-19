---
description: "Запустить Kanban веб-доску для визуализации планов"
---

# /claude-plan:web — Kanban-доска

## Инструкции

Запускает веб-приложение с Kanban-доской для визуализации `.plan/` данных.

### Step 0: Detect Backend

Выполни процедуру **"Detect Backend"** из SKILL.md:
1. Проверь `.plan/config.json` → определи `mode` (local/obsidian) и `vaultPath`
2. Передай config через env-переменные:
   - `PLAN_BACKEND=obsidian` (или `local`)
   - `VAULT_PATH=<vault_path>` (только для obsidian)
3. Остальной алгоритм без изменений — web server сам определит backend

### Алгоритм

1. **Проверь наличие `.plan/`** в текущей рабочей директории. Если нет — сообщи пользователю: "Нет директории `.plan/`. Используй `/claude-plan:init` для создания плана."

2. **Проверь Node.js**: выполни `node --version`. Если нет — сообщи: "Для веб-доски нужен Node.js. Установи: https://nodejs.org"

3. **Определи путь к плагину**: папка `web/` находится рядом с этим файлом команды. Путь: `<plugin-dir>/web/`.

4. **Установи зависимости** (если нет `node_modules`):
   ```bash
   cd <plugin-dir>/web && npm install
   ```

5. **Запусти dev-сервер** в фоне:
   ```bash
   cd <plugin-dir>/web && PLAN_DIR=<cwd>/.plan npm run dev
   ```
   Используй `run_in_background: true` для Bash tool.

6. **Открой в браузере**:
   ```bash
   open http://localhost:5173
   ```

7. **Покажи сообщение**:
   ```
   Kanban-доска запущена:
   → http://localhost:5173

   Сервер работает в фоне. Данные обновляются из .plan/ при каждом запросе.
   Для остановки: Ctrl+C в процессе или закрой терминал.
   ```

### Правила

- Путь к `.plan/` передаётся через `PLAN_DIR` env-переменную
- Dev-режим: Vite (порт 5173) + Hono API (порт 3001)
- Vite проксирует `/api` на Hono автоматически
- На macOS используй `open`, на Linux — `xdg-open`
