# Verification record — 2026-11-05

This document records local checks before publication. Hosted status belongs to the GitHub Actions run for the pushed commit; it is not inferred from local pass results.

## UI reuse and skill evolution — latest local validation

- Package validator: 25 skills, 4 schemas, 6 profiles, 18 task routes and portable local references pass.
- Unit/behavior suite: 46 tests pass, covering source registry freshness and path protection, missing telemetry, focused routing, ownership, restartable migration/backfill, lesson lookup and deterministic archive manifests.
- Installer/exporter: 10 scenario groups pass, including standalone ui-system-reuse and opt-in UIRegistry/Secrets.
- New UI fixture: typecheck, contract tests and build pass; a new Reports screen uses the existing Button export, shared model/formatter and token roles. Light/dark, scoped compact variant, modal focus, navigation-vs-selection and axe checks pass. Injected wrong font token fails browser assertions and marks the index stale; byte-exact restore passes.
- Actual fixture issue found: browser-default blue link failed dark-theme axe contrast (1.67); mapping the shared Card style to the semantic text token fixed it without disabling checks.
- UI reuse artifacts: `.cache/tests/ui-reuse-3cd1a9c4d151480e91fdc18547ef8a99/` (logs and evidence.json).
- Gitleaks 8.30.1: no findings in the intended source distribution or the two existing Git commits at scan time. A broad working-directory scan also included ignored upstream/dependency caches and found 138 matches there; those were not source-distribution findings. Values stayed redacted; no blanket allowlist was added.
- Source build: scripts/build.py creates a ZIP with SHA256 per file and omits cache/runtime/dependency directories. Unit checks compare two builds byte-for-byte. Archive hash changes when sources/docs change and is printed by the final build command.
- skill-evaluation supplies a labeled suite/scorer; runs.json is intentionally empty. No live independent agent A/B experiment or measured token-saving percentage has been performed. Unknown token/tool telemetry remains null. SQLite fixture results do not establish production online-DDL behavior.

## Earlier quality-tooling validation

Scope: reusable skill packages, installer/exporter, local check runner and template validation. Base repository revision: `2c88c54ed58bc167c4a4fceeb52e5e2027cb4705`; the changes in this record are working-tree additions, not a published release.

## Observed results

| Check | Actual result |
| --- | --- |
| `python scripts/validate.py` | Pass: 18 skills, portable references, 3 schemas, 4 profiles, verified lesson and 10 routes |
| Full installation | All 18 skill packages installed; repeated install performed no updates |
| CodeRabbit YAML | Starter validated against the official schema.v2.json fetched on this date; service itself not enabled |
| Invalid workflow fixture | actionlint rejected undefined github field; corrected github.sha accepted |
| skill-creator `quick_validate.py` on all skill folders | 18/18 pass |
| `python -m unittest discover -s tests -p 'test_*.py' -v` | 21/21 pass; includes Windows npm resolution, failure/missing tool/timeout, required skipped checks, report protection and routing |
| `pwsh -NoProfile -File tests/test-installer.ps1` | 9 groups pass on Windows, including dry-run, nested resources, idempotency, preflight, modified files, legacy migration, unmanaged targets, obsolete files, traversal and junction guard |
| actionlint 1.7.12 on templates and kit workflow | Pass; shellcheck/pyflakes integrations disabled because those tools were not installed |
| zizmor 1.32.0 offline, auditor persona, no ignores | No findings on templates and kit workflow; online audits not run |
| `python tests/run-portability.py --ui --offline-deps` | Both stack fixtures: clean pass → injected logic bug fails → restored implementation passes |
| Playwright + axe | Three viewport checks and keyboard journey pass; injected overflow and changed screenshot fail; restored UI passes without updating snapshots |

Cross-stack/UI artifacts from the recorded run: `.cache/tests/portability-a227de5fe8474d8b958e7be715e3660c/`. Each project has clean/bug/fixed logs and JSON reports; web also has baseline, overflow, visual-change and UI-fixed logs. Cache is deliberately not distributed. A 390px baseline was visually inspected; this is a controlled fixture, not a design evaluation of an application.

## Limits

- At the time of this earlier local record, hosted GitHub Actions jobs had not run. Linux is configured in the matrix; consult the pushed revision’s Actions run for its actual hosted result.
- SonarQube token/host/project and CodeRabbit authorization were not supplied. Templates/references are present; live scanner gates and bot reviews remain unverified. The optional Semgrep/reviewdog adapters were not executed locally.
- The deploy reusable workflow is syntax/security checked. No provider authentication, production deployment, rollback or hosted smoke test was performed.
- Routing helper selects 1–3 initial skills by explicit task kind without reading their bodies. Agent behavior still depends on its host and task reasoning. No exact token savings percentage is claimed.
- Runner command output is inherited, not stored in its JSON report; argv may still contain sensitive values, so never put tokens/passwords in command arguments. Reports identify the enclosing repository revision and do not prove a dirty working tree equals that commit.

## Reproduce

Install Python development dependencies with `python -m pip install -r tests/requirements.txt`, then run the package and unit commands above. Installer tests retain isolated artifacts under `.cache/tests`. For the full portability run, install the pinned fixture dependencies and Chromium first, or allow the harness's npm ci to populate them. `--offline-deps` requires an existing npm cache. Browser execution and loopback server startup may require an environment that permits child processes and local networking. Set PWTEST_CACHE_DIR to a writable workspace folder where the default temporary directory is restricted.

Consult references/upstreams.md for exact action commits, validator versions and release archive checksums. The committed fixture lockfile pins web test dependencies; target projects keep their own versions and test commands.
