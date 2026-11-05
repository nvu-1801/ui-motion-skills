"""Create a deterministic source distribution with a SHA256 manifest; omit caches and runtime outputs."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = {'README.md', 'CATALOG.md', 'AGENTS.md', 'CHANGELOG.md', 'PLAN.md', 'QUALITY_AUTOMATION_PLAN.md',
              'UI_REUSE_AND_SKILL_EVOLUTION_PLAN.md', '.gitignore', '.gitattributes'}
SOURCE_DIRS = {'.agents', '.github', 'scripts', 'tests', 'docs', 'knowledge', 'references', 'examples'}


def build(output):
    output = Path(output).absolute()
    allowed_output = ROOT / '.cache/dist'
    if not output.resolve().is_relative_to(allowed_output.resolve()) or output.suffix != '.zip':
        raise ValueError('Output must be a .zip inside .cache/dist')
    for path in [output, *output.parents]:
        if path.is_symlink() or (hasattr(path, 'is_junction') and path.is_junction()):
            raise ValueError('Linked output paths are not supported')
    result = subprocess.run(['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], cwd=ROOT, capture_output=True, check=True)
    names = sorted(set(x.decode('utf-8') for x in result.stdout.split(b'\0') if x))
    files = {}
    for name in names:
        relative = Path(name)
        if name not in ROOT_FILES and relative.parts[0] not in SOURCE_DIRS:
            continue
        if any(p in {'node_modules', '__pycache__', '.cache', '.git', 'test-results', 'playwright-report', '.next'} for p in relative.parts) or relative.suffix in {'.pyc', '.pyo', '.tsbuildinfo'}:
            continue
        path = ROOT / relative
        for item in [path, *path.parents]:
            if item == ROOT.parent: break
            if item.is_symlink() or (hasattr(item, 'is_junction') and item.is_junction()):
                raise ValueError('Linked source path: ' + name)
        if not path.resolve().is_relative_to(ROOT.resolve()) or not path.is_file():
            raise ValueError('Missing or unsafe source: ' + name)
        files[name] = path.read_bytes()
    if not files:
        raise ValueError('No distributable files')
    manifest = {'version': 1, 'producer': 'ui-motion-skills/source-build-v1',
                'files': {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}}
    files['MANIFEST.json'] = (json.dumps(manifest, indent=2) + '\n').encode()
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0)); info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    return {'path': str(output), 'sourceFiles': len(manifest['files']), 'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default=str(ROOT / '.cache/dist/ui-motion-skills.zip'))
    args = parser.parse_args()
    try:
        print(json.dumps(build(args.output), indent=2)); return 0
    except (OSError, ValueError, subprocess.CalledProcessError) as exc:
        print('Build error: ' + str(exc), file=sys.stderr); return 1


if __name__ == '__main__':
    sys.exit(main())
