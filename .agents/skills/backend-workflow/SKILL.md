---
name: backend-workflow
description: Implement or review backend features across frameworks while preserving domain rules, authorization and data consistency.
---

# backend-workflow

1. Trace the current request, job or command from entry point to persistence and side effects. Find all callers, existing tests, deployment runtime and compatibility constraints.
2. Keep transport parsing and response mapping at the boundary. Keep business invariants in the existing domain/service layer and persistence rules close to data access. Use the project's conventions and introduce layers only when the change needs a real boundary.
3. Validate untrusted inputs server-side, authorize the actor against the resource and tenant, and use established parameterized queries or ORM bindings. Bound inputs and avoid returning secrets or logging personal payloads.
4. For multi-write changes, define the transaction boundary and back data invariants with database constraints where applicable. For retryable operations, scope the idempotency key and use atomic claim/uniqueness so concurrent requests cannot both act. Coordinate external effects through the project's durable mechanism when delivery or recovery matters. A read-then-write cache alone leaves a race.
5. Plan schema changes for existing rows and mixed application versions. For rolling deploys, add compatible schema first, backfill and verify, then remove obsolete fields in a later change when the deployment allows it.
6. Verify the actual entry point with success, invalid input, forbidden access, failure and relevant retry or concurrency scenarios. Record commands, outcomes and any behavior still unverified.
