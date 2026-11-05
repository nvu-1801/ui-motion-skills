---
name: dependency-security
description: Assess dependency and lockfile risk, licenses and safe upgrades using the target project ecosystem.
---

# dependency-security

Read manifests, lockfiles, supported runtimes and actual dependency paths. Prefer the project's native audit/update tools; use current advisory data when scanning and record scanner/database version and timestamp. A clean scan is scoped to the database/tool, not proof of no vulnerability.

Separate direct/transitive dependencies, runtime/dev exposure, reachable code and license obligations. Do not dismiss a dev dependency if it executes during build/CI. Verify upstream provenance and package identity before changing versions. Read only the ecosystem reference that applies: [Node/Python](references/ecosystems.md).

Propose or apply the smallest compatible upgrade authorized by the task. Preserve lockfile consistency; don't force major upgrades, remove a scanner or broaden ignores merely to get a clean result. Run affected tests/build and check framework/runtime compatibility. Record unresolved advisories and narrowly justified exceptions with owner/expiry, rather than silently hiding them.
