import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('evaluation', ROOT / '.agents/skills/skill-evaluation/scripts/score.py')
evaluation = importlib.util.module_from_spec(spec); spec.loader.exec_module(evaluation)

class Evaluation(unittest.TestCase):
    def setUp(self):
        self.suite = json.loads((ROOT / '.agents/skills/skill-evaluation/assets/templates/suite.json').read_text(encoding='utf-8'))

    def run_record(self, mode='skill', **updates):
        row = dict(taskId='reuse-button', mode=mode, repetition=1, model=None, settingsId=None,
                   selectedSkills=['ui-system-reuse'], outcome='pass', evidence=['fixture log'], evidenceVerified=True,
                   elapsedSeconds=None, toolCalls=None, inputTokens=None, outputTokens=None)
        row.update(updates); return row

    def test_empty_runs_are_unevaluated_not_success(self):
        result = evaluation.score(self.suite, [])
        self.assertIsNone(result['modes']['skill']['passRate']); self.assertEqual(result['matchedPassingTokenPairs'], [])

    def test_missing_tokens_do_not_produce_savings(self):
        result = evaluation.score(self.suite, [self.run_record('baseline'), self.run_record()])
        self.assertIsNone(result['modes']['skill']['costTotals']['inputTokens'])
        self.assertEqual(result['matchedPassingTokenPairs'], [])

    def test_unverified_pass_is_not_counted(self):
        result = evaluation.score(self.suite, [self.run_record(evidenceVerified=False)])
        self.assertEqual(result['modes']['skill']['evaluated'], 0)
        self.assertEqual(result['modes']['skill']['unevaluated'], 1)

    def test_unnecessary_skill_and_missing_skill_are_distinct(self):
        result = evaluation.score(self.suite, [self.run_record(selectedSkills=['release-deploy'])])
        self.assertEqual(result['activation']['unnecessarySelected'], 1)
        self.assertEqual(result['activation']['requiredMissing'], 1)
        self.assertEqual(result['activation']['recall'], 0)

    def test_matched_cost_pair_requires_same_model_settings_and_pass(self):
        old = self.run_record('baseline', model='fixture-model', settingsId='same', inputTokens=100, outputTokens=20)
        new = self.run_record(model='fixture-model', settingsId='same', inputTokens=80, outputTokens=10)
        result = evaluation.score(self.suite, [old, new])
        self.assertEqual(result['matchedPassingTokenPairs'][0]['savedTokens'], 30)
        new['settingsId'] = 'different'
        self.assertEqual(evaluation.score(self.suite, [old, new])['matchedPassingTokenPairs'], [])
        new['settingsId'] = 'same'; new['outcome'] = 'fail'
        self.assertEqual(evaluation.score(self.suite, [old, new])['matchedPassingTokenPairs'], [])

    def test_duplicate_and_invalid_metric_are_rejected(self):
        row = self.run_record()
        with self.assertRaises(ValueError): evaluation.score(self.suite, [row, copy.deepcopy(row)])
        with self.assertRaises(ValueError): evaluation.score(self.suite, [self.run_record(inputTokens=True)])
        with self.assertRaises(ValueError): evaluation.score(self.suite, [self.run_record(inputTokens=float('nan'))])
