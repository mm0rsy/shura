# Shura

A multi-agent orchestration system for coordinating work across multiple repositories simultaneously. Inspired by the Arabic consultative council concept — each repository gets its own autonomous Product Owner who leads a specialist team, while a Program Manager coordinates all teams toward a shared mission.

## Installation

```bash
claude plugin install https://github.com/mm0rsy/shura
```

Requires [Claude Code](https://claude.ai/code). After installing, the `/shura`, `/init`, `/add-repo`, `/goal`, `/get-manager`, `/status`, and `/recover` commands are available in any Claude Code session.

### Optional: graphify (strongly recommended)

[graphify](https://github.com/safishamsi/graphify) builds a knowledge graph of each repo so agents can understand the full codebase in a single read — architecture, key files, entry points, dependencies — instead of exploring blind with dozens of `find`/`cat` calls.

```bash
uv tool install graphifyy && graphify install
```

Install before running `/add-repo`. If graphify is present when you add a repo, it runs automatically and the resulting `GRAPH_REPORT.md` is injected into every agent's context at dispatch time. Without graphify, agents still work — they just explore the codebase manually, which is slower and less precise.

### Optional: External Skill Repos (recommended for specialist teams)

Shura integrates with external Claude Code skill plugins to give your agent teams domain expertise. When installed, Product Owners can hire specialists backed by proven skill prompts rather than generic instructions.

**[claude-skills](https://github.com/alirezarezvani/claude-skills)** — 313+ engineering, product, ML, and compliance skills across QA, RAG architecture, ML pipeline, DevOps, and more.

**[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** — 232 skills, 60 specialized agents, TDD workflows, architecture review, security scanning, database design.

Install each as a Claude Code plugin:
```bash
claude plugin install https://github.com/alirezarezvani/claude-skills
claude plugin install https://github.com/affaan-m/everything-claude-code
```

Then declare them when you run `/init` — Shura will use them to build the specialist catalogue for each repo's stack. Without skill repos, teams consist of Developer only.

---

## How Shura Works

### The core idea

You describe a mission. Shura splits the work across your repositories — each repo gets its own **Product Owner (PO)** agent who runs a full stakeholder meeting with you, breaks the epic into tasks, hires specialists as needed, and pushes the finished branch. A **Program Manager (PM)** coordinates all POs and is your only touchpoint throughout.

### The dispatch chain

```
/goal → stakeholder meeting (inline, you + PM)
      → epics confirmed
      → [PO dispatched per repo] ──── [PO dispatches Developer(s)]
                                  └── [PO dispatches Specialists on-demand]
                                         (Tester, Architect, Security Reviewer, ...)
```

Every agent receives its full context at dispatch time — repo path, branch, epic, decisions log, knowledge graph path, skill catalogue. Agents do not share state files directly; context is injected into each prompt.

### What runs where

| Layer | Who | Visibility |
|-------|-----|------------|
| User session | Program Manager (inline) | You talk to PM directly |
| Per-repo terminal | Product Owner | One visible terminal per repo |
| Below PO (hidden) | Developer(s), Specialists | Subagents — not separately visible |

---

## Commands

| Command | When to use |
|---------|-------------|
| `/init` | First step — create the project directory and configure skill repos |
| `/add-repo` | Add each repository (local worktree or remote clone); auto-detects stack; auto-indexes with graphify if installed |
| `/goal` | State the mission; interactive stakeholder meeting with PM; auto-launches all teams |
| `/get-manager` | Talk to the Program Manager at any time — check progress, give new direction |
| `/status` | Live dashboard — every repo's status, branch, epic, and recent decisions |
| `/recover` | Re-launch teams manually after a failure or incomplete `/goal` run |

---

## Agent Hierarchy

```
User ─── /get-manager ──► Program Manager (PM)
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
         Product Owner   Product Owner   Product Owner
          (repo A)        (repo B)        (repo C)
               │
     ┌─────────┼──────────┐
     ▼         ▼          ▼
 Developer  Tester   Architect
           (on-demand specialists — hired by PO when task warrants it)
```

### Communication rules

- **User ↔ PM only** — the PM is your sole touchpoint; you never speak directly to POs or Devs
- **PM → PO** — the PM briefs each PO with their epic and full mission context
- **PO → Specialists/Dev** — the PO hires, assigns tasks, collects output, and handles re-tries
- **Escalation chain** — Dev escalates to PO → PO escalates to PM → PM convenes a Product Board (all POs + PM) if cross-repo resolution is needed
- **Escalation triggers** — blocked tasks, cross-repo conflicts, 3+ failed implementation attempts, unclear requirements

### Product Board meetings

When a PO escalates to the PM, the PM runs a two-round board session:
1. **Round 1** — PM collects each PO's stake and position on the issue
2. **Round 2** — POs exchange views directly with each other (peer-to-peer)
3. **Decision** — PM makes the final call, communicates it to all POs, updates epics if needed

---

## Getting Started: Step-by-Step

### Step 1: Initialize the project

```
/init
```

Shura will ask for:
- **Project name** — used as the directory name and base branch name (e.g. `payment-revamp`)
- **Ticket ID** — e.g. `PROJ-1234`, or skip
- **Skill repos** — comma-separated list of installed plugins, e.g.:
  `alirezarezvani/claude-skills, affaan-m/everything-claude-code`

This creates:
```
payment-revamp/
├── .shura/
│   └── config.json   ← project identity + skill repo list
└── repos/            ← worktrees/clones land here
```

### Step 2: Add repositories

```
cd payment-revamp
/add-repo
```

For each repo, Shura will ask:
- **Name** — human label, e.g. `Frontend App`
- **Local or remote** — local path (creates a git worktree) or clone URL

Then Shura automatically:
1. **Detects the stack** — reads fingerprint files to identify `frontend`, `backend`, `python`, etc.
2. **Builds the specialist catalogue** — filters the skill-map against your installed skill repos
3. **Runs graphify** (if installed) — generates `GRAPH_REPORT.md` inside the worktree
4. **Writes** `.shura/repos/<slug>/config.json` with stack, skills, and specialist roles

Repeat for each repository. Repos can be added at any time.

### Step 3: Set the mission

```
/goal
```

Shura runs an **interactive stakeholder meeting** inline — you're talking directly to the Program Manager:

1. **State the mission** — describe what you want achieved across all repos
2. **Review proposed epics** — the PM proposes how work splits across repos; you refine each epic until satisfied
3. **Confirm** — once all epics are agreed, teams launch automatically

When the meeting ends, one Product Owner agent is dispatched per repo, simultaneously. Each PO reads its epic, explores the codebase (using the graphify knowledge graph if available), and begins breaking the work into tasks.

### Step 4: Monitor and steer

```
/status          ← dashboard: every repo's status, branch, epic, recent decisions
/get-manager     ← talk to PM: ask for a progress report, give new direction, resolve blockers
```

When teams complete their work, each PO pushes its branch and notifies the PM. Use `/get-manager` to get the final summary and plan your integration (merge, CI, code review).

---

## Specialist Hiring

Product Owners hire specialists on-demand when a task warrants it. The available specialists depend on the repo's detected stack and which skill repos you've installed.

### When POs hire which specialists

| Specialist | Hired when |
|------------|-----------|
| **Developer** | Every implementation task — default workhorse, always available |
| **Tester** | Critical paths (auth, payments, data integrity); low coverage in the affected area |
| **Architect** | Epic involves new services, significant structural changes, or unfamiliar architecture |
| **Security Reviewer** | Tasks touching authentication, authorization, external APIs, or new dependencies |
| **Database Engineer** | Schema migrations required; query performance is a concern |
| **ML Engineer** | Model training, evaluation pipelines, dataset handling (data-ml stack) |
| **Technical Writer** | Plugin/API documentation, SKILL.md files (claude-code-plugin stack) |

### How hiring works

The PO receives a JSON catalogue of available specialists at dispatch time (`{specialist_roles_json}`). Each entry specifies whether the role comes from a built-in agent file (`source: "builtin"`) or an external skill repo (`source: "skill"`).

For **builtin** roles (Developer): the PO reads `agents/dev.md` from the shura plugin directory, fills placeholders, and dispatches.

For **skill** roles (Tester, Architect, etc.): the PO locates the skill's `SKILL.md` file in the installed plugin's cache (`~/.claude/plugins/cache/<plugin>/skills/<skill>/SKILL.md`), reads it directly, appends the Shura context block, and dispatches it as a subagent.

### Specialist catalogue by stack

| Stack | Available Specialists (with both skill repos) |
|-------|-----------------------------------------------|
| `frontend` | Developer, Tester, Architect, Accessibility Reviewer, Performance Engineer |
| `backend` | Developer, Tester, Architect, Database Engineer, Security Reviewer |
| `fullstack` | Developer, Tester, Architect, Database Engineer, Security Reviewer |
| `mobile` | Developer, Tester, Architect, Security Reviewer |
| `devops` | Developer, Security Auditor, Architect |
| `data-ml` | Developer, ML Engineer, Data Architect, Tester, Security Reviewer |
| `python` | Developer, Tester, Architect, Security Reviewer |
| `cpp` | Developer, Tester, Security Reviewer |
| `claude-code-plugin` | Developer, Tester, Architect, Technical Writer, Security Reviewer |

Without skill repos installed, only `Developer` is available for every stack.

---

## Stack Detection

When you run `/add-repo`, Shura auto-detects the stack by reading fingerprint files in the repo root. Detection runs in priority order — the first match wins:

| Stack | Detected by |
|-------|------------|
| `claude-code-plugin` | `.claude-plugin/` directory exists |
| `data-ml` | `requirements.txt` with ML keyword (torch, tensorflow, pandas, etc.) OR `.ipynb` file at root |
| `mobile` | `pubspec.yaml` (Flutter) OR `ios/` + `android/` (React Native) OR `Podfile` (iOS native) |
| `cpp` | `CMakeLists.txt` OR `.cmake` file at root |
| `fullstack` | `package.json` with frontend framework dep AND `api/`, `server/`, or `backend/` directory |
| `frontend` | `package.json` with frontend framework dep (React, Vue, Angular, Svelte, Next, Nuxt, Gatsby) |
| `devops` | `Dockerfile` or `docker-compose.yml` WITHOUT `package.json` |
| `python` | `requirements.txt` (non-ML), `setup.py`, or `pyproject.toml` |
| `backend` | Fallback — anything that doesn't match the above |

The detected stack is stored in `.shura/repos/<slug>/config.json` and passed to the PO at dispatch time.

---

## Goal Versioning

When you re-run `/goal` on an existing project with prior goals, Shura starts a new goal cycle without losing the old work:

1. The current goal is **archived** into `goals[]` in `.shura/config.json`
2. The PM derives a short branch slug from the new mission (e.g. `add-oauth2-auth`)
3. Each repo worktree gets a **new branch**: `<project-name>/<goal-slug>` (branched off the latest upstream default)
4. First `/goal` run keeps the original `<project-name>` branch — no change

**Example:**
- First run → branch `payment-revamp` on all repos
- Second run (new mission) → branch `payment-revamp/add-oauth2-auth` on all repos
- Third run → branch `payment-revamp/dark-mode-ui`

Old branches and their commits are preserved. Each goal cycle is fully isolated.

---

## State & Configuration

All state lives in `.shura/` inside your project directory — it is never committed to any repository.

### `.shura/config.json` — project config

```json
{
  "name": "payment-revamp",
  "ticket": "PROJ-1234",
  "created": "2026-05-17T19:04:00Z",
  "status": "running",
  "goal": "Add OAuth2 authentication to all services",
  "branch_suffix": "add-oauth2-auth",
  "goals": [
    {
      "goal": "Migrate payment flow to Stripe",
      "branch_suffix": "stripe-migration",
      "archived_at": "2026-05-10T12:00:00Z"
    }
  ],
  "skill_repos": [
    "alirezarezvani/claude-skills",
    "affaan-m/everything-claude-code"
  ]
}
```

`status` lifecycle: `initialized` → `repos-added` → `goal-set` → `running` → `complete`

### `.shura/repos/<slug>/config.json` — per-repo config

```json
{
  "slug": "frontend",
  "name": "Frontend App",
  "type": "local",
  "source": "/home/user/repos/my-frontend",
  "path": "/home/user/projects/payment-revamp/repos/frontend",
  "branch": "payment-revamp/add-oauth2-auth",
  "status": "in-progress",
  "epic": "Add OAuth2 login flow with session management",
  "stack": "frontend",
  "must_use_skills": ["everything-claude-code:tdd"],
  "recommended_skills": ["everything-claude-code:security-review", "claude-skills:frontend"],
  "specialist_roles": {
    "Developer": {"source": "builtin", "file": "agents/dev.md"},
    "Tester": {"source": "skill", "name": "claude-skills:qa"},
    "Architect": {"source": "skill", "name": "everything-claude-code:architect"}
  },
  "graph_report": "/home/user/projects/payment-revamp/repos/frontend/graphify-out/GRAPH_REPORT.md"
}
```

`status` values: `ready` | `in-progress` | `complete` | `blocked`

You can edit `skill_repos` in `.shura/config.json` at any time. Re-run `/add-repo` after changing it to refresh the specialist catalogue for each repo.

---

## Decision Logs

Every agent appends structured decisions to a shared log file as it works. These logs serve two purposes:

1. **Consistency** — a Developer spawned mid-task reads prior decisions before acting, avoiding contradictions
2. **Recovery** — if a team is re-launched via `/recover`, the new agent reads the log and picks up where the last left off without re-opening closed questions

### Log locations

- `.shura/decisions.md` — PM cross-repo decisions
- `.shura/repos/<slug>/decisions.md` — per-repo decisions by PO, Dev, and Specialists

### Entry format

```markdown
### 2026-05-17T19:30:00Z | Product Owner
**Decision:** Use JWT with 15-minute expiry for session tokens
**Context:** Architect recommended either JWT or opaque tokens; epic requires stateless auth
**Rationale:** JWT enables stateless verification across microservices without shared session store
**Alternatives rejected:** Opaque tokens — would require a session store lookup on every request

---
```

Decisions are append-only and never deleted. They persist across team re-launches.

---

## Recovery

If a team launch fails mid-way (network timeout, context limit, agent error), use:

```
/recover
```

`/recover` reads the current `.shura/` state — including epics already confirmed and decisions already logged — and re-dispatches all Product Owner agents simultaneously. POs will read the decision log and avoid re-doing completed work.

**Before recovering:**
- Check `.shura/repos/<slug>/decisions.md` to see how far the team got
- Check the repo's git log (`git -C repos/<slug> log --oneline`) for committed work
- If a team pushed partial work, the PO will pick up from the latest commit

**Re-running `/goal`:**
If you want to change the mission (not just recover), re-run `/goal` instead of `/recover`. You'll be asked to confirm overwriting the current goal, and a new versioned branch cycle begins.

---

## Glossary

| Term | Description |
|------|-------------|
| **PM** | Program Manager — your only touchpoint; coordinates all POs and runs board meetings |
| **PO** | Product Owner — one per repo; owns the epic, hires specialists, manages tasks, pushes the branch |
| **Developer** | Developer agent — implements tasks; can be spawned in parallel for independent work |
| **Specialist** | On-demand agent (Tester, Architect, Security Reviewer, etc.) hired by PO from external skill repos |
| **Product Board** | All POs + PM — convenes for cross-repo decisions or when a PO escalates |
| **Epic** | High-level work item assigned to a single repo; agreed during the stakeholder meeting |
| **Stack** | Auto-detected tech profile of a repo; drives which specialists are available |
| **Skill repo** | External Claude Code plugin providing specialist agent prompts (e.g. `claude-skills`) |
| **graphify** | Optional tool that builds a repo knowledge graph; injected into agent context at dispatch |
| **Decisions log** | Append-only agent decision record in `.shura/`; used for consistency and recovery |
| **Goal versioning** | Each `/goal` run creates a new branch cycle; old branches are preserved |
