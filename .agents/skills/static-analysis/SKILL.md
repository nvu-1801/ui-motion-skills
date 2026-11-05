---
name: static-analysis
description: Configure or interpret lint, type checks, SonarQube and Semgrep without treating scanner output as verified logic correctness.
---

# static-analysis

Start with existing lint/typecheck/test commands and language support. Add the requested scanner only; do not install every scanner. Keep changes scoped to the target repository and its chosen quality policy.

Read only the matching reference: [SonarQube](references/sonarqube.md), [Semgrep](references/semgrep.md), [CodeRabbit/reviewdog](references/review.md), or [secret scanning](references/secrets.md). Templates live in `assets/templates/`; exporting does not enable a service or grant access.

Triage findings by location, impact, confidence and reproducibility; preserve rule IDs and distinguish existing debt from new defects. Document exclusions or false-positive decisions narrowly. Do not suppress checks, reduce thresholds or replace a baseline just to make CI green.

A scanner invocation or upload is not a completed quality gate. Record the analyzed commit, run URL and final gate status. Missing configuration, credentials or results are blocked/pending, not pass. Domain correctness still requires contracts and tests.
