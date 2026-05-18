# Skill Integration + Agent Hierarchy Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate external skill repos (alirezarezvani/claude-skills + affaan-m/everything-claude-code) via a stack-aware skill map, and remove the Engineering Manager layer so Product Owners become PM's direct reports and autonomous specialist hiring managers.

**Architecture:** A new `skill-map.json` file maps each of the 9 detected stacks to implementation skills (must_use + recommended) and specialist role definitions (each pointing to an external skill or a builtin agent file). `stack-detector.js` reads this map and returns the full result object. The `/init` skill asks users which skill repos they have installed. `/add-repo` writes the filtered catalogue to repo config. `/goal` and `/recover` now spawn PO agents (not EM agents) with all new placeholders injected. PO agents are rewritten as autonomous team leads who hire specialists by reading external skill content and dispatching it as subagent prompts.

**Tech Stack:** Node.js/ESM (`stack-detector.js`), JSON (`skill-map.json`, `.shura/*.json`), Markdown (all agent prompts and skill files)

**Specs:** `docs/superpowers/specs/2026-05-18-external-skill-integration-design.md` and `docs/superpowers/specs/2026-05-18-agent-hierarchy-redesign.md`

---

## File Map

| File | Action | Task |
|------|--------|------|
| `skills/add-repo/skill-map.json` | Create | 1 |
| `skills/add-repo/stack-detector.js` | Modify | 2 |
| `skills/add-repo/SKILL.md` | Modify | 3 |
| `skills/init/SKILL.md` | Modify | 4 |
| `agents/po.md` | Rewrite | 5 |
| `agents/program-manager.md` | Modify | 6 |
| `agents/templates/frontend.md` | Modify | 7 |
| `agents/templates/backend.md` | Modify | 7 |
| `agents/templates/fullstack.md` | Modify | 7 |
| `agents/templates/mobile.md` | Modify | 7 |
| `agents/templates/devops.md` | Modify | 7 |
| `agents/templates/data-ml.md` | Modify | 7 |
| `agents/templates/python.md` | Modify | 7 |
| `agents/templates/cpp.md` | Modify | 7 |
| `agents/templates/claude-code-plugin.md` | Modify | 7 |
| `agents/eng-manager.md` | Move → archive | 8 |
| `skills/goal/SKILL.md` | Modify | 9 |
| `skills/recover/SKILL.md` | Modify | 10 |
| `skills/shura/state-format.md` | Modify | 11 |
| `CLAUDE.md` | Modify | 12 |
| `README.md` | Modify | 12 |
| `skills/shura/SKILL.md` | Modify | 12 |

---

## Task 1: Create `skills/add-repo/skill-map.json`

**Files:**
- Create: `skills/add-repo/skill-map.json`

This is the foundation. All other tasks reference this file. The JSON maps each of the 9 stack types to three sections: `must_use` (skills Dev agents must invoke), `recommended` (skills to surface in prompts), and `specialist_roles` (role catalogue the PO uses when hiring).

**Important:** Skill names (e.g. `everything-claude-code:tdd`, `claude-skills:qa`) are best-guess values based on the repos' published descriptions. Before shipping, verify each name by checking the actual `name:` field in `SKILL.md` frontmatter in each repo. Update this file with corrected names as you discover them — wrong skill names cause the Skill tool to fail gracefully (not silently).

- [ ] **Step 1: Create the file**

```bash
# from the shura repo root
touch skills/add-repo/skill-map.json
```

- [ ] **Step 2: Write the full skill-map JSON**

Write this exact content to `skills/add-repo/skill-map.json`:

```json
{
  "frontend": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:frontend"
    ],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Accessibility Reviewer": {"source": "skill", "name": "claude-skills:engineering-core"},
      "Performance Engineer": {"source": "skill", "name": "claude-skills:engineering-core"}
    }
  },
  "backend": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:backend"
    ],
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
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:frontend",
      "claude-skills:backend"
    ],
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
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:engineering-core"
    ],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "devops": {
    "must_use": [],
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:devops"
    ],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Security Auditor": {"source": "skill", "name": "everything-claude-code:security-review"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"}
    }
  },
  "data-ml": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "claude-skills:rag-architect",
      "claude-skills:ml-pipeline",
      "everything-claude-code:security-review"
    ],
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
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:backend"
    ],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Architect": {"source": "skill", "name": "everything-claude-code:architect"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "cpp": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:security-review",
      "claude-skills:engineering-core"
    ],
    "specialist_roles": {
      "Developer": {"source": "builtin", "file": "agents/dev.md"},
      "Tester": {"source": "skill", "name": "claude-skills:qa"},
      "Security Reviewer": {"source": "skill", "name": "everything-claude-code:security-review"}
    }
  },
  "claude-code-plugin": {
    "must_use": ["everything-claude-code:tdd"],
    "recommended": [
      "everything-claude-code:mcp-server-builder",
      "everything-claude-code:security-review"
    ],
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

- [ ] **Step 3: Verify JSON is valid**

```bash
node -e "const m = JSON.parse(require('fs').readFileSync('skills/add-repo/skill-map.json','utf8')); console.log('Stacks:', Object.keys(m).join(', '))"
```

Expected output:
```
Stacks: frontend, backend, fullstack, mobile, devops, data-ml, python, cpp, claude-code-plugin
```

- [ ] **Step 4: Commit**

```bash
git add skills/add-repo/skill-map.json
git commit -m "feat(skill-map): create unified stack-to-skills-and-roles mapping"
```

---

## Task 2: Extend `skills/add-repo/stack-detector.js`

**Files:**
- Modify: `skills/add-repo/stack-detector.js`

The function currently returns a plain stack string. It needs to:
1. Accept `skillRepos` (array of `"<owner>/<repo>"` strings) as a second parameter
2. Load `skill-map.json` from the same directory
3. Derive namespace slugs from each installed repo slug (e.g. `"affaan-m/everything-claude-code"` → `"everything-claude-code"`)
4. Filter `must_use`, `recommended`, and `specialist_roles` to only include entries whose namespace prefix is in the installed set
5. Return `{stack, must_use_skills, recommended_skills, specialist_roles}` — never a plain string

- [ ] **Step 1: Write the full updated file**

Write this complete content to `skills/add-repo/stack-detector.js`:

```js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function deriveNamespace(repoSlug) {
  // "affaan-m/everything-claude-code" → "everything-claude-code"
  // "alirezarezvani/claude-skills" → "claude-skills"
  return repoSlug.split('/')[1];
}

function filterSkillNames(names, installedNamespaces) {
  if (!installedNamespaces.length) return [];
  return names.filter(name => installedNamespaces.includes(name.split(':')[0]));
}

function filterSpecialistRoles(roles, installedNamespaces) {
  const result = {};
  for (const [roleName, roleConfig] of Object.entries(roles)) {
    if (roleConfig.source === 'builtin') {
      result[roleName] = roleConfig;
    } else if (installedNamespaces.includes(roleConfig.name.split(':')[0])) {
      result[roleName] = roleConfig;
    }
  }
  return result;
}

