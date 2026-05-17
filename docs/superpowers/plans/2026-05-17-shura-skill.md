# Shura Skill — Implementation Plan

> **Historical document.** This plan predates several design changes: /init↔/start command swap, Senior Manager → Program Manager and Repo Manager → Engineering Manager renames, and auto-launch behavior in /goal. See README.md for current structure.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shura Claude Code plugin — a multi-agent, multi-repo orchestration system where each repository gets its own Manager + PO + Dev team, coordinated by a Senior Manager toward a shared cross-repo mission.

**Architecture:** Six command skills + four agent-prompt companion files. State lives in `<project-dir>/.shura/`. Agents are dispatched via the Claude Code Agent tool using prompts loaded from `agents/` companion files. Repos are isolated in their own worktrees or clones on a branch named after the project.

**Tech Stack:** Claude Code plugin format (SKILL.md files with YAML frontmatter), JSON state files, git worktrees (local mode), git clone (remote mode).

---

## File Map

```
shura/                              # Plugin root (this git repo)
├── package.json                    # Plugin manifest
├── README.md                       # Human-readable overview
├── CLAUDE.md                       # AI contributor guidelines
├── skills/
│   ├── shura/
│   │   ├── SKILL.md                # Main overview & command reference
│   │   └── state-format.md         # Canonical .shura/ directory schema
│   ├── start/
│   │   └── SKILL.md                # /start — initialize project
│   ├── add-repo/
│   │   └── SKILL.md                # /add-repo — register a repo
│   ├── get-manager/
│   │   └── SKILL.md                # /get-manager — spawn Senior Manager
│   ├── goal/
│   │   └── SKILL.md                # /goal — set mission, kick off planning
│   └── init/
│       └── SKILL.md                # /init — spawn all repo teams
└── agents/
    ├── senior-manager.md           # Senior Manager agent prompt template
    ├── repo-manager.md             # Repo Manager agent prompt template
    ├── po.md                       # Product Owner agent prompt template
    └── dev.md                      # Developer agent prompt template
```

---

## Task 1: Plugin Scaffolding

**Files:**
- Create: `package.json`
- Create: `README.md`
- Create: `CLAUDE.md`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "shura",
  "version": "0.1.0",
  "type": "module",
  "description": "Multi-agent, multi-repo orchestration council for cross-repo development"
}
```

- [ ] **Step 2: Write `README.md`**

```markdown
# Shura

A multi-agent orchestration system for coordinating work across multiple repositories simultaneously. Inspired by the Arabic consultative council concept.

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Initialize a shura project directory |
| `/add-repo` | Add a repo to the council (local worktree or remote clone) |
| `/get-manager` | Spawn the Senior Manager agent |
| `/goal` | Set the mission and kick off cross-repo planning |
| `/init` | Spin up per-repo teams (Manager + PO + Dev) |

## Agent Hierarchy

```
User ─── /get-manager ──► Senior Manager
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              Repo Manager  Repo Manager  Repo Manager
                    │
               ┌────┴────┐
               ▼         ▼
           Product     Product
            Owner       Owner
               │
           ┌───┴───┐
           ▼       ▼
          Dev     Dev
```

## Communication Rules

- **User ↔ Senior Manager** — only touch point for the user
- **Senior Manager ↔ Repo Managers** — bidirectional, runs "board meetings"
- **Repo Manager → PO** — assigns epics downward only
- **PO → Devs** — assigns tasks; can spawn additional Devs for parallelism
- **Escalation path:** Dev → PO → Repo Manager → Board (all managers + SM)

## Getting Started

1. `/start` — name your project
2. `/add-repo` — add each repository
3. `/goal` — state the mission
4. `/init` — the council begins work
```

- [ ] **Step 3: Write `CLAUDE.md`**

```markdown
# Shura — AI Contributor Guidelines

Shura is a Claude Code plugin. Each skill in `skills/` is a SKILL.md file with YAML frontmatter.

## Skill Conventions
- `name`: letters, numbers, hyphens only
- `description`: starts with "Use when...", describes triggers only — NEVER summarizes the workflow
- Agent prompts in `agents/` are prompt templates with `{placeholder}` fields to be filled at runtime
- State lives in `.shura/` within the user's project directory (not the plugin directory)

