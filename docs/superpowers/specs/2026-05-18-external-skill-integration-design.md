# External Skill Repo Integration Design

**Goal:** Let shura's Dev and PO agents leverage external skill repos (`alirezarezvani/claude-skills` and `affaan-m/everything-claude-code`) via stack-aware prompt injection, without hard-wiring any repo as a mandatory dependency.

**Architecture:** User declares installed skill repos in `.shura/config.json`. Stack detection at `/add-repo` maps each detected stack to a curated list of relevant skill names from installed repos. Those names are injected into EM/PO/Dev agent prompts as `{skill_repos}` and `{recommended_skills}` placeholders, enabling agents to invoke skills via the Claude Code `Skill` tool.

**Tech Stack:** Node.js (stack-detector extension), JSON (skill-map config), Markdown (prompt templates, skill docs)

---

## 1. Config Schema Changes

### `.shura/config.json` — new field

```json
{
  "name": "payment-revamp",
  "skill_repos": [
    "alirezarezvani/claude-skills",
    "affaan-m/everything-claude-code"
  ]
}
```

- `skill_repos`: array of `<owner>/<repo>` strings declared by user at `/init`
- Empty array `[]` means no external skills installed — agents omit the skills section entirely

### `.shura/repos/<slug>/config.json` — new fields

```json
{
  "slug": "frontend",
  "stack": "frontend",
  "recommended_skills": [
    "everything-claude-code:tdd",
    "everything-claude-code:security-review",
    "everything-claude-code:react-patterns",
    "claude-skills:frontend"
  ],
  "must_use_skills": [
    "everything-claude-code:tdd"
  ]
}
```

- `stack`: stack type string (already returned by `stack-detector.js`, now persisted)
- `recommended_skills`: union of must_use + recommended from `skill-map.json` for this stack, filtered to installed repos only
- `must_use_skills`: subset agents must invoke (e.g. TDD always required for Dev)

---

## 2. New File: `skills/add-repo/skill-map.json`

Curated mapping of each stack type to skill names from both external repos. Skill names use the `<plugin-namespace>:<skill-name>` format the Skill tool understands.

Plugin namespaces:
- `alirezarezvani/claude-skills` → namespace `claude-skills` *(verify against `.claude-plugin/manifest.json` `name` field in that repo before implementation — namespace may differ)*
- `affaan-m/everything-claude-code` → namespace `everything-claude-code` *(same caveat)*

> **Implementation note:** All skill names in this file are illustrative. Before finalizing `skill-map.json`, check the actual skill names available in each repo (their `skills/*/SKILL.md` frontmatter `name` fields). The namespace must match the plugin's manifest `name` exactly.

```json
{
  "frontend": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:security-review",
      "everything-claude-code:react-patterns",
      "claude-skills:frontend"
    ]
  },
  "backend": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:security-review",
      "everything-claude-code:database-designer",
      "claude-skills:backend"
    ]
  },
  "fullstack": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:security-review",
      "everything-claude-code:react-patterns",
      "everything-claude-code:database-designer",
      "claude-skills:frontend",
      "claude-skills:backend"
    ]
  },
  "mobile": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:engineering-core"
    ]
  },
  "devops": {
    "must_use": [],
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:devops",
      "everything-claude-code:ci-cd-builder"
    ]
  },
  "data-ml": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "claude-skills:rag-architect",
      "claude-skills:ml-pipeline",
      "everything-claude-code:security-review",
      "claude-skills:data-engineering"
    ]
  },
  "python": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:django-patterns",
      "everything-claude-code:security-review",
      "claude-skills:backend"
    ]
  },
  "cpp": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:engineering-core"
    ]
  },
  "claude-code-plugin": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:mcp-server-builder",
      "everything-claude-code:security-review",
      "claude-skills:engineering-core"
    ]
  }
}
```

**Filtering:** At `/add-repo` time, skill names are filtered against `config.skill_repos`. If `alirezarezvani/claude-skills` is not installed, all `claude-skills:*` entries are dropped from the repo's `recommended_skills` and `must_use_skills`.

---

## 3. `stack-detector.js` Changes

Currently returns a single stack type string. Extend to also accept the project-level `skill_repos` list and return:

```js
{
  stack: "frontend",
  must_use_skills: ["everything-claude-code:tdd"],
  recommended_skills: [
    "everything-claude-code:security-review",
    "everything-claude-code:react-patterns",
    "claude-skills:frontend"
  ]
}
```

Steps:
1. Detect stack (existing logic unchanged)
2. Load `skill-map.json` from same directory
3. Look up `skill-map[stack]`
4. Filter `must_use` + `recommended` arrays: keep only skills whose namespace prefix matches an installed repo slug
5. Return the result object