async function detectStackType(repoPath) {
  try {
    // 1. claude-code-plugin: .claude-plugin/ directory exists
    if (await exists(path.join(repoPath, '.claude-plugin'))) {
      return 'claude-code-plugin';
    }

    // 2. data-ml: requirements.txt with ML keywords OR *.ipynb files exist
    const reqPath = path.join(repoPath, 'requirements.txt');
    if (await exists(reqPath)) {
      const content = (await fs.readFile(reqPath, 'utf8')).toLowerCase();
      const mlKeywords = ['tensorflow', 'torch', 'sklearn', 'scikit-learn', 'pandas', 'keras', 'jupyter', 'xgboost', 'lightgbm', 'mlflow'];
      if (mlKeywords.some(kw => content.includes(kw))) {
        return 'data-ml';
      }
    }
    const rootFiles = await fs.readdir(repoPath);
    if (rootFiles.some(f => f.endsWith('.ipynb'))) {
      return 'data-ml';
    }

    // 3. mobile: pubspec.yaml (Flutter) OR ios/ + android/ (React Native) OR Podfile (iOS native)
    if (await exists(path.join(repoPath, 'pubspec.yaml'))) {
      return 'mobile';
    }
    if (await exists(path.join(repoPath, 'ios')) && await exists(path.join(repoPath, 'android'))) {
      return 'mobile';
    }
    if (await exists(path.join(repoPath, 'Podfile'))) {
      return 'mobile';
    }

    // 4. cpp: CMakeLists.txt OR *.cmake files in repo root
    if (await exists(path.join(repoPath, 'CMakeLists.txt'))) {
      return 'cpp';
    }
    if (rootFiles.some(f => f.endsWith('.cmake'))) {
      return 'cpp';
    }

    // 5. fullstack: package.json with frontend framework dep AND api/server/backend directory
    const pkgPath = path.join(repoPath, 'package.json');
    const hasPkg = await exists(pkgPath);
    const frontendFrameworks = ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt'];

    let allDeps = {};
    if (hasPkg) {
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
      allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      const hasFrontendDep = frontendFrameworks.some(fw => allDeps[fw] !== undefined || Object.keys(allDeps).some(dep => dep.startsWith(fw + '/')));

      if (hasFrontendDep) {
        const hasServerDir = await exists(path.join(repoPath, 'api')) ||
          await exists(path.join(repoPath, 'server')) ||
          await exists(path.join(repoPath, 'backend'));
        if (hasServerDir) {
          return 'fullstack';
        }
      }
    }

    // 6. frontend: package.json with any frontend framework dep
    if (hasPkg) {
      const frontendAll = ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'gatsby'];
      const hasFrontendDep = frontendAll.some(fw => allDeps[fw] !== undefined || Object.keys(allDeps).some(dep => dep.startsWith(fw + '/')));
      if (hasFrontendDep) {
        return 'frontend';
      }
    }

    // 7. devops: Dockerfile or docker-compose.yml/yaml exists AND package.json does NOT exist
    const hasDockerfile = await exists(path.join(repoPath, 'Dockerfile'));
    const hasDockerCompose = await exists(path.join(repoPath, 'docker-compose.yml')) ||
      await exists(path.join(repoPath, 'docker-compose.yaml'));
    if ((hasDockerfile || hasDockerCompose) && !hasPkg) {
      return 'devops';
    }

    // 8. python: requirements.txt OR setup.py OR pyproject.toml exists
    if (await exists(path.join(repoPath, 'requirements.txt')) ||
      await exists(path.join(repoPath, 'setup.py')) ||
      await exists(path.join(repoPath, 'pyproject.toml'))) {
      return 'python';
    }

    // 9. backend — default fallback
    return 'backend';
  } catch {
    return 'backend';
  }
}

export async function detectStack(repoPath, skillRepos = []) {
  const stack = await detectStackType(repoPath);

  let skillMap = {};
  try {
    const mapPath = path.join(__dirname, 'skill-map.json');
    skillMap = JSON.parse(await fs.readFile(mapPath, 'utf8'));
  } catch {
    // skill-map not found — return stack with empty skill/role data
  }

  const entry = skillMap[stack] || { must_use: [], recommended: [], specialist_roles: {} };
  const installedNamespaces = skillRepos.map(deriveNamespace);

  return {
    stack,
    must_use_skills: filterSkillNames(entry.must_use || [], installedNamespaces),
    recommended_skills: filterSkillNames(entry.recommended || [], installedNamespaces),
    specialist_roles: filterSpecialistRoles(entry.specialist_roles || {}, installedNamespaces),
  };
}
```

- [ ] **Step 2: Verify the module parses without errors**

```bash
node --input-type=module <<'EOF'
import { detectStack } from './skills/add-repo/stack-detector.js';
const result = await detectStack('/tmp', []);
console.log('stack:', result.stack);
console.log('must_use_skills:', result.must_use_skills);
console.log('specialist_roles keys:', Object.keys(result.specialist_roles));
EOF
```

Expected output (no skill repos installed, falls back to backend with only builtin Developer):
```
stack: backend
must_use_skills: []
specialist_roles keys: [ 'Developer' ]
```

- [ ] **Step 3: Test with a skill repo installed**

```bash
node --input-type=module <<'EOF'
import { detectStack } from './skills/add-repo/stack-detector.js';
const result = await detectStack('/tmp', ['alirezarezvani/claude-skills', 'affaan-m/everything-claude-code']);
console.log('stack:', result.stack);
console.log('must_use_skills:', result.must_use_skills);
console.log('specialist_roles keys:', Object.keys(result.specialist_roles));
EOF
```

Expected output (backend stack, both repos installed):
```
stack: backend
must_use_skills: [ 'everything-claude-code:tdd' ]
specialist_roles keys: [ 'Developer', 'Tester', 'Architect', 'Database Engineer', 'Security Reviewer' ]
```

- [ ] **Step 4: Commit**

```bash
git add skills/add-repo/stack-detector.js
git commit -m "feat(stack-detector): return full skill+role object instead of plain string"
```

---

## Task 3: Update `skills/add-repo/SKILL.md`

**Files:**
- Modify: `skills/add-repo/SKILL.md`

Changes:
1. Before Step 3, add a new step to read `skill_repos` from project config
2. Step 3.5 (detect stack) now calls `detectStack(repoPath, skillRepos)` and writes the full result — replacing the old `team` field with `stack`, `must_use_skills`, `recommended_skills`, `specialist_roles`
3. Step 5 confirm output updated to show skills and roles instead of team

- [ ] **Step 1: Write the complete updated file**

Write this complete content to `skills/add-repo/SKILL.md`:

```markdown
---
name: add-repo
description: Use when the user runs /add-repo to connect a repository to the shura council.
---

# /add-repo — Register a Repository

Adds a repository to the council. All repos land in `repos/<slug>/` under the project directory, on a branch named after the project.

## Prerequisites

Run from inside the shura project directory (where `.shura/config.json` exists).

Read `.shura/config.json` to get:
- `name` (project slug) — used as the branch name
- `ticket` — for context
- `skill_repos` — list of installed skill repo slugs (may be empty or missing; default to `[]`)

## Step 1: Ask for repo details

> "Repository name? (human label, e.g. `Frontend App`)"

Derive slug: lowercase, spaces and underscores → hyphens, strip non-alphanumeric characters except hyphens.
Example: `"Frontend App"` → `frontend-app`

> "Is this a local repo path or a remote URL?"

Options:
- **Local** — path to an existing local git repo
- **Remote** — HTTPS or SSH clone URL

## Step 2A: Local Repo (git worktree)

> "Path to the local repo? (absolute or relative)"

Validate: path exists and contains a `.git` directory (or is a bare repo).

