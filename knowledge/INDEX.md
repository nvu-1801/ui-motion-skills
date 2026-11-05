# Verified lesson index

Open cases by matching tags and preconditions; do not load every case at task start.

| Case | Tags | Preconditions | Evidence |
| --- | --- | --- | --- |
| [Cart quantity off by one](bug-patterns/cart-quantity.json) | python, typescript, money, boundary | A pure per-unit subtotal with no shipping, minimum order or tier pricing | Controlled fixture mutation: zero and three units fail before fix; pass after fix |

| [Dark-theme link color](bug-patterns/dark-theme-link-token.json) | ui, tokens, dark-theme, accessibility | Navigation link on dark surface still uses browser blue | Axe fails before token mapping; all theme/interaction checks pass after |

These are controlled examples validating the kit, not production incidents. Add project lessons only after redaction and verification.
