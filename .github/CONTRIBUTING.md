# Contributing to claude-plan

Thanks for your interest in contributing!

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed

## Local Development

```bash
# Clone the repository
git clone https://github.com/Lubas1337/claude-plan.git
cd claude-plan

# Install web dashboard dependencies
cd web
npm install

# Start development server (API + Vite)
npm run dev

# In another terminal — run TypeScript checks
npx tsc --noEmit
```

## Project Structure

```
claude-plan/
├── commands/          # Claude Code plugin commands (skills)
├── skills/            # Plugin skill definitions
├── web/               # Kanban web dashboard
│   ├── server/        # Hono API server
│   └── src/           # React frontend (Vite)
├── CLAUDE.md          # AI instructions for the plugin
└── .claude-plugin/    # Plugin marketplace metadata
```

## Plugin Development

Commands are defined as markdown files in `commands/`. Each command has a `SKILL.md` that defines the prompt and behavior.

To test your changes locally:

```bash
# Install the plugin from your local directory
claude plugin install /path/to/claude-plan
```

## Code Style

- TypeScript with strict mode
- React 19 with functional components
- Hono for the API server

## Submitting a PR

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run `npx tsc --noEmit` in `web/` to check types
5. Commit with a descriptive message
6. Push and open a Pull Request
