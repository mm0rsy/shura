---
name: goal
description: Use when the user runs /goal to define what the project should achieve across all repos.
---

# /goal — Set the Mission

Records the mission, runs an inline stakeholder meeting (you play the PM role directly — no subagent) to confirm epics, then dispatches all Product Owner agents in parallel.

> **Design note:** The stakeholder meeting is interactive and must stay in the main session. Only the EM/PO/Dev agents are dispatched as subagents — they are fire-and-forget workers, not conversational partners.

## Prerequisites

Run from inside the shura project directory. At least one repo must be registered in `.shura/repos/`.

## Step 1: Check for existing goal

Read `.shura/config.json`. If `goal` is non-empty, display it:
> "Current goal: {existing-goal}
> Do you want to replace it?"

Wait for confirmation. If the user says no, abort. If yes, note that this is a **re-run** — the old goal will be archived and a new versioned branch will be created. Continue to Step 2.

## Step 2: Capture the mission

> "What is the goal for this project? Describe what you want achieved across all repositories. (Type your mission and press Enter twice when done)"

Accept multi-line input. Capture the full text as the mission statement.

## Step 3: Save the goal

Update `.shura/config.json`:

**If this is a re-run** (goal was non-empty before Step 2):
  - Append the old goal to the `goals` array (initialize to `[]` if missing):
    ```json
    { "goal": "<old goal text>", "branch_suffix": "<old branch_suffix or project name>", "archived_at": "<ISO 8601 now>" }
    ```
  - Read `branch_suffix` from config to fill `archived_at` entry; if missing, use the project `name` as the suffix.

Set `goal` to the new mission text.
Set `branch_suffix` to `""` (will be filled after PM outputs the EPICS block in Step 6).
Set `status` to `"goal-set"` (do not change if status is already `"running"` or `"complete"`).

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
BRANCH: <goal-slug>
EPICS CONFIRMED.
```

`BRANCH:` is a URL-safe slug you derive from the mission text (3–5 meaningful words, lowercase, hyphens). Example: `add-oauth2-auth`. The system uses this to name versioned branches.

**Resume skill execution after outputting EPICS CONFIRMED.**

## Step 6: Save confirmed epics and create versioned branches

**Parse the EPICS block:**

1. Read epic lines (`- <slug>: <epic text>`). Match each slug to `.shura/repos/<slug>/config.json` and set its `epic` field.
2. Read the `BRANCH: <slug>` line. This is the goal slug derived by the PM.

If a slug in the epic lines does not match any registered repo, warn and ask the user to clarify before proceeding to Step 7.

**Determine the branch name for this goal:**

- `is_rerun` = `goals` array was non-empty before archiving in Step 3 (i.e., this is not the first `/goal` run)
- If `is_rerun`: `new_branch = "<project-name>/<goal-slug>"` (e.g., `payment-revamp/add-oauth2-auth`)
- If first run: `new_branch = "<project-name>"` (unchanged — repos already on this branch from `/add-repo`)

**Save branch suffix to project config:**

Update `.shura/config.json`:
- Set `branch_suffix` to `<goal-slug>`

**If `is_rerun` — create new branch in each repo worktree:**

For each registered repo (read from `.shura/repos/*/config.json`):
1. `cd <repo.path>`
2. Fetch latest from upstream:
   - `git fetch` (fetches from the configured remote, or the local source path)
3. Detect the default upstream branch:
   ```bash
   git remote show origin 2>/dev/null | grep 'HEAD branch' | awk '{print $NF}'
   ```
   Fall back to `main`, then `master` if the remote query fails.
4. Create and switch to the new branch from the upstream default:
   ```bash
   git checkout -b <new_branch> origin/<default_branch>
   # or if no remote: git checkout -b <new_branch> <default_branch>
   ```
5. Update `.shura/repos/<slug>/config.json`: set `branch` to `new_branch` and `status` to `"ready"`.

If branch creation fails for any repo, warn the user with the repo name and error, then continue with remaining repos.

## Step 7: Auto-launch all repo teams

Immediately after saving epics, launch the teams without waiting for user input.

Announce:
> "Epics confirmed and saved. Launching all repo teams now..."

Read `agents/po.md` from the plugin directory identified in step 4.

For each repo, fill `agents/po.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory
- `{decisions_log}` → absolute path to `.shura/repos/<slug>/decisions.md`
- `{graph_report}` → `repo.graph_report` (empty string if graphify was not run)
- `{stack}` → `repo.stack` (empty string if not set — older repos without stack detection)
- `{skill_repos}` → `config.skill_repos` joined as comma-separated string (or `"none"` if empty)
- `{must_use_skills}` → `repo.must_use_skills` formatted as bullet list (`"  - skill1\n  - skill2"`) or empty string
- `{recommended_skills}` → `repo.recommended_skills` formatted as bullet list or empty string
- `{specialist_roles_json}` → `JSON.stringify(repo.specialist_roles, null, 2)` (or `"{}"` if not set)

Dispatch ALL Product Owner agents simultaneously — send multiple Agent tool calls in a single message.

Update `.shura/config.json`: set `status` to `"running"`.

Confirm:
```
✓ All {N} teams launched.

Each team is running independently:
  Product Owner → hires specialists and Developers as needed

Use /get-manager to talk to the Program Manager and track progress.
When teams complete, they will push their branches and notify you directly.
```

## Notes

- `/recover` is available to re-launch teams manually (e.g. after a failure)
- If the user wants to revise epics later, they can re-run /goal (overwrite confirmation in step 1)
- The `{test_command}` for each repo is not known at this stage — Devs will determine it when they explore their repos
