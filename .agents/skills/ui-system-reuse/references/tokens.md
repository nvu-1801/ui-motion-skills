# Tokens, text and content

Find the actual CSS variables/theme config and override order. Resolve heading/body/caption roles through size, weight, line-height and letter-spacing. Use surface/text/action/status/border roles across light/dark and focus/error/disabled states. Reuse spacing/radius/shadow scales where they apply.

Same role and variant should share one definition; different roles can intentionally differ. A request for one screen should not change the default typography across all consumers. Prefer a meaningful existing variant or a scoped composition.

Use existing locale/content keys for the same meaning. Identical wording may need separate translation contexts; don't replace every matching string with one key. Don't normalize legitimate chart/artwork values just because they are literals.

Verify computed style at the affected viewport/theme/state and an unaffected consumer. Screenshots complement interaction and accessibility checks. Approve a baseline change only after inspecting why it differs.
