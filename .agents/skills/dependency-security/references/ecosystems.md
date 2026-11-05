# Native ecosystem checks

Node: use the lockfile's package manager. npm audit --json provides advisory data; preserve its nonzero result and triage dependency paths. npm ci verifies manifest/lock consistency. Avoid npm audit fix --force as an automatic resolution.

Python: use the project's pinned scanner (for example pip-audit when already chosen) against the actual requirements/environment. Do not confuse a source-code linter with a dependency advisory scan. Review platform markers and deployment constraints.

Pin scanner versions in repeatable CI and record advisory database time. Missing network, scanner or credentials is blocked/unavailable. Licenses need their own review; vulnerability scanners do not establish redistribution rights. Never include private registry tokens in command arguments or report bodies.