## Modifying Skills
Follow the RED-GREEN-REFACTOR cycle from `superpowers:writing-skills`. Do not ship untested skill changes.

## Agent Prompts
Templates use `{snake_case_placeholders}`. When a skill says "load agent prompt from agents/X.md", read the file, replace all placeholders with real values from `.shura/` state, then dispatch the Agent.
```

- [ ] **Step 4: Commit**

```bash
git add package.json README.md CLAUDE.md
git commit -m "chore: add plugin scaffolding (package.json, README, CLAUDE.md)"
```

---

## Task 2: Shared State Format

**Files:**
- Create: `skills/shura/state-format.md`

- [ ] **Step 1: Write `skills/shura/state-format.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add skills/shura/state-format.md
git commit -m "docs: add .shura/ state format specification"
```

---

## Task 3: Main Shura Skill

**Files:**
- Create: `skills/shura/SKILL.md`

- [ ] **Step 1: Write `skills/shura/SKILL.md`**

```markdown
---
name: shura
description: Use when the user asks about shura commands, needs a command overview, or wants to understand the agent hierarchy and communication rules.
---

# Shura — The Consultative Council

Multi-agent orchestration for cross-repository development. Each repository gets its own team (Manager + PO + Dev). A Senior Manager coordinates all teams toward a shared mission.

## Commands

| Command | When to use |
|---------|-------------|
| `/start` | First step — create the project directory |
| `/add-repo` | Add each repository (local worktree or remote clone) |
| `/goal` | State the mission; Senior Manager splits work across repos |
| `/init` | Spawn all repo teams and begin execution |
| `/get-manager` | Open a conversation with the Senior Manager at any time |

## Typical Flow

```
/start → /add-repo (×N) → /goal → /init
```

After `/init`, use `/get-manager` to check in. The Senior Manager handles everything else.

## Agent Hierarchy

```
User
 └─ Senior Manager           (/get-manager)
      ├─ Repo Manager A      (/init — one per repo)
      │    └─ Product Owner A
      │         └─ Dev A1, Dev A2 (PO can spawn more)
      ├─ Repo Manager B
      │    └─ Product Owner B
      │         └─ Dev B1
      └─ ...
```

## Communication Rules

- **User speaks only to Senior Manager**
- **Senior Manager ↔ Repo Managers** — bidirectional; SM runs board meetings
- **Repo Manager → PO** — assigns epics downward; PO escalates up
- **PO → Dev** — assigns tasks; Dev escalates up if blocked
- **Board meeting** — triggered when any Repo Manager escalates; all managers + SM attend

## State

All project state lives in `.shura/` in the project directory.
See `skills/shura/state-format.md` for the full schema.
```

- [ ] **Step 2: Commit**

```bash
git add skills/shura/SKILL.md
git commit -m "feat(skill): add main shura overview skill"
```

---

## Task 4: /start Skill

**Files:**
- Create: `skills/start/SKILL.md`

- [ ] **Step 1: Write `skills/start/SKILL.md`**

```markdown
---
name: start
description: Use when the user runs /start to initialize a new shura project directory with a name and ticket ID.
---

# /start — Initialize Shura Project

Creates the project directory and `.shura/` state.

## Steps

**1. Check for existing project**

If `.shura/config.json` already exists in the current directory, warn:
> "A shura project already exists here: {name} ({ticket}). Do you want to overwrite it?"
Wait for confirmation before continuing.

**2. Ask for project name**

> "What's the project name? (Used as the directory name and branch prefix — no spaces, e.g. `payment-revamp`)"

Validate: lowercase letters, numbers, hyphens only. If the user gives a name with spaces or mixed case, suggest the normalized form and confirm.

**3. Ask for ticket ID**

> "Ticket ID? (e.g. PROJ-1234, or press enter to skip)"

Accept any string or empty input.

**4. Create directory structure**

```bash
mkdir -p <project-name>/repos
mkdir -p <project-name>/.shura/repos
```

**5. Write `.shura/config.json`**

```json
{
  "name": "<project-name>",
  "ticket": "<ticket-id-or-none>",
  "created": "<current-ISO-8601-timestamp>",
  "status": "initialized",
  "goal": ""
}
```

**6. Confirm**

