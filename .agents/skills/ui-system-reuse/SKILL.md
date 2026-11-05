---
name: ui-system-reuse
description: Find and reuse existing UI components, variants, typography, colors and shared models before introducing new UI code.
---

# ui-system-reuse

Read the repo's UI ownership rules and the changed screen. Find the existing component library, token/theme definitions, content keys and shared model/formatter layer. Use existing component docs/Storybook when available; don't install another catalog framework by default.

Query the project's registry for the needed role, then open only the matching source and relevant consumers. `scripts/registry.py` builds/queries an explicit source index; read [registry use](references/registry.md) only when using it. Hash freshness is not semantic approval. A stale or missing entry requires source verification; it does not mean no reusable component exists.

Choose reuse → extend a meaningful variant/composition → create only for a demonstrated gap. Prefer imports to copied JSX/CSS. Similar appearance alone does not justify merging different interaction/data contracts. Avoid components with unrelated boolean switches. Before changing a shared default or token, inspect affected consumers; screen-specific behavior should not silently alter other screens.

Use semantic typography/color/spacing/radius roles from the current project, including theme and state variants. Literal values can be valid for artwork/charts or isolated dimensions; flag evidence-backed inconsistency, not every literal. Keep distinct translation contexts and ownership of domain types/formatters. Read [components and models](references/components.md) or [tokens and content](references/tokens.md) only for the resource being changed.

After editing, verify the changed journey and affected consumers. Record which source/variant was reused and why a new primitive was necessary, if any. Update matching registry entries when sources change. Do not copy one project's brand or domain data into another.
