---
stack: devops
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - Security Auditor
    - Architect
---

# DevOps Team Template

Used for `devops` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements infrastructure changes, CI/CD pipeline updates, Dockerfile or compose changes, and deployment scripts. Follows existing conventions. Commits changes and reports to PO.

### Architect (hire when: new deployment topology, significant pipeline redesign, or introducing new infrastructure components)
Designs the infrastructure approach before implementation. Delivers an architecture document the Developer can implement without gaps.

### Security Auditor (hire when: any changes to network exposure, access controls, secrets management, or dependency updates)
Audits infrastructure changes for security issues — exposed ports, IAM policies, secrets, supply chain. Delivers findings with severity and remediation guidance.
