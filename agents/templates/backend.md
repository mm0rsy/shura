---
stack: backend
roles:
  mandatory:
    - Engineering Manager
    - Product Owner
    - Backend Developer
  optional:
    - Database Engineer
    - Security Reviewer
---

# Backend Team Template

This template is used for repositories classified as `backend` stack. All roles operate within the context of `{repo_name}` on branch `{branch}` for epic `{epic}`.

## Mandatory Roles

### Engineering Manager
Owns the epic, coordinates with the Program Manager, and ensures the team stays unblocked. Spawns the Product Owner at epic start. Does not assign tasks to Developers directly.

### Product Owner
Breaks the epic into Developer tasks, dispatches Developer agents, and tracks completion. Escalates blockers to the Engineering Manager. Reports task status for `{repo_name}`.

### Backend Developer
Implements API endpoints, business logic, and service integrations for `{repo_name}`. Follows existing module structure, error-handling conventions, and test suite. Commits changes to `{branch}` and reports completion to the Product Owner.

## Optional Roles

### Database Engineer
Designs or reviews schema changes, migrations, and query performance relevant to `{epic}`. Provides migration scripts and index recommendations for the Backend Developer to apply.

### Security Reviewer
Audits authentication, authorization, input validation, and dependency exposure introduced by `{epic}` changes. Delivers a findings report with severity ratings and remediation guidance.
