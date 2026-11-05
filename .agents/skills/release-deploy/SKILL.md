---
name: release-deploy
description: Push authorized changes, follow CI and deploy revisions with explicit health evidence and rollback context.
---

# release-deploy

Determine the requested scope: push, PR, preview, staging or production. Read repo deployment rules and verify remote, branch, diff, commit and destination. Installing this skill does not authorize external changes; existing task authorization persists.

Run required checks and inspect for accidental files/secrets. When push is requested, push the intended branch, record SHA and follow the matching Actions run. Don't equate a successful push with successful CI. Don't force-push, merge or change branch protection as a workaround.

For deployment, use the project's existing provider and credentials. Bind deployment to the verified revision/artifact. Check environment/migrations, rollback feasibility and the task's permitted destination before starting. Read [deployment handoff](references/deploy.md) for the required evidence and optional reusable-workflow template.

Verify rollout and smoke-test the changed route/API; capture deploy/run URL, revision and observed status. When requested to watch a run, monitor during the active session to completion or an explicit blocker. Don't claim monitoring continues after the chat ends. Do not automatically repeat a failed production side effect or roll back a destructive migration.
