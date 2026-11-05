import hashlib
import importlib.util
import json
from pathlib import Path
import unittest
import uuid
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('source_build', ROOT / 'scripts/build.py')
source_build = importlib.util.module_from_spec(spec); spec.loader.exec_module(source_build)

class Build(unittest.TestCase):
    def test_distribution_is_repeatable_verified_and_excludes_runtime_files(self):
        tag = uuid.uuid4().hex
        first = ROOT / '.cache/dist' / (tag + '-a.zip'); second = ROOT / '.cache/dist' / (tag + '-b.zip')
        a = source_build.build(first); b = source_build.build(second)
        self.assertEqual(a['sha256'], b['sha256'])
        with zipfile.ZipFile(first) as archive:
            names = archive.namelist()
            self.assertIn('scripts/install.ps1', names)
            self.assertIn('.agents/skills/ui-system-reuse/scripts/registry.py', names)
            self.assertEqual({x for x in names if x.endswith('/SKILL.md') and x.startswith('.agents/skills/')},
                             {str(p.relative_to(ROOT)).replace('\\', '/') for p in (ROOT / '.agents/skills').glob('*/SKILL.md')})
            self.assertFalse(any('/node_modules/' in x or '/__pycache__/' in x or x.startswith('.cache/') or x.startswith('.git/') for x in names))
            manifest = json.loads(archive.read('MANIFEST.json'))
            for name, digest in manifest['files'].items():
                self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(), digest)

    def test_cannot_write_distribution_over_source(self):
        with self.assertRaises(ValueError): source_build.build(ROOT / 'README.md')
