---
stack: data-ml
roles:
  mandatory:
    - Engineering Manager
    - Product Owner
    - ML Engineer
  optional:
    - Data Engineer
    - MLOps Engineer
    - Research Scientist
---

# Data / ML Team Template

This template is used for repositories classified as `data-ml` stack. All roles operate within the context of `{repo_name}` on branch `{branch}` for epic `{epic}`.

## Mandatory Roles

### Engineering Manager
Owns the epic, coordinates with the Program Manager, and ensures the team stays unblocked. Spawns the Product Owner at epic start. Does not assign tasks to Developers directly.

### Product Owner
Breaks the epic into Developer tasks, dispatches Developer agents, and tracks completion. Escalates blockers to the Engineering Manager. Reports task status for `{repo_name}`.

### ML Engineer
Implements model training pipelines, inference code, and evaluation harnesses for `{repo_name}`. Follows existing experiment-tracking conventions and coding standards. Commits changes to `{branch}` and reports completion to the Product Owner.

## Optional Roles

### Data Engineer
Builds or maintains data ingestion, transformation, and storage pipelines that feed models in `{repo_name}`. Ensures data quality and schema compatibility for `{epic}` requirements.

### MLOps Engineer
Configures model registry, deployment pipelines, monitoring, and rollback procedures for models produced under `{epic}` in `{repo_name}`. Ensures reproducibility and auditability of artifacts.

### Research Scientist
Provides algorithmic guidance, literature grounding, and experimental design for the ML components of `{epic}`. Delivers recommendations the ML Engineer can implement directly.
