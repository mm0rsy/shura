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
