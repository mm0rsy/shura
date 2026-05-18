---
name: recover
description: Use when teams need to be re-launched after a failure or /goal ran but teams did not start.
---

# /recover — Re-launch the Council Teams

Manually launches one team per repo, all running in parallel. This is the recovery path — normally teams are launched automatically at the end of /goal. Use /recover when re-launching after a failure or when epics are already confirmed.

> **Note:** In the normal flow, teams launch automatically after the stakeholder meeting in /goal. /recover is for manual control only.

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

Find the shura plugin directory (two levels up from `skills/recover/`). Read:
- `agents/po.md`

(The Product Owner will read `agents/dev.md` itself when spawning Developers, and will load specialist skills from installed plugin directories as needed.)

**3. Announce launch**

Display:
```
Recovering shura council for: {project_name}
Repositories: {N} repos
  {for each repo: - {name} | branch: {branch}}

Re-launching all Product Owner agents simultaneously...
```

**4. Dispatch all Product Owner agents in parallel**

For each repo, fill `agents/po.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory (two levels up from `skills/recover/`)
- `{decisions_log}` → absolute path to `.shura/repos/<slug>/decisions.md`
- `{graph_report}` → `repo.graph_report` (empty string if graphify was not run)
- `{stack}` → `repo.stack` (empty string if not set)
- `{skill_repos}` → `config.skill_repos` joined as comma-separated string (or `"none"` if empty)
- `{must_use_skills}` → `repo.must_use_skills` as bullet list or empty string
- `{recommended_skills}` → `repo.recommended_skills` as bullet list or empty string
- `{specialist_roles_json}` → `JSON.stringify(repo.specialist_roles, null, 2)` (or `"{}"` if not set)

Dispatch ALL Product Owner agents simultaneously — send multiple Agent tool calls in a single message. Do not wait for one to finish before dispatching the next.

**5. Update project status**

Update `.shura/config.json`: set `status` to `"running"`.

**6. Confirm**

```
✓ All {N} teams re-launched.

Each team is running:
  Product Owner (PO) → will hire Developers and specialists as needed

Use /get-manager to talk to the Program Manager and track overall progress.
When teams complete, they will push their branches and notify the Program Manager.
```

## After Teams Complete

Each Product Owner pushes its branch and notifies the Program Manager. The user then handles integration (merge, CI/CD pipeline, or manual review). Use /get-manager to get the final status summary.

## Re-running /recover

If teams were already launched (`status: "running"`), warn:
> "Teams are already running. Use /get-manager to check status. Re-run /recover to restart all teams from scratch?"
Wait for confirmation before re-dispatching.
