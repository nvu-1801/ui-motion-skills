# Secret scanning

Use the project's pinned Gitleaks CLI or selected equivalent. Examples for Gitleaks v8: `gitleaks dir --redact --report-format json --report-path .quality/secrets.json .` for working files, and `gitleaks git --redact --report-format json --report-path .quality/secrets-history.json .` for relevant history. Restrict history scope when the task requires it; don't assume a directory scan covers old commits.

Redact output and avoid echoing matched values. A finding is a suspected secret until triaged; test fixtures may be intentionally synthetic. Use narrow documented allowlists, not a blanket exclusion. If a real credential is exposed, stop publishing it, report the affected location without the value and follow the owner's revocation/rotation process; deleting one file doesn't erase history.

The exported quality-secrets.json defines a required command for review/merging into the project's own config. Missing Gitleaks is blocked, not pass. Don't enable this check on every cosmetic task without project policy requiring it.

Official source: https://github.com/gitleaks/gitleaks . Verify command support/version when installing; this kit does not bundle the scanner binary.
