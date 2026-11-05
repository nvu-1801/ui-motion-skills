import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import uuid
import unittest

ROOT = Path(__file__).resolve().parents[1]
RUNNER = ROOT / '.agents/skills/quality-workflow/scripts/check.py'
spec = importlib.util.spec_from_file_location('quality_check', RUNNER)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Checks(unittest.TestCase):
    def setUp(self):
        self.root = ROOT / ".cache/tests" / ("runner-" + uuid.uuid4().hex)
        self.root.mkdir(parents=True)
        self.config = self.root / 'quality.config.json'

    def tearDown(self):
        pass  # Keep isolated artifacts under the ignored workspace cache.

    def run_checks(self, checks, *args):
        self.config.write_text(json.dumps({'version': 1, 'profile': 'test', 'checks': checks}), encoding='utf-8')
        return subprocess.run([sys.executable, str(RUNNER), '--config', str(self.config), *args], capture_output=True, text=True)

    def check(self, name='test', code='pass', **kwargs):
        return dict(id=name, command=['{python}', '-c', code], required=True, **kwargs)

    def report(self):
        return json.loads((self.root / '.quality/report.json').read_text(encoding='utf-8'))

    def test_pass_is_observed_and_output_not_stored(self):
        result = self.run_checks([self.check(code="print('private-output')")])
        self.assertEqual(result.returncode, 0, result.stderr)
        report = self.report()
        self.assertEqual(report['status'], 'pass')
        self.assertNotIn('private-output', json.dumps(report['checks'][0].get('output')))
        self.assertIn('revision', report)

    def test_nonzero_exit_fails(self):
        result = self.run_checks([self.check(code='raise SystemExit(7)')])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(self.report()['checks'][0]['exitCode'], 7)

    def test_missing_tool_blocks(self):
        check = self.check(); check['command'] = ['no-such-quality-tool-918273']
        self.assertEqual(self.run_checks([check]).returncode, 2)
        self.assertEqual(self.report()['status'], 'blocked')

    def test_timeout_blocks(self):
        result = self.run_checks([self.check(code='import time; time.sleep(20)', timeoutSeconds=1)])
        self.assertEqual(result.returncode, 2)
        self.assertEqual(self.report()['checks'][0]['reason'], 'timeout')

    def test_omitted_required_is_not_pass(self):
        result = self.run_checks([self.check('a'), self.check('b')], '--check', 'a')
        self.assertEqual(result.returncode, 2)
        self.assertEqual(self.report()['checks'][1]['status'], 'skipped')

    def test_disabled_required_is_not_pass(self):
        self.assertEqual(self.run_checks([self.check(enabled=False)]).returncode, 2)

    def test_disabled_optional_does_not_block(self):
        optional = self.check('optional', enabled=False); optional['required'] = False
        self.assertEqual(self.run_checks([self.check(), optional]).returncode, 0)

    def test_unknown_selector_is_invalid(self):
        self.assertEqual(self.run_checks([self.check()], '--check', 'typo').returncode, 2)
        self.assertFalse((self.root / '.quality/report.json').exists())

    def test_duplicate_ids_are_invalid(self):
        self.assertEqual(self.run_checks([self.check(), self.check()]).returncode, 2)

    def test_command_shell_string_is_invalid(self):
        check = self.check(); check['command'] = 'echo hello && echo unsafe'
        self.assertEqual(self.run_checks([check]).returncode, 2)

    def test_outside_cwd_is_invalid(self):
        self.assertEqual(self.run_checks([self.check(cwd='..')]).returncode, 2)

    def test_outside_report_is_invalid(self):
        self.assertEqual(self.run_checks([self.check()], '--report', '../escape.json').returncode, 2)

    def test_report_cannot_overwrite_existing_project_file(self):
        important = self.root / 'important.json'; important.write_text('{"business": true}')
        self.assertEqual(self.run_checks([self.check()], '--report', 'important.json').returncode, 2)
        self.assertEqual(json.loads(important.read_text(encoding='utf-8')), {'business': True})

    def test_report_can_be_updated(self):
        self.assertEqual(self.run_checks([self.check()]).returncode, 0)
        self.assertEqual(self.run_checks([self.check(code='raise SystemExit(1)')]).returncode, 1)
        self.assertEqual(self.report()['status'], 'fail')

    def test_validation_runs_no_commands(self):
        check = self.check(code="from pathlib import Path; Path('should-not-exist').touch()")
        self.assertEqual(self.run_checks([check], '--validate-only').returncode, 0)
        self.assertFalse((self.root / 'should-not-exist').exists())
        self.assertFalse((self.root / '.quality').exists())

    def test_windows_npm_launcher_resolves(self):
        import shutil
        if not shutil.which('npm'):
            self.skipTest('npm unavailable')
        check = self.check(); check['command'] = ['npm', '--version']
        self.assertEqual(self.run_checks([check]).returncode, 0)

    def test_schema_and_runtime_reject_bad_timeout(self):
        self.assertEqual(self.run_checks([self.check(timeoutSeconds=True)]).returncode, 2)


if __name__ == '__main__':
    unittest.main()
