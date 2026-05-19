---
name: shura
description: Use when the user asks about shura commands, needs a command overview, or wants to understand the agent hierarchy, specialist hiring, graphify integration, or skill_repos flow.
---

# Shura — The Consultative Council

Multi-agent orchestration for cross-repository development. Each repository gets its own Product Owner who leads a team of on-demand specialists. A Program Manager (PM) coordinates all POs toward a shared mission.

## Commands

| Command | When to use |
|---------|-------------|
| `/init` | First step — create the project directory and configure skill repos |
| `/add-repo` | Add each repository (local worktree or remote clone); auto-detects stack; auto-indexes with graphify if installed |
| `/goal` | State the mission; interactive stakeholder meeting with PM; auto-launches all teams |
| `/get-manager` | Open a conversation with the Program Manager at any time |
| `/status` | Live dashboard — see every repo team's status and recent decisions |
| `/recover` | Re-launch teams manually after a failure or incomplete /goal run |

## Typical Flow

```
/init → /add-repo (×N) → /goal → [teams auto-launch]
```

After teams launch, use `/get-manager` to check in and `/status` to see team progress at a glance. The Program Manager handles everything else.

## Agent Hierarchy

```
User
 └─ Program Manager (PM)                  (/get-manager)
      ├─ Product Owner (PO) A              (one per repo — visible terminal)
      │    ├─ Developer A1, Developer A2
      │    ├─ Architect A                  (on-demand specialists)
      │    └─ Tester A                     (subagents below PO — not separately visible)
      ├─ Product Owner (PO) B
      │    └─ Developer B1
      └─ ...
```

### Dispatch Chain

```
/goal → stakeholder meeting (inline, you + PM)
      → epics confirmed
      → [PO dispatched per repo] ──── [PO dispatches Developer(s)]
                                  └── [PO dispatches Specialists on-demand]
```

Every agent receives its full context at dispatch time — repo path, branch, epic, decisions log, knowledge graph path, skill catalogue. Agents do not share state files directly; context is injected into each prompt at dispatch.

## Communication Rules

- **User speaks only to Program Manager (PM)**
- **PM ↔ PO** — bidirectional; PM runs Product Board meetings
- **PO ↔ PO** — peer communication during Product Board sessions only
- **PO → Specialists/Dev** — PO hires and assigns; Specialists/Dev escalate up if blocked
- **Product Board meeting** — triggered when any PO escalates; all POs + PM attend

### Escalation Triggers

Escalation activates on: blocked tasks, cross-repo conflicts, unclear requirements, or 3+ failed implementation attempts.

## Specialist Hiring

Product Owners hire specialists on-demand when a task warrants it. The available specialists depend on the repo's detected stack and which skill repos are installed.

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

The PO receives a JSON catalogue of available specialists at dispatch time (`{specialist_roles_json}`). Each entry specifies:
- `source: "builtin"` — PO reads `agents/dev.md` from the shura plugin directory, fills placeholders, dispatches
- `source: "skill"` — PO locates the `SKILL.md` file in `~/.claude/plugins/cache/<plugin>/skills/<skill>/SKILL.md`, reads it, appends the Shura context block, dispatches as a subagent

Without skill repos installed, only `Developer` is available for every stack.

## Skill Repos and Stack Detection

### skill_repos flow

1. **`/init`** — user declares which Claude Code skill plugins they have installed (e.g. `alirezarezvani/claude-skills, affaan-m/everything-claude-code`); stored in `.shura/config.json`
2. **`/add-repo`** — runs stack detection on the repo root; filters the stack's skill-map against installed repos; writes `specialist_roles`, `must_use_skills`, `recommended_skills` to `.shura/repos/<slug>/config.json`
3. **`/goal`** — at dispatch time, `specialist_roles_json` is injected into each PO's prompt; PO uses this catalogue to decide when and whom to hire

Changing `skill_repos` in `.shura/config.json` and re-running `/add-repo` refreshes the specialist catalogue for all repos.

### Stack detection

Auto-runs during `/add-repo`. Detection runs in priority order — first match wins:

| Stack | Detected by |
|-------|------------|
| `claude-code-plugin` | `.claude-plugin/` directory exists |
| `data-ml` | `requirements.txt` with ML keyword OR `.ipynb` file at root |
| `mobile` | `pubspec.yaml` OR `ios/`+`android/` OR `Podfile` |
| `cpp` | `CMakeLists.txt` OR `.cmake` file at root |
| `fullstack` | `package.json` with frontend framework dep AND `api/`, `server/`, or `backend/` directory |
| `frontend` | `package.json` with frontend framework dep (React, Vue, Angular, Svelte, Next, Nuxt, Gatsby) |
| `devops` | `Dockerfile` or `docker-compose.yml` WITHOUT `package.json` |
| `python` | `requirements.txt` (non-ML), `setup.py`, or `pyproject.toml` |
| `backend` | Fallback — anything that doesn't match the above |

## graphify Integration

[graphify](https://github.com/safishamsi/graphify) builds a knowledge graph of a repo so agents understand the full codebase in a single read — architecture, key files, entry points, dependencies — instead of exploring blind with dozens of `find`/`cat` calls.

Install before running `/add-repo`:
```bash
uv tool install graphifyy && graphify install
```

If graphify is present when you add a repo, it runs automatically and the resulting `GRAPH_REPORT.md` is injected into every agent's context at dispatch time via the `{graph_report}` placeholder. Without graphify, agents still work — they just explore the codebase manually, which is slower and less precise.

## Glossary

| Term | Role |
|------|------|
| PM | Program Manager — user's only touchpoint; coordinates all POs and runs board meetings |
| PO | Product Owner — one per repo; owns the epic, hires specialists, manages tasks, pushes branch |
| Dev | Developer agent — executes tasks; can be spawned dynamically for parallelism |
| Specialist | On-demand agent (Tester, Architect, Security Reviewer, etc.) hired by PO from external skill repos |
| Product Board | All POs + PM — convenes for cross-repo decisions and escalations |
| Epic | High-level work item assigned to a single repo; agreed during the stakeholder meeting |
| Stack | Auto-detected tech profile of a repo; drives which specialists are available |
| Skill repo | External Claude Code plugin providing specialist agent prompts (e.g. `claude-skills`) |
| graphify | Optional tool that builds a repo knowledge graph; injected into agent context at dispatch |
| Decisions log | Append-only agent decision record in `.shura/`; used for consistency and recovery |
| Goal versioning | Each `/goal` run creates a new branch cycle; old branches are preserved |

## State

All project state lives in `.shura/` in the project directory.
See `skills/shura/state-format.md` for the full schema.