**Determine default branch of the source repo:**
```bash
git -C <source-path> symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null \
  | sed 's|origin/||' \
  || git -C <source-path> rev-parse --abbrev-ref HEAD
```
This gives `<base-branch>` (typically `main` or `master`).

**Create the worktree on a new branch:**
```bash
git -C <source-path> worktree add \
  <absolute-path-to-project>/repos/<slug> \
  -b <project-name> \
  <base-branch>
```

This creates a worktree at `repos/<slug>/` with a new branch named `<project-name>` branching off `<base-branch>`.

**If the branch already exists** in the source repo, ask:
> "Branch `<project-name>` already exists in this repo. Use it as-is, or abort?"

## Step 2B: Remote Repo (clone)

> "Clone URL?"

**Clone the repo:**
```bash
git clone <url> <absolute-path-to-project>/repos/<slug>
```

**Determine default branch:**
```bash
git -C <absolute-path-to-project>/repos/<slug> \
  symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null \
  | sed 's|origin/||' \
  || echo "main"
```

**Create and switch to project branch:**
```bash
git -C <absolute-path-to-project>/repos/<slug> \
  checkout -b <project-name> origin/<base-branch>
```

## Step 3: Detect stack and build team catalogue

After the repo is checked out/cloned, run stack detection.

Read `skill_repos` from `.shura/config.json` (default `[]` if missing).

Call the stack detector:

```js
import { detectStack } from './stack-detector.js';
const result = await detectStack(repoPath, skillRepos);
// result = { stack, must_use_skills, recommended_skills, specialist_roles }
```

The stack detector reads `skill-map.json` (in the same directory) and filters results to only include skills from installed repos. If `skillRepos` is empty, only `source: "builtin"` specialist entries survive (always at least `Developer`).

## Step 4: Write repo config

Create directory `.shura/repos/<slug>/` and write `.shura/repos/<slug>/config.json`:

```json
{
  "slug": "<slug>",
  "name": "<display-name>",
  "type": "<local|remote>",
  "source": "<source-path-or-url>",
  "path": "<absolute-path-to-project>/repos/<slug>",
  "branch": "<project-name>",
  "status": "ready",
  "epic": "",
  "stack": "<result.stack>",
  "must_use_skills": ["<result.must_use_skills entries>"],
  "recommended_skills": ["<result.recommended_skills entries>"],
  "specialist_roles": {
    "<role-name>": {"source": "<builtin|skill>", "file": "<path-if-builtin>", "name": "<skill-name-if-skill>"}
  },
  "graph_report": ""
}
```

Use the actual values from `result`. Write `must_use_skills` and `recommended_skills` as JSON arrays (may be empty `[]`). Write `specialist_roles` as the filtered object from `result.specialist_roles`.

Update `.shura/config.json`: set `status` to `"repos-added"` (unless it's already `"goal-set"` or later — don't downgrade).

## Step 5: Index the repo with graphify

Check if graphify is installed:
```bash
graphify --version
```

**If installed:**
1. Run the indexer inside the worktree/clone:
   ```bash
   cd <repo.path> && graphify .
   ```
2. The report lands at `<repo.path>/graphify-out/GRAPH_REPORT.md`
3. Update `.shura/repos/<slug>/config.json`: add `"graph_report": "<repo.path>/graphify-out/GRAPH_REPORT.md"`

**If not installed:**
- Warn:
  > "graphify not found — repo knowledge graph unavailable. Agents will explore the codebase without a pre-built index. Install with: `uv tool install graphifyy && graphify install`"
- Set `"graph_report": ""` in config

## Step 6: Confirm

```
✓ Repo registered: <name>

  Slug:    <slug>
  Path:    repos/<slug>/
  Branch:  <project-name>
  Type:    <Local worktree | Remote clone>
  Stack:   <detected-stack>
  Skills:  <N> recommended, <M> must-use  [or: "none (no skill repos configured)"]
  Roles:   <role1>, <role2>, ...  [or: "Developer only (no skill repos configured)"]
  Graph:   <GRAPH_REPORT.md path | "not indexed (graphify not installed)">

Run /add-repo again to add more repos, or /goal to set the mission.
```

For Skills line: if `must_use_skills` and `recommended_skills` are both empty, show `"none (no skill repos configured)"`.
For Roles line: list the keys of `specialist_roles`. If only `Developer` is present, show `"Developer only (no skill repos configured)"`.

## Error Handling

- **Worktree path already exists:** warn and ask to skip or overwrite
- **Clone fails:** show git error, ask user to verify URL and credentials
- **Source path has no .git:** error — not a valid git repository
```

- [ ] **Step 2: Verify key sections are present**

```bash
grep -n "skill_repos\|specialist_roles\|must_use_skills\|recommended_skills" skills/add-repo/SKILL.md
```

Expected: at least 6 matches across the file.

- [ ] **Step 3: Commit**

```bash
git add skills/add-repo/SKILL.md
git commit -m "feat(add-repo): use detectStack object, write skill+role fields to repo config"
```

---

## Task 4: Update `skills/init/SKILL.md`

**Files:**
- Modify: `skills/init/SKILL.md`

Add a new step (after ticket ID, before creating directories) that asks for installed skill repos. Write the result to `config.json` as `skill_repos`.

- [ ] **Step 1: Write the complete updated file**

Write this complete content to `skills/init/SKILL.md`:

```markdown
---
name: init
description: Use when the user runs /init to start a new shura project.
---

# /init — Initialize Shura Project

Creates the project directory and `.shura/` state.

## Prerequisites

Run from the directory where you want the project created.

## Step 1: Ask for project name

> "What's the project name? (Used as the directory name and branch name — no spaces, e.g. `payment-revamp`)"

Validate: lowercase letters, numbers, hyphens only. If the user gives a name with spaces or mixed case, suggest the normalized form and confirm.

Normalization: lowercase → replace spaces and underscores with hyphens → strip non-alphanumeric characters except hyphens.

## Step 2: Check for existing project

If `<project-name>/.shura/config.json` already exists in the current directory, warn:
> "A shura project named '<project-name>' already exists here. Do you want to overwrite it?"
Wait for confirmation before continuing.

## Step 3: Ask for ticket ID

> "Ticket ID? (e.g. PROJ-1234, or press enter to skip)"

Accept any string or empty input. If empty, store `"none"`.

## Step 4: Ask for installed skill repos

> "Which external skill repos do you have installed as Claude Code plugins?
> (comma-separated owner/repo slugs, e.g. alirezarezvani/claude-skills, affaan-m/everything-claude-code — press enter to skip)"

Accept a comma-separated list or empty input.

Normalize each entry:
- Strip whitespace around commas
- Validate format `<owner>/<repo>` — each part must be non-empty
- If invalid format given, warn and ask again
- If empty input, store `[]`

Store the result as an array of strings, e.g.:
```json
["alirezarezvani/claude-skills", "affaan-m/everything-claude-code"]
```

## Step 5: Create directory structure

```bash
mkdir -p <project-name>/repos
mkdir -p <project-name>/.shura/repos
```

## Step 6: Write `.shura/config.json`

```json
{
  "name": "<project-name>",
  "ticket": "<ticket-id-or-none>",
  "created": "<current-ISO-8601-timestamp>",
  "status": "initialized",
  "goal": "",
  "branch_suffix": "",
  "goals": [],
  "skill_repos": ["<repo-slug-1>", "<repo-slug-2>"]
}
```

Use the actual current timestamp in ISO 8601 format (e.g., `2026-05-17T19:04:00Z`).
If no skill repos were entered, write `"skill_repos": []`.

