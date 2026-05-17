---
name: init
description: Use when the user runs /init to initialize a new shura project directory with a name and ticket ID.
---

# /init — Initialize Shura Project

Creates the project directory and `.shura/` state.

## Prerequisites

Run from the directory where you want the project created.

## Step 1: Check for existing project

If `.shura/config.json` already exists in the current directory, warn:
> "A shura project already exists here: {name} ({ticket}). Do you want to overwrite it?"
Wait for confirmation before continuing.

## Step 2: Ask for project name

> "What's the project name? (Used as the directory name and branch prefix — no spaces, e.g. `payment-revamp`)"

Validate: lowercase letters, numbers, hyphens only. If the user gives a name with spaces or mixed case, suggest the normalized form and confirm.

Normalization: lowercase → replace spaces and underscores with hyphens → strip non-alphanumeric characters except hyphens.

## Step 3: Ask for ticket ID

> "Ticket ID? (e.g. PROJ-1234, or press enter to skip)"

Accept any string or empty input. If empty, store `"none"`.

## Step 4: Create directory structure

```bash
mkdir -p <project-name>/repos
mkdir -p <project-name>/.shura/repos
```

## Step 5: Write `.shura/config.json`

```json
{
  "name": "<project-name>",
  "ticket": "<ticket-id-or-none>",
  "created": "<current-ISO-8601-timestamp>",
  "status": "initialized",
  "goal": ""
}
```

Use the actual current timestamp in ISO 8601 format (e.g., `2026-05-17T19:04:00Z`).

## Step 6: Confirm

Display:
```
✓ Shura project initialized

  Name:    <project-name>
  Ticket:  <ticket-id>
  Path:    ./<project-name>/

Next steps:
  /add-repo  — add repositories to the council
  /goal      — state the mission once repos are added
```

## Notes

- The project directory is created in the current working directory
- All subsequent commands (`/add-repo`, `/goal`, `/start`) must be run from inside `<project-name>/`
- The `repos/` subdirectory is where worktrees and clones will live
- `.shura/` holds state only — not code
