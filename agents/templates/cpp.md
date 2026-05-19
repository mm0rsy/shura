---
stack: cpp
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Security Reviewer
---

# C++ Team Template

Used for `cpp` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements C++ changes following existing build system conventions (CMake), code style, and test suite. Commits changes and reports to PO.

### Tester (hire when: critical logic affected, undefined behavior risk, or coverage gaps in the test suite)
Writes and runs tests using the project's test framework (Google Test, Catch2, etc.). Delivers coverage report and new test files.

### Security Reviewer (hire when: memory management changes, external input parsing, network code, or new dependencies)
Audits for memory safety, integer overflow, injection, and unsafe API usage. Delivers findings with remediation.
