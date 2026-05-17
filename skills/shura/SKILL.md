---
name: shura
description: Use when the user asks about shura commands, needs a command overview, or wants to understand the agent hierarchy and communication rules.
---

# Shura — The Consultative Council

Multi-agent orchestration for cross-repository development. Each repository gets its own team (Manager + PO + Dev). A Senior Manager coordinates all teams toward a shared mission.

## Commands

| Command | When to use |
|---------|-------------|
| `/init` | First step — create the project directory |
| `/add-repo` | Add each repository (local worktree or remote clone) |
| `/goal` | State the mission; Senior Manager splits work across repos |
| `/start` | Spawn all repo teams and begin execution |
| `/get-manager` | Open a conversation with the Senior Manager at any time |

## Typical Flow

```
/init → /add-repo (×N) → /goal → /start
```

After `/start`, use `/get-manager` to check in. The Senior Manager handles everything else.

## Agent Hierarchy

```
User
 └─ Senior Manager           (/get-manager)
      ├─ Repo Manager A      (/init — one per repo)
      │    └─ Product Owner A
      │         └─ Dev A1, Dev A2 (PO can spawn more)
      ├─ Repo Manager B
      │    └─ Product Owner B
      │         └─ Dev B1
      └─ ...
```

## Communication Rules

- **User speaks only to Senior Manager**
- **Senior Manager ↔ Repo Managers** — bidirectional; SM runs board meetings
- **Repo Manager → PO** — assigns epics downward; PO escalates up
- **PO → Dev** — assigns tasks; Dev escalates up if blocked
- **Board meeting** — triggered when any Repo Manager escalates; all managers + SM attend

## State

All project state lives in `.shura/` in the project directory.
See `skills/shura/state-format.md` for the full schema.
