# Semgrep

Prefer the project's pinned Semgrep version and curated local rules. The template `semgrep.yml` is a local rule example; export it to `.quality/semgrep.yml`. Run `semgrep scan --config .quality/semgrep.yml --error --strict` on the intended paths. `--error` makes findings fail the command; a scanner that prints findings but exits 0 isn't a blocking check.

The example detects Python shell=True calls and is intentionally narrow; review whether the matched input is trusted before classifying a vulnerability. It does not prove all shell injection paths are covered. Expand with language-specific rules that the project can maintain. Record rule/version and ignore reasons. Avoid auto-fetching a changing remote ruleset during every task.

Source: https://github.com/semgrep/semgrep . Review licenses for engine and external rule packs separately before redistribution.
