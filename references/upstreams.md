# Upstream provenance

Checked 2026-11-05. Source clones are local, sparse and ignored under `.cache/upstreams`; their code is not redistributed in this package. No upstream build/install scripts were executed. Local guidance and templates were written for this kit, not copied from entire manuals.

| Source | Pinned revision | Local reading / purpose | License inspected |
| --- | --- | --- | --- |
| https://github.com/rhysd/actionlint | 011a6d15e749bb3f2d771eed9c7aa0e7e3e10ee7 | README.md, docs/checks.md; workflow validation coverage | LICENSE.txt: MIT |
| https://github.com/reviewdog/reviewdog | 180aeaad16981340891c222aa2ec68ffdda2f01f | README.md; linter-to-review adapter guidance | LICENSE: MIT |

## Workflow action pins

These immutable SHAs were resolved from the official repository HEAD on the date above. They are snapshots, not claims that a branch will remain unchanged or that every provider feature has been exercised. Local workflow validation passed; hosted execution remains unverified until a project installs them.

| Action repository | SHA |
| --- | --- |
| https://github.com/actions/checkout | f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a |
| https://github.com/actions/setup-node | 101b3474143230c3562bd21f0b3c3f8254784571 |
| https://github.com/actions/setup-python | 6d4fd22b20465ccc0f7354476588e8df7c9ca0e0 |
| https://github.com/actions/upload-artifact | cf430e030ddbb5b0abf93d22962f4752f3646cd9 |
| https://github.com/SonarSource/sonarqube-scan-action | 2ee10424dc885fe18ce449af6fde7a07fe49cd38 |
| https://github.com/SonarSource/sonarqube-quality-gate-action | 3cfda8eca512232cb42bd40fd01567cba471db39 |

## Local validator binaries

Downloaded official Windows amd64 releases, checked the SHA256 published in GitHub release asset metadata before extraction, kept in ignored cache:

- actionlint 1.7.12: https://github.com/rhysd/actionlint/releases/tag/v1.7.12 ; archive SHA256 `6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9`.
- zizmor 1.32.0: https://github.com/zizmorcore/zizmor/releases/tag/v1.32.0 ; archive SHA256 `d284a16e09d9df4ce2c000357e7b59bd531be093bea5718a1ce225b449b59d49`.

Other official references are linked from the relevant installed skill. CodeRabbit uses its documented YAML schema; this kit does not redistribute its service. Semgrep and third-party rule licenses must be reviewed separately before vendoring rules.

## Updating references

Fetch deliberately, inspect the source/license diff, record the new SHA and rerun the relevant package and workflow checks. Do not pull upstream main on each task. Keep caches, binaries, tokens and full source trees out of distributed skill packages. If copying upstream snippets later, retain the required attribution/NOTICE and record the exact file revision.

- Gitleaks 8.30.1 official Windows x64 archive: https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1 ; verified SHA256 `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e`. Binary remains in ignored cache; used to scan the intended source distribution and Git history with redacted output.
