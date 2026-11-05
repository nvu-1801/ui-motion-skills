---
name: business-logic-review
description: Review domain rules, state transitions, permissions and concurrent side effects against project contracts.
---

# business-logic-review

Extract invariants from acceptance criteria, domain code and tests. If sources conflict, identify the contradiction rather than silently choosing the current implementation as truth.

Trace input → validation → authorization → state transition → persistence → side effects. Select risks that apply: monetary precision, timezone boundaries, empty/null inputs, duplicate requests, ownership, transaction boundaries, partial failures, retries and concurrent updates. Do not apply every item to every task.

For concurrency claims, identify the atomic operation or uniqueness constraint and test competing requests when feasible. A sequential retry test does not prove race safety. Verify authorization on the server path, not only hidden UI controls.

Express findings with a concrete violating input/sequence and expected invariant. Separate confirmed defects from questions. Use the project's test runner and controlled clocks/data; do not introduce a new framework solely for this review.