Namespace derivation: `alirezarezvani/claude-skills` → `claude-skills`; `affaan-m/everything-claude-code` → `everything-claude-code`. (Take the repo name part, strip non-alphanumeric except hyphens.)

---

## 4. `/init` Skill Changes

After the existing ticket ID question, add one new step:

```
Which external skill repos do you have installed as Claude Code plugins?
(comma-separated, e.g. alirezarezvani/claude-skills, affaan-m/everything-claude-code — press enter to skip)
```

- Parse, normalize, validate format `<owner>/<repo>`
- Store as `skill_repos` array in `.shura/config.json`
- If empty, store `[]`

Update the confirmation output to include:
```
  Skills: {N} skill repos configured
```

---

## 5. `/add-repo` Skill Changes

In Step 3 (write repo config), after stack detection returns the extended object:
- Write `stack`, `recommended_skills`, and `must_use_skills` to `.shura/repos/<slug>/config.json`
- Pass `skill_repos` from project config into `detectStack()` for filtering

In Step 5 (confirm output), add a line:
```
Skills: {N} recommended ({M} must-use)
```

If `skill_repos` is empty, show:
```
Skills: no skill repos configured (add to .shura/config.json)
```

---

## 6. Agent Prompt Changes

### New placeholders (all three agents)

| Placeholder | Source |
|-------------|--------|
| `{skill_repos}` | `config.skill_repos` joined as comma-separated string |
| `{must_use_skills}` | `repo.must_use_skills` joined, newline-separated |
| `{recommended_skills}` | `repo.recommended_skills` joined, newline-separated |

When `skill_repos` is empty, all three placeholders are empty strings and the skills section is omitted from the rendered prompt.

### Dev agent — new section (highest impact)

```markdown
## External Skills Available
Installed skill repos: {skill_repos}

For your stack, invoke these skills before starting implementation:

**MUST USE (mandatory):**
{must_use_skills}

**RECOMMENDED (use as relevant):**
{recommended_skills}

Invoke skills with the Skill tool. TDD is mandatory — invoke it before writing any code.
All other skills from installed repos are available on demand during your task.
```

### PO agent — new section

```markdown
## External Skills Available
Installed skill repos: {skill_repos}
Stack-recommended skills: {recommended_skills}

Use relevant skills when writing task specs and acceptance criteria.
```

### EM agent — new section (awareness only)

```markdown
## External Skills Available
Installed skill repos: {skill_repos}
Stack skills available for your team: {recommended_skills}
```

The EM's PO-spawning placeholder list in `agents/eng-manager.md` must include all three new placeholders:
- `{skill_repos}` → `{skill_repos}` (pass through as-is)
- `{must_use_skills}` → `{must_use_skills}` (pass through)
- `{recommended_skills}` → `{recommended_skills}` (pass through)

---

## 7. `/goal` and `/recover` Changes

Both skills already populate EM placeholder lists. Add the three new placeholders to both:

- `{skill_repos}` → `config.skill_repos.join(', ')` (or empty string)
- `{must_use_skills}` → `repo.must_use_skills.join('\n  - ')` (or empty string)  
- `{recommended_skills}` → `repo.recommended_skills.join('\n  - ')` (or empty string)

---

## 8. Documentation Changes

### `CLAUDE.md`

Add to the "Key placeholders present in all three agent tiers" section:
- `{skill_repos}` — comma-separated list of installed skill repo slugs; empty string if none configured
- `{must_use_skills}` — newline-separated list of skill names agents must invoke (e.g. TDD); empty string if none
- `{recommended_skills}` — newline-separated list of stack-recommended skill names; empty string if none

### `skills/shura/state-format.md`

Document `skill_repos` in project config schema and `stack`, `recommended_skills`, `must_use_skills` in repo config schema.

### `README.md`

Add "Optional Skill Repos" section:
- Description of what each repo provides
- Install instructions for each (`claude code plugins install <url>`)
- How to declare them in `.shura/config.json`
- Note that shura works without them — they enhance Dev/PO quality

---

## 9. What Shura Does NOT Do

- Does not verify repos are actually installed (user-configurable model: trust config)
- Does not pin versions of external repos
- Does not scan plugin directories at runtime
- Does not hardcode any repo as a mandatory dependency

If an agent invokes a skill that's not installed, the Skill tool returns an error — the agent handles it gracefully.

---

## Out of Scope

- Automatic plugin installation via `/init`
- Versioned skill manifests or compatibility checking
- New shura commands (no `/add-skills` command)
- Changes to the PM agent (PM doesn't implement code)
