---
name: ui-visual-qa
description: Verify changed web UI across screen sizes, keyboard use, product workflow and relevant motion fallbacks.
---

# ui-visual-qa

Check only the changed route and affected journeys first. Use the existing browser/test setup; don't introduce another runner just for a simple visual fix. Add broader checks when shared styles/components changed or project policy requires them.

Capture mobile, tablet and desktop when responsive behavior changed. Check overflow, content length, focus and primary actions. Exercise navigation/forms and relevant loading, empty, error and success states; screenshots alone don't prove the flow works. Inspect console/network errors that affect that flow.

For motion/3D changes, sample scroll progress and reverse scrolling, reduced motion and WebGL fallback. Don't load motion references for an ordinary form or layout task.

Read [browser checks](references/browser-checks.md) when setting up regression automation. `assets/templates/quality.spec.ts` provides opt-in Playwright/axe checks; adapt its route and expected behavior to the project. Keep screenshot baselines tied to a controlled browser/OS/font/data environment, and review image changes before updating them.

Report commands, observed interactions, screenshots and uncovered cases. Automated accessibility checks complement keyboard and human review; a passing scan is not a complete accessibility audit.

For consistency changes, compare computed typography/color for the same role/variant across affected screens, light/dark themes and an unaffected consumer. Verify scoped variants do not change shared defaults. Test real navigation/form/error behavior; preserve focus restoration for reused dialogs.
