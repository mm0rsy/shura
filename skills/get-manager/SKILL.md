---
name: get-manager
description: Use when the user runs /get-manager to talk to the Program Manager.
---

# /get-manager — Invoke the Program Manager

Loads full council context and runs the Program Manager role inline in the current session. No subagent is dispatched — the conversation stays in the main session so multi-turn exchanges work without re-spawning.

> **Design note:** PM conversations are interactive. Running inline avoids the SendMessage dependency and keeps context intact across user replies.

## Prerequisites

Run from inside the shura project directory. `.shura/config.json` must exist.

If no repos are registered (no files in `.shura/repos/`), warn:
> "No repositories have been added yet. Run /add-repo first, then /get-manager."
Do not proceed.

## Steps

**1. Load project config**

Read `.shura/config.json`. Capture: `name`, `ticket`, `goal`, `status`.

**2. Load all repo configs**

List all files matching `.shura/repos/*/config.json`. Read each. Build a formatted repo list:
```
- Frontend App | path: /abs/path/repos/frontend-app | branch: payment-revamp | status: ready
- Backend API  | path: /abs/path/repos/backend-api  | branch: payment-revamp | status: in-progress
```

**3. Load the Program Manager context**

Find the shura plugin directory (two levels up from `skills/get-manager/`). Read `agents/program-manager.md`.

Note the filled values for context:
- Project: `config.name` (`config.ticket`)
- Goal: `config.goal` (if empty: "Not set yet — use /goal to define the mission")
- Repos: the formatted list from step 2
- Decisions log: absolute path to `.shura/decisions.md`

**4. Become the Program Manager inline**

**You are now the Program Manager for this conversation.** Do not dispatch an agent. Apply the PM's identity, responsibilities, constraints, and communication rules from `agents/program-manager.md` directly in this session.

Announce:
> "Program Manager online for {project_name}. How can I help?"

Then respond to the user's questions and requests as the PM. You have full context of all repos, their status, and the mission. Stay in the PM role for the duration of this conversation unless the user explicitly exits.
