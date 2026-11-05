# Evaluation records

The suite template defines tasks with id, prompt, split (train/holdout), requiredSkills and allowedSkills. These labels belong to the evaluator, not the execution prompt. Run records identify taskId, mode (baseline/skill), repetition, model, settingsId, selectedSkills, outcome (pass/fail/blocked/not-run), evidence, evidenceVerified, elapsedSeconds, toolCalls, inputTokens and outputTokens.

Use actual host records. Missing metrics are null; blocked/not-run or unverified outcomes remain unevaluated. evidenceVerified should only be true after the evaluator inspects the referenced command/artifact. The scorer treats it as an attestation, not independently verified truth.

Activation precision/recall are calculated only for skill-enabled records. Extra selections beyond allowedSkills are false positives; missing requiredSkills are false negatives. Optional allowed skills don't inflate correctness. A task with no selected/required skills has undefined precision/recall, not a fabricated 100%.

Cost totals are reported only if the field is available for every evaluated run in that mode. Missing models/settings prevent matched A/B comparison. Savings are reported only for matching task/repetition/model/settings with verified passing outcomes and complete token telemetry; one pair is descriptive, not evidence of general effectiveness. Keep the holdout set out of description tuning.

Templates live in assets/templates. The kit provides a harness and fixture checks, not model credentials or a claim that a live A/B experiment has already run.
