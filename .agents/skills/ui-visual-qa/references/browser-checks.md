# Browser regression setup

Use the project's pinned Playwright and @axe-core/playwright versions. Export the starter to tests/quality.spec.ts, configure Playwright webServer/baseURL or set QUALITY_BASE_URL to a running test server. It does not start production or choose credentials. Install the supported browser binaries through the project setup.

The starter checks document overflow at three widths, console/page errors, axe serious/critical violations and a screenshot per viewport. Add selectors/expected results for the changed business journey, API failure and keyboard order. It uses networkidle only through the project's own app readiness if needed; add a stable readiness locator rather than arbitrary sleeps.

Create initial snapshots in a known clean fixture, inspect them, then run comparisons. To prove a visual regression, change a visible region without updating snapshots, observe failure, restore/fix it and observe pass. Do not approve all changed images automatically. Dynamic dates, remote images and animations need controlled fixture data.

Sources: https://github.com/microsoft/playwright and https://github.com/dequelabs/axe-core . Avoid fetching their full source merely to run installed packages.
