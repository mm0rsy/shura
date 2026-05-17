---
name: start
description: Use when the user runs /start to manually launch or re-launch the repo agent teams, bypassing the /goal stakeholder meeting (e.g. after a failure or when epics are already set).
---

# /start — Launch the Council Teams

Manually launches one team per repo, all running in parallel. This is the recovery path — normally teams are launched automatically at the end of /goal. Use /start when re-launching after a failure or when epics are already confirmed.

> **Note:** In the normal flow, teams launch automatically after the stakeholder meeting in /goal. /start is for manual control only.

## Prerequisites

- `.shura/config.json` must exist with `status` at `"goal-set"` or later
- All registered repos must have a non-empty `epic` field (set by /goal)

If any repo has an empty `epic`, warn and abort:
> "Repo {name} has no epic assigned. Run /goal first to assign epics to all repos."
List all repos missing epics before aborting.

## Steps

**1. Load all configs**

Read `.shura/config.json` (project name, ticket, goal).
List and read all `.shura/repos/*/config.json`. Only proceed for repos where `epic` is non-empty.

**2. Load all agent prompt templates**

Find the shura plugin directory (two levels up from `skills/start/`). Read:
- `agents/repo-manager.md`

(The Repo Manager will read `agents/po.md` itself when spawning the PO; the PO will read `agents/dev.md` itself when spawning Devs.)

**3. Announce launch**

Display:
```
Launching shura council for: {project_name}
Repositories: {N} repos
  {for each repo: - {name} | branch: {branch}}

Starting all teams simultaneously...
```

**4. Dispatch all Repo Manager agents in parallel**

For each repo, fill `agents/repo-manager.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory (the directory containing this skills/start/SKILL.md, two levels up)

Dispatch ALL Repo Manager agents simultaneously — send multiple Agent tool calls in a single message. Do not wait for one to finish before dispatching the next.

**5. Update project status**

Update `.shura/config.json`: set `status` to `"running"`.

**6. Confirm**

```
✓ All {N} teams launched.

Each team is running:
  Repo Manager → will spawn PO → PO will spawn Dev(s)

Use /get-manager to talk to the Senior Manager and track overall progress.
When teams complete, they will push their branches and notify the Senior Manager.
```

## After Teams Complete

Each Repo Manager pushes its branch and notifies the Senior Manager. The user then handles integration (merge, CI/CD pipeline, or manual review). Use /get-manager to get the final status summary.

## Re-running /start

If teams were already launched (`status: "running"`), warn:
> "Teams are already running. Use /get-manager to check status. Re-run /start to restart all teams from scratch?"
Wait for confirmation before re-dispatching.
