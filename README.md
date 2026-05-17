# Shura

A multi-agent orchestration system for coordinating work across multiple repositories simultaneously. Inspired by the Arabic consultative council concept.

## Commands

| Command | Description |
|---------|-------------|
| `/init` | Initialize a shura project directory |
| `/add-repo` | Add a repo to the council (local worktree or remote clone) |
| `/goal` | Set the mission; stakeholder meeting with SM; auto-launches teams |
| `/get-manager` | Talk to the Senior Manager at any time |
| `/start` | Manually re-launch teams (recovery — normally auto-triggered by /goal) |

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

1. `/init` — name your project
2. `/add-repo` — add each repository
3. `/goal` — state the mission; teams launch automatically after the stakeholder meeting
