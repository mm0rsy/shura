---
name: shura
description: Use when the user asks about shura commands, needs a command overview, or wants to understand the agent hierarchy and communication rules.
---

# Shura — The Consultative Council

Multi-agent orchestration for cross-repository development. Each repository gets its own team (EM + PO + Dev). A Program Manager (PM) coordinates all teams toward a shared mission.

## Commands

| Command | When to use |
|---------|-------------|
| `/init` | First step — create the project directory |
| `/add-repo` | Add each repository (local worktree or remote clone); branch is named after the project automatically |
| `/goal` | State the mission; stakeholder meeting with PM; auto-launches teams |
| `/get-manager` | Open a conversation with the Program Manager at any time |
| `/recover` | Re-launch teams manually (recovery path — normally auto-triggered by /goal) |

## Typical Flow

```
/init → /add-repo (×N) → /goal → [teams auto-launch]
```

After teams launch, use `/get-manager` to check in. The Program Manager handles everything else.

## Agent Hierarchy

```
User
 └─ Program Manager (PM)        (/get-manager)
      ├─ Engineering Manager (EM) A   (one per repo)
      │    └─ Product Owner (PO) A
      │         └─ Dev A1, Dev A2 (PO can spawn more)
      ├─ Engineering Manager (EM) B
      │    └─ Product Owner (PO) B
      │         └─ Dev B1
      └─ ...
```

## Communication Rules

- **User speaks only to Program Manager (PM)**
- **PM ↔ EM** — bidirectional; PM runs board meetings
- **EM ↔ EM** — peer communication during Board sessions only
- **EM → PO** (assignments); **PO → EM** (escalations only)
- **PO → Dev** — assigns tasks; Dev escalates up if blocked
- **Board meeting** — triggered when any EM escalates; all EMs + PM attend

### Escalation Triggers

Escalation activates on: blocked tasks, cross-repo conflicts, unclear requirements, or 3+ failed implementation attempts.

## Glossary

| Term | Role |
|------|------|
| PM | Program Manager — user's only touchpoint; coordinates all teams |
| EM | Engineering Manager — one per repo; owns the epic, spawns PO |
| PO | Product Owner — breaks epic into tasks, manages and spawns Devs |
| Dev | Developer agent — executes tasks; can be spawned dynamically for parallelism |
| Board | All EMs + PM — convenes for cross-repo decisions and escalations |

## State

All project state lives in `.shura/` in the project directory.
See `skills/shura/state-format.md` for the full schema.
