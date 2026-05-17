---
name: status
description: Use when the user runs /status to see a live progress dashboard of all repo teams and their recent decisions.
---

# /status — Council Progress Dashboard

Reads all `.shura/` state files and prints a formatted snapshot of every repo team. Read-only — modifies nothing.

## Prerequisites

Run from inside the shura project directory. `.shura/config.json` must exist.

If no repos are registered, print:
> "No repositories added yet. Run /add-repo first."

## Output Format

Print this dashboard — fill in real values:

```
# Shura — {project_name} ({ticket})
Goal:   {goal | "(not set)"}
Status: {status}

─────────────────────────────────────────────

## {repo_name}  {status_emoji}  {status}
Branch:  {branch}
Epic:    {epic | "(not set)"}
Stack:   {stack | "(unknown)"}

Recent decisions:
  [{timestamp}] {role}: {decision_summary}
  [{timestamp}] {role}: {decision_summary}
  [{timestamp}] {role}: {decision_summary}

─────────────────────────────────────────────

{repeat for each repo}

{N} repos: {X} complete, {Y} in-progress, {Z} ready, {W} blocked
```

Status emoji mapping:
- `complete` → ✓
- `in-progress` → ⚡
- `ready` → ⏸
- `blocked` → ✗

## Steps

**1. Read project config**

Read `.shura/config.json`. Capture: `name`, `ticket`, `goal`, `status`.

**2. Load each repo**

List all `.shura/repos/*/config.json`. For each, read: `name`, `slug`, `branch`, `status`, `epic`, `stack`.

**3. Load recent decisions per repo**

For each repo, check if `.shura/repos/<slug>/decisions.md` exists.

If it exists: extract the **last 3 decision entries**. Each entry starts with `### ` (timestamp + role line) followed by a `**Decision:**` line. Show:
```
  [{timestamp}] {role}: {decision one-liner}
```

If the file is missing or empty: show `  No decisions recorded yet.`

**4. Print the dashboard**

Render the full output using the format above, then print the summary count line at the bottom.
