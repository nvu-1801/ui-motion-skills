"""Validate distributable skills, local references, schemas and fixture profiles."""
import importlib.util
import json
from pathlib import Path
import re
import sys

import jsonschema
import yaml

ROOT = Path(__file__).resolve().parents[1]


def main():
    skills = ROOT / '.agents/skills'
    names = set()
    for entry in sorted(skills.glob('*/SKILL.md')):
        text = entry.read_text(encoding='utf-8')
        parts = text.split('---', 2)
        if len(parts) != 3 or parts[0].strip():
            raise ValueError('Missing YAML frontmatter: ' + str(entry))
        metadata = yaml.safe_load(parts[1])
        if metadata.get('name') != entry.parent.name or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', metadata['name']):
            raise ValueError('Invalid skill name: ' + str(entry))
        if not isinstance(metadata.get('description'), str) or not metadata['description'].strip():
            raise ValueError('Missing trigger description: ' + str(entry))
        if len(parts[2].split()) > 700:
            raise ValueError('Move conditional details out of the entrypoint: ' + str(entry))
        names.add(metadata['name'])
        for doc in [entry, *entry.parent.glob('references/*.md')]:
            for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', doc.read_text(encoding='utf-8')):
                if '://' in target or target.startswith('#'):
                    continue
                path = (doc.parent / target.split('#', 1)[0]).resolve()
                if not path.is_relative_to(entry.parent.resolve()) or not path.exists():
                    raise ValueError(f'Broken/nonportable skill reference: {doc}: {target}')
    schema_root = skills / 'quality-workflow/assets/schemas'
    schemas = list(skills.glob('*/assets/schemas/*.json'))
    for path in schemas:
        jsonschema.Draft202012Validator.check_schema(json.loads(path.read_text(encoding='utf-8')))
    config_schema = json.loads((schema_root / 'quality-config.schema.json').read_text(encoding='utf-8'))
    profiles = list(skills.glob('*/assets/templates/quality-*.json')) + list((ROOT / 'tests/fixtures').glob('*/quality.config.json'))
    for path in profiles:
        jsonschema.validate(json.loads(path.read_text(encoding='utf-8')), config_schema)
    lesson_schema = json.loads((skills / 'agent-lessons/assets/schemas/lesson.schema.json').read_text(encoding='utf-8'))
    for path in (ROOT / 'knowledge/bug-patterns').glob('*.json'):
        jsonschema.validate(json.loads(path.read_text(encoding='utf-8')), lesson_schema)
    source_schema = json.loads((skills / 'ui-system-reuse/assets/schemas/sources.schema.json').read_text(encoding='utf-8'))
    for path in [skills / 'ui-system-reuse/assets/templates/sources.json', ROOT / 'tests/fixtures/ui-system/sources.json']:
        jsonschema.validate(json.loads(path.read_text(encoding='utf-8')), source_schema)
    evaluation_spec = importlib.util.spec_from_file_location('evaluation', skills / 'skill-evaluation/scripts/score.py')
    evaluation = importlib.util.module_from_spec(evaluation_spec); evaluation_spec.loader.exec_module(evaluation)
    evaluation.validate(json.loads((skills / 'skill-evaluation/assets/templates/suite.json').read_text(encoding='utf-8')),
                        json.loads((skills / 'skill-evaluation/assets/templates/runs.json').read_text(encoding='utf-8')))
    # Parse routing without loading any skill body.
    spec = importlib.util.spec_from_file_location('routes', ROOT / 'scripts/select-skills.py')
    routes = importlib.util.module_from_spec(spec); spec.loader.exec_module(routes)
    for task, selection in routes.ROUTES.items():
        if not selection or len(selection) != len(set(selection)) or not set(selection) <= names:
            raise ValueError('Invalid route: ' + task)
    catalog = (ROOT / 'CATALOG.md').read_text(encoding='utf-8')
    if any(f'| {name} |' not in catalog for name in names):
        raise ValueError('Catalog missing a skill')
    print(f'PASS: {len(names)} skills; local references; {len(schemas)} schemas; {len(profiles)} profiles; lessons; {len(routes.ROUTES)} routes')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, jsonschema.ValidationError, yaml.YAMLError) as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
