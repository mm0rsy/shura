---
stack: mobile
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Security Reviewer
---

# Mobile Team Template

Used for `mobile` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements mobile UI features, platform integrations, and business logic. Follows existing patterns, platform conventions, and test suite. Commits changes and reports to PO.

### Architect (hire when: new screens or navigation flows, significant state management changes, or cross-platform concerns)
Designs the mobile implementation approach — navigation, state, platform APIs — before coding begins. Delivers a design the Developer can follow directly.

### Tester (hire when: critical flows affected, platform-specific behavior untested, or regression risk is high)
Writes and runs tests for affected flows. Delivers a coverage report.

### Security Reviewer (hire when: auth changes, local data storage, new network requests, or permissions changes)
Audits mobile-specific security concerns — local storage, keychain, network calls, permissions. Delivers findings with remediation.
