# Agent Hierarchy Redesign: EM Removal + Autonomous Specialist Teams

**Goal:** Remove the Engineering Manager layer from shura's agent hierarchy, elevate Product Owners to direct PM reports, and enable POs to autonomously hire specialist agents (Tester, Architect, Tech Writer, etc.) drawn from external skill repos — making teams leaner, faster to escalate, and higher quality.

**Architecture:** Four-level hierarchy (PM → EM → PO → Dev) becomes three-level (PM → PO → Specialists). PO takes all EM responsibilities: epic ownership, push protocol, direct PM communication, board meeting participation. Specialists are dispatched by the PO on-demand using external skill repo content as their agent prompt, with shura context injected alongside.

**Visibility model:** POs are first-class visible agents — the user sees their terminals. Specialist subagents (Dev, Architect, Tester, Tech Writer) run below the PO as hidden subagents, not separately visible. This mirrors how the current EM is the visible agent and PO/Dev are hidden beneath it — but now PO is the visible layer. Each PO runs in its own isolated context; specialists get short-lived task-specific contexts with no session carry-over. This is the primary token saving: one fewer permanent context layer (EM removed), plus specialists never accumulate session history.

**Companion spec:** `2026-05-18-external-skill-integration-design.md` — the `skill-map.json` and stack-aware injection design. Both specs share implementation: the skill-map extended in this spec's Section 3, and the stack-detector changes overlap. Implement both in one plan.

**Tech Stack:** Markdown (agent prompts, skill docs), JSON (skill-map + config schemas), Node.js (stack-detector extension)

---

## 1. New Hierarchy

### Before
```
User
 └─ Program Manager (PM)
      └─ Engineering Manager (EM)   ← removed
            └─ Product Owner (PO)
                  └─ Dev(s)
```

### After
```
User
 └─ Program Manager (PM)
      └─ Product Owner (PO)         ← direct PM report; team lead
            ├─ Developer(s)         ← unchanged
            ├─ Tester               ← new, on-demand
            ├─ Architect            ← new, on-demand
            ├─ Tech Writer          ← new, on-demand
            └─ [other specialists]  ← stack-specific, on-demand
```

**What specialists are:** Ephemeral subagents dispatched for specific tasks. Not permanent team members. PO spawns them when a task warrants it, receives their output, and continues.

**What stays the same:**
- PM is the only user touchpoint
- Dev agent prompt (`agents/dev.md`) unchanged
- Decisions log format and location
- Escalation triggers (blocked, cross-repo, 3+ failed attempts)
- Board meeting format (round-trip: gather → peer exchange → PM decides)

---

## 2. PO Agent Redesign

`agents/po.md` is substantially rewritten. Key changes:

