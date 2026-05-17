---
name: shura
description: Use when the user asks about shura commands, needs a command overview, or wants to understand the agent hierarchy and communication rules.
---

# Shura — The Consultative Council

Multi-agent orchestration for cross-repository development. Each repository gets its own team (Manager + PO + Dev). A Program Manager coordinates all teams toward a shared mission.

## Commands

| Command | When to use |
|---------|-------------|
| `/init` | First step — create the project directory |
| `/add-repo` | Add each repository (local worktree or remote clone) |
| `/goal` | State the mission; stakeholder meeting with PM; auto-launches teams |
| `/get-manager` | Open a conversation with the Program Manager at any time |
| `/start` | Manually re-launch teams (recovery path — normally auto-triggered by /goal) |

## Typical Flow

```
/init → /add-repo (×N) → /goal → [teams auto-launch]
```

After teams launch, use `/get-manager` to check in. The Program Manager handles everything else.

## Agent Hierarchy

```
User
 └─ Program Manager           (/get-manager)
      ├─ Engineering Manager A      (/init — one per repo)
      │    └─ Product Owner A
      │         └─ Dev A1, Dev A2 (PO can spawn more)
      ├─ Engineering Manager B
      │    └─ Product Owner B
      │         └─ Dev B1
      └─ ...
```

## Communication Rules

- **User speaks only to Program Manager**
- **Program Manager ↔ Engineering Managers** — bidirectional; PM runs board meetings
- **Engineering Manager → PO** — assigns epics downward; PO escalates up
- **PO → Dev** — assigns tasks; Dev escalates up if blocked
- **Board meeting** — triggered when any Engineering Manager escalates; all EMs + PM attend

## State

All project state lives in `.shura/` in the project directory.
See `skills/shura/state-format.md` for the full schema.
