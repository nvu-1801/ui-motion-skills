---
name: landing-business-rules
description: Preserve and verify product rules when creating or redesigning a landing page, catalog entry point or lead-generation flow.
---

# landing-business-rules

## Map the landing page to real actions

- Read the current route, sections, navigation configuration, data sources, locale metadata and lead form. Map each prominent CTA to its actual destination and user outcome.
- Use the product's real sequence. A travel example is discover → compare → view tour → request advice. Preserve existing route targets and query context through redesigns. If the flow only captures inquiries, label the action as consultation or inquiry.
- Pull offer availability, prices, contact details and localized copy from their existing sources. Treat missing price separately from zero. Use the approved fallback label, omit unsupported claims and keep unpublished offers out of public selections.
- Preserve translation and indexing gates. Check canonical URLs, alternate languages, fallback copy and sitemap behavior when a route changes. For Sea Trip, the English homepage is gated by featured tour translation status. Read the target project's own policy before adopting this rule.
- Keep contextual product references in forms. Validate them on the server. Preserve input on recoverable failure, focus the first invalid field and only show the success state the backend actually guarantees. Provider acceptance and inbox delivery are separate events.

## Verify

Exercise navigation, every primary CTA, missing content, both locales when supported, keyboard and mobile, successful submission and recoverable failure. For a route refactor, also verify deep links and metadata. Record the rule, where it is enforced and the evidence.
