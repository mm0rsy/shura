# Shura

A multi-agent orchestration system for coordinating work across multiple repositories simultaneously. Inspired by the Arabic consultative council concept.

## Installation

```bash
claude plugin install https://github.com/mm0rsy/shura
```

Requires [Claude Code](https://claude.ai/code). After installing, the `/shura`, `/init`, `/add-repo`, `/goal`, `/get-manager`, and `/recover` commands are available in any Claude Code session.

## Commands

| Command | Description |
|---------|-------------|
| `/init` | Initialize a shura project directory |
| `/add-repo` | Add a repo to the council (local worktree or remote clone); branch is named after the project automatically |
| `/goal` | Set the mission; stakeholder meeting with PM; auto-launches teams |
| `/get-manager` | Talk to the Program Manager at any time |
| `/recover` | Re-launch teams manually after a failure or incomplete /goal run |

## Agent Hierarchy

```
User ─── /get-manager ──► Program Manager (PM)
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
             Engineering    Engineering  Engineering
             Manager (EM)   Manager (EM) Manager (EM)
                    │
                    ▼
             Product Owner (PO)
                    │
               ┌────┴────┐
               ▼         ▼
              Dev        Dev
```

## Communication Rules

- **User ↔ PM** — only touch point for the user
- **PM ↔ EM** — bidirectional; PM runs board meetings
- **EM ↔ EM** — peer communication during Board sessions only
- **EM → PO** (assignments); **PO → EM** (escalations only)
- **PO → Dev** — assigns tasks; can spawn additional Devs for parallelism
- **Escalation triggers:** blocked tasks, cross-repo conflicts, unclear requirements, or 3+ failed attempts
- **Escalation chain:** Dev escalates to PO → PO escalates to EM → EM escalates to PM (who convenes a Board)

## Getting Started

1. `/init` — name your project
2. `/add-repo` — add each repository
3. `/goal` — state the mission; teams launch automatically after the stakeholder meeting

## Glossary

| Term | Role |
|------|------|
| PM | Program Manager — user's only touchpoint; coordinates all teams |
| EM | Engineering Manager — one per repo; owns the epic, spawns PO |
| PO | Product Owner — breaks epic into tasks, manages and spawns Devs |
| Dev | Developer agent — executes tasks; can be spawned dynamically for parallelism |
| Board | All EMs + PM — convenes for cross-repo decisions and escalations |
