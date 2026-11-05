# SonarQube

Use the official scan action and quality-gate action from SonarSource. `assets/templates/sonar.yml` is a manually triggered integration starter with pinned commits; it fails if SONAR_TOKEN, SONAR_HOST_URL or SONAR_PROJECT_KEY is absent. Configure the quality-analysis GitHub environment, store its token as a secret and host/project as environment or repository variables. It uses the workflow revision, scans, then waits for the quality gate with a job timeout.

For meaningful coverage, run the project's tests and configure the appropriate coverage report paths before scanning. The starter does not invent coverage. Set sources, exclusions and supported branch/PR analysis for the selected SonarQube product/edition. Some stacks require specialized build/scanner integration instead of the generic action.

The starter is not a required PR check until adapted and connected to trusted project CI. Fork PRs must not receive the token. Use separate trusted runs for credentialed analysis and record whether the requested revision was actually analyzed. A scheduled/manual scan of main cannot establish the status of a different PR head.

Sources: https://github.com/SonarSource/sonarqube-scan-action and https://github.com/SonarSource/sonarqube-quality-gate-action . Check support and account terms at integration time.
