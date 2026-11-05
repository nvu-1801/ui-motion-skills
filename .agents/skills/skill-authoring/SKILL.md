---
name: skill-authoring
description: Create, revise or consolidate reusable agent skills with precise activation and portable resources.
---

# skill-authoring

Define the request a skill should handle and realistic cases where it should stay inactive. Inspect the catalog before creating another skill; extend an existing one when its responsibility already covers the change.

Write a short name/description that distinguishes the capability. Keep decisions and essential constraints in SKILL.md; link conditional detail from references and put reusable output templates in assets. A skill must work when installed alone: avoid links into the source checkout or mandatory sibling skills.

Use existing project conventions and preserve the user's scope. Do not turn a past project's settings into universal requirements, automatically run downloaded scripts, or treat installing a skill as permission to push/deploy. Keep generic tutorials and duplicated policies out of the entrypoint.

Validate names, frontmatter and local references, then exercise scripts and actual task outcomes. Schema checks prove structure, not agent competence. When behavior changes, use positive, negative and held-out tasks; read [authoring checklist](references/checklist.md). Update catalog, routes and version/change notes together. Preserve local modifications during package updates.
