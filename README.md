# Shura

A multi-agent orchestration system for coordinating work across multiple repositories simultaneously. Inspired by the Arabic consultative council concept.

## Installation

```bash
claude plugin install https://github.com/mm0rsy/shura
```

Requires [Claude Code](https://claude.ai/code). After installing, the `/shura`, `/init`, `/add-repo`, `/goal`, `/get-manager`, and `/recover` commands are available in any Claude Code session.

## Commands

| Command | Description |
|---------|-------------|
| `/init` | Initialize a shura project directory |
| `/add-repo` | Add a repo to the council (local worktree or remote clone); branch is named after the project automatically |
| `/goal` | Set the mission; stakeholder meeting with PM; auto-launches teams |
| `/get-manager` | Talk to the Program Manager at any time |
| `/recover` | Re-launch teams manually after a failure or incomplete /goal run |

## Team Templates

When `/add-repo` is called, Shura auto-detects the repository's tech stack and loads the matching team template. The detection logic lives in `skills/add-repo/stack-detector.js`. Templates live in `agents/templates/<stack-type>.md`.

Each template defines the mandatory roles that are always spawned for that stack, plus optional roles available for specialized work.

| Stack | Mandatory Roles |
|-------|----------------|
| frontend | Engineering Manager, Product Owner, Frontend Developer |
| backend | Engineering Manager, Product Owner, Backend Developer |
| mobile | Engineering Manager, Product Owner, Mobile Developer |
| fullstack | Engineering Manager, Product Owner, Full-Stack Developer |
| devops | Engineering Manager, Product Owner, DevOps Engineer |
| data-ml | Engineering Manager, Product Owner, ML Engineer |
| python | Engineering Manager, Product Owner, Python Developer |
| cpp | Engineering Manager, Product Owner, C++ Developer |
| claude-code-plugin | Engineering Manager, Product Owner, JS/ESM Developer, Prompt Engineer |

## Agent Hierarchy

```
User ─── /get-manager ──► Program Manager (PM)
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
             Engineering    Engineering  Engineering
             Manager (EM)   Manager (EM) Manager (EM)
                    │
                    ▼
             Product Owner (PO)
                    │
               ┌────┴────┐
               ▼         ▼
              Dev        Dev
```

## Communication Rules

- **User ↔ PM** — only touch point for the user
- **PM ↔ EM** — bidirectional; PM runs board meetings
- **EM ↔ EM** — peer communication during Board sessions only
- **EM → PO** (assignments); **PO → EM** (escalations only)
- **PO → Dev** — assigns tasks; can spawn additional Devs for parallelism
- **Escalation triggers:** blocked tasks, cross-repo conflicts, unclear requirements, or 3+ failed attempts
- **Escalation chain:** Dev escalates to PO → PO escalates to EM → EM escalates to PM (who convenes a Board)

## Getting Started

1. `/init` — name your project
2. `/add-repo` — add each repository
3. `/goal` — state the mission; teams launch automatically after the stakeholder meeting

## Glossary

| Term | Role |
|------|------|
| PM | Program Manager — user's only touchpoint; coordinates all teams |
| EM | Engineering Manager — one per repo; owns the epic, spawns PO |
| PO | Product Owner — breaks epic into tasks, manages and spawns Devs |
| Dev | Developer agent — executes tasks; can be spawned dynamically for parallelism |
| Board | All EMs + PM — convenes for cross-repo decisions and escalations |
