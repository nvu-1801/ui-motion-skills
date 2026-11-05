---
name: github-actions
description: Create, validate or diagnose GitHub Actions workflows and checks for the exact requested revision.
---

# github-actions

Read existing workflows, runtime/lockfiles and required checks. Keep project commands and supported runner versions. Use actionlint for syntax/expressions and zizmor for workflow security when available; report missing validators.

Use pinned action commits and record their upstream provenance. Avoid interpolating untrusted event fields into shell code; pass them through environment variables when necessary. Keep token permissions minimal, disable checkout credential persistence unless needed and keep untrusted PR execution separate from secrets, write permissions and deploy jobs. Do not use pull_request_target to execute a PR checkout.

For a failing run, inspect job logs for the exact branch/SHA, distinguish code/tool/configuration/infrastructure failures, then rerun only when the failure cause is addressed or transient. Bound retries; never disable a required job to finish.

`assets/templates/ci-web.yml` and `ci-python.yml` run the installed quality helper. Adapt dependency installation and check IDs before use. Export to a project explicitly; don't replace its existing pipeline blindly. Read [CI setup](references/ci.md) when wiring required checks or optional tools.