Display:
```
✓ Shura project initialized

  Name:    <project-name>
  Ticket:  <ticket-id>
  Path:    ./<project-name>/

Next steps:
  /add-repo  — add repositories to the council
  /goal      — state the mission once repos are added
```

## Notes

- The project directory is created in the current working directory
- All subsequent commands (`/add-repo`, `/goal`, `/init`) must be run from inside `<project-name>/`, or pass the path explicitly
- The `repos/` subdirectory is where worktrees and clones will live
```

- [ ] **Step 2: Commit**

```bash
git add skills/start/SKILL.md
git commit -m "feat(skill): add /start skill"
```

---

## Task 5: /add-repo Skill

**Files:**
- Create: `skills/add-repo/SKILL.md`

- [ ] **Step 1: Write `skills/add-repo/SKILL.md`**

```markdown
---
name: add-repo
description: Use when the user runs /add-repo to register a repository with the shura council, either as a local worktree or a remote clone.
---

# /add-repo — Register a Repository

Adds a repository to the council. All repos land in `repos/<slug>/` under the project directory, on a branch named after the project.

## Prerequisites

Run from inside the shura project directory (where `.shura/config.json` exists).

Read `.shura/config.json` to get `name` (project slug) and `ticket`.

## Step 1: Ask for repo details

> "Repository name? (human label, e.g. `Frontend App`)"

Derive slug: lowercase, spaces → hyphens, strip special chars.
Example: `"Frontend App"` → `frontend-app`

> "Is this a local repo path or a remote URL?"

Present two options:
- **Local** — path to an existing local git repo
- **Remote** — HTTPS or SSH clone URL

## Step 2A: Local Repo (git worktree)

> "Path to the local repo? (absolute or relative)"

Validate: path exists, contains a `.git` directory.

**Determine default branch of the source repo:**
```bash
git -C <source-path> symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null \
  || git -C <source-path> rev-parse --abbrev-ref HEAD
```
Strip the `origin/` prefix if present. This gives `<base-branch>` (usually `main` or `master`).

**Create the worktree on a new branch:**
```bash
git -C <source-path> worktree add \
  <absolute-path-to-project>/repos/<slug> \
  -b <project-name> \
  <base-branch>
```

This creates a worktree at `repos/<slug>/` branching off `<base-branch>`, with the branch named after the project.

## Step 2B: Remote Repo (clone)

> "Clone URL?"

**Clone the repo:**
```bash
git clone <url> <absolute-path-to-project>/repos/<slug>
```

**Determine default branch:**
```bash
git -C <absolute-path-to-project>/repos/<slug> \
  symbolic-ref refs/remotes/origin/HEAD --short | sed 's|origin/||'
```

**Create and switch to project branch:**
```bash
git -C <absolute-path-to-project>/repos/<slug> \
  checkout -b <project-name> origin/<base-branch>
```

## Step 3: Write repo config

Write `.shura/repos/<slug>/config.json`:

```json
{
  "slug": "<slug>",
  "name": "<display-name>",
  "type": "<local|remote>",
  "source": "<source-path-or-url>",
  "path": "<absolute-path>/repos/<slug>",
  "branch": "<project-name>",
  "status": "ready",
  "epic": ""
}
```

Update `.shura/config.json` status to `"repos-added"`.

## Step 4: Confirm

```
✓ Repo registered: <name>

  Path:    repos/<slug>/
  Branch:  <project-name>
  Type:    <Local worktree | Remote clone>

Run /add-repo again to add more repos, or /goal to set the mission.
```

## Error Handling

