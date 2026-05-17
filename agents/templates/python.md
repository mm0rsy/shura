---
stack: python
roles:
  mandatory:
    - Engineering Manager
    - Product Owner
    - Python Developer
  optional:
    - Data Scientist
    - DevOps Engineer
---

# Python Team Template

This template is used for repositories classified as `python` stack. All roles operate within the context of `{repo_name}` on branch `{branch}` for epic `{epic}`.

## Mandatory Roles

### Engineering Manager
Owns the epic, coordinates with the Program Manager, and ensures the team stays unblocked. Spawns the Product Owner at epic start. Does not assign tasks to Developers directly.

### Product Owner
Breaks the epic into Developer tasks, dispatches Developer agents, and tracks completion. Escalates blockers to the Engineering Manager. Reports task status for `{repo_name}`.

### Python Developer
Implements features, scripts, and modules for `{repo_name}` following the project's coding style, dependency management conventions (e.g., `requirements.txt`, `pyproject.toml`), and test suite. Commits changes to `{branch}` and reports completion to the Product Owner.

## Optional Roles

### Data Scientist
Performs exploratory analysis, feature engineering, or statistical modeling relevant to `{epic}`. Delivers reproducible notebooks or scripts the Python Developer can integrate into the production codebase.

### DevOps Engineer
Configures or updates CI/CD pipelines, Docker images, and deployment manifests needed to ship `{epic}` changes from `{repo_name}` to the target environment.
