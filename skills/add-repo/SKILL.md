---
name: add-repo
description: Use when the user runs /add-repo to connect a repository to the shura council.
---

# /add-repo — Register a Repository

Adds a repository to the council. All repos land in `repos/<slug>/` under the project directory, on a branch named after the project.

## Prerequisites

Run from inside the shura project directory (where `.shura/config.json` exists).

Read `.shura/config.json` to get:
- `name` (project slug) — used as the branch name
- `ticket` — for context
- `skill_repos` — list of installed skill repo slugs (may be empty or missing; default to `[]`)

## Step 1: Ask for repo details

> "Repository name? (human label, e.g. `Frontend App`)"

Derive slug: lowercase, spaces and underscores → hyphens, strip non-alphanumeric characters except hyphens.
Example: `"Frontend App"` → `frontend-app`

> "Is this a local repo path or a remote URL?"

Options:
- **Local** — path to an existing local git repo
- **Remote** — HTTPS or SSH clone URL

## Step 2A: Local Repo (git worktree)

> "Path to the local repo? (absolute or relative)"

Validate: path exists and contains a `.git` directory (or is a bare repo).

**Determine default branch of the source repo:**
```bash
git -C <source-path> symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null \
  | sed 's|origin/||' \
  || git -C <source-path> rev-parse --abbrev-ref HEAD
```
This gives `<base-branch>` (typically `main` or `master`).

**Create the worktree on a new branch:**
```bash
git -C <source-path> worktree add \
  <absolute-path-to-project>/repos/<slug> \
  -b <project-name> \
  <base-branch>
```

This creates a worktree at `repos/<slug>/` with a new branch named `<project-name>` branching off `<base-branch>`.

**If the branch already exists** in the source repo, ask:
> "Branch `<project-name>` already exists in this repo. Use it as-is, or abort?"

## Step 2B: Remote Repo (clone)

> "Clone URL?"

**Clone the repo:**
```bash
git clone <url> <absolute-path-to-project>/repos/<slug>
```

**Determine default branch:**
```bash
git -C <absolute-path-to-project>/repos/<slug> \
  symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null \
  | sed 's|origin/||' \
  || echo "main"
```

**Create and switch to project branch:**
```bash
git -C <absolute-path-to-project>/repos/<slug> \
  checkout -b <project-name> origin/<base-branch>
```

## Step 3: Detect stack and build team catalogue

After the repo is checked out/cloned, run stack detection.

Read `skill_repos` from `.shura/config.json` (default `[]` if missing).

Call the stack detector:

```js
import { detectStack } from './stack-detector.js';
const result = await detectStack(repoPath, skillRepos);
// result = { stack, must_use_skills, recommended_skills, specialist_roles }
```

The stack detector reads `skill-map.json` (in the same directory) and filters results to only include skills from installed repos. If `skillRepos` is empty, only `source: "builtin"` specialist entries survive (always at least `Developer`).

## Step 4: Write repo config

Create directory `.shura/repos/<slug>/` and write `.shura/repos/<slug>/config.json`:

```json
{
  "slug": "<slug>",
  "name": "<display-name>",
  "type": "<local|remote>",
  "source": "<source-path-or-url>",
  "path": "<absolute-path-to-project>/repos/<slug>",
  "branch": "<project-name>",
  "status": "ready",
  "epic": "",
  "stack": "<result.stack>",
  "must_use_skills": ["<result.must_use_skills entries>"],
  "recommended_skills": ["<result.recommended_skills entries>"],
  "specialist_roles": {
    "<role-name>": {"source": "<builtin|skill>", "file": "<path-if-builtin>", "name": "<skill-name-if-skill>"}
  },
  "graph_report": ""
}
```

Use the actual values from `result`. Write `must_use_skills` and `recommended_skills` as JSON arrays (may be empty `[]`). Write `specialist_roles` as the filtered object from `result.specialist_roles`.

Update `.shura/config.json`: set `status` to `"repos-added"` (unless it's already `"goal-set"` or later — don't downgrade).

## Step 5: Index the repo with graphify

Check if graphify is installed:
```bash
graphify --version
```

**If installed:**
1. Run the indexer inside the worktree/clone:
   ```bash
   cd <repo.path> && graphify .
   ```
2. The report lands at `<repo.path>/graphify-out/GRAPH_REPORT.md`
3. Update `.shura/repos/<slug>/config.json`: add `"graph_report": "<repo.path>/graphify-out/GRAPH_REPORT.md"`

**If not installed:**
- Warn:
  > "graphify not found — repo knowledge graph unavailable. Agents will explore the codebase without a pre-built index. Install with: `uv tool install graphifyy && graphify install`"
- Set `"graph_report": ""` in config

## Step 6: Confirm

```
✓ Repo registered: <name>

  Slug:    <slug>
  Path:    repos/<slug>/
  Branch:  <project-name>
  Type:    <Local worktree | Remote clone>
  Stack:   <detected-stack>
  Skills:  <N> recommended, <M> must-use  [or: "none (no skill repos configured)"]
  Roles:   <role1>, <role2>, ...  [or: "Developer only (no skill repos configured)"]
  Graph:   <GRAPH_REPORT.md path | "not indexed (graphify not installed)">

Run /add-repo again to add more repos, or /goal to set the mission.
```

For Skills line: if `must_use_skills` and `recommended_skills` are both empty, show `"none (no skill repos configured)"`.
For Roles line: list the keys of `specialist_roles`. If only `Developer` is present, show `"Developer only (no skill repos configured)"`.

## Error Handling

- **Worktree path already exists:** warn and ask to skip or overwrite
- **Clone fails:** show git error, ask user to verify URL and credentials
- **Source path has no .git:** error — not a valid git repository
