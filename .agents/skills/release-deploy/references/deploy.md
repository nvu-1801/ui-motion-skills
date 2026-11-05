# Deployment handoff

Use existing provider workflows when present. The optional `assets/templates/deploy.yml` defines workflow_call with separate verify, deploy and smoke commands. It has no automatic push trigger, uses the protected `production` environment and serializes releases. Configure environment protections in GitHub separately. The caller must run only trusted revisions and pass fixed trusted commands, not PR text. Replace production with the project destination for preview/staging.

The workflow checks out the caller revision, executes verification, deployment and smoke checks in order. It provides no provider authentication: adapt OIDC or the project's secrets explicitly. Do not wire an echo/no-op as deployment and then report a release. Keep commands nonempty and fail on errors. For build-once systems, adapt it to consume the verified immutable artifact rather than rebuilding.

Record: target environment; commit and artifact identity; required check results; deployment/run URL; health endpoint and observed response; previous known-good revision; rollback command and migration limitations. Don't publish credentials or private payloads in these records.

If a run cannot be observed, state pending/blocked and the next action. The template does not implement a provider-specific rollback or validate business health by itself.
