---
stack: frontend
roles:
  mandatory:
    - Engineering Manager
    - Product Owner
    - Frontend Developer
  optional:
    - UX Designer
    - Accessibility Reviewer
    - Performance Engineer
---

# Frontend Team Template

This template is used for repositories classified as `frontend` stack. All roles operate within the context of `{repo_name}` on branch `{branch}` for epic `{epic}`.

## Mandatory Roles

### Engineering Manager
Owns the epic, coordinates with the Program Manager, and ensures the team stays unblocked. Spawns the Product Owner at epic start. Does not assign tasks to Developers directly.

### Product Owner
Breaks the epic into Developer tasks, dispatches Developer agents, and tracks completion. Escalates blockers to the Engineering Manager. Reports task status for `{repo_name}`.

### Frontend Developer
Implements UI features and fixes in the frontend codebase. Follows the project's component structure, styling conventions, and test suite. Commits changes to `{branch}`. Reports completion to the Product Owner.

## Optional Roles

### UX Designer
Produces interaction specs, wireframes, or annotated mockups for the `{epic}` feature set. Delivers assets that the Frontend Developer can implement directly without interpretation gaps.

### Accessibility Reviewer
Audits frontend output against WCAG criteria. Flags violations in `{repo_name}` and provides concrete remediation steps for the Frontend Developer.

### Performance Engineer
Profiles bundle size, render performance, and runtime metrics. Provides actionable recommendations scoped to `{epic}` changes in `{repo_name}`.
