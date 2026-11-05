"""Index curated UI sources and query only the entries needed by a task."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile

PRODUCER = 'ui-motion-skills/ui-registry-v1'
KINDS = {'component', 'token', 'model', 'formatter', 'content', 'asset'}
FIELDS = {'id', 'kind', 'role', 'sources', 'summary', 'reviewState', 'symbol', 'importPath', 'variants', 'examples', 'themes', 'fingerprints'}


def safe_path(root, relative):
    if not isinstance(relative, str) or not relative.strip() or Path(relative).is_absolute() or re.match(r'^[A-Za-z]:', relative):
        raise ValueError('Expected a project-relative path')
    path = root / relative
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError('Path escapes project: ' + relative)
    for item in [path, *path.parents]:
        if item.is_symlink() or (hasattr(item, 'is_junction') and item.is_junction()):
            raise ValueError('Linked path is not supported: ' + relative)
    return path


def validate(data, indexed=False):
    allowed = {'version', 'entries'} | ({'producer'} if indexed else set())
    if not isinstance(data, dict) or set(data) - allowed or type(data.get('version')) is not int or data['version'] != 1:
        raise ValueError('Expected registry/spec version 1')
    if indexed and data.get('producer') != PRODUCER:
        raise ValueError('Not a managed registry')
    if not isinstance(data.get('entries'), list):
        raise ValueError('entries must be an array')
    seen = set()
    for entry in data['entries']:
        required = {'id', 'kind', 'role', 'sources', 'summary', 'reviewState'} | ({'fingerprints'} if indexed else set())
        if not isinstance(entry, dict) or not required <= set(entry) or set(entry) - (FIELDS if indexed else FIELDS - {'fingerprints'}):
            raise ValueError('Invalid entry fields')
        if not isinstance(entry['id'], str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', entry['id']) or entry['id'] in seen:
            raise ValueError('Entry IDs must be unique lowercase names')
        seen.add(entry['id'])
        if entry['kind'] not in KINDS or entry['reviewState'] not in {'candidate', 'verified', 'deprecated'}:
            raise ValueError('Invalid kind/reviewState')
        for name in ['role', 'summary']:
            if not isinstance(entry[name], str) or not entry[name].strip():
                raise ValueError(name + ' must be nonempty')
        for name in ['sources', 'variants', 'examples', 'themes']:
            if name in entry:
                values = entry[name]
                if not isinstance(values, list) or (name == 'sources' and not values) or any(not isinstance(x, str) or not x.strip() for x in values) or len(values) != len(set(values)):
                    raise ValueError('Invalid ' + name)
        for name in ['symbol', 'importPath']:
            if name in entry and (not isinstance(entry[name], str) or not entry[name].strip()):
                raise ValueError('Invalid ' + name)
        if indexed:
            hashes = entry['fingerprints']
            if not isinstance(hashes, dict) or set(hashes) != set(entry['sources']) or any(not isinstance(h, str) or not re.fullmatch(r'[0-9a-f]{64}', h) for h in hashes.values()):
                raise ValueError('Invalid source fingerprints')
    return data


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(root, relative, indexed=False):
    return validate(json.loads(safe_path(root, relative).read_text(encoding='utf-8-sig')), indexed)


def build(root, spec_path, output):
    spec = load(root, spec_path)
    target = safe_path(root, output)
    owned = {safe_path(root, spec_path).resolve()}
    for entry in spec['entries']:
        owned.update(safe_path(root, p).resolve() for p in entry['sources'] + entry.get('examples', []))
    if target.resolve() in owned:
        raise ValueError('Output would overwrite a source/spec/example')
    if target.exists():
        load(root, output, indexed=True)
    entries = []
    for entry in spec['entries']:
        hashes = {}
        for source in entry['sources']:
            path = safe_path(root, source)
            if not path.is_file():
                raise ValueError('Missing source: ' + source)
            hashes[source] = digest(path)
        for example in entry.get('examples', []):
            if not safe_path(root, example).is_file():
                raise ValueError('Missing example: ' + example)
        entries.append(dict(entry, fingerprints=hashes))
    result = {'producer': PRODUCER, 'version': 1, 'entries': entries}
    target.parent.mkdir(parents=True, exist_ok=True)
    # Same-directory atomic replacement avoids a truncated index on interrupted writes.
    with tempfile.NamedTemporaryFile('w', dir=target.parent, prefix='.ui-registry-', suffix='.tmp', encoding='utf-8', delete=False) as stream:
        stream.write(json.dumps(result, indent=2) + '\n')
        temporary = Path(stream.name)
    try:
        os.replace(temporary, target)
    finally:
        if temporary.exists():
            temporary.unlink()
    return {'status': 'built', 'entries': len(entries), 'output': output}


def query(root, registry, role=None, kind=None, limit=5, include_deprecated=False):
    data = load(root, registry, indexed=True)
    # Check all path shapes, but only open source files for selected candidates.
    for entry in data['entries']:
        for path in entry['sources'] + entry.get('examples', []):
            safe_path(root, path)
    selected = [entry for entry in data['entries'] if
                (role is None or role.casefold() in (entry['role'] + ' ' + entry['id'] + ' ' + entry['summary']).casefold()) and
                (kind is None or entry['kind'] == kind) and
                (include_deprecated or entry['reviewState'] != 'deprecated')]
    rows = []
    for entry in selected[:limit]:
        missing = [p for p in entry['sources'] if not safe_path(root, p).is_file()]
        stale = [] if missing else [p for p in entry['sources'] if digest(safe_path(root, p)) != entry['fingerprints'][p]]
        rows.append(dict(entry, freshness='missing' if missing else 'stale' if stale else 'fresh', changedSources=missing or stale))
    return {'matches': rows, 'totalMatches': len(selected), 'truncated': len(selected) > limit}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    for name in ['build', 'query', 'check']:
        command = sub.add_parser(name)
        command.add_argument('--project', default='.')
        if name == 'build':
            command.add_argument('--spec', required=True)
            command.add_argument('--output', required=True)
        else:
            command.add_argument('--registry', required=True)
            if name == 'query':
                command.add_argument('--role')
                command.add_argument('--kind', choices=sorted(KINDS))
                command.add_argument('--limit', type=int, default=5, choices=range(1, 21), metavar='1..20')
                command.add_argument('--include-deprecated', action='store_true')
    args = parser.parse_args(argv)
    try:
        root = Path(args.project).absolute()
        if not root.is_dir():
            raise ValueError('Project must be a directory')
        if args.action == 'build':
            result = build(root, args.spec, args.output)
            code = 0
        elif args.action == 'check':
            data = load(root, args.registry, indexed=True)
            result = query(root, args.registry, limit=max(1, len(data['entries'])), include_deprecated=True)
            code = 2 if any(x['freshness'] != 'fresh' for x in result['matches']) else 0
        else:
            result = query(root, args.registry, args.role, args.kind, args.limit, args.include_deprecated)
            code = 1 if not result['matches'] else 2 if any(x['freshness'] != 'fresh' for x in result['matches']) else 0
        print(json.dumps(result, indent=2))
        return code
    except (ValueError, OSError, TypeError) as exc:
        print('Registry error: ' + str(exc), file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
