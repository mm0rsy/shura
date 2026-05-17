---
name: goal
description: Use when the user runs /goal to define what the project should achieve across all repos.
---

# /goal — Set the Mission

Records the mission, runs an inline stakeholder meeting (you play the PM role directly — no subagent) to confirm epics, then dispatches all Engineering Manager agents in parallel.

> **Design note:** The stakeholder meeting is interactive and must stay in the main session. Only the EM/PO/Dev agents are dispatched as subagents — they are fire-and-forget workers, not conversational partners.

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

Read all `.shura/repos/*/config.json`. Build the formatted repo list:
```
- {name} | path: {path} | branch: {branch} | status: {status}
```

Also read `agents/program-manager.md` from the plugin directory (two levels up from `skills/goal/`) to load the PM's responsibilities, communication rules, and constraints — you will act on these inline, not dispatch an agent.

## Step 5: Run the stakeholder meeting inline

**You are now the Program Manager for the rest of this meeting.** Do not dispatch an agent. Conduct the meeting directly in this session using the PM's responsibilities and constraints from `agents/program-manager.md`.

Run the meeting:
1. Greet the User and confirm receipt of the mission
2. Present your initial read: how does the work split across the repos?
3. For each repo, propose a clear epic and ask the User if it looks right
4. Adjust epics based on User feedback until all are confirmed
5. When all epics are confirmed, output this block exactly — one line per repo,
   using the repo slug (not the display name) from the council list:

```
EPICS:
- <repo-slug>: <final confirmed epic text>
- <repo-slug>: <final confirmed epic text>
EPICS CONFIRMED.
```

**Resume skill execution after outputting EPICS CONFIRMED.**

## Step 6: Save confirmed epics

Parse the `EPICS:` block line by line. Each line has the form `- <slug>: <epic text>`. Match each slug to the corresponding `.shura/repos/<slug>/config.json` and set its `epic` field to the epic text.

If a slug in the block does not match any registered repo, warn and ask the user to clarify before proceeding to Step 7.

## Step 7: Auto-launch all repo teams

Immediately after saving epics, launch the teams without waiting for user input.

Announce:
> "Epics confirmed and saved. Launching all repo teams now..."

Read `agents/eng-manager.md` from the plugin directory identified in step 4.

For each repo, fill `agents/eng-manager.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory
- `{decisions_log}` → absolute path to `.shura/repos/<slug>/decisions.md`

Dispatch ALL Engineering Manager agents simultaneously — send multiple Agent tool calls in a single message.

Update `.shura/config.json`: set `status` to `"running"`.

Confirm:
```
✓ All {N} teams launched.

Each team is running independently:
  Engineering Manager → spawns PO → PO spawns Dev(s)

Use /get-manager to talk to the Program Manager and track progress.
When teams complete, they will push their branches and notify you directly.
```

## Notes

- `/recover` is available to re-launch teams manually (e.g. after a failure)
- If the user wants to revise epics later, they can re-run /goal (overwrite confirmation in step 1)
- The `{test_command}` for each repo is not known at this stage — Devs will determine it when they explore their repos
