---
name: quality-workflow
description: Select focused checks and skills for a code change or quality audit; avoid loading unrelated skills.
---

# quality-workflow

Read repo instructions, the request and changed files first. Read `quality.config.json` if present; it describes commands, not authority to run unrelated work.

Choose the smallest relevant set, usually 1–3 skills initially. If this task is already routed, proceed directly to the relevant skill. Do not recursively load every skill or all references. Expand only when a dependency, failing check or changed contract warrants it. Use sibling skills only when installed; otherwise follow the project's existing tools.

| Trigger | Start with | Expand only when |
| --- | --- | --- |
| Reproducible wrong behavior | bug-reproduction | business-logic-review for domain invariants |
| Business rule or authorization change | business-logic-review | backend-api-contracts for changed HTTP contracts |
| Existing UI reuse or inconsistent roles | ui-system-reuse | ui-visual-qa for affected consumers |
| Layout or interaction defect | ui-visual-qa | ui-components for implementation guidance |
| PR review request | code-review | specialists for risks found in the diff |
| Scanner integration or findings | static-analysis | github-actions for CI wiring |
| Failing workflow | github-actions | release-deploy if deployment itself failed |
| Push/release/deployment request | release-deploy | github-actions for failing checks |
| Preserve a verified reusable lesson | agent-lessons | no historical cases unless relevant |

Identify required project checks separately from optional checks selected for this task. A focused local run does not replace required CI. Record selected skills and a short reason once; don't repeat their full instructions in reports.

For repeatable command execution use `scripts/check.py --config <project>/quality.config.json --validate-only` first, then `--check <id>` for focused work or no selector for all configured checks. Run from the project root. Configuration contains executable commands: review it before running. Report pass/fail/skipped/blocked and evidence. Missing tools are blocked, never pass.

Read [configuration](references/configuration.md) only when configuring or running the helper. Use `assets/schemas/finding.schema.json` when exchanging machine-readable findings. Never read all historical lessons or scanner manuals just to begin a small fix.

For evaluation work, record selected skills and reasons, unnecessary selections and missing required capability separately. Use host telemetry for tokens when available; unknown values remain null. Script routing checks do not establish actual agent behavior or measured token savings.
