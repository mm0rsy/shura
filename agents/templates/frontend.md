---
stack: frontend
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Tester
    - Architect
    - Accessibility Reviewer
    - Performance Engineer
---

# Frontend Team Template

Used for `frontend` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements UI features and fixes. Follows existing component structure, styling conventions, and test suite. Commits changes and reports to PO.

### Architect (hire when: significant structural changes, new component library, or routing redesign)
Produces a technical design document scoped to the epic. Delivers decisions the Developer can implement without gaps.

### Tester (hire when: critical user flows affected, coverage gaps in existing suite, or after major feature addition)
Writes and runs tests for the affected UI flows. Delivers a test coverage report and any new test files.

### Accessibility Reviewer (hire when: new UI components, form changes, or navigation changes)
Audits output against WCAG criteria. Delivers concrete remediation steps for the Developer.

### Performance Engineer (hire when: bundle size or render performance is a concern for this epic)
Profiles and identifies bottlenecks. Provides actionable recommendations scoped to epic changes.
