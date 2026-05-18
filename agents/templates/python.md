---
stack: python
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Security Reviewer
---

# Python Team Template

Used for `python` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements Python modules, scripts, and services. Follows existing package structure, naming conventions, and test suite (pytest/unittest). Commits changes and reports to PO.

### Architect (hire when: new modules, service decomposition, or ambiguous implementation approach)
Designs the Python package structure, interface contracts, and implementation approach. Delivers a design document the Developer can follow directly.

### Tester (hire when: critical business logic affected, coverage gaps, or new public APIs added)
Writes and runs pytest tests for the affected code. Delivers coverage report and new test files.

### Security Reviewer (hire when: web endpoints, external HTTP calls, file I/O, or user input processing is changed)
Audits for injection, deserialization, dependency, and input validation issues. Delivers findings with remediation.
