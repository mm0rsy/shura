---
stack: data-ml
roles:
  mandatory:
    - Product Owner
  catalogue:
    - Developer
    - ML Engineer
    - Data Architect
    - Tester
    - Security Reviewer
---

# Data / ML Team Template

Used for `data-ml` stack repositories. The Product Owner leads the team and hires specialists as needed.

## Product Owner
Owns the epic, coordinates directly with the Program Manager, breaks the epic into tasks, hires specialists from the catalogue, and handles push when done.

## Hiring Catalogue

### Developer (always hire)
Implements data pipelines, model training scripts, evaluation harnesses, and inference code. Follows existing experiment-tracking and coding conventions. Commits changes and reports to PO.

### ML Engineer (hire when: model architecture changes, training pipeline modifications, or new evaluation harness needed)
Designs and implements ML-specific components — loss functions, training loops, model architectures. Delivers working, tested code the Developer can integrate.

### Data Architect (hire when: new data sources, schema redesigns, retrieval system changes, or RAG pipeline modifications)
Designs data models, pipeline topology, and retrieval strategies. Delivers a technical design the Developer can implement directly.

### Tester (hire when: model output quality needs validation, data pipeline correctness is critical, or regression risk is high)
Writes and runs tests covering pipeline correctness and model output quality for the epic.

### Security Reviewer (hire when: new data sources, external APIs, model serving endpoints, or user data is involved)
Audits data handling and serving infrastructure. Delivers findings with remediation guidance.
