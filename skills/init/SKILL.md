---
name: init
description: Use when the user runs /init to start a new shura project.
---

# /init — Initialize Shura Project

Creates the project directory and `.shura/` state.

## Prerequisites

Run from the directory where you want the project created.

## Step 1: Ask for project name

> "What's the project name? (Used as the directory name and branch name — no spaces, e.g. `payment-revamp`)"

Validate: lowercase letters, numbers, hyphens only. If the user gives a name with spaces or mixed case, suggest the normalized form and confirm.

Normalization: lowercase → replace spaces and underscores with hyphens → strip non-alphanumeric characters except hyphens.

## Step 2: Check for existing project

If `<project-name>/.shura/config.json` already exists in the current directory, warn:
> "A shura project named '<project-name>' already exists here. Do you want to overwrite it?"
Wait for confirmation before continuing.

## Step 3: Ask for ticket ID

> "Ticket ID? (e.g. PROJ-1234, or press enter to skip)"

Accept any string or empty input. If empty, store `"none"`.

## Step 4: Ask for installed skill repos

> "Which external skill repos do you have installed as Claude Code plugins?
> (comma-separated owner/repo slugs, e.g. alirezarezvani/claude-skills, affaan-m/everything-claude-code — press enter to skip)"

Accept a comma-separated list or empty input.

Normalize each entry:
- Strip whitespace around commas
- Validate format `<owner>/<repo>` — each part must be non-empty
- If invalid format given, warn and ask again
- If empty input, store `[]`

Store the result as an array of strings, e.g.:
```json
["alirezarezvani/claude-skills", "affaan-m/everything-claude-code"]
```

## Step 5: Create directory structure

```bash
mkdir -p <project-name>/repos
mkdir -p <project-name>/.shura/repos
```

## Step 6: Write `.shura/config.json`

```json
{
  "name": "<project-name>",
  "ticket": "<ticket-id-or-none>",
  "created": "<current-ISO-8601-timestamp>",
  "status": "initialized",
  "goal": "",
  "branch_suffix": "",
  "goals": [],
  "skill_repos": ["<repo-slug-1>", "<repo-slug-2>"]
}
```

Use the actual current timestamp in ISO 8601 format (e.g., `2026-05-17T19:04:00Z`).
If no skill repos were entered, write `"skill_repos": []`.

## Step 7: Confirm

Display:
```
✓ Shura project initialized

  Name:    <project-name>
  Ticket:  <ticket-id>
  Path:    ./<project-name>/
  Skills:  <N> skill repo(s) configured  [or: "none configured"]

Next steps:
  /add-repo  — add repositories to the council
  /goal      — state the mission once repos are added
```

## Notes

- The project directory is created in the current working directory
- All subsequent commands (`/add-repo`, `/goal`, `/recover`) must be run from inside `<project-name>/`
- The `repos/` subdirectory is where worktrees and clones will live
- `.shura/` holds state only — not code
- `skill_repos` can be updated later by editing `.shura/config.json` directly — rerun `/add-repo` after changing it to refresh the per-repo skill catalogue
