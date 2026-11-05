# Working in this skill repository

This repository distributes reusable skills and quality tooling for other projects. Demo applications are examples, not the default target of changes.

Start with the task and changed files. Use CATALOG.md or `python scripts/select-skills.py <task-kind>` to select a small initial skill set; read only selected SKILL.md files. Do not read every skill or reference because it is installed. Expand only for a real dependency or failure. Existing task/user instructions take precedence.

Keep essential guidance in SKILL.md and conditional detail in linked references. Templates are opt-in assets; installing a skill does not enable services, push or deploy. Reuse existing test runners in target projects.

Validate package changes with `python scripts/validate.py`, runner behavior with `python -m unittest discover -s tests -p 'test_*.py'`, and installer/export changes with `pwsh -NoProfile -File tests/test-installer.ps1`. Workflow changes also need actionlint and zizmor. Record unavailable checks honestly. Do not alter unrelated demo applications.
