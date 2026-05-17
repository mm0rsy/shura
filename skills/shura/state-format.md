# Shura State Format

All state lives in `.shura/` relative to the shura project directory created by `/init`.

## Directory Layout

```
<project-dir>/
├── .shura/
│   ├── config.json             # Project identity + mission
│   ├── decisions.md            # PM cross-repo decision log (never committed to git)
│   └── repos/
│       └── <slug>/
│           ├── config.json     # Per-repo registration
│           └── decisions.md    # Repo team decision log (never committed to git)
└── repos/
    └── <slug>/                 # Repo worktree or clone (actual code)
```

## `.shura/config.json` Schema

```json
{
  "name": "payment-revamp",
  "ticket": "PROJ-1234",
  "created": "2026-05-17T19:04:00Z",
  "status": "initialized",
  "goal": ""
}
```

Fields:
- `name` — project slug (no spaces; used as directory and branch names)
- `ticket` — tracking ticket ID (or `"none"`)
- `created` — ISO 8601 timestamp
- `status` — one of: `initialized` | `repos-added` | `goal-set` | `running` | `complete`
- `goal` — the mission statement, set by `/goal`

## `.shura/repos/<slug>/config.json` Schema

```json
{
  "slug": "frontend",
  "name": "Frontend App",
  "type": "local",
  "source": "/home/user/repos/my-frontend",
  "path": "/home/user/projects/payment-revamp/repos/frontend",
  "branch": "payment-revamp",
  "status": "ready",
  "epic": ""
}
```

Fields:
- `slug` — URL-safe identifier (auto-derived from name)
- `name` — human display name
- `type` — `"local"` (worktree) or `"remote"` (clone)
- `source` — for `local`: original repo path; for `remote`: clone URL
- `path` — absolute path to repo working tree inside the project
- `branch` — branch name (always equals the project `name`)
- `status` — one of: `ready` | `in-progress` | `complete` | `blocked`
- `epic` — assigned epic from Program Manager (set during `/goal`)

## Decision Log Format

Decision logs are append-only markdown files stored inside `.shura/`. They are **never committed to any git repository** — they exist solely for agent context and failure recovery.

- **`.shura/decisions.md`** — cross-repo decisions by the Program Manager
- **`.shura/repos/<slug>/decisions.md`** — decisions by the Engineering Manager, PO, and Dev for that repo

### Entry format

```markdown
### {ISO-8601-timestamp} | {Role}
**Decision:** {what was decided — one line}
**Context:** {what situation triggered this decision}
**Rationale:** {why this option over the alternatives}
**Alternatives rejected:** {other options and why they were not chosen}

---
```

Omit "Alternatives rejected" when no meaningful alternatives existed.

### What to log

Log any decision where:
- One technical approach is chosen over another
- A scope boundary is set (what's in/out of this epic or task)
- A workaround is applied for a discovered constraint
- An ambiguity in requirements is resolved
- An epic or task definition changes mid-execution

Do **not** log routine implementation steps — only choices with real alternatives.

### Recovery use

When an agent is re-spawned after failure, it reads the decision log before acting. This prevents re-opening closed decisions and contradicting prior choices.

## Slug Derivation

From a repo name: lowercase, replace spaces/underscores with hyphens, strip special chars.
Example: `"My Frontend App"` → `"my-frontend-app"`
