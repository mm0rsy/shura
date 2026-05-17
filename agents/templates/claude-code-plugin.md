---
stack: claude-code-plugin
roles:
  mandatory:
    - Engineering Manager
    - Product Owner
    - JS/ESM Developer
    - Prompt Engineer
  optional:
    - Docs Developer
---

# Claude Code Plugin Team Template

This template is used for repositories classified as `claude-code-plugin` stack. All roles operate within the context of `{repo_name}` on branch `{branch}` for epic `{epic}`.

## Mandatory Roles

### Engineering Manager
Owns the epic, coordinates with the Program Manager, and ensures the team stays unblocked. Spawns the Product Owner at epic start. Does not assign tasks to Developers directly.

### Product Owner
Breaks the epic into Developer tasks, dispatches Developer agents, and tracks completion. Escalates blockers to the Engineering Manager. Reports task status for `{repo_name}`.

### JS/ESM Developer
Implements skill entry points, helper modules, and plugin scaffolding for `{repo_name}` using ES module conventions. Follows the SKILL.md frontmatter format, existing file layout under `skills/`, and the project's test suite. Commits changes to `{branch}` and reports completion to the Product Owner.

### Prompt Engineer
Authors and refines agent prompt templates under `agents/` for `{repo_name}`. Ensures `{snake_case_placeholder}` conventions are used consistently, descriptions are trigger-scoped (not workflow summaries), and prompts are unambiguous for the roles they address. Coordinates with the JS/ESM Developer when prompts are loaded and dispatched by skill code.

## Optional Roles

### Docs Developer
Updates or creates Markdown documentation (`{docs_path}`) covering `{epic}` changes. Keeps docs consistent with skill and agent behavior — no duplication of frontmatter content into prose.
