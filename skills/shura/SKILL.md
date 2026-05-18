---
name: shura
description: Use when the user asks about shura commands, needs a command overview, or wants to understand the agent hierarchy and communication rules.
---

# Shura — The Consultative Council

Multi-agent orchestration for cross-repository development. Each repository gets its own Product Owner who leads a team of on-demand specialists. A Program Manager (PM) coordinates all POs toward a shared mission.

## Commands

| Command | When to use |
|---------|-------------|
| `/init` | First step — create the project directory |
| `/add-repo` | Add each repository (local worktree or remote clone); auto-indexes with graphify if installed |
| `/goal` | State the mission; stakeholder meeting with PM; auto-launches teams |
| `/get-manager` | Open a conversation with the Program Manager at any time |
| `/status` | Live dashboard — see every repo team's status and recent decisions |
| `/recover` | Re-launch teams manually after a failure or incomplete /goal run |

## Typical Flow

```
/init → /add-repo (×N) → /goal → [teams auto-launch]
```

After teams launch, use `/get-manager` to check in and `/status` to see team progress at a glance. The Program Manager handles everything else.

## Agent Hierarchy

```
User
 └─ Program Manager (PM)                  (/get-manager)
      ├─ Product Owner (PO) A              (one per repo — visible terminal)
      │    ├─ Developer A1, Developer A2
      │    ├─ Architect A                  (on-demand specialists)
      │    └─ Tester A                     (subagents below PO — not separately visible)
      ├─ Product Owner (PO) B
      │    └─ Developer B1
      └─ ...
```

## Communication Rules

- **User speaks only to Program Manager (PM)**
- **PM ↔ PO** — bidirectional; PM runs Product Board meetings
- **PO ↔ PO** — peer communication during Product Board sessions only
- **PO → Specialists/Dev** — PO hires and assigns; Specialists/Dev escalate up if blocked
- **Product Board meeting** — triggered when any PO escalates; all POs + PM attend

### Escalation Triggers

Escalation activates on: blocked tasks, cross-repo conflicts, unclear requirements, or 3+ failed implementation attempts.

## Glossary

| Term | Role |
|------|------|
| PM | Program Manager — user's only touchpoint; coordinates all POs |
| PO | Product Owner — one per repo; owns the epic, hires specialists, pushes branch |
| Dev | Developer agent — executes tasks; can be spawned dynamically for parallelism |
| Specialist | On-demand agent (Tester, Architect, Tech Writer, etc.) hired by PO from external skill repos |
| Product Board | All POs + PM — convenes for cross-repo decisions and escalations |

## State

All project state lives in `.shura/` in the project directory.
See `skills/shura/state-format.md` for the full schema.
