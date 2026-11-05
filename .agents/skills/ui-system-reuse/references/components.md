# Components, modals and models

Reuse Button/Dialog/Input primitives and existing props/variants before introducing another implementation. Preserve focus trapping/restoration, accessible names, disabled/loading states and real actions. A visual Card and an interactive selection Card can remain different components using common lower-level primitives.

Import shared types/view-models and money/date formatters from the owning layer. Don't duplicate a domain interface in each screen or move domain ownership into UI to create a shared file. Adapt via the project's existing boundary when contracts differ.

For 3D model/assets, reuse the asset/loader only when the task concerns 3D; ordinary UI reuse does not require loading the 3D skill. Across repositories, share a versioned design-system package only when they deliberately share that system; retain adapters, themes and product semantics per project.

Search imports and consumers before modifying a shared API. Migrate affected callers when a change is authorized; do not keep obsolete copies silently. Duplication search produces candidates for review, never an automatic deletion decision.
