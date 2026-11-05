# Migration compatibility checklist

- Old app can still read/write during the expanded schema phase.
- New app tolerates rows not yet backfilled; contract change waits for retirement of old writers.
- Backfill uses stable keys, batching/checkpoints and idempotent writes; resume doesn't double-apply changes.
- Invalid existing rows are surfaced before adding NOT NULL/unique/FK constraints.
- Engine-specific locking/DDL behavior and expected duration are assessed using realistic volume.
- Restore has an actual backup/restore rehearsal when needed; forward fix is distinguished from rollback.

The kit's SQLite fixture demonstrates additive schema compatibility and restartable backfill on tiny controlled data. It does not establish PostgreSQL/MySQL online DDL behavior or production migration performance.
