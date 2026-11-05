---
name: agent-lessons
description: Preserve a verified reusable bug lesson with reproduction, root cause and regression evidence; retrieve only relevant cases.
---

# agent-lessons

Search the project lesson index by symptom, stack or invariant before opening individual cases. Use `scripts/search.py --directory <lesson-folder> --tag <tag>` to retrieve metadata for verified cases; add --include-deprecated only when investigating history. Version and replacement metadata help identify obsolete guidance. Read only matching cases; a similar symptom is not proof of the same cause. Apply a lesson only when its preconditions match.

After a verified fix, create a case from `assets/templates/lesson.md` in the project's chosen knowledge folder. Include source revision, environment, reproduction, expected/actual, root cause, fix principle, verification and exceptions. Remove secrets, customer data and private identifiers before sharing across projects.

Use draft until the case has reproducible evidence; verified needs before/after checks or equivalent artifacts. Mark obsolete guidance deprecated with its replacement. Promote a lesson into a general skill only after checking its scope and counterexamples. Saving a case is persistent retrieval guidance, not model training.

For machine validation use `assets/schemas/lesson.schema.json`. Don't automatically copy project-specific cases back into the shared skill repository.
