---
name: backend-nextjs
description: Implement Next.js backend features with App Router Route Handlers, Server Actions and server-only data access.
---

# backend-nextjs

- Confirm the installed Next.js version and read relevant repo instructions and version-specific docs. Follow its conventions for route params, cache configuration and revalidation.
- Use a Route Handler for HTTP consumers, webhooks and stable machine contracts. Use a Server Action for a UI-owned mutation where the project already supports it. Server Components can call the shared server-side read service directly where no HTTP contract is required.
- Treat every Route Handler and Server Action as a callable boundary. Validate inputs and enforce session, role and resource checks server-side. Keep credentials, provider SDKs and database access in server-only modules. Serialize only the fields the client needs.
- Match Node or Edge runtime to database drivers and provider SDKs. Make caching explicit for identity- or tenant-scoped reads and invalidate affected public data after successful writes using the repo's cache conventions.
- Avoid process-local coordination for durable idempotency or cross-instance rate limits. Run the repo's type generation and typecheck, production build and a real HTTP or UI mutation check.
