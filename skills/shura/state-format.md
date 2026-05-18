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
  "goal": "Add OAuth2 authentication to all services",
  "branch_suffix": "add-oauth2-auth",
  "goals": [
    {
      "goal": "Migrate payment flow to Stripe",
      "branch_suffix": "stripe-migration",
      "archived_at": "2026-05-17T19:00:00Z"
    }
  ],
  "skill_repos": [
    "alirezarezvani/claude-skills",
    "affaan-m/everything-claude-code"
  ]
}
```

Fields:
- `name` — project slug (no spaces; used as directory and branch names)
- `ticket` — tracking ticket ID (or `"none"`)
- `created` — ISO 8601 timestamp
- `status` — one of: `initialized` | `repos-added` | `goal-set` | `running` | `complete`
- `goal` — current mission statement, set by `/goal`
- `branch_suffix` — slug derived from the current goal by the PM (e.g., `"add-oauth2-auth"`); empty string on first run before `/goal` sets it
- `goals` — append-only history of archived goals; each entry has `goal`, `branch_suffix`, and `archived_at`
- `skill_repos` — array of `<owner>/<repo>` slugs for installed skill plugins; controls which skills and specialist roles are surfaced to agents; `[]` if none configured

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
  "epic": "",
  "stack": "frontend",
  "must_use_skills": ["everything-claude-code:tdd"],
  "recommended_skills": [
    "everything-claude-code:security-review",
    "claude-skills:frontend"
  ],
  "specialist_roles": {
    "Developer": {"source": "builtin", "file": "agents/dev.md"},
    "Tester": {"source": "skill", "name": "claude-skills:qa"},
    "Architect": {"source": "skill", "name": "everything-claude-code:architect"}
  },
  "graph_report": "/home/user/projects/payment-revamp/repos/frontend/graphify-out/GRAPH_REPORT.md"
}
```

Fields:
- `slug` — URL-safe identifier (auto-derived from name)
- `name` — human display name
- `type` — `"local"` (worktree) or `"remote"` (clone)
- `source` — for `local`: original repo path; for `remote`: clone URL
- `path` — absolute path to repo working tree inside the project
- `branch` — branch name; first goal run: `<project-name>`; subsequent runs: `<project-name>/<branch_suffix>`
- `status` — one of: `ready` | `in-progress` | `complete` | `blocked`
- `epic` — assigned epic from Program Manager (set during `/goal`)
- `stack` — detected stack type string (`frontend`, `backend`, etc.); written at `/add-repo` time
- `must_use_skills` — skill names agents must invoke (e.g. TDD); empty array if no skill repos configured
- `recommended_skills` — stack-relevant skill names for agent context; empty array if no skill repos configured
- `specialist_roles` — map of role name → `{source, file|name}` filtered to installed repos; always contains at least `Developer` (builtin)
- `graph_report` — absolute path to `graphify-out/GRAPH_REPORT.md` inside the repo; empty string if graphify was not run

## Decision Log Format

Decision logs are append-only markdown files stored inside `.shura/`. They are **never committed to any git repository** — they exist solely for agent context and failure recovery.

- **`.shura/decisions.md`** — cross-repo decisions by the Program Manager
- **`.shura/repos/<slug>/decisions.md`** — decisions by the PO, Dev, and any specialists for that repo

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