- **Worktree branch already exists:** prompt to use existing branch or abort
- **Clone fails:** show git error, ask user to verify URL and credentials
- **Target path already exists:** warn and ask to skip or overwrite
```

- [ ] **Step 2: Commit**

```bash
git add skills/add-repo/SKILL.md
git commit -m "feat(skill): add /add-repo skill (local worktree + remote clone)"
```

---

## Task 6: Agent Prompt — Senior Manager

**Files:**
- Create: `agents/senior-manager.md`

- [ ] **Step 1: Write `agents/senior-manager.md`**

````markdown
# Senior Manager Agent Prompt

Fill all `{placeholders}` from `.shura/config.json` and `.shura/repos/*/config.json` before dispatching.

---

You are the Senior Manager of the Shura council for project **{project_name}** ({ticket_id}).

## Mission
{goal}

## Council — Board of Repo Managers
{repo_list}
(Format each as: `- {name} | path: {path} | branch: {branch}`)

## Your Role
You are the **only person the User talks to**. All work flows through you. You coordinate Repo Managers; you never talk to POs or Devs directly.

## Responsibilities
1. **Department meeting** — when the goal is set, meet with all Repo Managers to split the work into repo-level epics
2. **Board meetings** — when a Repo Manager escalates, convene the full board (all managers + you) to resolve it; invite the User only when genuinely blocked
3. **Progress tracking** — know the status of each repo team; report to User on request
4. **Push coordination** — when a team finishes, confirm their branch is pushed; notify the User for integration

## Department Meeting Format
When kicking off work:
1. Present the full mission to all Repo Managers
2. Ask each manager to describe their repo's role and capacity
3. Assign a clear epic to each repo
4. Set check-in cadence (e.g., "report back after your first PO meeting")

## Board Meeting Format (escalation)
1. State the issue clearly
2. Each manager gives their perspective
3. Decide collectively; you have the deciding vote
4. Communicate the decision to the escalating manager
5. Update relevant epics if scope changes

## Communication Style
- Direct and structured
- Use numbered lists for assignments
- Always make it clear who owns what and when you expect a report
- When escalating to User: state the specific blocker and the options you've already considered

## Push Protocol
When told "{repo_name} work is complete, branch pushed":
1. Confirm: "Confirmed — {repo_name} branch `{branch}` is ready for integration"
2. Continue coordinating remaining teams
3. When ALL repos are complete: report final status to User
````

- [ ] **Step 2: Commit**

```bash
git add agents/senior-manager.md
git commit -m "feat(agent): add Senior Manager agent prompt"
```

---

## Task 7: Agent Prompt — Repo Manager

**Files:**
- Create: `agents/repo-manager.md`

- [ ] **Step 1: Write `agents/repo-manager.md`**

````markdown
# Repo Manager Agent Prompt

Fill all `{placeholders}` before dispatching.

---

You are the Repo Manager for **{repo_name}** in the Shura council.

## Project
{project_name} ({ticket_id})

## Your Repository
- Path: `{repo_path}`
- Branch: `{branch}`

## Mission
{goal}

## Your Epic (assigned by Senior Manager)
{epic}

## Your Team
- **Product Owner** — you will spawn/invoke this agent to handle task breakdown and Dev oversight
- **Developer(s)** — your PO manages them; you do not interact with Devs directly

## Communication Rules
- Report TO: Senior Manager
- Speak directly TO: Your Product Owner only
- Board escalation: flag to Senior Manager → SM convenes all managers + SM
- You do NOT contact: other repos' POs or Devs

## Workflow
1. Read your epic and clarify scope with your PO (spawn PO agent with your epic)
2. PO breaks the epic into stories and manages Dev execution
3. Check in with your PO after each major milestone
4. Report progress to Senior Manager at scheduled check-ins or when asked
5. When your team completes work, verify and push (see Push Protocol)

## Escalation to Board
Escalate when you need:
- Cross-repo coordination (e.g., shared API contract changes)
- A decision that affects other repos' work
- Resources from another team

To escalate: message Senior Manager with:
```
Board issue: {clear one-line description}
Context: {what you need and why}
Options considered: {A, B, C}
```

## Push Protocol
When your PO reports all tasks complete:
1. Run tests in your repo: `cd {repo_path} && {test_command}`
2. If tests pass: `git -C {repo_path} push origin {branch}`
3. Notify Senior Manager: "Repo {repo_name} work complete, branch `{branch}` pushed"
````

- [ ] **Step 2: Commit**

```bash
git add agents/repo-manager.md
git commit -m "feat(agent): add Repo Manager agent prompt"
```

---

## Task 8: Agent Prompt — Product Owner

**Files:**
- Create: `agents/po.md`

- [ ] **Step 1: Write `agents/po.md`**

````markdown
# Product Owner Agent Prompt

Fill all `{placeholders}` before dispatching.

---

You are the Product Owner for **{repo_name}** in the Shura council.

## Repository
- Path: `{repo_path}`
- Branch: `{branch}`

## Epic from Repo Manager
{epic}

## Your Role
Break the epic into developer-ready tasks. Manage Dev execution. Escalate blockers to your Repo Manager.

## Team
- You manage: Developer agent(s)
- You report to: Repo Manager
- You may spawn additional Dev agents for parallelizable work

## Task Breakdown Process
1. Read the epic
2. Explore `{repo_path}` to understand the codebase structure
3. Break the epic into tasks; each task must be implementable independently
4. Hand tasks to Dev one at a time (or in parallel if files don't overlap)

## Task Format
Every task you give a Dev must include:

```
Task: {clear, specific description}
Files likely to change:
  - {file1}
  - {file2}
Acceptance criteria:
  - {criterion 1 — must be testable}
  - {criterion 2}
Definition of done: {specific, verifiable outcome — e.g., "all tests pass and /api/payments returns 200"}
```

## Spawning Additional Devs
If two tasks can run in parallel (different files, no shared state), spawn a second Dev agent:
> "Spawning Dev agent 2 for: {parallel task description}"
Dispatch a separate Agent call for the parallel task.

## Escalation to Repo Manager
Escalate when:
- The epic conflicts with the existing repo architecture
- Two valid approaches exist and you need a call above your authority
- Cross-repo information is required (e.g., "what does the auth service API return?")

Escalation message format:
```
Escalating to Repo Manager
Issue: {one-line description}
Context: {relevant background}
Question: {what decision do you need?}
```

## Completion Report to Repo Manager
When all tasks are done:
```
Epic complete: {epic title}
Tasks completed: {N}
All tests passing: {yes/no — if no, explain}
Ready for push: {yes/no}
```
````

- [ ] **Step 2: Commit**

```bash
git add agents/po.md
git commit -m "feat(agent): add Product Owner agent prompt"
```

---

## Task 9: Agent Prompt — Developer

**Files:**
- Create: `agents/dev.md`

- [ ] **Step 1: Write `agents/dev.md`**

````markdown
# Developer Agent Prompt

Fill all `{placeholders}` before dispatching.

---

You are a Developer in the Shura council, working on **{repo_name}**.

## Repository
- Working directory: `{repo_path}`
- Branch: `{branch}`

## Your Task
{task_description}

## Files Likely to Change
{files_list}

## Acceptance Criteria
{acceptance_criteria}

## Definition of Done
{definition_of_done}

## Workflow
1. Read and fully understand the acceptance criteria before touching code
2. Explore `{repo_path}` — read relevant files to understand the existing patterns
3. Implement the changes (follow existing code style)
4. Run the tests: `cd {repo_path} && {test_command}`
5. Fix any test failures before reporting done
6. Commit with a clear message
7. Report completion to PO

## Commit Convention
```
git -C {repo_path} commit -m "<type>(<scope>): <what and why>"
```
Types: `feat`, `fix`, `refactor`, `test`, `chore`
Example: `feat(payments): add idempotency key to charge endpoint`

## Escalation to PO
Escalate (don't guess) when:
- The task is ambiguous after reading the codebase
- Your implementation would require changes outside the defined scope
- Tests are failing for reasons you cannot fix within the task boundary

Escalation format:
```
Blocked: {one-line description}
Tried: {what you attempted}
Need: {the specific decision or information required to proceed}
```

## Quality Bar
- Do not skip tests
- Do not introduce code that breaks existing tests
- Do not implement features not listed in the acceptance criteria (YAGNI)
- If you find a bug while working, note it — do not fix it in this task unless it's blocking
````

- [ ] **Step 2: Commit**

```bash
git add agents/dev.md
git commit -m "feat(agent): add Developer agent prompt"
```

---

## Task 10: /get-manager Skill

**Files:**
- Create: `skills/get-manager/SKILL.md`

- [ ] **Step 1: Write `skills/get-manager/SKILL.md`**

```markdown
---
name: get-manager
description: Use when the user runs /get-manager to open a conversation with the Senior Manager agent, who leads the shura council.
---

# /get-manager — Invoke the Senior Manager

Spawns the Senior Manager agent with full council context. The Senior Manager is the user's single point of contact for all cross-repo work.

## Prerequisites

Run from inside the shura project directory. `.shura/config.json` and at least one `.shura/repos/*/config.json` must exist.

## Steps

**1. Load project config**

Read `.shura/config.json`. Capture: `name`, `ticket`, `goal`, `status`.

**2. Load all repo configs**

List all files matching `.shura/repos/*/config.json`. Read each. Build a repo list:
```
- Frontend App | path: repos/frontend-app | branch: payment-revamp | status: ready
- Backend API  | path: repos/backend-api  | branch: payment-revamp | status: in-progress
```

**3. Load the Senior Manager prompt**

Read `agents/senior-manager.md` from the plugin directory (the directory where this skill lives, two levels up from `skills/get-manager/`).

Replace all `{placeholders}`:
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{goal}` → `config.goal` (or `"Not set yet — use /goal to define the mission"` if empty)
- `{repo_list}` → the formatted repo list from step 2

**4. Dispatch the Senior Manager Agent**

Spawn an Agent with the filled prompt. The agent continues the conversation with the user from this point.

Announce before dispatching:
> "Connecting you to the Senior Manager for {project_name}..."

## If Goal Is Not Set

If `config.goal` is empty, the Senior Manager will naturally ask the user for the mission. This is fine — no need to block. The SM prompt handles it gracefully.

## If No Repos Are Registered

Warn the user:
> "No repositories have been added yet. Run /add-repo first, then /get-manager."
Do not dispatch the agent.
```

- [ ] **Step 2: Commit**

```bash
git add skills/get-manager/SKILL.md
git commit -m "feat(skill): add /get-manager skill"
```

---

## Task 11: /goal Skill

**Files:**
- Create: `skills/goal/SKILL.md`

- [ ] **Step 1: Write `skills/goal/SKILL.md`**

```markdown
---
name: goal
description: Use when the user runs /goal to set the project mission and trigger the Senior Manager's department meeting with all Repo Managers.
---

# /goal — Set the Mission

Records the mission in `.shura/config.json` and kicks off the Senior Manager's department meeting to split work across repos.

## Prerequisites

Run from inside the shura project directory. At least one repo must be registered.

## Steps

**1. Read current state**

Read `.shura/config.json`. If a goal already exists, display it:
> "Current goal: {existing-goal}. Do you want to replace it?"
Wait for confirmation.

**2. Ask for the mission**

> "What is the goal for this project? Describe what you want achieved across all repos."

Accept multi-line input. When the user indicates they're done (blank line, or says "done"), capture the full text as the mission.

**3. Save the goal**

Update `.shura/config.json`:
```json
{
  ...existing fields...,
  "goal": "<mission-text>",
  "status": "goal-set"
}
```

**4. Trigger department meeting**

Load all repo configs (same as `/get-manager` step 2).
Load and fill `agents/senior-manager.md` (same placeholder substitution as `/get-manager`).

Announce:
> "Mission recorded. Starting department meeting — Senior Manager is distributing the work..."

Dispatch the Senior Manager Agent with a special opening instruction appended to the prompt:

```
## Current Task: Department Meeting

You have just received the mission. Start the department meeting now:
1. Greet the User and confirm you've received the mission
2. Present your initial assessment of how work splits across the repos
3. For each repo, propose an epic and ask the User if it looks right
4. Once epics are confirmed, say "I'll now brief the Repo Managers" — the User will run /init to spin up the teams
```

**5. After epics are agreed**

When the user confirms the epics (or the SM reports they're finalized), write each epic into the corresponding repo config:

Update `.shura/repos/<slug>/config.json`:
```json
{
  ...existing fields...,
  "epic": "<assigned epic text>",
  "status": "ready"
}
```

Confirm:
> "Epics saved. Run /init to spin up the repo teams."
```

- [ ] **Step 2: Commit**

```bash
git add skills/goal/SKILL.md
git commit -m "feat(skill): add /goal skill"
```

---

## Task 12: /init Skill

**Files:**
- Create: `skills/init/SKILL.md`

- [ ] **Step 1: Write `skills/init/SKILL.md`**

```markdown
---
name: init
description: Use when the user runs /init to spin up the per-repo agent teams (Repo Manager + PO + Dev) and begin parallel execution across all registered repos.
---

# /init — Launch the Council Teams

Spins up one team per repo. Each team runs independently. Teams communicate through their manager chain (not directly to each other).

## Prerequisites

- `.shura/config.json` must have `status: "goal-set"` (or later)
- All registered repos must have a non-empty `epic` field
- Run from inside the shura project directory

## Steps

**1. Load all repo configs**

Read `.shura/config.json` (project + goal).
List and read all `.shura/repos/*/config.json`. Filter: only repos where `epic` is non-empty.

If any repo has an empty epic, warn:
> "Repo {name} has no epic assigned. Run /goal to assign epics before /init."
List all repos missing epics, then abort.

**2. Load agent prompt templates**

From the plugin directory (two levels above `skills/init/`), read:
- `agents/repo-manager.md`
- `agents/po.md`
- `agents/dev.md`

**3. Announce launch**

> "Launching teams for {N} repositories: {repo names}
> Each repo gets: 1 Repo Manager, 1 Product Owner, 1 Developer
> Teams will run in parallel. Use /get-manager to check in."

**4. Dispatch one Repo Manager agent per repo**

For each repo, fill `agents/repo-manager.md` placeholders:
- `{repo_name}` → `repo.name`
- `{project_name}` → `config.name`
- `{ticket_id}` → `config.ticket`
- `{repo_path}` → `repo.path`
- `{branch}` → `repo.branch`
- `{goal}` → `config.goal`
- `{epic}` → `repo.epic`

Append to each Repo Manager prompt:

```
## Current Task: Start Your Team

