# Explicit UI source registry

Python 3.10+ standard library only. Start from assets/templates/sources.json and curate entries for the target project. Paths are relative to --project; symlinks/junctions and paths outside it are rejected. Include token/theme/implementation dependencies in each entry's sources so their changes invalidate freshness. For third-party exports, index the local manifest/adapter and record package version in importPath/summary.

Build: `python <installed-skill>/scripts/registry.py build --project . --spec docs/ui-system/sources.json --output docs/ui-system/registry.json`.
Query: `python <installed-skill>/scripts/registry.py query --project . --registry docs/ui-system/registry.json --role Button --kind component --limit 3`.
Check all entries: use the `check` command with the same project/registry arguments.

The index stores source paths/hashes and curated metadata, not source bodies or fixed line numbers. Optional symbol is a hint; this is not an AST resolver. Queries open/hash only selected entries, limiting output to 1–20 matches. Returned freshness can be fresh/stale/missing; reviewState candidate/verified/deprecated is independently curated, never inferred from a hash.

Exit 0: selected entries fresh (or check of all entries fresh). Exit 1: query has no matches. Exit 2: stale/missing entries, malformed input or unsafe path. A missing match doesn't prove that nothing reusable exists: inspect exports/re-exports and update the spec. Deprecated entries are excluded unless --include-deprecated is explicitly passed.

Build creates a new registry or updates only a registry with this tool's producer marker. It preflights sources and refuses to overwrite source/spec files. Registry/spec validation cannot establish that two component behaviors are interchangeable.
