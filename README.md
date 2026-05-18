# Shura

A multi-agent orchestration system for coordinating work across multiple repositories simultaneously. Inspired by the Arabic consultative council concept.

## Installation

```bash
claude plugin install https://github.com/mm0rsy/shura
```

Requires [Claude Code](https://claude.ai/code). After installing, the `/shura`, `/init`, `/add-repo`, `/goal`, `/get-manager`, `/status`, and `/recover` commands are available in any Claude Code session.

### Optional: graphify (recommended)

[graphify](https://github.com/safishamsi/graphify) builds a knowledge graph of each repo so agents can understand the codebase in one read instead of exploring blind. Install before running `/add-repo`:

```bash
uv tool install graphifyy && graphify install
```

Without graphify, agents still work — they just explore the codebase manually.

### Optional: External Skill Repos (recommended)

Shura integrates with external Claude Code skill plugins to give your agent teams domain expertise. When installed, Product Owners can hire specialists backed by these skills.

**[claude-skills](https://github.com/alirezarezvani/claude-skills)** — 313+ engineering, product, ML, and compliance skills

**[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** — 232 skills, 60 specialized agents, TDD workflows, security scanning

Install each as a Claude Code plugin, then declare them when running `/init`.

## Commands

| Command | Description |
|---------|-------------|
| `/init` | Initialize a shura project directory |
| `/add-repo` | Add a repo to the council (local worktree or remote clone); auto-indexes with graphify if installed |
| `/goal` | Set the mission; stakeholder meeting with PM; auto-launches teams |
| `/get-manager` | Talk to the Program Manager at any time |
| `/status` | Live dashboard — see every repo team's status and recent decisions |
| `/recover` | Re-launch teams manually after a failure or incomplete /goal run |

## Team Templates

When `/add-repo` is called, Shura auto-detects the repository's tech stack and loads the matching team template. The detection logic lives in `skills/add-repo/stack-detector.js`. Templates live in `agents/templates/<stack-type>.md`.

Each template defines a Product Owner (always present) and a catalogue of specialists the PO can hire on-demand.

| Stack | Always Present | Available Specialists |
|-------|---------------|----------------------|
| frontend | Product Owner | Developer, Tester, Architect, Accessibility Reviewer, Performance Engineer |
| backend | Product Owner | Developer, Tester, Architect, Database Engineer, Security Reviewer |
| mobile | Product Owner | Developer, Tester, Architect, Security Reviewer |
| fullstack | Product Owner | Developer, Tester, Architect, Database Engineer, Security Reviewer |
| devops | Product Owner | Developer, Security Auditor, Architect |
| data-ml | Product Owner | Developer, ML Engineer, Data Architect, Tester, Security Reviewer |
| python | Product Owner | Developer, Tester, Architect, Security Reviewer |
| cpp | Product Owner | Developer, Tester, Security Reviewer |
| claude-code-plugin | Product Owner | Developer, Tester, Architect, Technical Writer, Security Reviewer |

## Agent Hierarchy

```
User ─── /get-manager ──► Program Manager (PM)
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
             Product         Product    Product
             Owner (PO)      Owner (PO) Owner (PO)
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
  Developer   Tester    Architect
              (on-demand specialists)
```

## Communication Rules

- **User ↔ PM** — only touch point for the user
- **PM ↔ PO** — bidirectional; PM runs Product Board meetings
- **PO ↔ PO** — peer communication during Product Board sessions only
- **PO → Specialists/Dev** — PO hires and assigns; Specialists/Dev escalate up if blocked
- **Escalation triggers:** blocked tasks, cross-repo conflicts, unclear requirements, or 3+ failed attempts
- **Escalation chain:** Dev/Specialist escalates to PO → PO escalates to PM (who convenes a Product Board)

## Goal Versioning

When you re-run `/goal` on an existing project, shura starts a new goal cycle:

- The current goal is archived to a `goals[]` history in `config.json`
- The PM derives a short branch slug from the mission text (e.g., `add-oauth2-auth`)
- Each repo worktree gets a new branch: `<project-name>/<goal-slug>` (created from the latest upstream default)
- First run keeps the original `<project-name>` branch — no change

This means each goal has its own branch and a clean history. Old work stays on the previous branch.

## Getting Started

1. `/init` — name your project
2. `/add-repo` — add each repository (installs graphify knowledge graph if available)
3. `/goal` — state the mission; teams launch automatically after the stakeholder meeting
4. `/status` — check team progress at any time

## Glossary

| Term | Role |
|------|------|
| PM | Program Manager — user's only touchpoint; coordinates all POs |
| PO | Product Owner — one per repo; owns the epic, hires specialists, pushes branch |
| Dev | Developer agent — executes tasks; can be spawned dynamically for parallelism |
| Specialist | On-demand agent (Tester, Architect, Tech Writer, etc.) hired by PO from external skill repos |
| Product Board | All POs + PM — convenes for cross-repo decisions and escalations |
