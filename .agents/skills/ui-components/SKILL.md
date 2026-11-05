---
name: ui-components
description: Implement responsive web UI components using existing tokens, real product data and accessible interaction states.
---

# ui-components

- Before creating a component, search existing exports/variants and callers. Prefer import/composition, then extend a meaningful variant, then create for a real gap. Similar appearance alone does not justify merging different contracts.
- Reuse the repo’s navigation, buttons, form controls, routing and image helpers. Keep domain formatting in its existing layer.
- Make cards readable with real titles, prices, dates and long text. Keep meaningful text outside images and avoid nested interactive controls.
- Treat gallery controls as buttons with names and keyboard access. Preserve focus on open and restore it on close when implementing a modal.
- Preserve permissions, validation and URLs. Cover loading, empty, error and success states when the component owns them.

- Keep model/type and formatter imports in their owning layer. Before changing a shared default, check affected consumers; a one-screen change should use a scoped variant. Update an existing UI registry entry if its source changes.
