import json
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]

class Routing(unittest.TestCase):
    def route(self, task):
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/select-skills.py'), task, '--json'], capture_output=True, text=True, check=True)
        return json.loads(result.stdout)

    def test_ui_fix_does_not_load_scanners_or_deploy(self):
        selected = self.route('ui-fix')
        self.assertIn('ui-visual-qa', selected)
        self.assertNotIn('static-analysis', selected)
        self.assertNotIn('release-deploy', selected)
        self.assertNotIn('web-3d-scenes', selected)

    def test_logic_includes_contract_review(self):
        self.assertEqual(self.route('logic'), ['bug-reproduction', 'business-logic-review'])

    def test_ci_and_deploy_are_distinct_tasks(self):
        self.assertEqual(self.route('ci'), ['github-actions'])
        self.assertEqual(self.route('deploy'), ['release-deploy'])

    def test_unknown_starts_with_router_only(self):
        self.assertEqual(self.route('unknown'), ['quality-workflow'])

    def test_reuse_build_and_consistency_are_focused(self):
        self.assertEqual(self.route('ui-reuse'), ['ui-system-reuse'])
        self.assertEqual(self.route('ui-consistency'), ['ui-system-reuse', 'ui-visual-qa'])
        self.assertIn('ui-system-reuse', self.route('ui-build'))
        self.assertNotIn('web-3d-scenes', self.route('ui-build'))

    def test_specialists_do_not_load_ui(self):
        for task in ['dependencies', 'security', 'migration', 'upstream-audit']:
            self.assertNotIn('ui-system-reuse', self.route(task))
