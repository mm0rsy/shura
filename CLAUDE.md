# Shura — AI Contributor Guidelines

Shura is a Claude Code plugin. Each skill in `skills/` is a SKILL.md file with YAML frontmatter.

## Skill Conventions
- `name`: letters, numbers, hyphens only
- `description`: starts with "Use when...", describes triggers only — NEVER summarizes the workflow
- Agent prompts in `agents/` are prompt templates with `{placeholder}` fields to be filled at runtime
- State lives in `.shura/` within the user's project directory (not the plugin directory)
- Full `.shura/` schema is documented in `skills/shura/state-format.md`

## Agent Communication Protocol
Agents communicate exclusively via the Claude Code **Agent tool** (dispatching subagents). There is no file-based messaging and no `SendMessage` between agents. The dispatch chain is:

```
skill → dispatches → Engineering Manager
                           └─ dispatches → Product Owner
                                               └─ dispatches → Developer(s)
```

Each agent receives its full context at dispatch time via filled `{placeholders}`. Agents do not read each other's state files directly — all context they need is injected into their prompt.

## Modifying Skills
Follow the RED-GREEN-REFACTOR cycle from `superpowers:writing-skills` (external plugin, install separately). Do not ship untested skill changes.

## Agent Prompts
Templates use `{snake_case_placeholders}`. When a skill says "load agent prompt from agents/X.md", read the file, replace all placeholders with real values from `.shura/` state, then dispatch the Agent.

Key placeholders present in all three agent tiers (EM, PO, Dev):
- `{graph_report}` — absolute path to `graphify-out/GRAPH_REPORT.md` inside the repo worktree; empty string if graphify was not run. Agents read this file at startup for codebase context.
- `{decisions_log}` — absolute path to `.shura/repos/<slug>/decisions.md`; append-only log shared across EM/PO/Dev for that repo.

## Goal Versioning
When `/goal` is re-run, the old goal is archived to `goals[]` in `config.json` and each repo worktree switches to a new branch `<project-name>/<branch_suffix>`. The `branch_suffix` is derived by the PM from the mission text and output as `BRANCH: <slug>` in the EPICS block. First-run behavior is unchanged: repos stay on `<project-name>`.

## Team Templates

Stack detection runs automatically during `/add-repo`.

**Detection module:** `skills/add-repo/stack-detector.js` — ESM module exporting `detectStack(repoPath)` which returns one of nine stack type strings. Default fallback stack when no fingerprint matches: `backend`.

**Templates:** `agents/templates/<stack-type>.md` — each has YAML frontmatter with:
- `stack`: the stack type string
- `roles.mandatory`: list of required roles for this stack
- `roles.optional`: list of optional roles

**Supported stacks:** `frontend`, `backend`, `mobile`, `fullstack`, `devops`, `data-ml`, `python`, `cpp`, `claude-code-plugin`
