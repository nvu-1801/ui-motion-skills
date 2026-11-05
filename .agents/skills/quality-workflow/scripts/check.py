#!/usr/bin/env python3
"""Run reviewed project argv checks; no shell interpolation or third-party dependencies."""
import argparse
import datetime
import json
import os
from pathlib import Path
import re
import signal
import shutil
import subprocess
import sys
import time

CONFIG_KEYS = {'version', 'profile', 'checks'}
CHECK_KEYS = {'id', 'command', 'required', 'enabled', 'cwd', 'timeoutSeconds'}


def inside(root, relative):
    if not isinstance(relative, str) or Path(relative).is_absolute() or re.match(r'^[A-Za-z]:', relative):
        raise ValueError('Paths must be relative to the config directory')
    path = root / relative
    resolved = path.resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError('Path escapes project: ' + relative)
    # Reject aliases even when they currently resolve inside the project.
    for item in [path, *path.parents]:
        if item.is_symlink() or (hasattr(item, 'is_junction') and item.is_junction()):
            raise ValueError('Linked paths are not supported: ' + str(item))
    return path


def validate(config, root):
    if not isinstance(config, dict) or set(config) - CONFIG_KEYS or type(config.get('version')) is not int or config.get('version') != 1:
        raise ValueError('Expected version 1 config with version/profile/checks fields')
    if not isinstance(config.get('profile'), str) or not config['profile'].strip():
        raise ValueError('profile must be a nonempty string')
    checks = config.get('checks')
    if not isinstance(checks, list) or not checks:
        raise ValueError('checks must be a nonempty array')
    seen = set()
    for check in checks:
        if not isinstance(check, dict) or set(check) - CHECK_KEYS:
            raise ValueError('Invalid check fields')
        cid = check.get('id')
        if not isinstance(cid, str) or not re.fullmatch(r'[a-z][a-z0-9-]*', cid) or cid in seen:
            raise ValueError('Check IDs must be unique lowercase names')
        seen.add(cid)
        cmd = check.get('command')
        if not isinstance(cmd, list) or not cmd or any(not isinstance(x, str) or not x.strip() or '\x00' in x for x in cmd):
            raise ValueError('command must be a nonempty argv array: ' + cid)
        if not isinstance(check.get('required'), bool) or not isinstance(check.get('enabled', True), bool):
            raise ValueError('required/enabled must be booleans: ' + cid)
        timeout = check.get('timeoutSeconds', 300)
        if type(timeout) is not int or not 1 <= timeout <= 3600:
            raise ValueError('timeoutSeconds must be 1..3600: ' + cid)
        cwd = inside(root, check.get('cwd', '.'))
        if not cwd.is_dir():
            raise ValueError('Check working directory does not exist: ' + cid)
    return checks


def revision(root):
    try:
        result = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=root, capture_output=True, text=True, timeout=5)
        return result.stdout.strip() if result.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        return None


def execute(check, root):
    start = time.monotonic()
    command = list(check['command'])
    if command[0] == '{python}':
        command[0] = sys.executable
    else:
        command[0] = shutil.which(command[0]) or command[0]
    result = {'id': check['id'], 'required': check['required'], 'command': check['command']}
    try:
        options = {'creationflags': subprocess.CREATE_NEW_PROCESS_GROUP} if os.name == 'nt' else {'start_new_session': True}
        process = subprocess.Popen(command, cwd=inside(root, check.get('cwd', '.')), shell=False, **options)
        try:
            code = process.wait(timeout=check.get('timeoutSeconds', 300))
            result.update(status='pass' if code == 0 else 'fail', exitCode=code)
        except subprocess.TimeoutExpired:
            if os.name == 'nt':
                killed = subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
                if killed.returncode != 0:
                    process.kill()
            else:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
            process.wait()
            result.update(status='blocked', reason='timeout')
    except OSError as exc:
        result.update(status='blocked', reason=f'Cannot start command ({type(exc).__name__})')
    result['durationSeconds'] = round(time.monotonic() - start, 3)
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', default='quality.config.json')
    parser.add_argument('--check', action='append', default=[])
    parser.add_argument('--validate-only', action='store_true')
    parser.add_argument('--report', default='.quality/report.json')
    args = parser.parse_args(argv)
    try:
        config_path = Path(args.config).absolute()
        root = config_path.parent
        inside(root, config_path.name)
        config = json.loads(config_path.read_text(encoding='utf-8-sig'))
        checks = validate(config, root)
        unknown = set(args.check) - {c['id'] for c in checks}
        if unknown:
            raise ValueError('Unknown checks: ' + ', '.join(sorted(unknown)))
        if args.validate_only:
            print(f'Valid config: {len(checks)} checks')
            return 0
        report_path = inside(root, args.report)
        if report_path.suffix != '.json' or report_path == config_path:
            raise ValueError('Report must be a JSON file distinct from config')
        if report_path.exists():
            previous = json.loads(report_path.read_text(encoding='utf-8'))
            if not isinstance(previous, dict) or previous.get('producer') != 'ui-motion-skills/quality-check-v1':
                raise ValueError('Refusing to overwrite an unmanaged report file')
        results = []
        for check in checks:
            if not check.get('enabled', True) or (args.check and check['id'] not in args.check):
                results.append({'id': check['id'], 'required': check['required'], 'status': 'skipped',
                                'reason': 'disabled' if not check.get('enabled', True) else 'not selected'})
            else:
                print('Running ' + check['id'], flush=True)
                results.append(execute(check, root))
        failed = any(r['status'] == 'fail' for r in results)
        incomplete = any(r['status'] == 'blocked' or (r['required'] and r['status'] != 'pass') for r in results)
        status = 'fail' if failed else 'blocked' if incomplete else 'pass'
        report = {'producer': 'ui-motion-skills/quality-check-v1', 'version': 1,
                  'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  'revision': revision(root), 'profile': config['profile'], 'status': status,
                  'checks': results}
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
        for row in results:
            print(f"{row['id']}: {row['status']}")
        print(f'Overall: {status}; report: {report_path}')
        return 1 if failed else 2 if incomplete else 0
    except (ValueError, OSError) as exc:
        print('Configuration/report error: ' + str(exc), file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