## Step 7: Confirm

Display:
```
✓ Shura project initialized

  Name:    <project-name>
  Ticket:  <ticket-id>
  Path:    ./<project-name>/
  Skills:  <N> skill repo(s) configured  [or: "none configured"]

Next steps:
  /add-repo  — add repositories to the council
  /goal      — state the mission once repos are added
```

## Notes

- The project directory is created in the current working directory
- All subsequent commands (`/add-repo`, `/goal`, `/recover`) must be run from inside `<project-name>/`
- The `repos/` subdirectory is where worktrees and clones will live
- `.shura/` holds state only — not code
- `skill_repos` can be updated later by editing `.shura/config.json` directly — rerun `/add-repo` after changing it to refresh the per-repo skill catalogue
```

- [ ] **Step 2: Verify key sections are present**

```bash
grep -n "skill_repos\|Step 4\|Step 5\|Step 6\|Step 7" skills/init/SKILL.md
```

Expected: Lines for Step 4 (skill repos question), Step 5 (mkdir), Step 6 (config write with `skill_repos`), Step 7 (confirm).

- [ ] **Step 3: Commit**

```bash
git add skills/init/SKILL.md
git commit -m "feat(init): ask for skill_repos at project creation, write to config"
```

---

## Task 5: Rewrite `agents/po.md`

**Files:**
- Modify: `agents/po.md`

The PO is now the team lead — PM's direct report, epic owner, push coordinator, and autonomous specialist hiring manager. This is a complete rewrite.

- [ ] **Step 1: Write the complete new file**

Write this complete content to `agents/po.md`:

```markdown
# Product Owner Agent Prompt

Fill all `{placeholders}` before dispatching. Required: `{plugin_dir}`, `{decisions_log}`, `{specialist_roles_json}`.

---

You are the Product Owner for **{repo_name}** in the Shura council. You are a **team lead** — not just a task-breaker. You own the epic, hire the team, coordinate execution, handle push, and report directly to the Program Manager.

## Project
{project_name} ({ticket_id})

## Your Repository
- Path: `{repo_path}`
- Branch: `{branch}`
- Stack: `{stack}`
- Knowledge graph: `{graph_report}`

If the knowledge graph path is non-empty: **read it before exploring the repo**. One read maps the full codebase; dozens of `find`/`cat` calls do not.

## Mission (for context)
{goal}

## Your Epic (assigned by Program Manager)
{epic}

## Constraints
- Never contact another repo's PO or Devs directly — cross-repo coordination goes through the Program Manager
- Never write code or commit to the repo yourself — implementation is Developers' responsibility
- Never assign work based on cross-repo assumptions; escalate to PM if you need cross-repo information

## Communication Rules
- Report TO: Program Manager (directly — there is no Engineering Manager)
- Manage: Developer(s) and any specialists you hire
- Board escalation: escalate directly to Program Manager → PM convenes all POs for a Product Board session

## Workflow
1. Read the knowledge graph (if available), then explore `{repo_path}` to understand existing structure
2. Assess which specialists the epic requires (see Hiring Catalogue below)
3. Hire an Architect first if the epic involves significant structural changes
4. Break the epic into tasks; hand tasks to Developers and specialists
5. Track completion; re-assign or re-spawn if blocked
6. When all tasks are done and tests pass, run Push Protocol
7. Report completion to Program Manager

## Decision Log
Your team's decisions log: `{decisions_log}`

**On startup:** If the file exists, read it — prior decisions are recorded here. Do not re-open what is already resolved.

**When making a decision** (task breakdown, scope call, specialist hiring choice, design tradeoff): append an entry:

```
### {ISO-8601-timestamp} | Product Owner
**Decision:** {one-line summary}
**Context:** {what triggered this}
**Rationale:** {why}
**Alternatives rejected:** {if any}

---
```

## Hiring Catalogue

Available specialists for your stack (`{stack}`):

```json
{specialist_roles_json}
```

**To hire a specialist with `source: "builtin"`:**
- Read the file at `{plugin_dir}/{file}` (e.g. `{plugin_dir}/agents/dev.md`)
- Fill the standard placeholders (see Spawning a Developer below for the full list)
- Dispatch as a subagent

**To hire a specialist with `source: "skill"`:**
- Locate the skill file in the installed plugin's directory. Plugin directories are typically under `~/.claude/plugins/cache/`. Search for the plugin name in that path, then find `skills/<skill-name>/SKILL.md`.
- Read that SKILL.md file — this is the specialist's core instructions
- Dispatch a new Agent with this content as the main instructions + the Shura Context Block (below) appended at the end
- Do NOT use the Skill tool to load specialist content — you need the raw file text to inject into a subagent, not to load it into your own context

**Shura Context Block** (append to every specialist dispatch):

```
---
## Shura Council Context
You are a specialist in the Shura council.
Repo path: {repo_path}
Branch: {branch}
Project: {project_name} ({ticket_id})
Epic: {epic}
Decisions log: {decisions_log}
Knowledge graph: {graph_report}

On startup: read the decisions log if it exists. Understand prior decisions before acting.
When making decisions: append to the decisions log in the standard format (### ISO-timestamp | Your-Role).
Report all outputs and completion to your Product Owner.
---
```

Fill `{repo_path}`, `{branch}`, `{project_name}`, `{ticket_id}`, `{epic}`, `{decisions_log}`, `{graph_report}` with the actual values when constructing the specialist's prompt.

## Spawning a Developer

Developers use the builtin agent file. Read `{plugin_dir}/agents/dev.md`. Fill these placeholders:

- `{decisions_log}` → {decisions_log}
- `{repo_name}` → {repo_name}
- `{repo_path}` → {repo_path}
- `{branch}` → {branch}
- `{task_description}` → the specific task
- `{files_list}` → files likely to change
- `{acceptance_criteria}` → your criteria
- `{definition_of_done}` → specific, testable outcome
- `{test_command}` → appropriate test command for this repo
- `{graph_report}` → {graph_report}
- `{skill_repos}` → {skill_repos}
- `{must_use_skills}` → {must_use_skills}
- `{recommended_skills}` → {recommended_skills}

Then dispatch the Developer as a subagent.

## Task Format

Every task you give a Developer or specialist must include:

```
Task: {clear, specific description}
Files likely to change:
  - {file1}
  - {file2}
Acceptance criteria:
  - {criterion — must be testable}
Definition of done: {specific, verifiable outcome}
```

## Spawning Additional Developers

If two tasks can run in parallel (different files, no shared state), dispatch a second Developer simultaneously.

## Escalation to Program Manager

Escalate when:
- The epic conflicts with the existing repo architecture (after Architect assessment)
- Cross-repo information is required
- Two valid approaches exist and you need a call above your authority
- You are blocked after 3 attempts

Escalation format:
```
Escalating to Program Manager
Issue: {one-line description}
Context: {relevant background}
Question: {what decision do you need?}
```

## Participating in a Product Board Session

When the Program Manager brings a cross-repo issue to you, you are in a board session.

**Round 1 — Your perspective:**
```
Repo: {repo_name}
Stake: {how this issue affects your work or timeline}
Position: {what outcome you need or prefer, and why}
```

**Round 2 — Peer exchange:**
When the PM shares all POs' perspectives: read each position, address conflicts directly, state whether you agree or need adjustment.

## Push Protocol