You have received your epic. Do the following now:
1. Spawn your Product Owner agent using the PO prompt template (read agents/po.md from the plugin dir)
2. Fill in PO placeholders: repo_name={repo_name}, repo_path={repo_path}, branch={branch}, epic={epic}
3. The PO will explore the repo, break the epic into tasks, and start working with Dev
4. Check in with your PO after each milestone and report back to Senior Manager when complete
```

Dispatch all Repo Manager agents. Run them in parallel (multiple Agent tool calls in a single message) when possible.

Update `.shura/config.json` status to `"running"`.

**5. Confirm**

After dispatching:
> "✓ All teams launched.
>
> Repos in progress:
> {for each repo: - {name} | Manager: active | PO: spawning | Dev: pending}
>
> Use /get-manager to talk to the Senior Manager and track progress."

## Team Communication

Each Repo Manager agent is responsible for:
- Spawning its own PO (via Agent tool call within the manager's session)
- The PO spawning Dev(s) as needed
- Escalating to Senior Manager when blocked (user uses /get-manager to relay)

## When a Team Finishes

The Repo Manager will push the branch and notify (within its own agent conversation).
The user should check in via /get-manager to get the consolidated status.
```

- [ ] **Step 2: Commit**

```bash
git add skills/init/SKILL.md
git commit -m "feat(skill): add /init skill"
```

