---
name: database-migrations
description: Plan and validate schema migrations and backfills across old/new app versions with realistic recovery constraints.
---

# database-migrations

Read the schema, migration history, ORM/engine/version and deployment sequence. Identify old/new app compatibility, locks, constraints, data volume and side effects. Use expand → migrate/backfill → contract where rolling versions require it; don't assume a transaction makes every engine operation rollback-safe.

Make backfills restartable and bounded; handle partial progress, duplicate execution and concurrent writers. Verify the required invariant on existing data before tightening a constraint. Test migration from representative old data, mixed app versions, interruption/resume and invalid rows. Read [compatibility checklist](references/compatibility.md) only when planning or implementing a migration.

Choose rollback, forward fix or restore according to actual destructive effects. Never promise a down migration can reconstruct dropped data. Production execution and backups follow the project's authorized release process; installing this skill doesn't authorize modifying a live database. Record commands, revision, validation and recovery limitations.
