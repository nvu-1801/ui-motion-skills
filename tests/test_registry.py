import importlib.util
import json
from pathlib import Path
import shutil
import unittest
import uuid
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('ui_registry', ROOT / '.agents/skills/ui-system-reuse/scripts/registry.py')
registry = importlib.util.module_from_spec(spec); spec.loader.exec_module(registry)

class Registry(unittest.TestCase):
    def setUp(self):
        self.root = ROOT / '.cache/tests' / ('registry-' + uuid.uuid4().hex)
        shutil.copytree(ROOT / 'tests/fixtures/ui-system', self.root)
        registry.build(self.root, 'sources.json', 'registry.json')

    def test_role_query_is_focused_and_does_not_open_unrelated_sources(self):
        with patch.object(registry, 'digest', wraps=registry.digest) as spy:
            result = registry.query(self.root, 'registry.json', role='Button', kind='component')
            self.assertEqual([x['id'] for x in result['matches']], ['button'])
            self.assertEqual(result['matches'][0]['freshness'], 'fresh')
            self.assertEqual(spy.call_count, 3)
            self.assertNotIn('src/format.ts', [str(call.args[0].relative_to(self.root)).replace('\\', '/') for call in spy.call_args_list])

    def test_changed_theme_marks_button_stale(self):
        with (self.root / 'public/tokens.css').open('a', encoding='utf-8') as stream: stream.write('\n/* changed theme */\n')
        row = registry.query(self.root, 'registry.json', role='Button')['matches'][0]
        self.assertEqual(row['freshness'], 'stale')
        self.assertEqual(row['changedSources'], ['public/tokens.css'])
        registry.build(self.root, 'sources.json', 'registry.json')
        self.assertEqual(registry.query(self.root, 'registry.json', role='Button')['matches'][0]['freshness'], 'fresh')

    def test_missing_source_is_explicit(self):
        # Rename only the named fixture file, within this isolated workspace.
        source = self.root / 'src/ui.ts'; source.rename(self.root / 'src/ui-renamed.ts')
        self.assertEqual(registry.query(self.root, 'registry.json', role='Button')['matches'][0]['freshness'], 'missing')

    def test_candidates_are_not_auto_verified(self):
        spec = json.loads((self.root / 'sources.json').read_text(encoding='utf-8')); spec['entries'][0]['reviewState'] = 'candidate'
        (self.root / 'sources.json').write_text(json.dumps(spec), encoding='utf-8')
        registry.build(self.root, 'sources.json', 'registry.json')
        self.assertEqual(registry.query(self.root, 'registry.json', role='Button')['matches'][0]['reviewState'], 'candidate')

    def test_no_match_and_deprecated_default(self):
        self.assertEqual(registry.query(self.root, 'registry.json', role='not-found')['matches'], [])
        data = json.loads((self.root / 'sources.json').read_text(encoding='utf-8')); data['entries'][0]['reviewState'] = 'deprecated'
        (self.root / 'sources.json').write_text(json.dumps(data), encoding='utf-8'); registry.build(self.root, 'sources.json', 'registry.json')
        self.assertFalse(registry.query(self.root, 'registry.json', role='Button')['matches'])
        self.assertTrue(registry.query(self.root, 'registry.json', role='Button', include_deprecated=True)['matches'])

    def test_no_overwrite_of_source_spec_or_unmanaged_file(self):
        for output in ['sources.json', 'src/ui.ts']:
            with self.assertRaises(ValueError): registry.build(self.root, 'sources.json', output)
        (self.root / 'business.json').write_text('{"customer": true}', encoding='utf-8')
        with self.assertRaises(ValueError): registry.build(self.root, 'sources.json', 'business.json')
        self.assertEqual(json.loads((self.root / 'business.json').read_text(encoding='utf-8')), {'customer': True})

    def test_traversal_and_poisoned_manifest_are_rejected(self):
        with self.assertRaises(ValueError): registry.safe_path(self.root, '../outside.ts')
        data = json.loads((self.root / 'registry.json').read_text(encoding='utf-8'))
        data['entries'][0]['sources'] = ['../outside.ts']; data['entries'][0]['fingerprints'] = {'../outside.ts': 'a' * 64}
        (self.root / 'registry.json').write_text(json.dumps(data), encoding='utf-8')
        with self.assertRaises(ValueError): registry.query(self.root, 'registry.json', role='Price')

    def test_duplicate_ids_are_invalid(self):
        data = json.loads((self.root / 'sources.json').read_text(encoding='utf-8')); data['entries'].append(data['entries'][0])
        with self.assertRaises(ValueError): registry.validate(data)

    def test_limit_keeps_output_small(self):
        result = registry.query(self.root, 'registry.json', kind='component', limit=1)
        self.assertEqual(len(result['matches']), 1); self.assertTrue(result['truncated'])
