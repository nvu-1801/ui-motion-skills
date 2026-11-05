---
name: skill-evaluation
description: Evaluate skill activation, actual task outcomes and observed cost without confusing script tests with agent behavior.
---

# skill-evaluation

Define representative positive, negative and held-out tasks before tuning a skill. Keep prompts separate from expected skill selection and outcome checks. Include tasks that should reuse a component and ones where visually similar components must keep distinct contracts.

Compare baseline and skill-enabled runs in separate workspaces with the same starting revision, request, model/version and settings. Never inject expected answers into the execution prompt. Use multiple repetitions for claims about effectiveness; do not treat a deterministic selector test as a live agent benchmark.

Record actual selected skills, outcome evidence, tool calls, elapsed time and host-provided token telemetry. Unknown values stay null; word/byte estimates are not measured tokens. Include initial indexing and index-maintenance cost when assessing reuse. Correctness/accessibility/required checks must remain satisfied before claiming savings.

Use `scripts/score.py --suite <suite.json> --runs <runs.json>` to aggregate records; read [evaluation records](references/records.md) for the format. The scorer never runs agents or validates evidence itself: unverified/not-run outcomes cannot be counted as pass. Keep source/user data out of shared records; retain only redacted evidence references.
