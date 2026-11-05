# CodeRabbit and reviewdog

`assets/templates/coderabbit.yaml` is a minimal .coderabbit.yaml starter. Check its current schema and install/authorize the service on the intended repository separately. This template does not provide CodeRabbit's model or hosted service. Don't clone an old AI reviewer fork and label it the current product.

Source/schema: https://docs.coderabbit.ai/getting-started/yaml-configuration and https://www.coderabbit.ai/integrations/schema.v2.json . Verify availability, data handling and billing for the chosen account when enabling it.

The optional `assets/templates/reviewdog.yaml` exports as .reviewdog.yml and uses the project's ESLint plus eslint-formatter-rdjson. Install/pin those in the target project if chosen, then run `reviewdog -conf=.reviewdog.yml -reporter=local -filter-mode=nofilter` for local diagnostics. Keep the original lint command as a required check; review comments alone are not a gate.

reviewdog bridges existing linter output to review comments: https://github.com/reviewdog/reviewdog . Use a pinned release, the matching error format and diff filtering. For PR reporting give only the needed write permission in a trusted job; do not grant secrets to arbitrary fork code. On untrusted PRs keep read-only diagnostics/artifacts instead of posting. Local review does not need GitHub writes.

Bot comments are findings to investigate. Preserve the rule/location and decision when accepting, rejecting or deferring a suggestion; don't auto-apply every suggestion.
