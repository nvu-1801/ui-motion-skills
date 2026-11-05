# CI setup

Export one profile only after reading package/lockfiles and existing jobs. Web starter assumes Node 22, npm and package-lock.json; Python starter assumes Python 3.12 and requirements.txt. Change these to the project's actual supported versions. No cache is enabled until a matching lockfile is known.

Install quality-workflow into the project and commit its scripts/resources if CI calls them. Configure actual check IDs/commands. The runner fails closed for missing required checks or tools. Reports contain statuses and SHA; tool output stays in logs. Review reports before sharing.

Use stable required job names. Configure branch protection/rulesets in the project separately; exporting YAML does not enable them. Avoid path filters that leave required checks pending. Deploy only from trusted revisions after required checks. `sonar.yml` is optional and manual until wired for the project's trust model.

Validate workflows with actionlint; run zizmor where installed. Pin validator tool versions in CI instead of downloading latest during every run. A syntax/security scan does not execute a hosted GitHub run; report those as separate verification levels.
