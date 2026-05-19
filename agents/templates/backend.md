---
stack: backend
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

# Backend Team Template

Used for `backend` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements API endpoints, business logic, and service integrations. Follows existing module structure, error-handling conventions, and test suite. Commits changes and reports to PO.

### Architect (hire when: new services, significant API redesign, cross-service dependencies, or ambiguous implementation path)
Produces a technical design scoped to the epic. Delivers interface contracts and implementation guidance the Developer can follow directly.

### Tester (hire when: critical business logic affected, coverage gaps, or integration paths untested)
Writes and runs tests for affected endpoints and business logic. Delivers test coverage report and new test files.

### Database Engineer (hire when: schema migrations required, query performance concerns, or new data models)
Designs migrations and reviews query patterns for the epic. Delivers migration scripts and index recommendations.

### Security Reviewer (hire when: auth/authz changes, new external APIs, new dependencies, or data exposure paths)
Audits authentication, authorization, input validation, and dependency exposure. Delivers findings with severity ratings and remediation guidance.