### New responsibilities
- Owns the epic (was EM's)
- Reports progress directly to PM (was routed through EM)
- Handles push protocol: `git push origin {branch}` when all tasks done, notifies PM
- Attends/chairs Product Board sessions (was EM's seat)
- Autonomous hiring: reads epic + codebase → decides which specialists to hire

### New section: Hiring Catalogue

```markdown
## Hiring Catalogue
Available specialists for your stack ({stack}):

{specialist_roles_json}

To hire a specialist:
1. **Read** the specialist's skill file directly: `{plugin_dir}/../<plugin-slug>/skills/<skill-name>/SKILL.md`
   - For `source: "builtin"`: read `{plugin_dir}/{file}` (e.g. `agents/dev.md`)
   - For `source: "skill"`: derive the plugin directory from the installed plugin path, read its SKILL.md
2. Dispatch a new Agent with the skill file's content + the Shura Context block (below) appended
3. Collect the specialist's output and continue

> **Note on the Skill tool:** Use the Skill tool for your own workflow guidance (e.g. task breakdown techniques). Do NOT use it to load specialist prompts — you need the raw text to inject into a subagent dispatch, not to load it into your own context.
```

### Shura Context Block (appended to every specialist prompt)

This block makes specialists repo-aware without each needing their own full prompt template:

```
---
## Shura Context
You are a specialist in the Shura council.
Repo path: {repo_path}
Branch: {branch}
Project: {project_name} ({ticket_id})
Epic: {epic}
Task: {task_description}
Acceptance criteria: {acceptance_criteria}
Definition of done: {definition_of_done}
Decisions log: {decisions_log}
Knowledge graph: {graph_report}

On startup: read the decisions log if it exists. Do not re-open closed decisions.
When making decisions: append to decisions log in the standard format.
Report completion to: your Product Owner.
---
```

### Updated escalation target

Escalation now goes to PM directly (not EM). Format unchanged, recipient updated:

```
Escalating to Program Manager
Issue: {one-line description}
Context: {relevant background}
Question: {what decision do you need?}
```

### Updated completion report

```
Epic complete: {summary}
Branch pushed: {branch}
Specialists used: {list of roles hired}
Tests passing: yes/no
Ready for integration: yes
```

### New placeholders required in `agents/po.md`

| Placeholder | Source |
|-------------|--------|
| `{stack}` | `repo.stack` from `.shura/repos/<slug>/config.json` |
| `{specialist_roles_json}` | `repo.specialist_roles` — the filtered role catalogue for this stack |

These are populated by `/goal` and `/recover` at dispatch time, same as existing placeholders.

---

## 3. specialist_roles in skill-map.json

Extends the companion spec's `skill-map.json` (`skills/add-repo/skill-map.json`) with a `specialist_roles` key per stack.

```json
{
  "frontend": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": ["everything-claude-code:security-review", "claude-skills:frontend"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Accessibility Reviewer": {"source": "skill", "name": "claude-skills:engineering-core"},
      "Performance Engineer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "backend": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": ["everything-claude-code:security-review", "claude-skills:backend"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Database Engineer": {"source": "skill", "name": "everything-claude-code:database-designer"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "fullstack": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": ["everything-claude-code:security-review", "claude-skills:frontend", "claude-skills:backend"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Database Engineer": {"source": "skill", "name": "everything-claude-code:database-designer"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "mobile": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": ["everything-claude-code:security-review", "claude-skills:engineering-core"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "devops": {
    "must_use": [],
    "recommended": ["everything-claude-code:security-review", "claude-skills:devops"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Security Auditor": {"source": "skill", "name": "everything-claude-code:security-review"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"}
    }
  },
  "data-ml": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": ["claude-skills:rag-architect", "claude-skills:ml-pipeline", "everything-claude-code:security-review"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "ML Engineer": {"source": "skill", "name": "claude-skills:ml-pipeline"},
      "Data Architect": {"source": "skill", "name": "claude-skills:rag-architect"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "python": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": ["everything-claude-code:django-patterns", "everything-claude-code:security-review"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "cpp": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": ["everything-claude-code:security-review", "claude-skills:engineering-core"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "claude-code-plugin": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": ["everything-claude-code:mcp-server-builder", "everything-claude-code:security-review"],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Technical Writer": {"source": "skill", "name": "claude-skills:engineering-core"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  }
}
```

**Filtering:** At `/add-repo` time, specialist role entries are filtered against `config.skill_repos`. If `alirezarezvani/claude-skills` is not installed, all entries with `"name": "claude-skills:*"` are dropped. If both repos are missing, only `source: "builtin"` entries remain (i.e., only Developer).

**Implementation note:** All skill names above are illustrative. Verify actual skill names against each repo's `skills/*/SKILL.md` frontmatter `name` fields before finalizing.

### stack-detector.js changes

Returns an extended object (addition to companion spec):

```js
{
  stack: "backend",
  must_use_skills: [...],
  recommended_skills: [...],
  specialist_roles: {
    "Developer": {"source": "builtin", "file": "agents/dev.md"},
    "Tester": {"source": "skill", "name": "claude-skills:qa"},
    ...
  }
}
```

`specialist_roles` is filtered to installed repos before being returned.

---

## 4. Stack Template Updates

All 9 files in `agents/templates/` are updated:

1. **Remove** `Engineering Manager` from `roles.mandatory`
2. **Change** `roles.mandatory` to just `[Product Owner]` for all stacks
3. **Add** `roles.catalogue` listing available specialist names (matching keys in `specialist_roles` from skill-map)
4. **Body update**: remove EM role description; add PO team lead description; add "Hiring Guidance" section telling PO when to hire each optional role

Example updated `backend.md` header:

```yaml
---
stack: backend
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Database Engineer
    - Security Reviewer
---
```

Example "Hiring Guidance" body section:

```markdown
## Hiring Guidance

Hire a **Developer** for every implementation task. This is your default workhorse.

Hire an **Architect** when:
- The epic involves creating new services, modules, or significant structural changes
- The existing architecture needs to be understood before implementation begins

Hire a **Tester** when:
- The epic touches critical paths (auth, payments, data integrity)
- The codebase lacks coverage in the affected area
- Devs are completing tasks faster than you can verify quality

Hire a **Database Engineer** when:
- Schema migrations are required
- Query performance is a concern for the epic's data access patterns

Hire a **Security Reviewer** when:
- The epic touches authentication, authorization, or external APIs
- New dependencies are being added
```

---

## 5. PM Agent Changes

`agents/program-manager.md` — surgical updates only:

| Section | Change |
|---------|--------|
| `Council — Engineering Managers` | → `Council — Product Owners` |
| `{repo_list}` format label | `EM` → `PO` |
| Constraints | "Never talk to POs or Devs directly" → "Never talk to Devs or Specialists directly; your direct reports are Product Owners" |
| Board Meeting | "all Engineering Managers + PM" → "all Product Owners + PM" every occurrence |
| EM Briefing section | → PO Briefing section (same format, recipient is PO) |
| Push Protocol | Same (PM still confirms push to user) |
| Decision Log format | Unchanged |

The `EPICS:` output contract in the stakeholder meeting is **unchanged** — the `/goal` skill parses it to spawn agents; only the target agent type changes (PO instead of EM).

---

## 6. /goal and /recover Skill Changes

Both skills: spawn PO instead of EM.

**Read** `agents/po.md` instead of `agents/eng-manager.md`.

**New placeholders to populate before dispatch:**

| Placeholder | Value |
|-------------|-------|
| `{stack}` | `repo.stack` from `.shura/repos/<slug>/config.json` |
| `{specialist_roles_json}` | `JSON.stringify(repo.specialist_roles, null, 2)` — filtered catalogue |

All existing placeholders unchanged.

---

## 7. Config Schema Changes

### `.shura/repos/<slug>/config.json` — new fields

```json
{
  "slug": "frontend",
  "stack": "frontend",
  "recommended_skills": [...],
  "must_use_skills": [...],
  "specialist_roles": {
    "Developer": {"source": "builtin", "file": "agents/dev.md"},
    "Tester": {"source": "skill", "name": "claude-skills:qa"},
    "Architect": {"source": "skill", "name": "everything-claude-code:architect"}
  }
}
```

`specialist_roles` is written at `/add-repo` time by the stack detector, filtered to installed repos.

---

## 8. File Impact Summary

| File | Change |
|------|--------|
| `agents/eng-manager.md` | Moved to `agents/archive/eng-manager.md` |
| `agents/po.md` | Major rewrite (team lead, hiring catalogue, push, direct PM reporting) |
| `agents/program-manager.md` | Surgical: EMs → POs throughout |
| `agents/dev.md` | Unchanged |
| `agents/templates/frontend.md` | Remove EM; add catalogue + hiring guidance |
| `agents/templates/backend.md` | Same |
| `agents/templates/fullstack.md` | Same |
| `agents/templates/mobile.md` | Same |
| `agents/templates/devops.md` | Same |
| `agents/templates/data-ml.md` | Same |
| `agents/templates/python.md` | Same |
| `agents/templates/cpp.md` | Same |
| `agents/templates/claude-code-plugin.md` | Same |
| `skills/goal/SKILL.md` | Spawn PO; add `{stack}`, `{specialist_roles_json}` placeholders |
| `skills/recover/SKILL.md` | Same |
| `skills/shura/SKILL.md` | Update hierarchy diagram + role table |
| `skills/add-repo/skill-map.json` | Add `specialist_roles` per stack (combines both specs) |
| `skills/add-repo/stack-detector.js` | Return `specialist_roles` in output object |
| `skills/add-repo/SKILL.md` | Write `specialist_roles` to repo config |
| `skills/shura/state-format.md` | Document `specialist_roles` in repo config schema |
| `CLAUDE.md` | Update hierarchy; new placeholders `{stack}`, `{specialist_roles_json}` |
| `README.md` | Update hierarchy diagram + command docs |

---

## 9. /status Compatibility

The `/status` skill reads `.shura/repos/*/config.json`. No changes needed — `specialist_roles` is a new field in that schema, and `/status` does not display it (it only reads `name`, `slug`, `branch`, `status`, `epic`, `stack`). The new fields are additive and non-breaking.

---

## 11. Out of Scope

- Specialists spawning their own sub-specialists (no recursive delegation)
- Sub-POs for large epic decomposition
- PM hiring specialists directly
- Automatic plugin installation
- Versioned skill manifests
- New shura commands

## 12. Implementation Note

This spec and `2026-05-18-external-skill-integration-design.md` share significant implementation surface (skill-map.json, stack-detector.js, stack templates, po.md, goal/recover skills). They must be implemented in a single plan to avoid double-touching the same files.
