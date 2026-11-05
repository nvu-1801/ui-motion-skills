# Focused check configuration

Use JSON so the helper needs only Python 3.10+ standard library. `quality.config.json` replaces the YAML filename proposed during planning. Validate with `python .agents/skills/quality-workflow/scripts/check.py --config quality.config.json --validate-only`.

Each check has a unique `id`, `command` argv array, `required` boolean, optional `enabled`, `cwd` relative to the config directory and `timeoutSeconds` (1–3600). No shell strings or interpolated event payloads. Commands and project code are trusted executable inputs; inspect them before use. The helper never installs dependencies or contacts services by itself.

Use `--check test --check typecheck` to select checks. The report marks others skipped and declares incomplete when a required check was omitted/disabled. Exit codes: 0 selected checks passed with all required checks satisfied; 1 failure; 2 invalid config, missing tool, timeout or incomplete required checks. Report is `.quality/report.json` by default and contains SHA, command, duration and status, not command output. Child output is inherited, so configure tools to redact secrets. Use `--report` to choose a new report path inside the project; don't point at source files.

Only listed commands run. Avoid network/service commands unless the task calls for them. A deploy command belongs to the project's release workflow, not automatic local quality checks. Optional tooling can be disabled explicitly; never mark a required scanner optional merely because credentials are unavailable.

A command's exit code is its evidence, not a complete analysis of its semantics: a Sonar scanner without a wait/gate step does not prove the remote gate passed. Configure the proper gate or keep remote status blocked. Store findings separately using the schema, preserving severity and confidence.
