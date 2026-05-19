---
stack: fullstack
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Database Engineer
    - Security Reviewer
---

# Full-Stack Team Template

Used for `fullstack` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements both frontend UI and backend API changes. Follows existing conventions end-to-end. Commits changes and reports to PO.

### Architect (hire when: full-stack feature requiring new data models + UI flows, or significant structural changes to either layer)
Designs the end-to-end approach — data model, API contract, UI flow — before implementation begins. Delivers a doc the Developer can follow without interpretation gaps.

### Tester (hire when: critical user-facing flows affected, or end-to-end integration is untested)
Writes and runs tests covering both API and UI behavior for the epic. Delivers coverage report.

### Database Engineer (hire when: schema changes required or query performance is a concern)
Designs migrations and reviews query patterns. Delivers migration scripts and recommendations.

### Security Reviewer (hire when: auth flows, new APIs, or sensitive data access paths are changed)
Audits the full-stack change for security issues. Delivers findings with remediation guidance.
