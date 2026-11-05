---
name: security-review
description: Review changed trust boundaries, authorization and sensitive data paths for concrete exploitable defects.
---

# security-review

Map attacker-controlled input, identities, ownership and side effects for the changed path. Trace server-side validation/authorization, storage, output encoding and external calls. Select relevant risks instead of performing every security audit on every UI task.

Distinguish authentication from authorization. Check cross-user/object/tenant access, unsafe query/shell/template construction, redirects/URLs, file paths and sensitive logging where the change touches them. Reproduce with controlled local inputs and minimum permissions; don't probe live third-party systems or expose actual secrets.

A finding needs the trust boundary, concrete input/sequence, impact and evidence. Scanner/bot suggestions remain hypotheses until assessed against the actual path. Keep remediation in the owning layer and add a regression check that tests the security contract. Report scope and untested paths; don't claim an exhaustive audit from a diff review.
