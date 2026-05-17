# Shura

A multi-agent orchestration system for coordinating work across multiple repositories simultaneously. Inspired by the Arabic consultative council concept.

## Commands

| Command | Description |
|---------|-------------|
| `/init` | Initialize a shura project directory |
| `/add-repo` | Add a repo to the council (local worktree or remote clone) |
| `/goal` | Set the mission; stakeholder meeting with SM; auto-launches teams |
| `/get-manager` | Talk to the Program Manager at any time |
| `/start` | Manually re-launch teams (recovery — normally auto-triggered by /goal) |

## Agent Hierarchy

```
User ─── /get-manager ──► Program Manager
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              Engineering Manager  Engineering Manager  Engineering Manager
                    │
                    ▼
              Product Owner
                    │
               ┌────┴────┐
               ▼         ▼
              Dev        Dev
```

## Communication Rules

- **User ↔ Program Manager** — only touch point for the user
- **Program Manager ↔ Engineering Managers** — bidirectional, runs "board meetings"
- **Engineering Manager → PO** — assigns epics downward only
- **PO → Devs** — assigns tasks; can spawn additional Devs for parallelism
- **Escalation path:** Dev → PO → Engineering Manager → Board (all EMs + PM)

## Getting Started

1. `/init` — name your project
2. `/add-repo` — add each repository
3. `/goal` — state the mission; teams launch automatically after the stakeholder meeting
