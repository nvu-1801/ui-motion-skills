import importlib.util
import json
from pathlib import Path
import unittest
import uuid

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('lesson_search', ROOT / '.agents/skills/agent-lessons/scripts/search.py')
lessons = importlib.util.module_from_spec(spec); spec.loader.exec_module(lessons)

class Lessons(unittest.TestCase):
    def test_verified_tag_filter_returns_metadata_only(self):
        result = lessons.search(ROOT / 'knowledge/bug-patterns', ['typescript'])
        self.assertEqual(result['matches'][0]['id'], 'cart-quantity-off-by-one')
        self.assertNotIn('rootCause', result['matches'][0])
        self.assertEqual(result['matches'][0]['version'], '1')
        self.assertEqual(lessons.search(ROOT / 'knowledge/bug-patterns', ['nonmatching'])['matches'], [])

    def test_deprecated_is_not_suggested_by_default(self):
        folder = ROOT / '.cache/tests' / ('lessons-' + uuid.uuid4().hex); folder.mkdir(parents=True)
        case = json.loads((ROOT / 'knowledge/bug-patterns/cart-quantity.json').read_text(encoding='utf-8'))
        case.update(status='deprecated', replacement='new-case'); (folder / 'old.json').write_text(json.dumps(case), encoding='utf-8')
        self.assertEqual(lessons.search(folder, [])['matches'], [])
        self.assertEqual(lessons.search(folder, [], include_deprecated=True)['matches'][0]['replacement'], 'new-case')
