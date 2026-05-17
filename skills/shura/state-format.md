# Shura State Format

All state lives in `.shura/` relative to the shura project directory created by `/start`.

## Directory Layout

```
<project-dir>/
├── .shura/
│   ├── config.json             # Project identity + mission
│   └── repos/
│       └── <slug>/
│           └── config.json     # Per-repo registration
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
- `epic` — assigned epic from Senior Manager (set during `/goal`)

## Slug Derivation

From a repo name: lowercase, replace spaces/underscores with hyphens, strip special chars.
Example: `"My Frontend App"` → `"my-frontend-app"`
