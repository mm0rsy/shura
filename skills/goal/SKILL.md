---
name: goal
description: Use when the user runs /goal to set the project mission and trigger the Senior Manager's department meeting to split work across repos.
---

# /goal — Set the Mission

Records the mission in `.shura/config.json` and kicks off the Senior Manager's department meeting to split work across repos as epics.

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

## Step 5: Load and fill the Senior Manager prompt

Find the shura plugin directory (two levels up from `skills/goal/`). Read `agents/senior-manager.md`. Replace all `{placeholders}`:
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{goal}` → the mission just saved
- `{repo_list}` → formatted repo list from step 4

Append this department-meeting opener to the filled prompt:

```
## Current Task: Department Meeting

You have just received the mission. Run the department meeting now:
1. Greet the User and confirm receipt of the mission
2. Present your initial read: how does the work split across the repos?
3. For each repo, propose a clear epic and ask the User if it looks right
4. Adjust epics based on User feedback until all are confirmed
5. When all epics are confirmed, say exactly:
   "EPICS CONFIRMED. Please run /init to launch the teams."
   Then stop and wait.
```

## Step 6: Announce and dispatch

Say:
> "Mission saved. Starting department meeting — Senior Manager is splitting the work..."

Dispatch the Agent with the filled + appended prompt.

## Step 7: Save confirmed epics

After the Senior Manager says "EPICS CONFIRMED", the skill (not the agent) saves each confirmed epic.

For each repo, update `.shura/repos/<slug>/config.json`:
- Set `epic` to the confirmed epic text for that repo

Confirm to the user:
> "Epics saved. Run /init to spin up the repo teams."

## Notes

- The SM agent must reach "EPICS CONFIRMED" before /init can proceed
- If the user wants to revise epics later, they can re-run /goal (overwrite confirmation in step 1)
- The `{test_command}` for each repo is not known at this stage — Devs will determine it when they explore their repos
