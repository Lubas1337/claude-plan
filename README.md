# claude-plan

> Autonomous project planning plugin for Claude Code with Kanban dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Lubas1337/claude-plan/actions/workflows/ci.yml/badge.svg)](https://github.com/Lubas1337/claude-plan/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/Lubas1337/claude-plan)](https://github.com/Lubas1337/claude-plan/releases)
[![GitHub stars](https://img.shields.io/github/stars/Lubas1337/claude-plan)](https://github.com/Lubas1337/claude-plan/stargazers)

<!-- ![Demo](docs/demo.gif) -->

## Features

- **Project Vision & Roadmap** — define project mission, strategic goals, and roadmap phases across plans
- **Multi-plan support** — manage multiple plans simultaneously with a shared index
- **Dependency tracking** — automatic blocked/ready status based on part dependencies
- **Cascade unblocking** — completing a part automatically unblocks dependents
- **Kanban web dashboard** — 3-level visualization: Dashboard, Plan Detail, Task Modal
- **Agent orchestration** — delegate parts to Claude Code agents with auto-selection
- **Auto-cycle (`--yolo`)** — continuous execution of parts without intervention
- **Parallel execution** — run independent parts via git worktrees
- **Research & ADR** — research notes and Architecture Decision Records per plan
- **Session sidebar** — browse Claude Code sessions grouped by project

## Quick Start

```bash
# Add marketplace source
claude plugin marketplace add Lubas1337/claude-plan

# Install the plugin
claude plugin install claude-plan

# Create your first plan
/claude-plan:init my-project
```

## Commands

| Command | Description |
|---------|-------------|
| `/claude-plan:init` | Create a new plan in `.plan/` with MASTER.md and initial parts |
| `/claude-plan:status` | Show plan status — update INDEX.md and STATUS.md |
| `/claude-plan:next` | Pick the next ready part, execute tasks, update statuses |
| `/claude-plan:add-part` | Add a new part to an existing plan |
| `/claude-plan:research` | Create a research note or ADR in the plan |
| `/claude-plan:done` | Mark part as done, cascade unblock dependent parts, write to CHANGELOG |
| `/claude-plan:list` | Show all plans with progress |
| `/claude-plan:project` | Define or update project vision, strategic goals, and roadmap |
| `/claude-plan:setup` | Add AI instructions to the project's CLAUDE.md |
| `/claude-plan:web` | Launch Kanban web dashboard for plan visualization |

## When to Use

| Scenario | Tool |
|----------|------|
| Quick edit, 1-2 files | Direct editing |
| Medium project, 3-10 parts | **`.plan/`** (this plugin) |
| Large project, 10+ phases | GSD workflow |
| Ephemeral plan for one session | Plan mode |

## Workflow Example

```
1. /claude-plan:init my-project       # Create plan with parts
2. /claude-plan:next my-project       # Execute next ready part
3. /claude-plan:done my-project 01    # Mark part as done → unblocks dependents
4. /claude-plan:status my-project     # Check progress dashboard
5. /claude-plan:web                   # Open Kanban board in browser
```

## Kanban Dashboard

The web dashboard (`/claude-plan:web`) provides a 3-level visualization:

1. **Dashboard** — overview of all plans with progress cards
2. **Plan Detail** — Kanban board with expandable cards and inline task lists
3. **Task Modal** — task details with action, acceptance criteria, result, and affected files

Additional features:
- **Sessions Sidebar** — browse Claude Code sessions grouped by project directory

## `.plan/` Structure

```
.plan/
├── PROJECT.md                   # Project vision & roadmap (optional)
├── INDEX.md                     # Index of all plans
├── research/                    # Shared research notes
├── <plan-name>/
│   ├── MASTER.md                # Overview, parts table, goals
│   ├── STATUS.md                # Auto-generated dashboard
│   ├── CHANGELOG.md             # Versioning
│   ├── research/
│   │   └── adr/                 # Architecture Decision Records
│   └── parts/
│       └── NN-slug/
│           ├── META.md          # Metadata: status, dependencies
│           ├── 01-task.md       # Individual task files
│           └── 02-task.md
```

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE)

---

[Документация на русском](./docs/README-ru.md)
