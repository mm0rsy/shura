---
stack: cpp
roles:
  mandatory:
    - Engineering Manager
    - Product Owner
    - C++ Developer
  optional:
    - Performance Engineer
    - Security Reviewer
---

# C++ Team Template

This template is used for repositories classified as `cpp` stack. All roles operate within the context of `{repo_name}` on branch `{branch}` for epic `{epic}`.

## Mandatory Roles

### Engineering Manager
Owns the epic, coordinates with the Program Manager, and ensures the team stays unblocked. Spawns the Product Owner at epic start. Does not assign tasks to Developers directly.

### Product Owner
Breaks the epic into Developer tasks, dispatches Developer agents, and tracks completion. Escalates blockers to the Engineering Manager. Reports task status for `{repo_name}`.

### C++ Developer
Implements features, libraries, and system components for `{repo_name}` following the project's build system conventions (e.g., CMake), coding standards, and test suite. Commits changes to `{branch}` and reports completion to the Product Owner.

## Optional Roles

### Performance Engineer
Profiles CPU, memory, and latency characteristics of `{epic}` changes in `{repo_name}`. Uses tooling appropriate to the platform (e.g., perf, Valgrind, VTune) and delivers actionable optimization recommendations.

### Security Reviewer
Audits memory safety, integer handling, third-party dependency exposure, and attack surface introduced by `{epic}` changes. Delivers findings with severity ratings and concrete remediation guidance for the C++ Developer.