When all tasks are done and all tests pass:
1. Ask the Developer for the test command they used
2. Re-run tests: `cd {repo_path} && <test command>`
3. If tests pass: `git -C {repo_path} push origin {branch}`
4. Notify Program Manager: "Repo {repo_name} complete, branch `{branch}` pushed. Specialists used: {list}."

## Completion Report to Program Manager

```
Epic complete: {epic summary}
Branch pushed: {branch}
Tasks completed: {N}
Specialists used: {list of roles hired}
All tests passing: yes/no
Ready for integration: yes
```
```

- [ ] **Step 2: Verify key sections are present**

```bash
grep -n "Hiring Catalogue\|Push Protocol\|Board Session\|specialist_roles_json\|Shura Context Block" agents/po.md
```

Expected: at least 5 matches.

- [ ] **Step 3: Commit**

```bash
git add agents/po.md
git commit -m "feat(po): rewrite as autonomous team lead with specialist hiring catalogue"
```

---

## Task 6: Update `agents/program-manager.md`

**Files:**
- Modify: `agents/program-manager.md`

Surgical find/replace: EMs → POs throughout. Board meeting participants change from EMs to POs. Constraints updated. The stakeholder meeting output contract and decisions log format are unchanged.

- [ ] **Step 1: Replace "Engineering Manager" references with "Product Owner"**

Make these exact replacements in `agents/program-manager.md`:

| Old text | New text |
|----------|----------|
| `Council — Engineering Managers` | `Council — Product Owners` |
| `Never talk to POs or Devs directly — your direct reports are Engineering Managers only` | `Never talk to Devs or Specialists directly — your direct reports are Product Owners` |
| `All cross-repo decisions go through the Board; never resolve a cross-repo conflict unilaterally without convening one` | `All cross-repo decisions go through the Product Board; never resolve a cross-repo conflict unilaterally without convening one` |
| `coordinate Engineering Managers` | `coordinate Product Owners` |
| `brief all Engineering Managers` | `brief all Product Owners` |
| `all Engineering Managers + you` | `all Product Owners + you` |
| `all EMs + PM` | `all POs + PM` |
| `each Engineering Manager` | `each Product Owner` |
| `every other EM` | `every other PO` |
| `escalating EM` | `escalating PO` |
| `every EM` | `every PO` |
| `each EM` | `each PO` |
| `the one who escalated` | `the PO who escalated` |
| `Engineering Manager (EM)` | `Product Owner (PO)` |
| `EM Briefing Format` | `PO Briefing Format` |

The `{repo_list}` format comment in the PM prompt is unchanged — the format string itself doesn't need updating.

- [ ] **Step 2: Verify EM references are gone**

```bash
grep -n "Engineering Manager\|EM\b" agents/program-manager.md | grep -v "^[0-9]*:.*PO\|^[0-9]*:.*Product Owner"
```

Expected: 0 lines (all EM references should now be PO).

If any remain, fix them manually.

- [ ] **Step 3: Commit**

```bash
git add agents/program-manager.md
git commit -m "feat(program-manager): replace EM layer with PO as direct reports"
```

---

## Task 7: Update all 9 `agents/templates/*.md`

**Files:**
- Modify: `agents/templates/frontend.md`
- Modify: `agents/templates/backend.md`
- Modify: `agents/templates/fullstack.md`
- Modify: `agents/templates/mobile.md`
- Modify: `agents/templates/devops.md`
- Modify: `agents/templates/data-ml.md`
- Modify: `agents/templates/python.md`
- Modify: `agents/templates/cpp.md`
- Modify: `agents/templates/claude-code-plugin.md`

Each template gets three changes:
1. YAML frontmatter: `roles.mandatory` becomes `[Product Owner]`; `roles.optional` becomes `roles.catalogue` listing available specialist names
2. Body: remove EM role description section
3. Body: replace "Optional Roles" section with "Hiring Catalogue" section giving guidance on when to hire each role

Write each file completely (all 9 shown below):

- [ ] **Step 1: Write `agents/templates/frontend.md`**

```markdown
---
stack: frontend
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Accessibility Reviewer
    - Performance Engineer
---

# Frontend Team Template

Used for `frontend` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements UI features and fixes. Follows existing component structure, styling conventions, and test suite. Commits changes and reports to PO.

### Architect (hire when: significant structural changes, new component library, or routing redesign)
Produces a technical design document scoped to the epic. Delivers decisions the Developer can implement without gaps.

### Tester (hire when: critical user flows affected, coverage gaps in existing suite, or after major feature addition)
Writes and runs tests for the affected UI flows. Delivers a test coverage report and any new test files.

### Accessibility Reviewer (hire when: new UI components, form changes, or navigation changes)
Audits output against WCAG criteria. Delivers concrete remediation steps for the Developer.

### Performance Engineer (hire when: bundle size or render performance is a concern for this epic)
Profiles and identifies bottlenecks. Provides actionable recommendations scoped to epic changes.
```

- [ ] **Step 2: Write `agents/templates/backend.md`**

```markdown
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

# Backend Team Template

Used for `backend` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements API endpoints, business logic, and service integrations. Follows existing module structure, error-handling conventions, and test suite. Commits changes and reports to PO.

### Architect (hire when: new services, significant API redesign, cross-service dependencies, or ambiguous implementation path)
Produces a technical design scoped to the epic. Delivers interface contracts and implementation guidance the Developer can follow directly.

### Tester (hire when: critical business logic affected, coverage gaps, or integration paths untested)
Writes and runs tests for affected endpoints and business logic. Delivers test coverage report and new test files.

### Database Engineer (hire when: schema migrations required, query performance concerns, or new data models)
Designs migrations and reviews query patterns for the epic. Delivers migration scripts and index recommendations.

### Security Reviewer (hire when: auth/authz changes, new external APIs, new dependencies, or data exposure paths)
Audits authentication, authorization, input validation, and dependency exposure. Delivers findings with severity ratings and remediation guidance.
```

- [ ] **Step 3: Write `agents/templates/fullstack.md`**

```markdown
---
stack: fullstack
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

# Full-Stack Team Template

Used for `fullstack` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements both frontend UI and backend API changes. Follows existing conventions end-to-end. Commits changes and reports to PO.

### Architect (hire when: full-stack feature requiring new data models + UI flows, or significant structural changes to either layer)
Designs the end-to-end approach — data model, API contract, UI flow — before implementation begins. Delivers a doc the Developer can follow without interpretation gaps.

### Tester (hire when: critical user-facing flows affected, or end-to-end integration is untested)
Writes and runs tests covering both API and UI behavior for the epic. Delivers coverage report.

### Database Engineer (hire when: schema changes required or query performance is a concern)
Designs migrations and reviews query patterns. Delivers migration scripts and recommendations.

### Security Reviewer (hire when: auth flows, new APIs, or sensitive data access paths are changed)
Audits the full-stack change for security issues. Delivers findings with remediation guidance.
```

- [ ] **Step 4: Write `agents/templates/mobile.md`**

```markdown
---
stack: mobile
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Security Reviewer
---

# Mobile Team Template

Used for `mobile` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements mobile UI features, platform integrations, and business logic. Follows existing patterns, platform conventions, and test suite. Commits changes and reports to PO.

### Architect (hire when: new screens or navigation flows, significant state management changes, or cross-platform concerns)
Designs the mobile implementation approach — navigation, state, platform APIs — before coding begins. Delivers a design the Developer can follow directly.

### Tester (hire when: critical flows affected, platform-specific behavior untested, or regression risk is high)
Writes and runs tests for affected flows. Delivers a coverage report.

### Security Reviewer (hire when: auth changes, local data storage, new network requests, or permissions changes)
Audits mobile-specific security concerns — local storage, keychain, network calls, permissions. Delivers findings with remediation.
```

- [ ] **Step 5: Write `agents/templates/devops.md`**

```markdown
---
stack: devops
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Security Auditor
    - Architect
---

# DevOps Team Template

Used for `devops` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements infrastructure changes, CI/CD pipeline updates, Dockerfile or compose changes, and deployment scripts. Follows existing conventions. Commits changes and reports to PO.

### Architect (hire when: new deployment topology, significant pipeline redesign, or introducing new infrastructure components)
Designs the infrastructure approach before implementation. Delivers an architecture document the Developer can implement without gaps.

### Security Auditor (hire when: any changes to network exposure, access controls, secrets management, or dependency updates)
Audits infrastructure changes for security issues — exposed ports, IAM policies, secrets, supply chain. Delivers findings with severity and remediation guidance.
```

- [ ] **Step 6: Write `agents/templates/data-ml.md`**

```markdown
---
stack: data-ml
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - ML Engineer
    - Data Architect
    - Tester
    - Security Reviewer
---

# Data / ML Team Template

Used for `data-ml` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements data pipelines, model training scripts, evaluation harnesses, and inference code. Follows existing experiment-tracking and coding conventions. Commits changes and reports to PO.

### ML Engineer (hire when: model architecture changes, training pipeline modifications, or new evaluation harness needed)
Designs and implements ML-specific components — loss functions, training loops, model architectures. Delivers working, tested code the Developer can integrate.

### Data Architect (hire when: new data sources, schema redesigns, retrieval system changes, or RAG pipeline modifications)
Designs data models, pipeline topology, and retrieval strategies. Delivers a technical design the Developer can implement directly.

### Tester (hire when: model output quality needs validation, data pipeline correctness is critical, or regression risk is high)
Writes and runs tests covering pipeline correctness and model output quality for the epic.

### Security Reviewer (hire when: new data sources, external APIs, model serving endpoints, or user data is involved)
Audits data handling and serving infrastructure. Delivers findings with remediation guidance.
```

- [ ] **Step 7: Write `agents/templates/python.md`**

```markdown
---
stack: python
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Security Reviewer
---

# Python Team Template

Used for `python` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements Python modules, scripts, and services. Follows existing package structure, naming conventions, and test suite (pytest/unittest). Commits changes and reports to PO.

### Architect (hire when: new modules, service decomposition, or ambiguous implementation approach)
Designs the Python package structure, interface contracts, and implementation approach. Delivers a design document the Developer can follow directly.

### Tester (hire when: critical business logic affected, coverage gaps, or new public APIs added)
Writes and runs pytest tests for the affected code. Delivers coverage report and new test files.

### Security Reviewer (hire when: web endpoints, external HTTP calls, file I/O, or user input processing is changed)
Audits for injection, deserialization, dependency, and input validation issues. Delivers findings with remediation.
```

- [ ] **Step 8: Write `agents/templates/cpp.md`**

```markdown
---
stack: cpp
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Security Reviewer
---

# C++ Team Template

Used for `cpp` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements C++ changes following existing build system conventions (CMake), code style, and test suite. Commits changes and reports to PO.

### Tester (hire when: critical logic affected, undefined behavior risk, or coverage gaps in the test suite)
Writes and runs tests using the project's test framework (Google Test, Catch2, etc.). Delivers coverage report and new test files.

### Security Reviewer (hire when: memory management changes, external input parsing, network code, or new dependencies)
Audits for memory safety, integer overflow, injection, and unsafe API usage. Delivers findings with remediation.
```

- [ ] **Step 9: Write `agents/templates/claude-code-plugin.md`**

```markdown
---
stack: claude-code-plugin
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Technical Writer
    - Security Reviewer
---

# Claude Code Plugin Team Template

Used for `claude-code-plugin` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements skill entry points, helper modules, and plugin scaffolding using ES module conventions. Follows SKILL.md frontmatter format, existing file layout under `skills/`, and the project's test suite. Commits changes and reports to PO.

### Architect (hire when: new skill categories, significant refactoring of plugin layout, or introducing agent templates)
Designs the plugin structure — skill organization, placeholder conventions, agent hierarchy. Delivers a design the Developer can implement without gaps.

### Tester (hire when: skill dispatch logic changes, new agent prompts added, or regression risk is high)
Writes and runs tests for affected skill logic and agent dispatch. Delivers coverage report.

### Technical Writer (hire when: new commands, new skills, or agent hierarchy changes need user-facing documentation)
Updates README, CLAUDE.md, and skill/agent documentation. Ensures docs match actual behavior — no duplication of frontmatter content into prose.

### Security Reviewer (hire when: new external tool invocations, plugin manifest changes, or MCP server components added)
Audits plugin security — manifest scopes, tool permissions, external API calls. Delivers findings with remediation.
```

- [ ] **Step 10: Verify no EM references remain in any template**

```bash
grep -rn "Engineering Manager\|\bEM\b" agents/templates/
```

Expected: 0 matches.

- [ ] **Step 11: Commit**

```bash
git add agents/templates/
git commit -m "feat(templates): remove EM layer, add PO-led catalogue with hiring guidance"
```

---

## Task 8: Archive `agents/eng-manager.md`

**Files:**
- Create: `agents/archive/eng-manager.md` (moved from `agents/eng-manager.md`)
- Delete: `agents/eng-manager.md`

The EM agent prompt is archived for reference. It is no longer dispatched by any skill.

- [ ] **Step 1: Create the archive directory and move the file**

```bash
mkdir -p agents/archive
git mv agents/eng-manager.md agents/archive/eng-manager.md
```

- [ ] **Step 2: Verify the move**

```bash
ls agents/archive/
ls agents/eng-manager.md 2>/dev/null && echo "ERROR: file still exists" || echo "OK: file moved"
```

Expected:
```
eng-manager.md
OK: file moved
```

- [ ] **Step 3: Commit**

```bash
git add agents/archive/eng-manager.md
git commit -m "chore(agents): archive eng-manager.md — EM layer removed"
```

---

## Task 9: Update `skills/goal/SKILL.md`

**Files:**
- Modify: `skills/goal/SKILL.md`

Step 7 currently reads `agents/eng-manager.md` and spawns EM agents. Change to read `agents/po.md` and spawn PO agents with all new placeholders. The announce text and confirm message also update.

- [ ] **Step 1: Replace Step 7 in `skills/goal/SKILL.md`**

Find this section (starting at "## Step 7: Auto-launch all repo teams"):

```markdown
## Step 7: Auto-launch all repo teams

Immediately after saving epics, launch the teams without waiting for user input.

Announce:
> "Epics confirmed and saved. Launching all repo teams now..."

Read `agents/eng-manager.md` from the plugin directory identified in step 4.

For each repo, fill `agents/eng-manager.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory
- `{decisions_log}` → absolute path to `.shura/repos/<slug>/decisions.md`
- `{graph_report}` → `repo.graph_report` (empty string if graphify was not run)

Dispatch ALL Engineering Manager agents simultaneously — send multiple Agent tool calls in a single message.

Update `.shura/config.json`: set `status` to `"running"`.

Confirm:
```
✓ All {N} teams launched.

Each team is running independently:
  Engineering Manager → spawns PO → PO spawns Dev(s)

Use /get-manager to talk to the Program Manager and track progress.
When teams complete, they will push their branches and notify you directly.
```

## Notes
```

Replace it with:

```markdown
## Step 7: Auto-launch all repo teams

Immediately after saving epics, launch the teams without waiting for user input.

Announce:
> "Epics confirmed and saved. Launching all repo teams now..."

Read `agents/po.md` from the plugin directory identified in step 4.

For each repo, fill `agents/po.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory
- `{decisions_log}` → absolute path to `.shura/repos/<slug>/decisions.md`
- `{graph_report}` → `repo.graph_report` (empty string if graphify was not run)
- `{stack}` → `repo.stack` (empty string if not set — older repos without stack detection)
- `{skill_repos}` → `config.skill_repos` joined as comma-separated string (or `"none"` if empty)
- `{must_use_skills}` → `repo.must_use_skills` formatted as bullet list (`"  - skill1\n  - skill2"`) or empty string
- `{recommended_skills}` → `repo.recommended_skills` formatted as bullet list or empty string
- `{specialist_roles_json}` → `JSON.stringify(repo.specialist_roles, null, 2)` (or `"{}"` if not set)

Dispatch ALL Product Owner agents simultaneously — send multiple Agent tool calls in a single message.

Update `.shura/config.json`: set `status` to `"running"`.

Confirm:
```
✓ All {N} teams launched.

Each team is running independently:
  Product Owner → hires specialists and Developers as needed

Use /get-manager to talk to the Program Manager and track progress.
When teams complete, they will push their branches and notify you directly.
```

## Notes
```

- [ ] **Step 2: Verify the change**

```bash
grep -n "agents/po.md\|agents/eng-manager\|specialist_roles_json\|Product Owner agents" skills/goal/SKILL.md
```

Expected: lines referencing `agents/po.md`, `specialist_roles_json`, and `Product Owner agents`. No reference to `agents/eng-manager`.

- [ ] **Step 3: Commit**

```bash
git add skills/goal/SKILL.md
git commit -m "feat(goal): spawn PO agents directly; inject skill+role placeholders"
```

---

## Task 10: Update `skills/recover/SKILL.md`

**Files:**
- Modify: `skills/recover/SKILL.md`

Step 4 currently reads `agents/eng-manager.md` and dispatches EM agents. Same changes as Task 9: switch to `agents/po.md`, add all new placeholders. Also update Step 3 announce text.

- [ ] **Step 1: Replace Step 2 "Load agent prompt" in `skills/recover/SKILL.md`**

Find:
```markdown
**2. Load all agent prompt templates**

Find the shura plugin directory (two levels up from `skills/recover/`). Read:
- `agents/eng-manager.md`

(The Engineering Manager will read `agents/po.md` itself when spawning the PO; the PO will read `agents/dev.md` itself when spawning Devs.)
```

Replace with:
```markdown
**2. Load all agent prompt templates**

Find the shura plugin directory (two levels up from `skills/recover/`). Read:
- `agents/po.md`

(The Product Owner will read `agents/dev.md` itself when spawning Developers, and will load specialist skills from installed plugin directories as needed.)
```

- [ ] **Step 2: Replace Step 3 announce text in `skills/recover/SKILL.md`**

Find:
```markdown
```
Recovering shura council for: {project_name}
Repositories: {N} repos
  {for each repo: - {name} | branch: {branch}}

Re-launching all teams simultaneously...
```
```

Replace with:
```markdown
```
Recovering shura council for: {project_name}
Repositories: {N} repos
  {for each repo: - {name} | branch: {branch}}

Re-launching all Product Owner agents simultaneously...
```
```

- [ ] **Step 3: Replace Step 4 placeholder list in `skills/recover/SKILL.md`**

Find:
```markdown
For each repo, fill `agents/eng-manager.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory (two levels up from `skills/recover/`)
- `{decisions_log}` → absolute path to `.shura/repos/<slug>/decisions.md`
- `{graph_report}` → `repo.graph_report` (empty string if graphify was not run)

Dispatch ALL Engineering Manager agents simultaneously — send multiple Agent tool calls in a single message. Do not wait for one to finish before dispatching the next.
```

Replace with:
```markdown
For each repo, fill `agents/po.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`
- `{plugin_dir}` → absolute path to the shura plugin directory (two levels up from `skills/recover/`)
- `{decisions_log}` → absolute path to `.shura/repos/<slug>/decisions.md`
- `{graph_report}` → `repo.graph_report` (empty string if graphify was not run)
- `{stack}` → `repo.stack` (empty string if not set)
- `{skill_repos}` → `config.skill_repos` joined as comma-separated string (or `"none"` if empty)
- `{must_use_skills}` → `repo.must_use_skills` as bullet list or empty string
- `{recommended_skills}` → `repo.recommended_skills` as bullet list or empty string
- `{specialist_roles_json}` → `JSON.stringify(repo.specialist_roles, null, 2)` (or `"{}"` if not set)

Dispatch ALL Product Owner agents simultaneously — send multiple Agent tool calls in a single message. Do not wait for one to finish before dispatching the next.
```

- [ ] **Step 4: Replace Step 6 confirm message**

Find:
```markdown
```
✓ All {N} teams re-launched.

Each team is running:
  Engineering Manager (EM) → will spawn PO → PO will spawn Dev(s)

Use /get-manager to talk to the Program Manager and track overall progress.
When teams complete, they will push their branches and notify the Program Manager.
```
```

Replace with:
```markdown
```
✓ All {N} teams re-launched.

Each team is running:
  Product Owner (PO) → will hire Developers and specialists as needed

Use /get-manager to talk to the Program Manager and track overall progress.
When teams complete, they will push their branches and notify the Program Manager.
```
```

- [ ] **Step 5: Verify no EM references remain**

```bash
grep -n "Engineering Manager\|eng-manager\|\bEM\b" skills/recover/SKILL.md
```

Expected: 0 matches.

- [ ] **Step 6: Commit**

```bash
git add skills/recover/SKILL.md
git commit -m "feat(recover): spawn PO agents; inject skill+role placeholders"
```

---

## Task 11: Update `skills/shura/state-format.md`

**Files:**
- Modify: `skills/shura/state-format.md`

Document all new config fields: `skill_repos` in project config; `stack`, `must_use_skills`, `recommended_skills`, `specialist_roles` in repo config; remove `team` field from repo config schema.

- [ ] **Step 1: Update project config schema**

In the `.shura/config.json` Schema section, find the example JSON block and add `skill_repos`:

Old example:
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
  ]
}
```

New example (add `skill_repos` after `goals`):
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

Add to the Fields list below that example:
```
- `skill_repos` — array of `<owner>/<repo>` slugs for installed skill plugins; controls which skills and specialist roles are surfaced to agents; `[]` if none configured
```

- [ ] **Step 2: Update repo config schema**

Replace the existing `.shura/repos/<slug>/config.json` example with:

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

Update the Fields list to replace the old `team`-related entries with:
```
- `stack` — detected stack type string (`frontend`, `backend`, etc.); written at `/add-repo` time
- `must_use_skills` — skill names agents must invoke (e.g. TDD); empty array if no skill repos configured
- `recommended_skills` — stack-relevant skill names for agent context; empty array if no skill repos configured
- `specialist_roles` — map of role name → `{source, file|name}` filtered to installed repos; always contains at least `Developer` (builtin)
```

Remove any reference to the old `team` field if present.

- [ ] **Step 3: Verify key terms appear**

```bash
grep -n "skill_repos\|specialist_roles\|must_use_skills\|recommended_skills" skills/shura/state-format.md
```

Expected: at least 6 matches.

- [ ] **Step 4: Commit**

```bash
git add skills/shura/state-format.md
git commit -m "docs(state-format): document skill_repos, stack, specialist_roles schema fields"
```

---

## Task 12: Update `CLAUDE.md`, `README.md`, and `skills/shura/SKILL.md`

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`
- Modify: `skills/shura/SKILL.md`

Documentation pass: update dispatch chain, placeholder list, hierarchy diagram.

- [ ] **Step 1: Update `CLAUDE.md`**

Replace the Agent Communication Protocol dispatch chain:

Old:
```
skill → dispatches → Engineering Manager
                           └─ dispatches → Product Owner
                                               └─ dispatches → Developer(s)
```

New:
```
skill → dispatches → Product Owner
                           └─ dispatches → Developer(s) and Specialists
```

Replace the "Key placeholders" section. Add the new placeholders after `{graph_report}` and `{decisions_log}`:

```
- `{stack}` — detected stack type for this repo; empty string for repos registered before stack detection was added
- `{skill_repos}` — comma-separated list of installed skill repo slugs; `"none"` if empty
- `{must_use_skills}` — newline-separated bullet list of skills Dev agents must invoke; empty string if none
- `{recommended_skills}` — newline-separated bullet list of stack-recommended skill names; empty string if none
- `{specialist_roles_json}` — JSON string of `specialist_roles` object from repo config; passed to PO for its hiring catalogue
```

Update the Team Templates section:

Old:
```
- `roles.mandatory`: list of required roles for this stack
- `roles.optional`: list of optional roles
```

New:
```
- `roles.mandatory`: always `[Product Owner]` — PO is the only role guaranteed for every stack
- `roles.catalogue`: list of specialist roles available for this stack (PO hires from this list on-demand)
```

Update the Agent Communication Protocol section heading from "EM, PO, Dev" to "PO, Dev, Specialists":
```
Key placeholders present in all agent tiers (PO, Dev, Specialists):
```

- [ ] **Step 2: Update `README.md` — hierarchy diagram**

Find the Agent Hierarchy section and replace the ASCII diagram. Old:
```
User ─── /get-manager ──► Program Manager (PM)
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
             Engineering    Engineering  Engineering
             Manager (EM)   Manager (EM) Manager (EM)
```

New:
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

- [ ] **Step 3: Update `README.md` — Team Templates table**

Replace the Mandatory Roles column to reflect the new structure:

Old table:
```markdown
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
```

New table:
```markdown
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
```

- [ ] **Step 4: Update `README.md` — Optional Skill Repos section**

Find or add after the graphify section a new "Optional Skill Repos" section:

```markdown
### Optional: External Skill Repos (recommended)

Shura integrates with external Claude Code skill plugins to give your agent teams domain expertise. When installed, Product Owners can hire specialists backed by these skills.

**[claude-skills](https://github.com/alirezarezvani/claude-skills)** — 313+ engineering, product, ML, and compliance skills

**[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** — 232 skills, 60 specialized agents, TDD workflows, security scanning

Install each as a Claude Code plugin, then declare them when running `/init`:
```

- [ ] **Step 5: Update `skills/shura/SKILL.md` — hierarchy and command table**

Update the Agent Hierarchy diagram from:
```
User
 └─ Program Manager (PM)        (/get-manager)
      ├─ Engineering Manager (EM) A   (one per repo)
      │    └─ Product Owner (PO) A
      │         └─ Dev A1, Dev A2 (PO can spawn more)
      ├─ Engineering Manager (EM) B
      │    └─ Product Owner (PO) B
      │         └─ Dev B1
      └─ ...
```

To:
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

Update the Communication Rules section — remove the EM ↔ EM and EM → PO lines:

Old:
```
- **User speaks only to Program Manager (PM)**
- **PM ↔ EM** — bidirectional; PM runs board meetings
- **EM ↔ EM** — peer communication during Board sessions only
- **EM → PO** (assignments); **PO → EM** (escalations only)
- **PO → Dev** — assigns tasks; Dev escalates up if blocked
- **Board meeting** — triggered when any EM escalates; all EMs + PM attend
```

New:
```
- **User speaks only to Program Manager (PM)**
- **PM ↔ PO** — bidirectional; PM runs Product Board meetings
- **PO ↔ PO** — peer communication during Product Board sessions only
- **PO → Specialists/Dev** — PO hires and assigns; Specialists/Dev escalate up if blocked
- **Product Board meeting** — triggered when any PO escalates; all POs + PM attend
```

Update the Glossary — remove EM row, update PO row:

Old:
```
| PM | Program Manager — user's only touchpoint; coordinates all teams |
| EM | Engineering Manager — one per repo; owns the epic, spawns PO |
| PO | Product Owner — breaks epic into tasks, manages and spawns Devs |
```

New:
```
| PM | Program Manager — user's only touchpoint; coordinates all POs |
| PO | Product Owner — one per repo; owns the epic, hires specialists, pushes branch |
| Dev | Developer agent — executes tasks; can be spawned dynamically for parallelism |
| Specialist | On-demand agent (Tester, Architect, Tech Writer, etc.) hired by PO from external skill repos |
```

- [ ] **Step 6: Verify no EM references remain in updated docs**

```bash
grep -rn "Engineering Manager\|\bEM\b" CLAUDE.md README.md skills/shura/SKILL.md
```

Expected: 0 matches. Fix any that remain.

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md README.md skills/shura/SKILL.md
git commit -m "docs: update hierarchy, placeholders, and team structure for PO-led redesign"
```

---

## Self-Review Checklist

Before declaring the plan complete, verify coverage against both specs:

**From `external-skill-integration-design.md`:**
- [x] Task 1: `skill-map.json` created with `must_use`, `recommended`, `specialist_roles` per stack
- [x] Task 2: `stack-detector.js` returns full object, filters by installed repos
- [x] Task 3: `add-repo/SKILL.md` writes all new fields
- [x] Task 4: `init/SKILL.md` asks for `skill_repos`
- [x] Tasks 9–10: goal + recover pass `{skill_repos}`, `{must_use_skills}`, `{recommended_skills}`
- [x] Task 11: state-format documents `skill_repos`, new repo fields
- [x] Task 12: CLAUDE.md documents new placeholders

**From `agent-hierarchy-redesign.md`:**
- [x] Task 5: `po.md` rewritten as team lead with hiring catalogue + push protocol + board meeting
- [x] Task 6: `program-manager.md` updated — EMs → POs
- [x] Task 7: All 9 stack templates updated — EM removed, catalogue added
- [x] Task 8: `eng-manager.md` archived
- [x] Tasks 9–10: goal + recover spawn PO agents, pass `{stack}`, `{specialist_roles_json}`
- [x] Task 12: README hierarchy diagram + shura SKILL.md updated

**Placeholder scan:** No TBD, TODO, or "similar to Task N" anywhere in this plan.

**Type consistency:** `specialist_roles` JSON format is consistent across skill-map.json (Task 1), stack-detector.js return value (Task 2), repo config (Task 3), state-format.md (Task 11), and po.md hiring catalogue (Task 5).
