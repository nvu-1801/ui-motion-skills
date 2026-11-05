---
name: bug-reproduction
description: Diagnose and fix reproducible defects using root-cause evidence and a targeted regression check.
---

# bug-reproduction

Establish expected behavior from the user's report, contract or existing specification. Reproduce with the smallest relevant input; record actual behavior and environment. If reproduction is unavailable, label the hypothesis and specify what evidence is missing.

Trace the failing path and its callers before editing. Distinguish incorrect code, data, configuration and environment. Fix the cause with the smallest scope consistent with the task; avoid opportunistic cleanup.

For logic changes add or adapt a regression test that fails before the fix and passes after it. For a simple visual fix, before/after screenshots and interaction checks may be better evidence than a new unit test. Include boundary and failure cases only when they exercise the cause.

Run relevant project checks, inspect the final diff and report the cause, changed behavior, exact verification and remaining uncertainty. Capture a reusable lesson only after validation and only when it adds knowledge beyond the local fix.
