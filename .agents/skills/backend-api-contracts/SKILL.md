---
name: backend-api-contracts
description: Design or change HTTP API contracts, including validation, status codes, errors, pagination and safe retry behavior.
---

# backend-api-contracts

- Identify consumers and write representative request and response examples before changing the contract. Preserve stable field meanings, error codes and pagination ordering for existing callers. Use the project's versioning and deprecation policy for breaking changes.
- Enforce supported content types and body size at ingress. If the app owns the limit, bound actual bytes while reading. Validate shape, field bounds and resource identifiers before side effects. Apply authorization at the server boundary and on resource access.
- Use the project's existing error envelope or Problem Details if already adopted. Distinguish field validation, unauthenticated/forbidden access, conflicts, rate limits and dependency failures. Keep public codes stable, attach a safe correlation identifier and keep internal details in logs.
- Define what each success state guarantees. For a retryable write, document key scope, equivalent vs conflicting payloads, behavior while in flight and retry semantics after failure. Make rate limits and retry guidance consistent with caller behavior.
- Verify status, body, headers and effects at the HTTP boundary. Include a repeat request and an upstream failure when the endpoint performs a side effect.
