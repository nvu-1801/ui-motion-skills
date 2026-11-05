---
name: code-review
description: Review a diff for actionable regressions and verify automated review findings before changing code.
---

# code-review

Read repository review rules, base/head and changed contracts. Follow affected callers and tests only as needed to assess impact. Prioritize correctness, security, data loss and broken workflows over stylistic preferences.

A finding needs a changed location, failing scenario, user impact and evidence. Use severity and confidence separately; label an untested hypothesis. Avoid duplicate findings across linters and bots. A clean review means no actionable issue was found in the inspected scope, not proof of correctness.

When responding to CodeRabbit or another bot, check the suggestion against current code and project requirements. Reproduce where possible; apply justified changes and reject or defer unsupported ones with reasoning. Don't implement every bot suggestion automatically.

Report findings first, then scope and verification gaps. Use the project's existing review format or the installed quality-workflow finding schema when structured exchange is needed. Posting comments or requesting remote review requires the task's authorization; local review needs no posting.
