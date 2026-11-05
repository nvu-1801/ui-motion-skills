"""Print a small initial skill set without reading skill bodies."""
import argparse
import json
from pathlib import Path

ROUTES = {
    'ui-fix': ['ui-visual-qa'],
    'ui-build': ['ui-system-reuse', 'ui-components', 'ui-visual-qa'],
    'ui-reuse': ['ui-system-reuse'],
    'ui-consistency': ['ui-system-reuse', 'ui-visual-qa'],
    'skill-authoring': ['skill-authoring'],
    'skill-evaluation': ['skill-evaluation'],
    'upstream-audit': ['upstream-skill-audit'],
    'dependencies': ['dependency-security'],
    'security': ['security-review'],
    'migration': ['database-migrations'],
    'bug': ['bug-reproduction'],
    'logic': ['bug-reproduction', 'business-logic-review'],
    'review': ['code-review'],
    'scanner': ['static-analysis'],
    'ci': ['github-actions'],
    'deploy': ['release-deploy'],
    'lesson': ['agent-lessons'],
    'unknown': ['quality-workflow'],
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('task', choices=sorted(ROUTES))
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    names = ROUTES[args.task]
    root = Path(__file__).resolve().parents[1]
    for name in names:
        if not (root / '.agents/skills' / name / 'SKILL.md').is_file():
            parser.error('Unavailable skill: ' + name)
    print(json.dumps(names) if args.json else ','.join(names))


if __name__ == '__main__':
    main()
