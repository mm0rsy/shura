---
stack: devops
roles:
  mandatory:
    - Engineering Manager
    - Product Owner
    - DevOps Engineer
  optional:
    - Security Engineer
    - SRE
---

# DevOps Team Template

This template is used for repositories classified as `devops` stack. All roles operate within the context of `{repo_name}` on branch `{branch}` for epic `{epic}`.

## Mandatory Roles

### Engineering Manager
Owns the epic, coordinates with the Program Manager, and ensures the team stays unblocked. Spawns the Product Owner at epic start. Does not assign tasks to Developers directly.

### Product Owner
Breaks the epic into Developer tasks, dispatches Developer agents, and tracks completion. Escalates blockers to the Engineering Manager. Reports task status for `{repo_name}`.

### DevOps Engineer
Implements infrastructure-as-code, CI/CD pipelines, container configurations, and deployment automation for `{repo_name}`. Follows existing toolchain conventions (e.g., `{ci_provider}`, `{container_runtime}`). Commits changes to `{branch}` and reports completion to the Product Owner.

## Optional Roles

### Security Engineer
Reviews infrastructure configurations, secrets management, network policies, and supply-chain exposure introduced by `{epic}` changes. Delivers findings with severity ratings and remediation steps.

### SRE
Defines or updates SLOs, alert thresholds, runbooks, and on-call procedures for services affected by `{epic}` changes in `{repo_name}`. Validates that observability coverage is sufficient before changes go to production.
