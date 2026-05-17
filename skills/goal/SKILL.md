---
name: goal
description: Use when the user runs /goal to define what the project should achieve across all repos.
---

# /goal — Set the Mission

Records the mission, runs a stakeholder meeting with the Program Manager to confirm epics, then automatically launches all repo teams.

## Prerequisites

Run from inside the shura project directory. At least one repo must be registered in `.shura/repos/`.

## Step 1: Check for existing goal

Read `.shura/config.json`. If `goal` is non-empty, display it:
> "Current goal: {existing-goal}
> Do you want to replace it?"

Wait for confirmation. If the user says no, abort. If yes, continue.

## Step 2: Capture the mission

> "What is the goal for this project? Describe what you want achieved across all repositories. (Type your mission and press Enter twice when done)"

Accept multi-line input. Capture the full text as the mission statement.

## Step 3: Save the goal

Update `.shura/config.json`:
- Set `goal` to the captured mission text
- Set `status` to `"goal-set"` (do not change if status is already `"running"` or `"complete"`)

## Step 4: Load council context

Read all `.shura/repos/*/config.json`. Build the formatted repo list (same format as /get-manager):
```
- {name} | path: {path} | branch: {branch} | status: {status}
```

## Step 5: Load and fill the Program Manager prompt

The shura plugin directory is two levels up from `skills/goal/` — use this path in steps 5 and 8.

Read `agents/program-manager.md`. Replace all `{placeholders}`:
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{goal}` → the mission just saved
- `{repo_list}` → formatted repo list from step 4
- `{decisions_log}` → absolute path to `.shura/decisions.md`

Append this stakeholder-meeting opener to the filled prompt:

```
## Current Task: Stakeholder Meeting

You have just received the mission from the User (the stakeholder). Run the stakeholder meeting now:
1. Greet the User and confirm receipt of the mission
2. Present your initial read: how does the work split across the repos?
3. For each repo, propose a clear epic and ask the User if it looks right
4. Adjust epics based on User feedback until all are confirmed
5. When all epics are confirmed, say exactly:
   "EPICS CONFIRMED."
   Then stop — the system will take it from here.
```

## Step 6: Announce and dispatch

Say:
> "Mission saved. Starting stakeholder meeting — Program Manager is presenting the work breakdown..."

Dispatch the Agent with the filled + appended prompt.

## Step 7: Save confirmed epics

After the Program Manager says "EPICS CONFIRMED", the skill (not the agent) saves each confirmed epic.

For each repo, update `.shura/repos/<slug>/config.json`:
- Set `epic` to the confirmed epic text for that repo

## Step 8: Auto-launch all repo teams

Immediately after saving epics, launch the teams without waiting for user input.

Announce:
> "Epics confirmed and saved. Launching all repo teams now..."

Read `agents/eng-manager.md` from the plugin directory identified in step 5.

For each repo, fill `agents/eng-manager.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory (two levels up from `skills/goal/`)
- `{decisions_log}` → absolute path to `.shura/repos/<slug>/decisions.md`

Dispatch ALL Engineering Manager agents simultaneously — send multiple Agent tool calls in a single message.

Update `.shura/config.json`: set `status` to `"running"`.

Confirm:
```
✓ All {N} teams launched.

Each team is running independently:
  Engineering Manager → spawns PO → PO spawns Dev(s)

Use /get-manager to talk to the Program Manager and track progress.
When teams complete, they will push their branches and notify the Program Manager.
```

## Notes

- `/recover` is available to re-launch teams manually (e.g. after a failure)
- If the user wants to revise epics later, they can re-run /goal (overwrite confirmation in step 1)
- The `{test_command}` for each repo is not known at this stage — Devs will determine it when they explore their repos
