---
stack: fullstack
roles:
  mandatory:
    - Engineering Manager
    - Product Owner
    - Full-Stack Developer
  optional:
    - UX Designer
    - DevOps Engineer
    - Database Engineer
---

# Full-Stack Team Template

This template is used for repositories classified as `fullstack` stack. All roles operate within the context of `{repo_name}` on branch `{branch}` for epic `{epic}`.

## Mandatory Roles

### Engineering Manager
Owns the epic, coordinates with the Program Manager, and ensures the team stays unblocked. Spawns the Product Owner at epic start. Does not assign tasks to Developers directly.

### Product Owner
Breaks the epic into Developer tasks, dispatches Developer agents, and tracks completion. Escalates blockers to the Engineering Manager. Reports task status for `{repo_name}`.

### Full-Stack Developer
Implements features spanning both client and server layers in `{repo_name}`. Follows existing conventions for the frontend framework, backend routing, and data access. Commits changes to `{branch}` and reports completion to the Product Owner.

## Optional Roles

### UX Designer
Produces interaction specs and visual designs for the `{epic}` feature set. Delivers assets in a format the Full-Stack Developer can implement without interpretation gaps.

### DevOps Engineer
Configures or updates CI/CD pipelines, environment variables, and deployment manifests needed to ship `{epic}` changes from `{repo_name}` to production.

### Database Engineer
Designs or reviews schema changes, migrations, and query performance relevant to `{epic}`. Provides migration scripts and index recommendations for the Full-Stack Developer to apply.
