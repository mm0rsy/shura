# Shura

A multi-agent orchestration system for coordinating work across multiple repositories simultaneously. Inspired by the Arabic consultative council concept.

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Initialize a shura project directory |
| `/add-repo` | Add a repo to the council (local worktree or remote clone) |
| `/get-manager` | Spawn the Senior Manager agent |
| `/goal` | Set the mission and kick off cross-repo planning |
| `/init` | Spin up per-repo teams (Manager + PO + Dev) |

## Agent Hierarchy

```
User ─── /get-manager ──► Senior Manager
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              Repo Manager  Repo Manager  Repo Manager
                    │
                    ▼
              Product Owner
                    │
               ┌────┴────┐
               ▼         ▼
              Dev        Dev
```

## Communication Rules

- **User ↔ Senior Manager** — only touch point for the user
- **Senior Manager ↔ Repo Managers** — bidirectional, runs "board meetings"
- **Repo Manager → PO** — assigns epics downward only
- **PO → Devs** — assigns tasks; can spawn additional Devs for parallelism
- **Escalation path:** Dev → PO → Repo Manager → Board (all managers + SM)

## Getting Started

1. `/start` — name your project
2. `/add-repo` — add each repository
3. `/goal` — state the mission
4. `/init` — the council begins work
