---
name: get-manager
description: Use when the user runs /get-manager to open a conversation with the Senior Manager agent, who leads the shura council.
---

# /get-manager — Invoke the Senior Manager

Spawns the Senior Manager agent with full council context. The Senior Manager is the user's single point of contact for all cross-repo work.

## Prerequisites

Run from inside the shura project directory. `.shura/config.json` must exist.

If no repos are registered (no files in `.shura/repos/`), warn:
> "No repositories have been added yet. Run /add-repo first, then /get-manager."
Do not dispatch the agent.

## Steps

**1. Load project config**

Read `.shura/config.json`. Capture: `name`, `ticket`, `goal`, `status`.

**2. Load all repo configs**

List all files matching `.shura/repos/*/config.json`. Read each. Build a formatted repo list:
```
- Frontend App | path: /abs/path/repos/frontend-app | branch: payment-revamp | status: ready
- Backend API  | path: /abs/path/repos/backend-api  | branch: payment-revamp | status: in-progress
```

**3. Load and fill the Senior Manager prompt**

Find the shura plugin directory. It is the directory containing this skill file, two levels up (i.e., `../../` relative to `skills/get-manager/SKILL.md`). Read `agents/senior-manager.md` from that directory.

Replace all `{placeholders}` in the prompt:
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{goal}` → `config.goal` (if empty, use: `"Not set yet — use /goal to define the mission"`)
- `{repo_list}` → the formatted repo list from step 2

**4. Announce and dispatch**

Before dispatching, say:
> "Connecting you to the Senior Manager for {project_name}..."

Dispatch an Agent with the filled Senior Manager prompt. The agent continues the conversation with the user from this point.
