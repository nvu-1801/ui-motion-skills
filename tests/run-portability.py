"""Exercise installed skills on isolated Python and TypeScript/web projects."""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import uuid

ROOT = Path(__file__).resolve().parents[1]


def run(argv, cwd, expected=0, env=None, log=None):
    argv = [shutil.which(argv[0]) or argv[0], *map(str, argv[1:])]
    result = subprocess.run(argv, cwd=cwd, env=env, capture_output=True, text=True, timeout=180)
    if log:
        log.write_text(result.stdout + result.stderr, encoding='utf-8')
    if result.returncode != expected:
        raise RuntimeError(f'{argv}: expected {expected}, got {result.returncode}\n{result.stdout}\n{result.stderr}')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ui', action='store_true', help='Run Chromium, axe and screenshot regression checks')
    parser.add_argument('--offline-deps', action='store_true', help='Require dependencies already in npm cache')
    args = parser.parse_args()
    work = ROOT / '.cache/tests' / ('portability-' + uuid.uuid4().hex)
    work.mkdir(parents=True)
    evidence = {}
    for stack in ('python', 'web'):
        target = work / stack
        shutil.copytree(ROOT / 'tests/fixtures' / stack, target)
        run(['pwsh', '-NoProfile', '-File', ROOT / 'scripts/install.ps1', '-Target', target,
             '-Skill', 'quality-workflow'], ROOT)
        helper = target / '.agents/skills/quality-workflow/scripts/check.py'
        if stack == 'web':
            install = ['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund']
            if args.offline_deps:
                install.append('--offline')
            run(install, target, log=target / 'install.log')
        run([sys.executable, helper], target, log=target / 'clean.log')
        source = target / ('cart.py' if stack == 'python' else 'src/cart.ts')
        good = source.read_text(encoding='utf-8')
        bad = good.replace('return unit_cents * quantity', 'return unit_cents * (quantity + 1)') if stack == 'python' else good.replace('return unitCents * quantity', 'return unitCents * (quantity + 1)')
        if bad == good:
            raise RuntimeError('Fixture mutation no longer applies')
        try:
            source.write_text(bad, encoding='utf-8')
            run([sys.executable, helper], target, expected=1, log=target / 'bug.log')
            shutil.copyfile(target / '.quality/report.json', target / 'before.json')
        finally:
            source.write_text(good, encoding='utf-8')
        run([sys.executable, helper], target, log=target / 'fixed.log')
        evidence[stack] = {'clean': 'pass', 'injectedLogicBug': 'fail', 'fixed': 'pass'}
        if stack == 'web' and args.ui:
            env = dict(os.environ, PWTEST_CACHE_DIR=str(work / 'playwright-cache'))
            # Baselines are created only for this controlled throwaway fixture.
            run(['npm', 'run', 'test:ui', '--', '--update-snapshots'], target, env=env, log=target / 'baseline.log')
            html = target / 'index.html'
            original = html.read_text(encoding='utf-8')
            try:
                html.write_text(original.replace('max-width:48rem', 'max-width:48rem;min-width:1200px'), encoding='utf-8')
                run(['npm', 'run', 'test:ui'], target, expected=1, env=env, log=target / 'overflow.log')
                html.write_text(original.replace('background:#173b67', 'background:#661515'), encoding='utf-8')
                run(['npm', 'run', 'test:ui'], target, expected=1, env=env, log=target / 'visual-change.log')
            finally:
                html.write_text(original, encoding='utf-8')
            run(['npm', 'run', 'test:ui'], target, env=env, log=target / 'ui-fixed.log')
            evidence['ui'] = {'overflow': 'fail', 'changedScreenshot': 'fail', 'restoredScreenshotKeyboardAxe': 'pass'}
    (work / 'evidence.json').write_text(json.dumps(evidence, indent=2), encoding='utf-8')
    print(json.dumps(evidence, indent=2))
    print('Artifacts: ' + str(work))


if __name__ == '__main__':
    main()
