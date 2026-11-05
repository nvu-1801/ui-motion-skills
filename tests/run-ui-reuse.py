"""Build and exercise installed UI reuse tooling in an isolated target project."""
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
    argv = [shutil.which(str(argv[0])) or str(argv[0]), *map(str, argv[1:])]
    result = subprocess.run(argv, cwd=cwd, env=env, text=True, capture_output=True, timeout=180)
    if log:
        log.write_text(result.stdout + result.stderr, encoding='utf-8')
    if result.returncode != expected:
        raise RuntimeError(f'{argv}: expected {expected}, got {result.returncode}\n{result.stdout}\n{result.stderr}')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--offline-deps', action='store_true')
    parser.add_argument('--ui', action='store_true')
    args = parser.parse_args()
    target = ROOT / '.cache/tests' / ('ui-reuse-' + uuid.uuid4().hex)
    shutil.copytree(ROOT / 'tests/fixtures/ui-system', target)
    for name in ['ui-system-reuse', 'quality-workflow']:
        run(['pwsh', '-NoProfile', '-File', ROOT / 'scripts/install.ps1', '-Target', target, '-Skill', name], ROOT)
    helper = target / '.agents/skills/ui-system-reuse/scripts/registry.py'
    run([sys.executable, helper, 'build', '--spec', 'sources.json', '--output', 'registry.json'], target, log=target / 'registry-build.log')
    query = [sys.executable, helper, 'query', '--registry', 'registry.json', '--role', 'Button', '--kind', 'component', '--limit', '1']
    row = json.loads(run(query, target).stdout)['matches'][0]
    if row['id'] != 'button' or row['freshness'] != 'fresh':
        raise RuntimeError('Expected fresh reusable Button')
    install = ['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'] + (['--offline'] if args.offline_deps else [])
    run(install, target, log=target / 'install.log')
    check = [sys.executable, target / '.agents/skills/quality-workflow/scripts/check.py']
    run(check, target, log=target / 'build.log')
    evidence = {'installedStandalone': 'pass', 'registryRoleQuery': 'pass', 'typecheckContractsBuild': 'pass'}
    # A new screen composes the existing exports; no copy of the primitive is introduced.
    screens = target / 'src/screens.ts'
    screens.write_text(screens.read_text(encoding='utf-8').replace("['Home', 'Settings', 'Checkout']", "['Home', 'Settings', 'Checkout', 'Reports']"), encoding='utf-8')
    run(check, target, log=target / 'new-screen.log')
    if args.ui:
        env = dict(os.environ, PWTEST_CACHE_DIR=str(target / '.playwright-cache'))
        (target / 'tests/new-screen.spec.ts').write_text("""import { test, expect } from '@playwright/test';
test('new screen reuses the primary role', async ({ page }) => {
  await page.goto('/');
  const reports = page.getByRole('button', { name: 'Confirm Reports' });
  await expect(reports).toHaveCSS('font-size', '14px');
  await expect(reports).toHaveClass('button button--primary button--default');
});
""", encoding='utf-8')
        run(['npm', 'run', 'test:ui'], target, env=env, log=target / 'ui.log')
        tokens = target / 'public/tokens.css'; original = tokens.read_bytes()
        try:
            tokens.write_bytes(original.replace(b'--font-action:14px', b'--font-action:19px'))
            run(query, target, expected=2, log=target / 'stale.log')
            run(['npm', 'run', 'test:ui'], target, expected=1, env=env, log=target / 'wrong-role.log')
        finally:
            tokens.write_bytes(original)
        run(['npm', 'run', 'test:ui'], target, env=env, log=target / 'ui-restored.log')
        run(query, target)
        evidence.update(newScreenSharedRole='pass', themesAndScopedVariant='pass', dialogKeyboardAxe='pass',
                        wrongSharedRole='detected', staleTokenIndex='detected', restoredUI='pass')
    (target / 'evidence.json').write_text(json.dumps(evidence, indent=2), encoding='utf-8')
    print(json.dumps(evidence, indent=2)); print('Artifacts: ' + str(target))


if __name__ == '__main__':
    main()
