"""Summarize attested evaluation records; never execute agents or infer missing telemetry."""
import argparse
import json
from pathlib import Path
import sys

METRICS = ['elapsedSeconds', 'toolCalls', 'inputTokens', 'outputTokens']


def validate(suite, runs):
    if not isinstance(suite, dict) or suite.get('version') != 1 or not isinstance(suite.get('tasks'), list):
        raise ValueError('Expected suite version 1 with tasks')
    tasks = {}
    for task in suite['tasks']:
        if not isinstance(task, dict) or not isinstance(task.get('id'), str) or not task['id'].strip() or task['id'] in tasks:
            raise ValueError('Task IDs must be unique nonempty strings')
        if task.get('split') not in {'train', 'holdout'} or not isinstance(task.get('prompt'), str) or not task['prompt'].strip():
            raise ValueError('Task needs prompt and train/holdout split')
        for key in ['requiredSkills', 'allowedSkills']:
            values = task.get(key)
            if not isinstance(values, list) or any(not isinstance(x, str) or not x for x in values) or len(values) != len(set(values)):
                raise ValueError('Invalid ' + key)
        if not set(task['requiredSkills']) <= set(task['allowedSkills']):
            raise ValueError('Required skills must be allowed')
        tasks[task['id']] = task
    if not tasks or not isinstance(runs, list):
        raise ValueError('Suite cannot be empty; runs must be an array')
    seen = set()
    for run in runs:
        if not isinstance(run, dict) or run.get('taskId') not in tasks or run.get('mode') not in {'baseline', 'skill'}:
            raise ValueError('Run must identify known task and mode')
        if type(run.get('repetition')) is not int or run['repetition'] < 1:
            raise ValueError('repetition must be a positive integer')
        key = (run['taskId'], run['mode'], run['repetition'])
        if key in seen:
            raise ValueError('Duplicate task/mode/repetition')
        seen.add(key)
        if run.get('outcome') not in {'pass', 'fail', 'blocked', 'not-run'} or type(run.get('evidenceVerified')) is not bool:
            raise ValueError('Invalid outcome/evidenceVerified')
        evidence = run.get('evidence')
        if not isinstance(evidence, list) or any(not isinstance(x, str) or not x.strip() for x in evidence):
            raise ValueError('Evidence must be a string array')
        if run['evidenceVerified'] and not evidence:
            raise ValueError('Verified evidence cannot be empty')
        selected = run.get('selectedSkills')
        if not isinstance(selected, list) or any(not isinstance(x, str) or not x for x in selected) or len(selected) != len(set(selected)):
            raise ValueError('selectedSkills must be unique strings')
        for key in ['model', 'settingsId']:
            if key not in run or (run[key] is not None and (not isinstance(run[key], str) or not run[key].strip())):
                raise ValueError(key + ' must be nonempty or null')
        for key in METRICS:
            value = run.get(key)
            if key not in run or (value is not None and (type(value) not in (int, float) or value < 0 or not __import__('math').isfinite(value))):
                raise ValueError(key + ' must be nonnegative or null')
            if key != 'elapsedSeconds' and value is not None and type(value) is not int:
                raise ValueError(key + ' must be integer counts')
    return tasks


def evaluated(run):
    return run['evidenceVerified'] and run['outcome'] in {'pass', 'fail'}


def score(suite, runs):
    tasks = validate(suite, runs)
    modes = {}
    for mode in ['baseline', 'skill']:
        rows = [r for r in runs if r['mode'] == mode]
        checked = [r for r in rows if evaluated(r)]
        modes[mode] = {'recorded': len(rows), 'evaluated': len(checked), 'unevaluated': len(rows) - len(checked),
                       'passed': sum(r['outcome'] == 'pass' for r in checked),
                       'passRate': sum(r['outcome'] == 'pass' for r in checked) / len(checked) if checked else None,
                       'costTotals': {key: sum(r[key] for r in checked) if checked and all(r[key] is not None for r in checked) else None for key in METRICS}}
    tp = fp = fn = 0
    for run in runs:
        if run['mode'] != 'skill' or not evaluated(run):
            continue
        task = tasks[run['taskId']]
        selected = set(run['selectedSkills']); required = set(task['requiredSkills']); allowed = set(task['allowedSkills'])
        tp += len(selected & required); fp += len(selected - allowed); fn += len(required - selected)
    # Optional allowed selections are neutral; precision refers to required selections vs extras.
    activation = {'requiredSelected': tp, 'unnecessarySelected': fp, 'requiredMissing': fn,
                  'precision': tp / (tp + fp) if tp + fp else None, 'recall': tp / (tp + fn) if tp + fn else None}
    baseline = {(r['taskId'], r['repetition']): r for r in runs if r['mode'] == 'baseline'}
    pairs = []
    for run in runs:
        before = baseline.get((run['taskId'], run['repetition']))
        if run['mode'] != 'skill' or not before or not all(evaluated(x) and x['outcome'] == 'pass' for x in [before, run]):
            continue
        if not run['model'] or not run['settingsId'] or (run['model'], run['settingsId']) != (before['model'], before['settingsId']):
            continue
        if any(x[k] is None for x in [before, run] for k in ['inputTokens', 'outputTokens']):
            continue
        old = before['inputTokens'] + before['outputTokens']; new = run['inputTokens'] + run['outputTokens']
        pairs.append({'taskId': run['taskId'], 'repetition': run['repetition'], 'baselineTokens': old, 'skillTokens': new,
                      'savedTokens': old - new, 'savedPercent': 100 * (old - new) / old if old else None})
    return {'version': 1, 'modes': modes, 'activation': activation, 'matchedPassingTokenPairs': pairs,
            'generalEffectivenessClaim': 'not established by this scorer',
            'splitCoverage': {s: len({r['taskId'] for r in runs if evaluated(r) and tasks[r['taskId']]['split'] == s}) for s in ['train', 'holdout']}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--suite', required=True); parser.add_argument('--runs', required=True)
    args = parser.parse_args()
    try:
        result = score(json.loads(Path(args.suite).read_text(encoding='utf-8-sig')), json.loads(Path(args.runs).read_text(encoding='utf-8-sig')))
        print(json.dumps(result, indent=2))
        return 0 if any(row['evaluated'] for row in result['modes'].values()) else 2
    except (ValueError, OSError, TypeError) as exc:
        print('Evaluation error: ' + str(exc), file=sys.stderr); return 2


if __name__ == '__main__':
    sys.exit(main())
