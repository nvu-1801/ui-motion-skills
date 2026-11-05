"""Search lesson metadata without loading every full lesson into agent context."""
import argparse
import json
from pathlib import Path
import sys


def search(folder, tags, include_deprecated=False, limit=5):
    if not folder.is_dir():
        raise ValueError('Lesson directory does not exist')
    rows = []
    for path in sorted(folder.glob('*.json')):
        if path.is_symlink() or (hasattr(path, 'is_junction') and path.is_junction()):
            raise ValueError('Linked lesson files are not supported')
        data = json.loads(path.read_text(encoding='utf-8-sig'))
        if not isinstance(data, dict) or data.get('status') not in {'draft', 'verified', 'deprecated'} or not isinstance(data.get('tags'), list):
            raise ValueError('Invalid lesson metadata: ' + path.name)
        if not include_deprecated and data['status'] != 'verified':
            continue
        if tags and not set(t.casefold() for t in tags) <= {t.casefold() for t in data['tags']}:
            continue
        rows.append({'id': data['id'], 'status': data['status'], 'tags': data['tags'],
                     'preconditions': data['preconditions'], 'source': data['source'],
                     'version': data.get('version'), 'replacement': data.get('replacement'), 'file': path.name})
    return {'matches': rows[:limit], 'totalMatches': len(rows), 'truncated': len(rows) > limit}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', required=True); parser.add_argument('--tag', action='append', default=[])
    parser.add_argument('--include-deprecated', action='store_true'); parser.add_argument('--limit', type=int, choices=range(1,21), default=5)
    args = parser.parse_args()
    try:
        result = search(Path(args.directory), args.tag, args.include_deprecated, args.limit)
        print(json.dumps(result, indent=2)); return 0 if result['matches'] else 1
    except (ValueError, OSError, TypeError, KeyError) as exc:
        print('Lesson search error: ' + str(exc), file=sys.stderr); return 2


if __name__ == '__main__':
    sys.exit(main())