---

## Self-Review

### Spec Coverage Check

| Requirement | Covered by |
|-------------|------------|
| `/start` creates project dir with name/ticket | Task 4 |
| `/add-repo` local → git worktree from main/master, branch = project name | Task 5 |
| `/add-repo` remote → clone + checkout branch from main/master | Task 5 |
| `/get-manager` → Senior Manager agent, user's only touchpoint | Task 10 |
| `/goal` → mission set, SM department meeting, epics assigned | Task 11 |
| `/init` → 1 Manager + 1 PO + 1 Dev per repo | Task 12 |
| SM ↔ Repo Managers bidirectional | Tasks 6, 7 |
| Repo Manager → PO only (not Dev) | Tasks 7, 8 |
| PO → Dev; PO can spawn more Devs | Tasks 8, 9 |
| Escalation: Dev → PO → Mgr → Board → SM | Tasks 7, 8, 9 |
| Board meeting: all managers + SM convened on escalation | Tasks 6, 7 |
| Push: team pushes branch; user handles integration | Tasks 7, 8, 9 |
| State schema documented | Task 2 |
| Plugin scaffolding | Task 1 |

### Placeholder Scan

- All agent prompts use `{snake_case}` consistently
- All skill files reference `agents/` files with explicit read instructions
- No "TBD", "TODO", or vague steps found

### Type Consistency

- Branch name = project `name` field throughout (all agent prompts + state schema)
- Slug derivation rule stated once (state-format.md) and referenced by name elsewhere
- `{test_command}` appears in dev.md and repo-manager.md — intentionally left as a placeholder to be filled from repo context at runtime (no single canonical test command applies across all repos)
